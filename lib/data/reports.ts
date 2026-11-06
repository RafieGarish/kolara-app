export interface Period {
  name: string; label: string; short: string; days: string[]; weeks: string[]; ontime: number[];
  weekNote: string; tasksDelta: string; tasksVs: string; ontimeDelta: string; ontimeVs: string;
  matrix: Record<string, number[]>;
}
export type PeriodKey = "this" | "last";

export const PERIODS: Record<PeriodKey, Period> = {
  this: {
    name: "This week", label: "Nov 2 – 8, 2026", short: "this week",
    days: ["Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6", "Sat 7", "Sun 8"],
    weeks: ["Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2"],
    ontime: [82, 86, 88, 90, 92],
    weekNote: "Week starting Nov 2 is the selected period",
    tasksDelta: "16%", tasksVs: "vs. last week", ontimeDelta: "8%", ontimeVs: "vs. last month",
    matrix: {
      "Website redesign": [2, 3, 2, 3, 3, 1, 0],
      "Mobile app v2.0": [2, 2, 2, 3, 2, 0, 1],
      "Design system": [1, 1, 1, 1, 1, 0, 0],
      "Client portal": [1, 1, 1, 1, 1, 1, 0],
      "Customer onboarding": [0, 1, 0, 0, 1, 0, 0],
      "Product analytics": [0, 0, 1, 1, 0, 0, 1],
    },
  },
  last: {
    name: "Last week", label: "Oct 26 – Nov 1, 2026", short: "last week",
    days: ["Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30", "Sat 31", "Sun 1"],
    weeks: ["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26"],
    ontime: [80, 82, 86, 88, 90],
    weekNote: "Week starting Oct 26 is the selected period",
    tasksDelta: "5%", tasksVs: "vs. prior week", ontimeDelta: "6%", ontimeVs: "vs. last month",
    matrix: {
      "Website redesign": [2, 2, 2, 2, 2, 1, 0],
      "Mobile app v2.0": [2, 2, 1, 2, 2, 1, 0],
      "Design system": [1, 1, 0, 1, 1, 0, 0],
      "Client portal": [1, 1, 1, 1, 1, 0, 0],
      "Customer onboarding": [0, 1, 0, 1, 1, 0, 0],
      "Product analytics": [0, 0, 1, 1, 0, 0, 1],
    },
  },
};

export const ONTIME_OFFSET: Record<string, number> = {
  "Website redesign": 1, "Mobile app v2.0": 0, "Design system": -8,
  "Client portal": 2, "Customer onboarding": 3, "Product analytics": 1,
};

export const REP_COLS: [string, string][] = [
  ["name", "PROJECT"], ["owner", "OWNER"], ["completed", "COMPLETED THIS WEEK"],
  ["progress", "LIFETIME PROGRESS"], ["status", "STATUS"], ["due", "DUE DATE"],
];

export const P_LABEL: Record<string, string> = { on: "On track", risk: "At risk" };
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
