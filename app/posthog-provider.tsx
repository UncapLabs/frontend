// app/provider.tsx
import { useEffect, useState, type ReactNode } from "react";

// Define proper types for PostHog
interface PostHogWindow extends Window {
  posthog?: {
    init: (apiKey: string, config: { api_host: string }) => void;
    capture: (event: string, properties?: Record<string, any>) => void;
    identify: (userId: string, properties?: Record<string, any>) => void;
    reset: () => void;
    q?: any[];
    c?: number;
  };
}

declare global {
  interface Window {
    posthog?: PostHogWindow["posthog"];
  }
}

export function PHProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    let mounted = true;

    const loadPostHog = async () => {
      try {
        const { default: posthog } = await import("posthog-js");

        if (mounted) {
          posthog.init("phc_yIxOHwCOu1TnJZfNoiwJl6mwxc4PuQG8UGkG2VcZEjL", {
            api_host: "https://us.i.posthog.com",
          });
        }
      } catch (error) {
        console.error("Failed to load PostHog:", error);
      }
    };

    loadPostHog();

    return () => {
      mounted = false;
    };
  }, [isClient]);

  return <>{children}</>;
}
