"use client";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dayDiff, dueLabel } from "@/lib/dates";
import { PRIO_LABEL, PRIO_ORDER, PROJ_COLOR, type MyTask } from "@/lib/types";
import { WEEK_LABELS } from "./task-helpers";
import { useGrow } from "./use-grow";

export function TaskSide({ tasks, onOpen }: { tasks: MyTask[]; onOpen: (id: number) => void }) {
  const grown = useGrow();
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const goal = 12;
  const pct = Math.min(100, Math.round((done.length / goal) * 100));
  const counts = Array.from({ length: 7 }, (_, i) => done.filter((t) => t.doneDay === i).length);
  const max = Math.max(1, ...counts);

  const cand =
    [...open]
      .filter((t) => dayDiff(t.due) <= 0)
      .sort(
        (a, b) =>
          (dayDiff(a.due) === 0 ? 0 : 1) - (dayDiff(b.due) === 0 ? 0 : 1) || PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority],
      )[0] || open[0];

  return (
    <aside className="t-side">
      <Card className="momentum">
        <CardHeader className="tight">
          <h3>Your weekly momentum</h3>
          <span className="muted-icon"><Icon name="trend" /></span>
        </CardHeader>
        <p className="m-sub">Small steps add up. Keep going.</p>
        <div className="m-score"><strong>{done.length}</strong><span>/ {goal}</span><em>{pct}% of your goal</em></div>
        <Progress large value={grown ? pct : 0} />
        <div className="m-bars">
          {counts.map((c, i) => (
            <div key={i} className={`m-col ${i === 6 ? "cur" : ""}`}>
              <div className="mb" style={{ height: grown ? `${c ? Math.max(14, (c / max) * 100) : 6}%` : undefined }} />
            </div>
          ))}
        </div>
        <div className="m-labels">
          {WEEK_LABELS.map((l, i) => <span key={i} className={i === 6 ? "cur" : ""}>{l}</span>)}
        </div>
        <p className="m-foot"><Icon name="trend-up" />2 more completed than last week</p>
      </Card>

      {cand && (
        <Card className="start-card">
          <header className="start-head">
            <span className="start-label"><Icon name="target" />A good place to start</span>
            <span className="muted-icon"><Icon name="more" /></span>
          </header>
          <h3>{cand.title}</h3>
          <p className="start-proj"><i style={{ background: PROJ_COLOR[cand.project] }} /><span>{cand.project}</span></p>
          <p className="start-note">{cand.note || "A clear next step. Take it when you’re ready."}</p>
          <div className="start-foot">
            <span>{dueLabel(cand.due) === "Today" ? "Due today" : "Due " + dueLabel(cand.due)} · {PRIO_LABEL[cand.priority]} priority</span>
            <Button variant="link" onClick={() => onOpen(cand.id)}>Open task <Icon name="arrow-right" /></Button>
          </div>
        </Card>
      )}

      <Card className="radar">
        <CardHeader className="tight">
          <h3>On your radar</h3>
          <span className="radar-open">{open.length} open</span>
        </CardHeader>
        <ul>
          {Object.keys(PROJ_COLOR).map((p) => {
            const mine = open.filter((t) => t.project === p);
            const due = mine.filter((t) => dayDiff(t.due) <= 0);
            const over = due.some((t) => dayDiff(t.due) < 0);
            return (
              <li key={p}>
                <div className="r-name">
                  <i style={{ background: PROJ_COLOR[p] }} />
                  <div>{p}<span className="r-sub">{due.length} due {over ? "today or earlier" : "today"}</span></div>
                </div>
                <span className="r-count">{mine.length}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </aside>
  );
}
