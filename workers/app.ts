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
  return c.env.DOCS_WORKER.fetch(c.req.raw);
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
