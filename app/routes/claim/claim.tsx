import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/claim";
import { STRKRewardsCard } from "~/components/claim/strk-rewards-card";

function ClaimPage() {
  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">STRK Rewards</h1>
        <p className="text-slate-600">
          Claim your STRK rebates earned from protocol fees
        </p>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      {/* STRK Rewards Section */}
      <STRKRewardsCard />
    </div>
  );
}

export default ClaimPage;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STRK Rewards - USDU" },
    {
      name: "description",
      content: "Claim your STRK rewards and rebates",
    },
  ];
}
