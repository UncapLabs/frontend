import { priceRouter } from "./routers/prices";
import { positionsRouter } from "./routers/positions";
import { branchRouter } from "./routers/branch";
import { pointsRouter } from "./routers/points";
import { interestRouter } from "./routers/interest";
import { feesRouter } from "./routers/fees";
import { stabilityPoolRouter } from "./routers/stability-pool";
import { createCallerFactory, router } from "./trpc";
import { testRouter } from "./routers/test";

// Define our app's router
export const appRouter = router({
  priceRouter,
  positionsRouter,
  branchRouter,
  pointsRouter,
  interestRouter,
  feesRouter,
  stabilityPoolRouter,
  testRouter,
});

// Export type of AppRouter for client-side use
export type AppRouter = typeof appRouter;

// Create and export the caller factory instance.
export const createCaller = createCallerFactory(appRouter);
