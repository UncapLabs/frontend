import { initTRPC } from "@trpc/server";
import type { Bindings } from "hono/types";
import type { RpcProvider } from "starknet";
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

export interface CloudflareBindings extends Bindings {
  VALUE_FROM_CLOUDFLARE: string;
  ASSETS: Fetcher;
  // Need to add other specific environment variables as needed
}

// Define the shape of our tRPC context.
export type HonoContext = {
  env: CloudflareBindings;
  executionCtx: ExecutionContext;
  starknetProvider: RpcProvider;
  // honoReq: import(\'hono\').Context[\'req\']; // could also include the raw Hono request if needed
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
