"use client";

import { Icon } from "@/components/icon";
import { dayDiff } from "@/lib/dates";
import type { MyTask } from "@/lib/types";

export function TasksKpis({ tasks }: { tasks: MyTask[] }) {
  const o = tasks.filter((t) => !t.done);
  const today = o.filter((t) => dayDiff(t.due) === 0).length;
  const over = o.filter((t) => dayDiff(t.due) < 0).length;
  const done = tasks.filter((t) => t.done).length;
  const projects = new Set(o.map((t) => t.project)).size;
  const cards = [
    { label: "Open tasks", icon: "check-circle", v: o.length, note: <span className="kpi-note">Across {projects} project{projects === 1 ? "" : "s"}</span> },
    { label: "Due today", icon: "calendar", v: today, note: <span className="kpi-note">Your next small steps</span> },
    {
      label: "Overdue", icon: "clock", v: over,
      note: over ? <span className="kpi-note red">Let’s get these moving</span> : <span className="kpi-note green">All caught up</span>,
    },
    {
      label: "Completed this week", icon: "double-check", v: done,
      note: <span className="kpi-note green"><Icon name="arrow-trend" />2 more than last week</span>,
    },
  ];
  return (
    <section className="kpis kpis-plain" id="taskKpis">
      {cards.map((c) => (
        <article className="kpi" key={c.label}>
          <div className="kpi-top"><span>{c.label}</span><span><Icon name={c.icon} /></span></div>
          <div className="kpi-mid"><span className="kpi-value">{c.v}</span>{c.note}</div>
        </article>
      ))}
    </section>
  );
}
