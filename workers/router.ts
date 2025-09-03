import { priceRouter } from "./routers/prices";
import { testRouter } from "./routers/test";
import { positionsRouter } from "./routers/positions";
import { branchRouter } from "./routers/branch";
import { pointsRouter } from "./routers/points";
import { interestRouter } from "./routers/interest";
import { createCallerFactory, router } from "./trpc";

// Define our app's router
export const appRouter = router({
  testRouter,
  priceRouter,
  positionsRouter,
  branchRouter,
  pointsRouter,
  interestRouter,
});

// Export type of AppRouter for client-side use
export type AppRouter = typeof appRouter;

// Create and export the caller factory instance.
export const createCaller = createCallerFactory(appRouter);
