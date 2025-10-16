import { InfoDialog } from "./info-dialog";

export function FloatingInfoButton() {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:left-8 z-40">
      <InfoDialog />
    </div>
  );
}
