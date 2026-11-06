import type { Tone } from "@/lib/types";

export const MIN = 60000;
export type ChatGroup = "All" | "Design" | "Engineering" | "PM";
export const CHAT_GROUPS: ChatGroup[] = ["All", "Design", "Engineering", "PM"];

export const CHAT_PEOPLE: Record<string, { ini: string; tone: Tone; group: ChatGroup; me?: boolean }> = {
  Alex: { ini: "AM", tone: "mint", group: "Design" },
  Sarah: { ini: "SC", tone: "sand", group: "Engineering" },
  Marcus: { ini: "MR", tone: "blue", group: "Engineering" },
  Emma: { ini: "EW", tone: "lilac", group: "PM" },
  Jamie: { ini: "JL", tone: "mint", group: "PM", me: true },
};

export interface ChatMsg { id: number; who: string; text: string; ts: number; read: boolean }

export const CHAT_REPLIES = [
  "Sounds good — I’ll take a look this afternoon.",
  "Nice, thanks for the update!",
  "On it. I’ll share a quick note once it’s done.",
  "Great idea. Let’s pick it up in the next sync.",
  "Love it. Adding it to the board now.",
];
export const REPLY_ORDER = ["Sarah", "Marcus", "Emma", "Alex"];

export const seedMessages = (now: number): ChatMsg[] =>
  (
    [
      ["Alex", "Hero exploration is ready for review.", 2, false],
      ["Sarah", "I left feedback on the login flow.", 12, true],
      ["Marcus", "Analytics events are now set up.", 28, true],
      ["Emma", "I created a milestone for design handoff.", 42, true],
      ["Jamie", "Let’s sync on the homepage wireframes before lunch.", 60, true],
    ] as [string, string, number, boolean][]
  ).map(([who, text, ago, read], i) => ({ id: i + 1, who, text, ts: now - ago * MIN, read }));
