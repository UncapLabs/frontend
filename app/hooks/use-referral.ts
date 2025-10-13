import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC, useTRPCClient } from "~/lib/trpc";
import { useAccount } from "@starknet-react/core";
import { toast } from "sonner";

export function useReferral() {
  const { address } = useAccount();
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  const { data: referralInfo, isLoading } = useQuery({
    ...trpc.pointsRouter.getReferralInfo.queryOptions(
      { userAddress: address || "" },
      { enabled: !!address }
    ),
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      return trpcClient.pointsRouter.generateReferralCode.mutate({
        userAddress: address || "",
      });
    },
    onSuccess: () => {
      toast.success("Referral code generated!");
      queryClient.invalidateQueries({
        queryKey: trpc.pointsRouter.getReferralInfo.queryKey({
          userAddress: address || "",
        }),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate code: ${error.message}`);
    },
  });

  const applyCode = useMutation({
    mutationFn: async (code: string) => {
      return trpcClient.pointsRouter.applyReferralCode.mutate({
        userAddress: address || "",
        referralCode: code,
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: trpc.pointsRouter.getReferralInfo.queryKey({
            userAddress: address || "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.pointsRouter.getUserPoints.queryKey({
            userAddress: address || "",
          }),
        });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply code: ${error.message}`);
    },
  });

  return {
    referralInfo,
    isLoading,
    generateCode: () => generateCode.mutate(),
    applyCode: (code: string) => applyCode.mutate(code),
    isGenerating: generateCode.isPending,
    isApplying: applyCode.isPending,
  };
}
