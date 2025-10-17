import { useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { useTRPC, useTRPCClient } from "~/lib/trpc";
import { REFERRAL_STORAGE_KEY, normalizeReferralCode } from "~/lib/referrals";
import { useLocation, useNavigate } from "react-router";

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [storedCode, setStoredCode] = useLocalStorage<string | null>(
    REFERRAL_STORAGE_KEY,
    null
  );

  useEffect(() => {
    const search = location.search;
    if (!search) {
      return;
    }

    const params = new URLSearchParams(search);
    const codeFromQuery = params.get("ref");
    if (!codeFromQuery) {
      return;
    }

    const normalized = normalizeReferralCode(codeFromQuery);
    if (!normalized) {
      return;
    }

    setStoredCode((current) => (current === normalized ? current : normalized));

    params.delete("ref");
    const nextSearch = params.toString();
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    const nextUrl = `${location.pathname}${
      nextSearch ? `?${nextSearch}` : ""
    }${location.hash}`;

    if (nextUrl !== currentUrl) {
      navigate(nextUrl, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate, setStoredCode]);

  useEffect(() => {
    if (!address) {
      return;
    }

    const normalizedCode = normalizeReferralCode(storedCode ?? "");
    if (!normalizedCode) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await trpcClient.pointsRouter.applyReferralCode.mutate({
          userAddress: address,
          referralCode: normalizedCode,
        });

        if (cancelled) {
          return;
        }

        if (result.success) {
          toast.success(`Referral code ${normalizedCode} applied!`);
          setStoredCode(null);
          queryClient.invalidateQueries({
            queryKey: trpc.pointsRouter.getReferralInfo.queryKey({
              userAddress: address,
            }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.pointsRouter.getUserPoints.queryKey({
              userAddress: address,
            }),
          });
        } else {
          const message = result.message || "Failed to apply referral code";
          if (message === "You have already used a referral code") {
            toast.info(message);
          } else {
            toast.error(message);
          }
          setStoredCode(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to auto-apply referral code", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, storedCode, trpc, trpcClient, queryClient, setStoredCode]);

  return <>{children}</>;
}
