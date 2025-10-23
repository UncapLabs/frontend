import BottomBanner from "~/components/ui/bottom-banner";

interface LiquidationWarningProps {
  liquidatedCount: number;
  onViewDetails: () => void;
}

export default function LiquidationWarning({
  liquidatedCount,
  onViewDetails,
}: LiquidationWarningProps) {
  return (
    <BottomBanner
      show={liquidatedCount > 0}
      variant="info"
      title="Liquidated Positions"
      description={`You have ${liquidatedCount} position${liquidatedCount > 1 ? "s" : ""} that ${liquidatedCount > 1 ? "were" : "was"} liquidated. You may have collateral surplus to claim.`}
      buttonText="View details & check surplus"
      onButtonClick={onViewDetails}
    />
  );
}
