import type { Tone } from "@/lib/types";

export const OV_PROJECTS = [
  { name: "Website redesign", done: 24, total: 32, pct: 75, start: 0, end: 0.634 },
  { name: "Mobile app v2.0", done: 18, total: 30, pct: 60, start: 0.132, end: 0.851 },
  { name: "Design system", done: 8, total: 20, pct: 40, start: 0.264, end: 0.853 },
];

export const DAYS = ["Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6", "Sat 7", "Sun 8"];

export const PEOPLE: { ini: string; name: string; role: string; done: number; total: number; tone: Tone }[] = [
  { ini: "AM", name: "Alex Morgan", role: "Product designer", done: 8, total: 10, tone: "mint" },
  { ini: "SC", name: "Sarah Chen", role: "Frontend developer", done: 6, total: 8, tone: "sand" },
  { ini: "MR", name: "Marcus Reed", role: "Backend developer", done: 5, total: 8, tone: "lilac" },
  { ini: "EW", name: "Emma Wilson", role: "Product manager", done: 7, total: 9, tone: "blue" },
];

export type OvStatus = "progress" | "review" | "todo" | "done";
export interface OvTask { title: string; project: string; status: OvStatus; due: string; who: string; tone: Tone }

export const OV_TASKS: OvTask[] = [
  { title: "Finalize homepage wireframes", project: "Website redesign", status: "progress", due: "Today", who: "AM", tone: "mint" },
  { title: "Review authentication flow", project: "Mobile app v2.0", status: "review", due: "Today", who: "SC", tone: "sand" },
  { title: "Document button components", project: "Design system", status: "todo", due: "Tomorrow", who: "EW", tone: "blue" },
  { title: "Set up analytics events", project: "Website redesign", status: "done", due: "Nov 4", who: "MR", tone: "lilac" },
];

export const FEED: { ini: string; tone: Tone; who: string; text: string; target: string; meta: string; time: string }[] = [
  { ini: "AM", tone: "mint", who: "Alex", text: "completed", target: "Hero exploration", meta: "Website redesign", time: "2 min ago" },
  { ini: "SC", tone: "sand", who: "Sarah", text: "left feedback on", target: "Login flow", meta: "Mobile app v2.0", time: "12 min ago" },
  { ini: "MR", tone: "lilac", who: "Marcus", text: "moved", target: "Analytics events", meta: "Website redesign · Done", time: "28 min ago" },
  { ini: "EW", tone: "blue", who: "Emma", text: "created a milestone", target: "Design handoff", meta: "Design system", time: "42 min ago" },
];
