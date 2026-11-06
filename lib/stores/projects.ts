import { create } from "zustand";
import { d } from "@/lib/dates";
import type { Project, Tone } from "@/lib/types";

const mkp = (
  name: string, desc: string, icon: string, tone: Tone, color: string, owner: string, team: string[],
  extra: number, done: number, total: number, due: Date, status: "on" | "risk", fav: boolean,
): Project => ({ id: name, name, desc, icon, tone, color, owner, team, extra, done, total, due, status, fav, archived: false });

export const initialProjects = (): Project[] => [
  mkp("Website redesign", "A clearer, more thoughtful experience for our website.", "p-layout", "mint", "#317B67", "Alex Morgan", ["AM", "JL", "MR"], 2, 24, 32, d(10, 6), "on", true),
  mkp("Mobile app v2.0", "Refining the mobile experience, from login to onboarding.", "p-phone", "mint", "#A7C8BA", "Sarah Chen", ["SC", "JL", "MR"], 1, 18, 30, d(10, 8), "on", true),
  mkp("Design system", "Reusable components and guidelines for a consistent product.", "p-comp", "lilac", "#7D858D", "Emma Wilson", ["EW", "AM", "JL"], 1, 8, 20, d(10, 8), "risk", true),
  mkp("Client portal", "One place for clients to follow work and share feedback.", "p-panel", "blue", "#8FA3B3", "Marcus Reed", ["MR", "SC", "EW"], 1, 6, 24, d(10, 20), "on", false),
  mkp("Customer onboarding", "Helping new teams find their flow from day one.", "p-route", "sand", "#C9B48A", "Emma Wilson", ["EW", "AM", "SC"], 0, 2, 20, d(10, 27), "on", false),
  mkp("Product analytics", "Turning product signals into a shared view of success.", "p-chart", "blue", "#6E9BB5", "Marcus Reed", ["MR", "SC", "EW"], 0, 3, 20, d(11, 4), "on", false),
];

interface ProjectsState {
  projects: Project[];
  setProjects: (fn: (p: Project[]) => Project[]) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addProject: (p: Project) => void;
  removeProject: (id: string) => void;
}

export const useProjects = create<ProjectsState>((set) => ({
  projects: initialProjects(),
  setProjects: (fn) => set((s) => ({ projects: fn(s.projects) })),
  updateProject: (id, patch) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
}));

export const activeProjects = (list: Project[]) => list.filter((p) => !p.archived);
