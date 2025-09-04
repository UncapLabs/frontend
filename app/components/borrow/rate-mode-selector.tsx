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
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="manual">Manual</SelectItem>
        <SelectItem value="managed">Managed by Telos</SelectItem>
      </SelectContent>
    </Select>
  );
}
