"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calcMetrics, calcRoutineScore } from "@/lib/domain/metrics";
import { fmt$, fmtDate } from "@/lib/domain/format";
import { deleteSession, deleteTrade } from "@/app/actions/sessions";
import type { DraftSession } from "@/lib/domain/types";

export function JournalView({ sessions }: { sessions: DraftSession[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<
    | { kind: "session"; sessionId: string; date: string }
    | { kind: "trade"; tradeId: string }
    | null
  >(null);

  function runDelete() {
    if (!confirm) return;
    startTransition(async () => {
      try {
        if (confirm.kind === "session") await deleteSession(confirm.sessionId);
        else await deleteTrade(confirm.tradeId);
        toast.success("Deleted");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setConfirm(null);
      }
    });
  }

  if (!sessions.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>No sessions yet.</p>
          <Link href="/log" className={buttonVariants()}>
            Log your first session
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map((s) => {
        const totalPnl = s.trades.reduce((acc, t) => acc + calcMetrics(t).pnl, 0);
        const wins = s.trades.filter((t) => calcMetrics(t).pnl > 0).length;
        const routineScore = calcRoutineScore(s.routine);
        return (
          <Card key={s.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">
                  {new Date(`${s.date}T12:00:00Z`).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{s.trades.length} trades</Badge>
                  <Badge
                    variant="outline"
                    className={
                      totalPnl > 0
                        ? "text-emerald-400"
                        : totalPnl < 0
                          ? "text-rose-400"
                          : undefined
                    }
                  >
                    {fmt$(totalPnl)}
                  </Badge>
                  <Badge variant="outline">{wins} W</Badge>
                  <Badge variant="outline">Routine {routineScore}%</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/log/${s.date}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  Edit
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirm({ kind: "session", sessionId: s.id!, date: s.date })}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            {s.trades.length > 0 && (
              <CardContent className="grid gap-2">
                {s.trades.map((t) => {
                  const m = calcMetrics(t);
                  return (
                    <div
                      key={t.id ?? t.occurredAt}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{t.instrument}</Badge>
                        <Badge variant="outline">{t.direction}</Badge>
                        <Badge variant="outline">{t.sessionWindow}</Badge>
                        <span className="text-muted-foreground">{fmtDate(t.occurredAt)}</span>
                        <span className="text-muted-foreground">·</span>
                        <span>R:R {m.rr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            m.pnl > 0
                              ? "font-semibold text-emerald-400"
                              : m.pnl < 0
                                ? "font-semibold text-rose-400"
                                : "font-semibold"
                          }
                        >
                          {fmt$(m.pnl)}
                        </span>
                        <Badge variant="outline">{t.outcome}</Badge>
                        {t.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirm({ kind: "trade", tradeId: t.id! })}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {confirm?.kind === "session" ? `the session on ${confirm.date}` : "this trade"}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={runDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
