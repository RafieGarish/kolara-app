"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import "./chat.css";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/stores/ui";
import { useTasks } from "@/lib/stores/tasks";
import { unreadOf, useChat } from "@/lib/stores/chat";
import { CHAT_GROUPS, CHAT_PEOPLE, MIN, type ChatMsg } from "@/lib/data/chat";
import { notify } from "@/lib/toast";

const relTime = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / MIN);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.floor(h / 24)} d ago`;
};

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** @mentions + search highlight, as React nodes. */
function Highlighted({ text, q }: { text: string; q: string }) {
  const parts = text.split(/(@(?:Alex|Sarah|Marcus|Emma|Jamie)\b)/g);
  const re = q ? new RegExp(`(${escRe(q)})`, "gi") : null;
  return (
    <>
      {parts.map((p, i) =>
        /^@(Alex|Sarah|Marcus|Emma|Jamie)$/.test(p) ? (
          <span className="mention" key={i}>
            {re ? p.split(re).map((s, k) => (k % 2 ? <mark key={k}>{s}</mark> : <Fragment key={k}>{s}</Fragment>)) : p}
          </span>
        ) : re ? (
          p.split(re).map((s, k) => (k % 2 ? <mark key={`${i}-${k}`}>{s}</mark> : <Fragment key={`${i}-${k}`}>{s}</Fragment>))
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Message({ m, q }: { m: ChatMsg; q: string }) {
  const p = CHAT_PEOPLE[m.who];
  return (
    <div className="msg">
      <UserAvatar ini={p.ini} tone={p.tone} />
      <div style={{ minWidth: 0 }}>
        <div className="msg-top">
          <strong>{m.who}</strong>
          <time>{relTime(m.ts)}</time>
        </div>
        <div className={cn("bubble", (!m.read || p.me) && "tint")}>
          <Highlighted text={m.text} q={q} />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { chatOpen: open, setChatOpen } = useUi();
  const { msgs, group, q, wide, typing, setGroup, setQ, toggleWide, markAllRead, send } = useChat();
  const nextTask = useTasks((s) =>
    s.tasks.filter((t) => !t.done).sort((a, b) => a.due.getTime() - b.due.getTime())[0],
  );

  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [, tick] = useState(0);

  const trimmedQ = q.trim();
  const items = useMemo(() => {
    const lq = trimmedQ.toLowerCase();
    return msgs.filter((m) => {
      const p = CHAT_PEOPLE[m.who];
      return (group === "All" || p.group === group) && (!lq || m.text.toLowerCase().includes(lq) || m.who.toLowerCase().includes(lq));
    });
  }, [msgs, group, trimmedQ]);
  const allUnread = unreadOf(msgs);

  // keep "x min ago" fresh
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // stick to bottom when content changes (and when opening)
  const stick = useRef(true);
  useEffect(() => {
    const l = listRef.current;
    if (l && stick.current) l.scrollTop = l.scrollHeight;
  }, [items, typing, open, wide]);
  const onScroll = () => {
    const l = listRef.current;
    if (l) stick.current = l.scrollHeight - l.scrollTop - l.clientHeight < 60;
  };

  // open / close side effects
  useEffect(() => {
    document.body.classList.toggle("chat-open", open);
    if (open) {
      wasOpen.current = true;
      stick.current = true;
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 340);
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      setMenu(false);
      markAllRead(); // messages seen while open count as read
      document.getElementById("chatBtn")?.focus({ preventScroll: true });
    }
  }, [open, markAllRead]);
  useEffect(() => () => document.body.classList.remove("chat-open"), []);

  // keyboard: Escape, ⌘K, focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menu) return setMenu(false);
        if (!document.querySelector('[data-slot="dialog-content"], [role="menu"]')) setChatOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current?.contains(document.activeElement)) {
        const f = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, [tabindex]:not([tabindex='-1'])"),
        ).filter((el) => !el.closest("[hidden]"));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, menu, setChatOpen]);

  // aria-label of the topbar button reflects unread (topbar owns the button)
  useEffect(() => {
    const btn = document.getElementById("chatBtn");
    if (!btn) return;
    btn.classList.toggle("has-dot", allUnread > 0 && !open);
    btn.setAttribute("aria-label", open ? "Close team chat" : allUnread ? `Open team chat (${allUnread} unread)` : "Open team chat");
  }, [allUnread, open]);

  const addText = (s: string) => {
    setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}${s}`);
    inputRef.current?.focus();
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text);
    setText("");
    stick.current = true;
    inputRef.current?.focus();
  };
  const typingP = typing ? CHAT_PEOPLE[typing] : null;

  return (
    <aside
      ref={panelRef}
      className={cn("chat", open && "open", wide && "wide")}
      id="chatPanel"
      role="dialog"
      aria-label="Team chat"
      aria-hidden={!open}
      inert={!open}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(".cc-field")) setMenu(false);
      }}
    >
      <header className="chat-head">
        <div>
          <h2>Team chat</h2>
          <p>Live workspace updates</p>
        </div>
        <div className="chat-actions">
          <button className="ch-btn" type="button" aria-label={wide ? "Shrink chat" : "Expand chat"} onClick={toggleWide}>
            <Icon name="expand" />
          </button>
          <button className="ch-btn" type="button" aria-label="Close chat" onClick={() => setChatOpen(false)}>
            <Icon name="x" />
          </button>
        </div>
      </header>

      <div className="chat-search">
        <label>
          <Icon name="search" />
          <Input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chat…"
            autoComplete="off"
            className="h-auto flex-1 border-0 bg-transparent p-0 text-[12.5px] shadow-none focus-visible:ring-0"
          />
          <kbd>⌘ K</kbd>
        </label>
      </div>

      <div className="chat-chips" role="tablist" aria-label="Chat groups">
        {CHAT_GROUPS.map((g) => {
          const n = g === "All" ? allUnread : 0;
          return (
            <button key={g} type="button" role="tab" aria-selected={group === g} className={cn("chip-b", group === g && "active")} onClick={() => setGroup(g)}>
              {g}
              {n ? <em>{n}</em> : null}
            </button>
          );
        })}
      </div>

      <div className="chat-list" ref={listRef} onScroll={onScroll} aria-live="polite">
        {items.length ? (
          items.map((m) => <Message key={m.id} m={m} q={trimmedQ} />)
        ) : (
          <div className="chat-empty">
            <b>{trimmedQ ? "No messages found" : "Nothing here yet"}</b>
            {trimmedQ ? "Try a different word or clear the search." : "Start the conversation — say hello."}
          </div>
        )}
        {typing && typingP ? (
          <div className="msg typing" aria-label={`${typing} is typing`}>
            <UserAvatar ini={typingP.ini} tone={typingP.tone} />
            <div>
              <div className="msg-top"><strong>{typing}</strong><time>typing…</time></div>
              <div className="bubble"><i /><i /><i /></div>
            </div>
          </div>
        ) : null}
      </div>

      <form className="chat-compose" autoComplete="off" onSubmit={submit}>
        <div className="cc-field">
          <button type="button" className="cc-plus" aria-label="Add to message" aria-haspopup="menu" aria-expanded={menu} onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }}>
            <Icon name="plus" />
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            placeholder="Message the team…"
            maxLength={400}
            aria-label="Message the team"
          />
          {menu && (
            <div className="menu cc-menu" role="menu">
              <div className="m-h">MENTION</div>
              {Object.keys(CHAT_PEOPLE).filter((n) => !CHAT_PEOPLE[n].me).map((n) => (
                <button key={n} type="button" role="menuitem" onClick={() => { setMenu(false); addText(`@${n} `); }}>
                  <span className="m-i">@ {n}</span>
                </button>
              ))}
              <div className="m-h">SHARE</div>
              {nextTask && (
                <button type="button" role="menuitem" onClick={() => { setMenu(false); addText(`Next up: “${nextTask.title}” `); }}>
                  <span className="m-i"><Icon name="tasks" />Share next task</span>
                </button>
              )}
              <button type="button" role="menuitem" onClick={() => { setMenu(false); notify("File attachments are coming soon"); inputRef.current?.focus(); }}>
                <span className="m-i"><Icon name="plus" />Attach file</span>
              </button>
            </div>
          )}
        </div>
        <Button type="submit" variant="ghost" className="cc-send" aria-label="Send message" disabled={!text.trim()}>
          <Icon name="send" />
        </Button>
      </form>
    </aside>
  );
}
