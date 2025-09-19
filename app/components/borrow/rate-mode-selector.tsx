import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type RateMode = "manual" | "managed";

interface RateModeSelectorProps {
  mode: RateMode;
  onModeChange: (mode: RateMode) => void;
  disabled?: boolean;
}

export function RateModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: RateModeSelectorProps) {
  return (
    <Select
      value={mode}
      onValueChange={(value) => onModeChange(value as RateMode)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 border border-neutral-800/10 rounded-lg text-xs text-neutral-800 font-medium font-sora leading-3">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          className="text-xs text-neutral-800 font-medium font-sora leading-3"
          value="manual"
        >
          Advanced
        </SelectItem>
        <SelectItem
          className="text-xs text-neutral-800 font-medium font-sora leading-3"
          value="managed"
        >
          Managed by Telos
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
