import type { Route } from "./+types/claim";
import { STRKRewardsCard } from "~/components/claim/strk-rewards-card";

function ClaimPage() {
  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
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
