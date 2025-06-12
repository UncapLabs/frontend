// app/provider.tsx
import { useEffect, useState } from "react";
import { PostHogProvider } from "posthog-js/react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  const [posthog, setPosthog] = useState<any>(null);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== "undefined") {
      // Dynamic import to ensure it only loads on client
      import("posthog-js").then((posthogModule) => {
        const posthogClient = posthogModule.default;

        posthogClient.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          capture_pageview: false, // We'll handle this manually with React Router
        });

        setPosthog(posthogClient);
      });
    }
  }, []);

  // Don't render PostHogProvider until posthog is loaded
  if (!posthog) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
