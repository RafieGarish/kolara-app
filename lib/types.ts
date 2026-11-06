export type Tone = "mint" | "sand" | "lilac" | "blue";
export type TaskStatus = "todo" | "progress" | "review" | "done";
export type Priority = "high" | "medium" | "low";

export const STATUS: Record<TaskStatus, { label: string; cls: string }> = {
  progress: { label: "In progress", cls: "progress" },
  review: { label: "In review", cls: "review" },
  todo: { label: "To do", cls: "todo" },
  done: { label: "Done", cls: "done" },
};
export const STATUS_ORDER: TaskStatus[] = ["todo", "progress", "review", "done"];
export const PRIO_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
export const PRIO_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };

export interface MyTask {
  id: number;
  title: string;
  project: string;
  status: TaskStatus;
  priority: Priority;
  due: Date;
  comments: number;
  sub: [number, number] | null;
  done: boolean;
  /** 0 = Tue … 6 = Mon/today, for tasks completed this week */
  doneDay: number | null;
  note: string;
}

export interface Project {
  id: string;
  name: string;
  desc: string;
  icon: string;
  tone: Tone;
  color: string;
  owner: string;
  team: string[];
  extra: number;
  done: number;
  total: number;
  due: Date;
  status: "on" | "risk";
  fav: boolean;
  archived: boolean;
}

export interface Member {
  ini: string;
  name: string;
  role: string;
  tone: Tone;
  proj: string;
  more: number;
  tasks: number;
  pct: number;
  away: string | null;
  me: boolean;
  email: string;
}
export interface Invite { email: string; role: string; sent: string }

/** Initials -> avatar tone (used by projects/calendar) */
export const AV_TONE: Record<string, Tone> = { AM: "mint", JL: "sand", MR: "lilac", SC: "sand", EW: "blue" };
export const PROJ_COLOR: Record<string, string> = {
  "Website redesign": "#317B67",
  "Mobile app v2.0": "#A7C8BA",
  "Design system": "#7D858D",
};
