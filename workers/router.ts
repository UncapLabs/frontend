import { priceRouter } from "./routers/prices";
import { positionsRouter } from "./routers/positions";
import { branchRouter } from "./routers/branch";
import { pointsRouter } from "./routers/points";
import { interestRouter } from "./routers/interest";
import { feesRouter } from "./routers/fees";
import { stabilityPoolRouter } from "./routers/stability-pool";
import { createCallerFactory, router } from "./trpc";
import { contentRouter } from "./routers/content";
import { claimRouter } from "./routers/claim";
import { featureFlagsRouter } from "./routers/feature-flags";
import { incentivesRouter } from "./routers/incentives";

// Define our app's router
export const appRouter = router({
  priceRouter,
  positionsRouter,
  branchRouter,
  pointsRouter,
  interestRouter,
  feesRouter,
  stabilityPoolRouter,
  contentRouter,
  claimRouter,
  featureFlagsRouter,
  incentivesRouter,
});

// Export type of AppRouter for client-side use
export type AppRouter = typeof appRouter;

// Create and export the caller factory instance.
export const createCaller = createCallerFactory(appRouter);
