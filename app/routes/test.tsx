import { useQuery } from "@tanstack/react-query";
import { createCaller } from "workers/router";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/lib/trpc";
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
  });

  const { env, test } = await caller.testRouter.getWorkerInfo();

  return { env, test };
}

export default function Test({ loaderData }: Route.ComponentProps) {
  const trpc = useTRPC();
  const greetingQuery = useQuery(trpc.testRouter.hello.queryOptions("Bro"));
  const workerInfoQuery = useQuery(
    trpc.testRouter.getWorkerInfo.queryOptions()
  );

  return (
    <div>
      <div className="flex items-center justify-center p-4">
        <div className="flex flex-col gap-4">
          <Button
            className=""
            onClick={() => {
              console.log("Hello");
            }}
          >
            Click me
          </Button>
        </div>
      </div>
      <p>{greetingQuery.data}</p>
      <p>{loaderData.env}</p>
      <p>{loaderData.test}</p>
      <p>{workerInfoQuery.data?.env}</p>
      <p>{workerInfoQuery.data?.test}</p>
    </div>
  );
}
