import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { useTRPC } from "~/lib/trpc";
import { useState, useEffect, useRef } from "react";

export function UserPoints() {
  const { address } = useAccount();
  const trpc = useTRPC();
  const [displayPoints, setDisplayPoints] = useState<number>(0);
  const lastFetchTime = useRef<number>(Date.now());
  const earningRateRef = useRef<number>(0);

  const { data, isLoading } = useQuery({
    ...trpc.pointsRouter.getUserPoints.queryOptions({ 
      userAddress: address || "" 
    }),
    enabled: !!address,
    refetchInterval: 5000, // Fetch new data every 5 seconds
    staleTime: 0,
    gcTime: 0,
  });

  // Update base points and earning rate when data changes
  useEffect(() => {
    if (data) {
      setDisplayPoints(data.currentPoints);
      earningRateRef.current = data.earningRate;
      lastFetchTime.current = Date.now();
    }
  }, [data]);

  // Animate points incrementing every 100ms
  useEffect(() => {
    if (!data || earningRateRef.current === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeDelta = (now - lastFetchTime.current) / 1000; // Convert to seconds
      const earnedSinceLastFetch = earningRateRef.current * timeDelta;
      setDisplayPoints(data.currentPoints + earnedSinceLastFetch);
    }, 100);

    return () => clearInterval(interval);
  }, [data]);

  if (!address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Coins className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  const formatAnimatedPoints = (points: number) => {
    const [whole, decimal] = points.toFixed(9).split('.');
    
    // Format whole number with commas
    const formattedWhole = parseInt(whole).toLocaleString();
    
    // Split decimals for different styling
    const firstThree = decimal.slice(0, 3);
    const middleThree = decimal.slice(3, 6);
    const lastThree = decimal.slice(6, 9);

    return (
      <span className="font-mono">
        <span className="text-sm font-semibold">{formattedWhole}</span>
        <span className="text-sm">.</span>
        <span className="text-sm">{firstThree}</span>
        <span className="text-xs opacity-80">{middleThree}</span>
        <span className="text-xs opacity-60">{lastThree}</span>
      </span>
    );
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="text-blue-900 dark:text-blue-100">
        {formatAnimatedPoints(displayPoints)}
        <span className="text-sm ml-1">pts</span>
      </div>
    </div>
  );
}