import { cn } from "@/lib/utils";

interface MacroChipProps {
  label: string;
  value: number;
  unit?: string;
  color: "protein" | "carbs" | "fats";
  size?: "sm" | "md";
}

const COLOR_MAP = {
  protein: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  carbs:   "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fats:    "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function MacroChip({ label, value, unit = "g", color, size = "md" }: MacroChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full font-medium",
        COLOR_MAP[color],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      <span className="opacity-70">{label}</span>
      <span>{value}{unit}</span>
    </div>
  );
}
