import { publicProcedure, router } from "../trpc";
import * as z from "zod";

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";

const getUserPointsQuery = `
  query GetUserPoints($userAddress: ID!) {
    user(id: $userAddress) {
      totalPoints
      totalRate
      lastUpdateTime
    }
  }
`;

type UserPointsResponse = {
  data?: {
    user?: {
      totalPoints: string;
      totalRate: string;
      lastUpdateTime: string;
    };
  };
  errors?: Array<{ message: string }>;
};

type PointsResult = {
  currentPoints: number;
  earningRate: number;
};

async function fetchUserFromGraphQL(
  userAddress: string
): Promise<UserPointsResponse> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: getUserPointsQuery,
      variables: { userAddress },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}

function calculateCurrentPoints(
  totalPoints: string,
  earningRate: string,
  lastUpdateTime: string
): PointsResult {
  const timestampNow = Math.floor(Date.now() / 1000);
  const timeDelta = timestampNow - parseInt(lastUpdateTime);

  // Convert from 10^18 format to actual values for calculation
  // earningRate is in points per second * 10^18
  const ratePerSecond = BigInt(earningRate);
  const totalPointsBigInt = BigInt(totalPoints);

  // Calculate accumulated points (rate * time)
  const accumulatedPoints = ratePerSecond * BigInt(timeDelta);

  // Add to total (both are in 10^18 format)
  const currentPointsBigInt = totalPointsBigInt + accumulatedPoints;

  // Convert to number by dividing by 10^18
  const currentPoints = Number(currentPointsBigInt) / 1e18;
  const earningRateNumber = Number(ratePerSecond) / 1e18;

  return {
    currentPoints,
    earningRate: earningRateNumber,
  };
}

export const pointsRouter = router({
  getUserPoints: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userAddress } = input;

      try {
        const data = await fetchUserFromGraphQL(userAddress);

        if (data.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        const user = data.data?.user;

        if (!user) {
          throw new Error(`User not found: ${userAddress}`);
        }

        return calculateCurrentPoints(
          user.totalPoints,
          user.totalRate,
          user.lastUpdateTime
        );
      } catch (error) {
        console.error("[getUserPoints] Error fetching user points:", error);
        throw error;
      }
    }),
});

export type PointsRouter = typeof pointsRouter;
