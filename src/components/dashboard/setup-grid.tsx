import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SetupGrid({
  data,
}: {
  data: { setup: string; winRate: number; trades: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Setup win rate</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => (
              <div
                key={d.setup}
                className="flex flex-col gap-1 rounded-md border bg-card p-3"
              >
                <div className="text-xs text-muted-foreground">{d.setup}</div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      d.winRate >= 60 && "text-emerald-400",
                      d.winRate >= 40 && d.winRate < 60 && "text-amber-400",
                      d.winRate < 40 && "text-rose-400",
                    )}
                  >
                    {d.winRate}%
                  </span>
                  <span className="text-[11px] text-muted-foreground">{d.trades} trades</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
