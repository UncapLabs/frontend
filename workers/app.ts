import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router";
import { createRequestHandler } from "react-router";
import { getTotalCirculatingSupply } from "./services/supply";
import { calculateWeeklyPoints } from "./scheduled/calculate-weekly-points";
import { SnapshotCollectorDO } from "./durable-objects/snapshot-collector";

const app = new Hono<{ Bindings: Env }>();

// Export Durable Object
export { SnapshotCollectorDO };

// CoinGecko API integration - Supply endpoint
app.get("/api/coingecko/supply", async (c) => {
  try {
    const totalSupply = await getTotalCirculatingSupply(c.env.NODE_URL);

    console.log("totalSupply", totalSupply);

    // Set CORS headers to allow CoinGecko to access the endpoint
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET");
    c.header("Cache-Control", "public, max-age=60"); // Cache for 1 minute

    return c.json({ result: totalSupply });
  } catch (error) {
    console.error("Error fetching supply for CoinGecko:", error);
    return c.json({ error: "Failed to fetch supply" }, 500);
  }
});

// Protect admin endpoints with Bearer Auth
app.use('/api/admin/*', async (c, next) => {
  if (!c.env.ADMIN_API_KEY) {
    return c.json({ error: 'Admin authentication not configured' }, 500);
  }

  const auth = bearerAuth({ token: c.env.ADMIN_API_KEY });
  return auth(c, next);
});

// Admin endpoints for Points & Referral system
app.post("/api/admin/init-snapshot-collector", async (c) => {
  try {
    const id = c.env.SNAPSHOT_COLLECTOR.idFromName("global");
    const stub = c.env.SNAPSHOT_COLLECTOR.get(id);
    const response = await stub.fetch(new Request("https://dummy/init"));
    return response;
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/api/admin/trigger-snapshot", async (c) => {
  try {
    const id = c.env.SNAPSHOT_COLLECTOR.idFromName("global");
    const stub = c.env.SNAPSHOT_COLLECTOR.get(id);
    const response = await stub.fetch(new Request("https://dummy/trigger"));
    return response;
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get("/api/admin/snapshot-status", async (c) => {
  try {
    const id = c.env.SNAPSHOT_COLLECTOR.idFromName("global");
    const stub = c.env.SNAPSHOT_COLLECTOR.get(id);
    const response = await stub.fetch(new Request("https://dummy/status"));
    return response;
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/api/admin/backfill-snapshots", async (c) => {
  try {
    const body = await c.req.json();
    const { from, to } = body;

    if (!from || !to) {
      return c.json({ error: "Missing required fields: from, to" }, 400);
    }

    const id = c.env.SNAPSHOT_COLLECTOR.idFromName("global");
    const stub = c.env.SNAPSHOT_COLLECTOR.get(id);
    const response = await stub.fetch(new Request(`https://dummy/backfill?from=${from}&to=${to}`));
    return response;
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/api/admin/trigger-points-calculation", async (c) => {
  try {
    await calculateWeeklyPoints(c.env);
    return c.json({ success: true, message: "Points calculated" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => {
      return {
        env: c.env,
        executionCtx: c.executionCtx,
      };
    },
  })
);

// Handle ALL /docs requests by forwarding to docs worker
app.all("/docs*", async (c) => {
  // Strip /docs prefix: /docs/intro becomes /intro, /docs becomes /
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace(/^\/docs/, "") || "/";

  const newRequest = new Request(url.toString(), {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.raw.body,
  });

  return c.env.DOCS_WORKER.fetch(newRequest);
});

app.get("*", (c) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
  );

  return requestHandler(c.req.raw, {
    cloudflare: {
      env: c.env,
      ctx: c.executionCtx,
    },
  });
});

// Scheduled handler for cron triggers
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`[Cron] Triggered: ${event.cron}`);

    try {
      if (event.cron === "0 0 * * FRI") {
        // Weekly points calculation (Friday midnight)
        await calculateWeeklyPoints(env);
      }
    } catch (error) {
      console.error('[Cron] Error:', error);
      // Don't throw - let cron retry naturally
    }
  },
};
