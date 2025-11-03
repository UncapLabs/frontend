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
      <SelectTrigger className="h-8 w-48 border border-neutral-800/10 rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="manual">Advanced</SelectItem>
        <SelectItem value="managed">Managed by TelosC</SelectItem>
      </SelectContent>
    </Select>
  );
}
