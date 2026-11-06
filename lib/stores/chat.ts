import { create } from "zustand";
import { notify } from "@/lib/toast";
import { useUi } from "@/lib/stores/ui";
import {
  CHAT_PEOPLE, CHAT_REPLIES, REPLY_ORDER, seedMessages, type ChatGroup, type ChatMsg,
} from "@/lib/data/chat";

interface ChatState {
  msgs: ChatMsg[];
  group: ChatGroup;
  q: string;
  wide: boolean;
  typing: string | null;
  uid: number;
  replyIdx: number;
  setGroup: (g: ChatGroup) => void;
  setQ: (q: string) => void;
  toggleWide: () => void;
  markAllRead: () => void;
  send: (text: string) => void;
}

let replyTimer: ReturnType<typeof setTimeout> | undefined;

export const useChat = create<ChatState>((set, get) => ({
  msgs: seedMessages(Date.now()),
  group: "All",
  q: "",
  wide: false,
  typing: null,
  uid: 5,
  replyIdx: 0,
  setGroup: (group) => set({ group }),
  setQ: (q) => set({ q }),
  toggleWide: () => set((s) => ({ wide: !s.wide })),
  markAllRead: () => set((s) => ({ msgs: s.msgs.map((m) => ({ ...m, read: true })) })),
  send: (raw) => {
    const text = raw.trim();
    if (!text) return;
    set((s) => ({
      uid: s.uid + 1,
      msgs: [...s.msgs, { id: s.uid + 1, who: "Jamie", text, ts: Date.now(), read: true }],
      group: s.group !== "All" && s.group !== "PM" ? "All" : s.group, // keep your own message visible
      q: "",
    }));
    clearTimeout(replyTimer);
    const who = REPLY_ORDER[get().replyIdx % REPLY_ORDER.length];
    set((s) => ({ replyIdx: s.replyIdx + 1 }));
    replyTimer = setTimeout(() => {
      set({ typing: who });
      replyTimer = setTimeout(() => {
        const s = get();
        const id = s.uid + 1;
        set({
          typing: null,
          uid: id,
          msgs: [...s.msgs, { id, who, text: CHAT_REPLIES[(id + s.replyIdx) % CHAT_REPLIES.length], ts: Date.now(), read: false }],
        });
        if (!useUi.getState().chatOpen) notify(`${who} replied in Team chat`);
      }, 1500 + Math.random() * 900);
    }, 700);
  },
}));

/** Unread messages from others (optionally for one group). Use `useChatUnread()` for the topbar badge. */
export const unreadOf = (msgs: ChatMsg[], group: ChatGroup | "All" = "All") =>
  msgs.filter((m) => !m.read && !CHAT_PEOPLE[m.who].me && (group === "All" || CHAT_PEOPLE[m.who].group === group)).length;

export const useChatUnread = () => useChat((s) => unreadOf(s.msgs));
