import { DurableObject } from 'cloudflare:workers';
import { createDbClient } from '../db/client';
import { positionSnapshots } from '../db/schema';
import { sql, and, gte, lt } from 'drizzle-orm';

type TroveSnapshot = {
  borrower: string;
  troveId: string;
  collateral: number;
  borrowed: number;
  interestRate?: number;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type TrovesQueryData = {
  troves: Array<{
    troveId: string;
    borrower: string;
    deposit: string;
    debt: string;
    interestRate?: string;
  }>;
};

export class SnapshotCollectorDO extends DurableObject<Env> {
  /**
   * Alarm handler - runs every hour
   */
  async alarm() {
    console.log('[SnapshotCollectorDO] Alarm triggered');

    try {
      await this.collectSnapshots(Date.now());

      // Schedule next snapshot in 1 hour
      const nextRun = Date.now() + 60 * 60 * 1000; // 1 hour
      await this.ctx.storage.setAlarm(nextRun);

      console.log(`[SnapshotCollectorDO] Next alarm scheduled for ${new Date(nextRun).toISOString()}`);
    } catch (error) {
      console.error('[SnapshotCollectorDO] Error in alarm:', error);

      // Retry in 5 minutes on error
      const retryTime = Date.now() + 5 * 60 * 1000;
      await this.ctx.storage.setAlarm(retryTime);
      console.log(`[SnapshotCollectorDO] Retry scheduled for ${new Date(retryTime).toISOString()}`);
    }
  }

  /**
   * HTTP handler for manual triggers and status checks
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Initialize and start the alarm schedule
    if (url.pathname === '/init') {
      const existingAlarm = await this.ctx.storage.getAlarm();
      if (existingAlarm === null) {
        // Set initial alarm to run immediately
        await this.ctx.storage.setAlarm(Date.now());
        return Response.json({ message: 'Snapshot collector initialized', nextRun: Date.now() });
      }
      return Response.json({ message: 'Already initialized', nextAlarm: existingAlarm });
    }

    // Manual trigger
    if (url.pathname === '/trigger') {
      await this.collectSnapshots(Date.now());
      return Response.json({ success: true, message: 'Snapshot collected' });
    }

    // Backfill historical snapshots
    if (url.pathname === '/backfill') {
      const fromParam = url.searchParams.get('from');
      const toParam = url.searchParams.get('to');

      if (!fromParam || !toParam) {
        return Response.json(
          { error: 'Missing required parameters: from and to (ISO date strings)' },
          { status: 400 }
        );
      }

      const from = new Date(fromParam).getTime();
      const to = new Date(toParam).getTime();

      if (isNaN(from) || isNaN(to)) {
        return Response.json({ error: 'Invalid date format' }, { status: 400 });
      }

      await this.backfillSnapshots(from, to);
      return Response.json({ success: true, message: 'Backfill completed' });
    }

    // Status check
    if (url.pathname === '/status') {
      const lastSnapshot = await this.ctx.storage.get('lastSnapshotTime');
      const lastCount = await this.ctx.storage.get('lastSnapshotCount');
      const nextAlarm = await this.ctx.storage.getAlarm();

      return Response.json({
        lastSnapshotTime: lastSnapshot ? new Date(lastSnapshot as number).toISOString() : null,
        lastSnapshotCount: lastCount || 0,
        nextAlarm: nextAlarm ? new Date(nextAlarm).toISOString() : null,
      });
    }

    return Response.json({ error: 'Unknown endpoint' }, { status: 404 });
  }

  /**
   * Collect snapshots at a specific timestamp
   */
  private async collectSnapshots(snapshotTime: number): Promise<void> {
    console.log(`[SnapshotCollectorDO] Starting collection at ${new Date(snapshotTime).toISOString()}`);

    try {
      const db = createDbClient(this.env.DB);

      // 1. Query GraphQL indexer for all active troves
      const troves = await this.fetchActiveTrovesFromIndexer();

      console.log(`[SnapshotCollectorDO] Found ${troves.length} active troves`);

      if (troves.length === 0) {
        console.log('[SnapshotCollectorDO] No active troves, skipping');
        return;
      }

      // 2. Prepare insert data
      const snapshotData = troves.map((trove) => ({
        userAddress: trove.borrower.toLowerCase(),
        troveId: trove.troveId,
        snapshotTime: new Date(snapshotTime),
        collateralBtc: trove.collateral,
        borrowedUsdu: trove.borrowed,
        interestRate: trove.interestRate ?? null,
      }));

      // 3. Insert in batches (Drizzle batch insert)
      const BATCH_SIZE = 1000;
      for (let i = 0; i < snapshotData.length; i += BATCH_SIZE) {
        const batch = snapshotData.slice(i, i + BATCH_SIZE);
        await db.insert(positionSnapshots).values(batch);
      }

      // 4. Update state
      await this.ctx.storage.put('lastSnapshotTime', snapshotTime);
      await this.ctx.storage.put('lastSnapshotCount', troves.length);

      console.log(`[SnapshotCollectorDO] Successfully saved ${troves.length} snapshots`);
    } catch (error) {
      console.error('[SnapshotCollectorDO] Error collecting snapshots:', error);
      throw error;
    }
  }

  /**
   * Backfill snapshots for a date range (hourly)
   */
  private async backfillSnapshots(fromMs: number, toMs: number): Promise<void> {
    console.log(
      `[SnapshotCollectorDO] Backfilling from ${new Date(fromMs).toISOString()} to ${new Date(toMs).toISOString()}`
    );

    const db = createDbClient(this.env.DB);

    // Generate hourly timestamps
    const timestamps: number[] = [];
    let current = fromMs;

    while (current <= toMs) {
      timestamps.push(current);
      current += 60 * 60 * 1000; // Add 1 hour
    }

    console.log(`[SnapshotCollectorDO] Will backfill ${timestamps.length} hourly snapshots`);

    // Collect snapshots for each timestamp
    for (const timestamp of timestamps) {
      // Check if snapshot already exists using Drizzle
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(positionSnapshots)
        .where(
          and(
            gte(positionSnapshots.snapshotTime, new Date(timestamp)),
            lt(positionSnapshots.snapshotTime, new Date(timestamp + 60 * 60 * 1000))
          )
        )
        .get();

      if (result && result.count > 0) {
        console.log(
          `[SnapshotCollectorDO] Snapshot already exists for ${new Date(timestamp).toISOString()}, skipping`
        );
        continue;
      }

      // Collect snapshot
      await this.collectSnapshots(timestamp);

      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`[SnapshotCollectorDO] Backfill completed`);
  }

  /**
   * Fetch active troves from GraphQL indexer
   */
  private async fetchActiveTrovesFromIndexer(): Promise<TroveSnapshot[]> {
    const query = `
      query GetActiveTroves {
        troves(where: { status: "active" }, first: 10000) {
          troveId
          borrower
          deposit
          debt
          interestRate
        }
      }
    `;

    const response = await fetch(this.env.GRAPHQL_ENDPOINT || 'https://orca-app-erqua.ondigitalocean.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result: GraphQLResponse<TrovesQueryData> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }

    // Convert from indexer format to our format
    return result.data.troves.map((trove) => ({
      borrower: trove.borrower,
      troveId: trove.troveId,
      collateral: parseFloat(trove.deposit),
      borrowed: parseFloat(trove.debt),
      interestRate: trove.interestRate ? parseFloat(trove.interestRate) : undefined,
    }));
  }
}
