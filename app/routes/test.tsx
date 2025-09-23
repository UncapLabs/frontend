import { RpcProvider } from "starknet";
import { createCaller } from "workers/router";
import type { Route } from "./+types/test";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "USDU" },
    { name: "This is USDU", content: "Welcome to USDU!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const caller = createCaller({
    env: context.cloudflare.env,
    executionCtx: context.cloudflare.ctx,
    starknetProvider: new RpcProvider({
      nodeUrl: context.cloudflare.env.NODE_URL,
    }),
  });

  const data = await caller.testRouter.getWorkerInfo({ name: "Test" });

  return { data };
}

export default function Test({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <p>{loaderData.data}</p>
    </div>
  );
}
