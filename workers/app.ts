import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router";
import { createRequestHandler } from "react-router";
import { getTotalCirculatingSupply } from "./services/supply";

const app = new Hono<{ Bindings: Env }>();

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

export default {
  fetch: app.fetch,
};
