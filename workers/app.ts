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

export default app;
