import { create } from "zustand";
import type { Invite, Member, Tone } from "@/lib/types";

const mkm = (
  ini: string, name: string, role: string, tone: Tone, proj: string, more: number, tasks: number, pct: number,
  away?: string | null, me?: boolean,
): Member => ({
  ini, name, role, tone, proj, more, tasks, pct, away: away || null, me: !!me,
  email: name.toLowerCase().replace(" ", ".") + "@kolara.app",
});

export const initialTeam = (): Member[] => [
  mkm("JL", "Jamie Lee", "Workspace admin", "sand", "Website redesign", 2, 7, 70, null, true),
  mkm("AM", "Alex Morgan", "Product designer", "mint", "Website redesign", 1, 10, 85),
  mkm("SC", "Sarah Chen", "Frontend developer", "sand", "Mobile app v2.0", 2, 8, 90),
  mkm("MR", "Marcus Reed", "Backend developer", "blue", "Client portal", 2, 8, 80),
  mkm("EW", "Emma Wilson", "Product manager", "blue", "Design system", 2, 9, 80),
  mkm("OP", "Olivia Park", "UX researcher", "mint", "Customer onboarding", 1, 5, 65),
  mkm("DK", "Daniel Kim", "QA engineer", "blue", "Mobile app v2.0", 1, 6, 75),
  mkm("ST", "Sophie Taylor", "Content designer", "sand", "Customer onboarding", 1, 7, 79),
  mkm("NP", "Noah Patel", "Full-stack developer", "lilac", "Product analytics", 0, 0, 0, "Back Nov 4"),
  mkm("IG", "Isabella Garcia", "Brand designer", "mint", "Design system", 0, 0, 0, "Back Nov 5"),
];

export const initialInvites = (): Invite[] => [
  { email: "lena.ortiz@kolara.app", role: "Product designer", sent: "Nov 1" },
  { email: "theo.nguyen@kolara.app", role: "QA engineer", sent: "Oct 30" },
];

export const ROLES = [
  "Workspace admin", "Product designer", "Product manager", "Frontend developer", "Backend developer",
  "Full-stack developer", "QA engineer", "UX researcher", "Content designer", "Brand designer",
];

interface TeamState {
  members: Member[];
  invites: Invite[];
  setMembers: (fn: (m: Member[]) => Member[]) => void;
  setInvites: (fn: (i: Invite[]) => Invite[]) => void;
}

export const useTeam = create<TeamState>((set) => ({
  members: initialTeam(),
  invites: initialInvites(),
  setMembers: (fn) => set((s) => ({ members: fn(s.members) })),
  setInvites: (fn) => set((s) => ({ invites: fn(s.invites) })),
}));
