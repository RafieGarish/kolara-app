import { create } from "zustand";
import { d } from "@/lib/dates";
import type { MyTask, Priority, TaskStatus } from "@/lib/types";

let uid = 100;
export const nextTaskId = () => ++uid;

const mk = (
  title: string,
  project: string,
  status: TaskStatus,
  priority: Priority,
  due: Date,
  extra: Partial<MyTask> = {},
): MyTask => ({
  id: ++uid,
  title,
  project,
  status,
  priority,
  due,
  comments: 0,
  sub: null,
  done: false,
  doneDay: null,
  note: "",
  ...extra,
});

export const initialMyTasks = (): MyTask[] => [
  mk("Approve homepage direction", "Website redesign", "review", "high", d(9, 30), { comments: 4 }),
  mk("Review component inventory", "Design system", "progress", "high", d(10, 1), { sub: [3, 5] }),
  mk("Share feedback on homepage wireframes", "Website redesign", "progress", "high", d(10, 2), {
    comments: 2,
    note: "Alex is ready for your feedback before the next design iteration.",
  }),
  mk("Sign off authentication flow", "Mobile app v2.0", "todo", "high", d(10, 2)),
  mk("Prepare design handoff checklist", "Design system", "progress", "medium", d(10, 2), { sub: [2, 4] }),
  mk("Review mobile onboarding screens", "Mobile app v2.0", "todo", "medium", d(10, 3)),
  mk("Align navigation with Alex", "Website redesign", "todo", "medium", d(10, 4), { comments: 1 }),
  mk("Audit accessibility guidelines", "Design system", "todo", "high", d(10, 5)),
  mk("Plan usability testing sessions", "Mobile app v2.0", "todo", "low", d(10, 6)),
  mk("Write release notes", "Mobile app v2.0", "todo", "low", d(10, 9)),
  mk("Update icon library", "Design system", "todo", "medium", d(10, 10)),
  mk("Prepare stakeholder demo", "Website redesign", "todo", "high", d(10, 13)),
  // completed this week (doneDay: 0 = Tue … 6 = Mon/today)
  ...(
    [
      ["Export brand assets", "Website redesign", 0],
      ["Draft sitemap v2", "Website redesign", 1],
      ["Review color tokens", "Design system", 2],
      ["Test checkout flow", "Mobile app v2.0", 3],
      ["Update typography scale", "Design system", 3],
      ["Sync with Sarah on API", "Mobile app v2.0", 6],
      ["Collect hero references", "Website redesign", 6],
      ["Publish icon guidelines", "Design system", 6],
    ] as [string, string, number][]
  ).map(([t, p, dd]) => mk(t, p, "done", "medium", d(10, 1), { done: true, doneDay: dd })),
];

/** View state of the My tasks screen (global in the original, so "go to project tasks" can set it). */
export interface TaskView {
  tab: "all" | "completed";
  mode: "list" | "board";
  group: "due" | "project" | "priority" | "status";
  sortDir: 1 | -1;
  project: string;
  priority: Priority | null;
  collapsed: string[];
}

interface TasksState {
  tasks: MyTask[];
  view: TaskView;
  setTasks: (fn: (t: MyTask[]) => MyTask[]) => void;
  updateTask: (id: number, patch: Partial<MyTask>) => void;
  addTask: (t: MyTask) => void;
  removeTask: (id: number) => void;
  setView: (patch: Partial<TaskView>) => void;
}

export const useTasks = create<TasksState>((set) => ({
  tasks: initialMyTasks(),
  view: { tab: "all", mode: "list", group: "due", sortDir: 1, project: "All projects", priority: null, collapsed: ["due:later"] },
  setTasks: (fn) => set((s) => ({ tasks: fn(s.tasks) })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
}));

export const selectOpenTasks = (s: TasksState) => s.tasks.filter((t) => !t.done);
