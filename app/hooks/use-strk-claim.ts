import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";
import { useTRPC } from "~/lib/trpc";
import { toHexAddress } from "~/lib/utils/address";

const DUMMY_ADDRESS = "0x0";

export function useStrkClaimCalldata(round?: number) {
  const { address } = useAccount();
  const trpc = useTRPC();
  const normalizedAddress = address ? toHexAddress(address) : undefined;
  const enabled = Boolean(normalizedAddress);

  return useQuery({
    ...trpc.claimRouter.getCalldata.queryOptions(
      {
        address: normalizedAddress ?? DUMMY_ADDRESS,
        round,
      },
      {
        enabled,
      }
    ),
    enabled,
    staleTime: 60_000,
  });
}

export function useStrkAllocationAmount(round?: number) {
  const { address } = useAccount();
  const trpc = useTRPC();
  const normalizedAddress = address ? toHexAddress(address) : undefined;
  const enabled = Boolean(normalizedAddress);

  return useQuery({
    ...trpc.claimRouter.getAllocationAmount.queryOptions(
      {
        address: normalizedAddress ?? DUMMY_ADDRESS,
        round,
      },
      {
        enabled,
      }
    ),
    enabled,
    staleTime: 60_000,
    refetchInterval: 300_000,
  });
}

export function useStrkRoundBreakdown(round?: number) {
  const { address } = useAccount();
  const trpc = useTRPC();
  const normalizedAddress = address ? toHexAddress(address) : undefined;
  const enabled = Boolean(normalizedAddress);

  return useQuery({
    ...trpc.claimRouter.getRoundBreakdown.queryOptions(
      {
        address: normalizedAddress ?? DUMMY_ADDRESS,
        round,
      },
      {
        enabled,
      }
    ),
    enabled,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });
}
