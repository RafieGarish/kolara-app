import { create } from "zustand";
import { d } from "@/lib/dates";
import type { MyTask } from "@/lib/types";

export type CalType = "deadline" | "milestone" | "meeting" | "task";

export interface CalEvent {
  cid: string;
  type: CalType;
  title: string;
  short?: string;
  date: Date;
  time?: string;
  end?: string;
  project: string;
  people: string[];
  custom?: boolean;
  where?: string;
  recurring?: boolean;
  risk?: boolean;
  owner?: string;
  task?: MyTask;
}

let calUid = 0;
export const mkc = (type: CalType, title: string, date: Date, extra: Partial<CalEvent> = {}): CalEvent => ({
  cid: "c" + ++calUid,
  type,
  title,
  date,
  time: "",
  end: "",
  project: "",
  people: [],
  custom: false,
  ...extra,
});

const initial = (): CalEvent[] => [
  mkc("meeting", "Design review", d(10, 10), { time: "14:00", end: "15:00", project: "Design system", people: ["Alex Morgan", "Emma Wilson", "Jamie Lee"] }),
  mkc("milestone", "Client portal prototype", d(10, 12), { project: "Client portal", people: ["Marcus Reed", "Sarah Chen", "Emma Wilson"] }),
  mkc("meeting", "Portal review", d(10, 18), { time: "14:00", end: "15:00", project: "Client portal", people: ["Marcus Reed", "Sarah Chen", "Emma Wilson"] }),
  mkc("milestone", "Client sign-off", d(10, 19), { project: "Client portal", people: ["Marcus Reed", "Emma Wilson", "Jamie Lee"] }),
  mkc("meeting", "Analytics review", d(10, 24), { time: "11:00", end: "12:00", project: "Product analytics", people: ["Marcus Reed", "Emma Wilson", "Noah Patel"] }),
  mkc("milestone", "Onboarding handoff", d(10, 26), { project: "Customer onboarding", people: ["Emma Wilson", "Olivia Park", "Sophie Taylor"] }),
];

interface CalState {
  events: CalEvent[];
  addEvent: (e: CalEvent) => void;
  removeEvent: (cid: string) => void;
}

export const useCalendar = create<CalState>((set) => ({
  events: initial(),
  addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
  removeEvent: (cid) => set((s) => ({ events: s.events.filter((x) => x.cid !== cid) })),
}));
