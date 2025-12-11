import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { useTRPC, useTRPCClient } from "~/lib/trpc";
import { REFERRAL_STORAGE_KEY, normalizeReferralCode } from "~/lib/referrals";
import { useLocation, useNavigate } from "react-router";
import { ReferralWelcomeDialog } from "~/components/referral-welcome-dialog";

/**
 * Extract and validate referral code from URL search params
 */
function getReferralCodeFromSearch(search: string): string | null {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const code = params.get("ref");
  if (!code) return null;
  return normalizeReferralCode(code);
}

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
  const [alreadyHasReferral, setAlreadyHasReferral] = useState(false);

  // Initialize dialog state based on URL - the initializer function only runs once
  // so this correctly shows the dialog on first render if ref param is present
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(
    () => getReferralCodeFromSearch(location.search) !== null
  );

  useEffect(() => {
    const normalizedCode = getReferralCodeFromSearch(location.search);
    if (!normalizedCode) {
      return;
    }

    // Store the referral code
    setStoredCode((current) =>
      current === normalizedCode ? current : normalizedCode
    );

    // Clean up URL by removing ref param
    const params = new URLSearchParams(location.search);
    params.delete("ref");
    const nextSearch = params.toString();
    const nextUrl = `${location.pathname}${nextSearch ? `?${nextSearch}` : ""}${
      location.hash
    }`;

    navigate(nextUrl, { replace: true });
  }, [
    location.pathname,
    location.search,
    location.hash,
    navigate,
    setStoredCode,
  ]);

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
          setStoredCode(null);
          setAlreadyHasReferral(false);
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
            setAlreadyHasReferral(true);
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

  return (
    <>
      {children}
      <ReferralWelcomeDialog
        open={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
        alreadyHasReferral={alreadyHasReferral}
      />
    </>
  );
}
