import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/claim";
import { CollateralSurplusCard } from "~/components/claim/collateral-surplus-card";
import { STRKRewardsCard } from "~/components/claim/strk-rewards-card";

function ClaimPage() {
  return (
    <div className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          Claim Rewards
        </h1>
        <p className="text-slate-600">
          Claim your available rewards from collateral surplus and STRK rebates
        </p>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      {/* Always show rewards sections */}
      <div className="space-y-12">
        {/* STRK Rewards Section - always shows */}
        <STRKRewardsCard />
        {/* Collateral Surplus Section - only shows if surplus available */}
        <CollateralSurplusCard />
      </div>
    </div>
  );
}

export default ClaimPage;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Claim Rewards - USDU" },
    {
      name: "description",
      content: "Claim your collateral surplus and STRK rewards",
    },
  ];
}
