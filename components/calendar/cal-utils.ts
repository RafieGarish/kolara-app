import { MONTHS, TODAY, dayDiff } from "@/lib/dates";
import type { CalEvent, CalType } from "@/lib/stores/calendar";
import type { Member, MyTask, Project } from "@/lib/types";

export const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const TYPE_LABEL: Record<CalType, string> = {
  deadline: "Project deadline",
  milestone: "Milestone",
  meeting: "Team meeting",
  task: "Task",
};
const RANK: Record<CalType, number> = { meeting: 0, milestone: 1, deadline: 2, task: 3 };

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const toISO = (dt: Date) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
export const fromISO = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
export const addDays = (dt: Date, n: number) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
export const longDate = (dt: Date) => `${DOW_FULL[dt.getDay()]}, ${MONTHS_FULL[dt.getMonth()]} ${dt.getDate()}`;
export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export interface CalFilters { project: string; member: string; type: string }
export interface CalSources { projects: Project[]; tasks: MyTask[]; members: Member[]; events: CalEvent[] }

export function calEventsOn(date: Date, src: CalSources, f: CalFilters, ignoreFilters = false): CalEvent[] {
  const nameOf = (ini: string) => src.members.find((m) => m.ini === ini)?.name;
  const out: CalEvent[] = [];
  src.projects
    .filter((p) => !p.archived && sameDay(p.due, date))
    .forEach((p) =>
      out.push({
        cid: "dl-" + p.id,
        type: "deadline",
        title: p.name,
        project: p.name,
        risk: p.status === "risk",
        date,
        owner: p.owner,
        people: [p.owner, ...(p.team.map(nameOf).filter(Boolean) as string[])],
      }),
    );
  src.events.filter((e) => sameDay(e.date, date)).forEach((e) => out.push(e));
  if (date.getDay() === 1)
    out.push({
      cid: "sync-" + toISO(date),
      type: "meeting",
      title: "Weekly team sync",
      short: "Team sync",
      date,
      time: "10:00",
      end: "10:30",
      project: "",
      people: src.members.map((m) => m.name),
      where: "Studio team",
      recurring: true,
    });
  src.tasks
    .filter((t) => !t.done && sameDay(t.due, date) && dayDiff(t.due) <= 6)
    .forEach((t) =>
      out.push({ cid: "tk-" + t.id, type: "task", title: t.title, project: t.project, date, people: ["Jamie Lee"], task: t }),
    );
  const ok = (e: CalEvent) =>
    ignoreFilters ||
    ((f.project === "all" || !e.project || e.project === f.project) &&
      (f.member === "all" || e.people.includes(f.member)) &&
      (f.type === "all" || e.type === f.type));
  return out.filter(ok).sort((a, b) => RANK[a.type] - RANK[b.type] || (a.time || "").localeCompare(b.time || ""));
}

export { MONTHS, TODAY };
