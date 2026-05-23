import { calcMetrics } from "@/lib/domain/metrics";
import type { DraftSession, DraftTrade } from "@/lib/domain/types";

export interface DashboardSummary {
  totalTrades: number;
  totalPnl: number;
  wins: number;
  losses: number;
  winRate: number; // %
  expectancy: number; // avg $ per trade
  avgWin: number;
  avgLoss: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  pnlByDay: { date: string; pnl: number }[];
  pnlByHour: { hour: number; pnl: number; trades: number }[];
  winRateBySetup: { setup: string; winRate: number; trades: number }[];
  checklistFailures: { key: string; label: string; failsOnLoss: number }[];
}

const CHECKLIST_LABELS: Record<string, string> = {
  htfBiasConfirmed: "HTF bias confirmed",
  sessionActive: "Killzone active",
  validSetup: "Valid setup",
  entry5mConfirmation: "1–2m FVG entry",
  stopBeyondStructure: "Stop beyond structure",
  riskInRange: "Risk ≤ $200",
};

export function aggregate(sessions: DraftSession[]): DashboardSummary {
  const trades: { date: string; trade: DraftTrade }[] = sessions.flatMap((s) =>
    s.trades.map((t) => ({ date: s.date, trade: t })),
  );

  const totals = { pnl: 0, wins: 0, losses: 0, totalWinDollars: 0, totalLossDollars: 0 };
  const byDay = new Map<string, number>();
  const byHour = new Map<number, { pnl: number; trades: number }>();
  const bySetup = new Map<string, { wins: number; trades: number }>();
  const checklistFails = new Map<string, number>();

  for (const { date, trade } of trades) {
    const m = calcMetrics(trade);
    totals.pnl += m.pnl;
    if (m.pnl > 0) {
      totals.wins++;
      totals.totalWinDollars += m.pnl;
    } else if (m.pnl < 0) {
      totals.losses++;
      totals.totalLossDollars += m.pnl;
    }
    byDay.set(date, (byDay.get(date) ?? 0) + m.pnl);

    const hour = new Date(trade.occurredAt).getHours();
    const cur = byHour.get(hour) ?? { pnl: 0, trades: 0 };
    cur.pnl += m.pnl;
    cur.trades++;
    byHour.set(hour, cur);

    for (const setup of trade.setup.primary) {
      const cur = bySetup.get(setup) ?? { wins: 0, trades: 0 };
      cur.trades++;
      if (m.pnl > 0) cur.wins++;
      bySetup.set(setup, cur);
    }

    if (m.pnl < 0) {
      for (const [key, val] of Object.entries(trade.checklist)) {
        if (val === "No") checklistFails.set(key, (checklistFails.get(key) ?? 0) + 1);
      }
    }
  }

  const pnlByDay = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl: Math.round(pnl * 100) / 100 }));
  const pnlByHour = [...byHour.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, v]) => ({ hour, pnl: Math.round(v.pnl * 100) / 100, trades: v.trades }));

  const winRateBySetup = [...bySetup.entries()]
    .map(([setup, v]) => ({
      setup,
      trades: v.trades,
      winRate: v.trades ? Math.round((v.wins / v.trades) * 100) : 0,
    }))
    .sort((a, b) => b.trades - a.trades);

  const checklistFailures = [...checklistFails.entries()]
    .map(([key, n]) => ({ key, label: CHECKLIST_LABELS[key] ?? key, failsOnLoss: n }))
    .sort((a, b) => b.failsOnLoss - a.failsOnLoss);

  const bestDay = pnlByDay.reduce<DashboardSummary["bestDay"]>(
    (best, d) => (best && best.pnl >= d.pnl ? best : { date: d.date, pnl: d.pnl }),
    null,
  );
  const worstDay = pnlByDay.reduce<DashboardSummary["worstDay"]>(
    (worst, d) => (worst && worst.pnl <= d.pnl ? worst : { date: d.date, pnl: d.pnl }),
    null,
  );

  const totalTrades = totals.wins + totals.losses + (trades.length - totals.wins - totals.losses);
  const winRate = totalTrades ? Math.round((totals.wins / totalTrades) * 100) : 0;
  const expectancy = trades.length ? Math.round((totals.pnl / trades.length) * 100) / 100 : 0;
  const avgWin = totals.wins ? Math.round((totals.totalWinDollars / totals.wins) * 100) / 100 : 0;
  const avgLoss = totals.losses
    ? Math.round((totals.totalLossDollars / totals.losses) * 100) / 100
    : 0;

  return {
    totalTrades: trades.length,
    totalPnl: Math.round(totals.pnl * 100) / 100,
    wins: totals.wins,
    losses: totals.losses,
    winRate,
    expectancy,
    avgWin,
    avgLoss,
    bestDay,
    worstDay,
    pnlByDay,
    pnlByHour,
    winRateBySetup,
    checklistFailures,
  };
}
