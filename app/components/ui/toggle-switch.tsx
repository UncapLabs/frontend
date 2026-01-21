import { cn } from "~/lib/utils";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
  className,
}: ToggleSwitchProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        enabled ? "bg-blue-500" : "bg-neutral-300",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          enabled ? "translate-x-[18px]" : "translate-x-1"
        )}
      />
    </button>
  );
}
