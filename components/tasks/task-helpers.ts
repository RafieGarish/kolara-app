import { dayDiff } from "@/lib/dates";
import { PRIO_LABEL, PRIO_ORDER, STATUS, type MyTask } from "@/lib/types";
import { MONTHS } from "@/lib/dates";
import { PROJ_COLOR } from "@/lib/types";
import type { TaskView } from "@/lib/stores/tasks";

export const WEEK_LABELS = ["T", "W", "T", "F", "S", "S", "M"];

export const passes = (v: TaskView) => (t: MyTask) =>
  (v.project === "All projects" || t.project === v.project) && (!v.priority || t.priority === v.priority);

export interface Group {
  key: string;
  label: string;
  cls?: string;
  sub?: string;
  items: MyTask[];
}

export function groupsFor(list: MyTask[], v: TaskView): Group[] {
  const defs: Group[] = [];
  if (v.group === "due") {
    const bucket = (t: MyTask) => {
      const n = dayDiff(t.due);
      return n < 0 ? "overdue" : n === 0 ? "today" : n < 7 ? "upcoming" : "later";
    };
    const rng = (arr: MyTask[]) => {
      if (!arr.length) return "";
      const a = arr.map((t) => t.due).sort((x, y) => x.getTime() - y.getTime());
      const f = a[0];
      const l = a[a.length - 1];
      return f.getTime() === l.getTime()
        ? `${MONTHS[f.getMonth()]} ${f.getDate()}`
        : `${MONTHS[f.getMonth()]} ${f.getDate()} – ${l.getDate()}`;
    };
    const labels = { overdue: "Overdue", today: "Today", upcoming: "Upcoming", later: "Later" } as const;
    (["overdue", "today", "upcoming", "later"] as const).forEach((k) => {
      const items = list.filter((t) => bucket(t) === k);
      if (!items.length) return;
      defs.push({ key: k, label: labels[k], cls: k, sub: k === "today" ? "Mon, Nov 2" : k === "later" ? rng(items) : "", items });
    });
  } else if (v.group === "project") {
    Object.keys(PROJ_COLOR).forEach((p) => {
      const items = list.filter((t) => t.project === p);
      if (items.length) defs.push({ key: p, label: p, items });
    });
  } else if (v.group === "priority") {
    (["high", "medium", "low"] as const).forEach((p) => {
      const items = list.filter((t) => t.priority === p);
      if (items.length) defs.push({ key: p, label: PRIO_LABEL[p] + " priority", items });
    });
  } else {
    (["todo", "progress", "review"] as const).forEach((s) => {
      const items = list.filter((t) => t.status === s);
      if (items.length) defs.push({ key: s, label: STATUS[s].label, items });
    });
  }
  defs.forEach((g) =>
    g.items.sort(
      (a, b) => (a.due.getTime() - b.due.getTime() || PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority]) * v.sortDir,
    ),
  );
  return defs;
}
