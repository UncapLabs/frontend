import { scan } from "react-scan";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { Toaster } from "~/components/ui/sonner";
import { TRPCProvider } from "./lib/trpc";
import { useState } from "react";
import { useEffect } from "react";
import type { AppRouter } from "workers/router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import superjson from "superjson";
import Big from "big.js";

import type { Route } from "./+types/root";
import "./app.css";
import { PHProvider } from "./providers/posthog-provider";
import { StarknetProvider } from "./providers/starknet-provider";
import { ReferralProvider } from "./providers/referral-provider";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Uncap Finance - Finally, Do More With Your Bitcoin" },
    {
      name: "description",
      content:
        "Borrow against your Bitcoin at rates as low as 0.5%—the cheapest in DeFi. You set the rate and keep full control of your Bitcoin.",
    },

    // Open Graph
    {
      property: "og:title",
      content: "Uncap Finance - Finally, Do More With Your Bitcoin",
    },
    {
      property: "og:description",
      content:
        "Borrow against your Bitcoin at rates as low as 0.5%—the cheapest in DeFi. You set the rate and keep full control of your Bitcoin.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://uncap.finance" },
    { property: "og:image", content: "https://uncap.finance/og-image.jpg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@UncapFinance" },
    {
      name: "twitter:title",
      content: "Uncap Finance - Finally, Do More With Your Bitcoin",
    },
    {
      name: "twitter:description",
      content:
        "Borrow against your Bitcoin at rates as low as 0.5%—the cheapest in DeFi. You set the rate and keep full control of your Bitcoin.",
    },
    { name: "twitter:image", content: "https://uncap.finance/og-image.jpg" },
  ];
};

// Register Big.js with superjson for serialization (must match server)
superjson.registerCustom<Big, string>(
  {
    isApplicable: (v): v is Big => v instanceof Big,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Big(v),
  },
  "big.js"
);

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Make sure to run react-scan only after hydration
    scan({
      enabled: true,
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PHProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </PHProvider>
      </body>
    </html>
  );
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function App() {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <StarknetProvider>
          <NuqsAdapter>
            <ReferralProvider>
              <Outlet />
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </ReferralProvider>
          </NuqsAdapter>
        </StarknetProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
