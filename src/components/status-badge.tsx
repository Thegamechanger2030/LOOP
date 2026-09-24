import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-[#7C3AED]/15 text-[#A78BFA] border border-[#3B1F4D]",
  REVIEWED: "bg-[#A855F7]/15 text-[#c084fc] border border-[#A855F7]/30",
  ACTIONED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
};

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm",
  NEUTRAL: "bg-[#7C3AED]/15 text-[#A78BFA] border border-[#3B1F4D]",
  NEGATIVE: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 shadow-sm",
};

export function Badge({ kind, value }: { kind: "status" | "sentiment"; value: string | null }) {
  if (!value) return <span className="text-xs text-[#A78BFA]">—</span>;
  const styles = kind === "status" ? STATUS_STYLES : SENTIMENT_STYLES;
  return (
    <span className={cn("text-xs font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap", styles[value])}>
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          value === "POSITIVE" || value === "ACTIONED"
            ? "bg-emerald-400 animate-pulse"
            : value === "NEGATIVE"
            ? "bg-[#EF4444]"
            : "bg-[#A855F7]"
        )}
      />
      {value.toLowerCase()}
    </span>
  );
}
