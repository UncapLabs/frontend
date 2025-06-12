import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router";
import { createRequestHandler } from "react-router";

const app = new Hono<{ Bindings: Env }>();

// Add more routes as needed here

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

// Handle both /docs and /docs/*
app.get("/docs", async (c) => {
  console.log("Docs route hit (exact):", c.req.path);
  console.log("DOCS_WORKER available:", !!c.env.DOCS_WORKER);

  try {
    const response = await c.env.DOCS_WORKER.fetch(c.req.raw);
    console.log("DOCS_WORKER response status:", response.status);
    console.log(
      "DOCS_WORKER response headers:",
      Object.fromEntries(response.headers.entries())
    );

    return response;
  } catch (error) {
    console.error("DOCS_WORKER fetch error:", (error as any).message);
    return c.text("Error calling docs worker: " + (error as any).message, 500);
  }
});

app.get("/docs/*", async (c) => {
  console.log("Docs route hit (wildcard):", c.req.path);
  return c.env.DOCS_WORKER.fetch(c.req.raw);
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

export default app;
