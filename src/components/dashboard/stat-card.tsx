import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "warn" | "info";
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
        ? "text-rose-400"
        : tone === "warn"
          ? "text-amber-400"
          : tone === "info"
            ? "text-blue-400"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="flex min-h-[100px] flex-col justify-between p-5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={cn("text-3xl font-extrabold tracking-tight", color)}>{value}</span>
        {sub ? <span className="text-[11px] font-medium text-muted-foreground">{sub}</span> : null}
      </CardContent>
    </Card>
  );
}
