import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import Big from "big.js";

// Register Big.js with superjson for serialization
superjson.registerCustom<Big, string>(
  {
    isApplicable: (v): v is Big => v instanceof Big,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Big(v),
  },
  "big.js"
);

// Define the shape of our tRPC context - uses Env from worker-configuration.d.ts
export type HonoContext = {
  env: Env;
  executionCtx: ExecutionContext;
};

// Initialize tRPC with the defined context type and superjson transformer
const t = initTRPC.context<HonoContext>().create({
  transformer: superjson,
});

// Export the router, procedure helpers, and middleware factory
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;
