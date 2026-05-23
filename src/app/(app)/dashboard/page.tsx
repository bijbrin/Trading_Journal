import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { SetupGrid } from "@/components/dashboard/setup-grid";
import { ChecklistFails } from "@/components/dashboard/checklist-fails";
import { listSessions } from "@/app/actions/sessions";
import { aggregate } from "@/lib/dashboard/aggregate";
import { fmt$ } from "@/lib/domain/format";

export default async function DashboardPage() {
  const sessions = await listSessions();
  const s = aggregate(sessions);

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Your dashboard will appear here once you log a session.</p>
          <Link href="/log" className={buttonVariants()}>
            Log your first session
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total P&L"
          value={fmt$(s.totalPnl)}
          sub={`${s.totalTrades} trades`}
          tone={s.totalPnl > 0 ? "good" : s.totalPnl < 0 ? "bad" : undefined}
        />
        <StatCard
          label="Win rate"
          value={`${s.winRate}%`}
          sub={`${s.wins}W / ${s.losses}L`}
          tone={s.winRate >= 50 ? "good" : "warn"}
        />
        <StatCard
          label="Expectancy"
          value={fmt$(s.expectancy)}
          sub="per trade"
          tone={s.expectancy > 0 ? "good" : s.expectancy < 0 ? "bad" : undefined}
        />
        <StatCard
          label="Avg win / loss"
          value={`${fmt$(s.avgWin)} / ${fmt$(s.avgLoss)}`}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="P&L by day"
          data={s.pnlByDay.slice(-14).map((d) => ({ label: d.date.slice(5), value: d.pnl }))}
        />
        <BarChart
          title="P&L by hour"
          data={s.pnlByHour.map((d) => ({ label: `${d.hour}:00`, value: d.pnl }))}
        />
      </div>

      <SetupGrid data={s.winRateBySetup} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChecklistFails data={s.checklistFailures} />
        <Card>
          <CardContent className="grid gap-2 p-5">
            <div className="text-sm font-semibold">Best day</div>
            {s.bestDay ? (
              <div>
                <span className="text-emerald-400 font-bold">{fmt$(s.bestDay.pnl)}</span>{" "}
                <span className="text-muted-foreground text-sm">on {s.bestDay.date}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            )}
            <div className="mt-4 text-sm font-semibold">Worst day</div>
            {s.worstDay ? (
              <div>
                <span className="text-rose-400 font-bold">{fmt$(s.worstDay.pnl)}</span>{" "}
                <span className="text-muted-foreground text-sm">on {s.worstDay.date}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
