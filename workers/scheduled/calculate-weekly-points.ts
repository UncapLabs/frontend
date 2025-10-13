import { createDbClient } from '../db/client';
import { positionSnapshots, userPoints, referrals, userTotalPoints } from '../db/schema';
import { POINTS_CONFIG, REFERRAL_CONFIG, getWeekConfig } from '../config/points-config';
import { sql, eq, and, gte, lt } from 'drizzle-orm';

export async function calculateWeeklyPoints(env: Env): Promise<void> {
  console.log('[Points Calculation] Starting weekly calculation');

  try {
    const db = createDbClient(env.DB);

    // 1. Determine which week to calculate (last completed week)
    const weekStart = getLastMondayISO();
    const weekEnd = getNextMondayISO(weekStart);

    console.log(`[Points Calculation] Calculating for week: ${weekStart} to ${weekEnd}`);

    // 2. Check if already calculated
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(userPoints)
      .where(eq(userPoints.weekStart, weekStart))
      .get();

    if (existing && existing.count > 0) {
      console.log('[Points Calculation] Week already calculated, skipping');
      return;
    }

    // 3. Get week configuration
    const weekConfig = getWeekConfig(weekStart);
    if (!weekConfig) {
      console.log('[Points Calculation] No configuration found for this week');
      return;
    }

    // 4. Get all snapshots for this week
    const weekStartMs = new Date(weekStart).getTime();
    const weekEndMs = new Date(weekEnd).getTime();

    const snapshots = await db
      .select({
        userAddress: positionSnapshots.userAddress,
        snapshotCount: sql<number>`count(*)`,
        avgCollateral: sql<number>`AVG(${positionSnapshots.collateralBtc})`,
        avgBorrowed: sql<number>`AVG(${positionSnapshots.borrowedUsdu})`,
        maxCollateral: sql<number>`MAX(${positionSnapshots.collateralBtc})`,
      })
      .from(positionSnapshots)
      .where(
        and(
          gte(positionSnapshots.snapshotTime, new Date(weekStartMs)),
          lt(positionSnapshots.snapshotTime, new Date(weekEndMs))
        )
      )
      .groupBy(positionSnapshots.userAddress)
      .all();

    if (!snapshots || snapshots.length === 0) {
      console.log('[Points Calculation] No snapshots found for this week');
      return;
    }

    console.log(`[Points Calculation] Processing ${snapshots.length} users`);

    // 5. Calculate base points for each user
    const userPointsMap = new Map<string, number>();
    let totalActivity = 0;

    for (const userSnapshot of snapshots) {
      // Check minimum snapshot requirement
      if (
        weekConfig.formula.minSnapshotsRequired &&
        userSnapshot.snapshotCount < weekConfig.formula.minSnapshotsRequired
      ) {
        continue;
      }

      // Calculate activity score
      let activityScore =
        userSnapshot.avgBorrowed * weekConfig.formula.borrowWeight +
        userSnapshot.avgCollateral * weekConfig.formula.collateralWeight;

      // Apply multipliers
      if (weekConfig.formula.multipliers?.earlyAdopter) {
        // Check if user participated in week 1
        const hasWeek1Activity = await hasUserActivityInWeek1(db, userSnapshot.userAddress);
        if (hasWeek1Activity) {
          activityScore *= weekConfig.formula.multipliers.earlyAdopter;
        }
      }

      if (weekConfig.formula.multipliers?.highCollateral && userSnapshot.maxCollateral >= 1.0) {
        activityScore *= weekConfig.formula.multipliers.highCollateral;
      }

      userPointsMap.set(userSnapshot.userAddress, activityScore);
      totalActivity += activityScore;
    }

    // 6. Normalize points to match weekly pool
    if (totalActivity > 0) {
      for (const [userAddress, activityScore] of userPointsMap.entries()) {
        const normalizedPoints = (activityScore / totalActivity) * weekConfig.totalPointsPool;
        userPointsMap.set(userAddress, normalizedPoints);
      }
    }

    // 7. Calculate referral bonuses
    const referralBonuses = await calculateReferralBonuses(db, userPointsMap);

    // 8. Save to database
    const season = POINTS_CONFIG.find((s) => s.weeks.some((w) => w.startDate === weekStart));

    const weekNumber = season?.weeks.findIndex((w) => w.startDate === weekStart);

    const pointsToInsert = [];
    for (const [userAddress, basePoints] of userPointsMap.entries()) {
      const referralBonus = referralBonuses.get(userAddress) || 0;
      const totalPoints = basePoints + referralBonus;

      pointsToInsert.push({
        userAddress,
        weekStart,
        seasonNumber: season?.seasonNumber || 1,
        weekNumber: (weekNumber || 0) + 1,
        basePoints,
        referralBonus,
        totalPoints,
        calculatedAt: new Date(),
      });
    }

    // Batch insert (handle large batches)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < pointsToInsert.length; i += BATCH_SIZE) {
      const batch = pointsToInsert.slice(i, i + BATCH_SIZE);
      await db.insert(userPoints).values(batch);
    }

    // 9. Update aggregated totals
    await updateUserTotalPoints(db, season?.seasonNumber || 1);

    console.log(`[Points Calculation] Successfully calculated points for ${userPointsMap.size} users`);
  } catch (error) {
    console.error('[Points Calculation] Error:', error);
    throw error;
  }
}

async function calculateReferralBonuses(
  db: ReturnType<typeof createDbClient>,
  userPointsMap: Map<string, number>
): Promise<Map<string, number>> {
  const bonuses = new Map<string, number>();

  // Get all referral relationships
  const allReferrals = await db.select().from(referrals).all();

  if (!allReferrals || allReferrals.length === 0) {
    return bonuses;
  }

  // Calculate bonuses
  for (const referral of allReferrals) {
    const refereePoints = userPointsMap.get(referral.refereeAddress) || 0;

    if (refereePoints >= REFERRAL_CONFIG.minPointsForBonus) {
      const bonus = refereePoints * REFERRAL_CONFIG.bonusRate;
      const currentBonus = bonuses.get(referral.referrerAddress) || 0;
      bonuses.set(referral.referrerAddress, currentBonus + bonus);
    }
  }

  console.log(`[Points Calculation] Calculated referral bonuses for ${bonuses.size} referrers`);

  return bonuses;
}

async function hasUserActivityInWeek1(
  db: ReturnType<typeof createDbClient>,
  userAddress: string
): Promise<boolean> {
  const season1Week1 = POINTS_CONFIG[0]?.weeks[0];
  if (!season1Week1) return false;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(positionSnapshots)
    .where(
      and(
        eq(positionSnapshots.userAddress, userAddress),
        gte(positionSnapshots.snapshotTime, new Date(season1Week1.startDate)),
        lt(positionSnapshots.snapshotTime, new Date(season1Week1.endDate))
      )
    )
    .get();

  return (result?.count || 0) > 0;
}

async function updateUserTotalPoints(
  db: ReturnType<typeof createDbClient>,
  seasonNumber: number
): Promise<void> {
  // Recalculate total points for all users in this season
  const totals = await db
    .select({
      userAddress: userPoints.userAddress,
      seasonPoints: sql<number>`SUM(${userPoints.totalPoints})`,
    })
    .from(userPoints)
    .where(eq(userPoints.seasonNumber, seasonNumber))
    .groupBy(userPoints.userAddress)
    .all();

  if (!totals || totals.length === 0) {
    return;
  }

  // Update each user's total (batch upserts)
  for (const row of totals) {
    const columnName = `season${seasonNumber}Points` as 'season1Points' | 'season2Points' | 'season3Points';

    await db
      .insert(userTotalPoints)
      .values({
        userAddress: row.userAddress,
        [columnName]: row.seasonPoints,
      })
      .onConflictDoUpdate({
        target: userTotalPoints.userAddress,
        set: {
          [columnName]: row.seasonPoints,
          allTimePoints: sql`${userTotalPoints.season1Points} + ${userTotalPoints.season2Points} + ${userTotalPoints.season3Points}`,
          lastUpdated: new Date(),
        },
      });
  }
}

function getLastMondayISO(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToSubtract - 7); // Go back to last week's Monday
  return lastMonday.toISOString().split('T')[0];
}

function getNextMondayISO(mondayISO: string): string {
  const monday = new Date(mondayISO);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return nextMonday.toISOString().split('T')[0];
}
