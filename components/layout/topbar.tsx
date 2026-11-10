"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUi } from "@/lib/stores/ui";
import { ThemeSwitch } from "./theme-switch";

const TITLES: Record<string, string> = {
  "/": "Landing",
  "/overview": "Overview",
  "/tasks": "My tasks",
  "/board": "Board",
  "/projects": "Projects",
  "/team": "Team",
  "/reports": "Reports",
  "/calendar": "Calendar",
};

export function Topbar() {
  const pathname = usePathname();
  const crumb = TITLES[pathname] ?? TITLES["/" + pathname.split("/")[1]] ?? "Overview";
  const { toggleSidebar, chatOpen, setChatOpen } = useUi();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Kolara.app – ${crumb === "Overview" ? "Team overview" : crumb}`;
    window.scrollTo({ top: 0 });
  }, [crumb]);

  // ⌘K / Ctrl+K focuses search (the chat panel binds its own ⌘K while open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !useUi.getState().chatOpen) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="topbar">
      <Button variant="ghost" size="icon" id="sidebarToggle" aria-label="Toggle sidebar" onClick={toggleSidebar}>
        <Icon name="panel" />
      </Button>
      <span className="divider-v" />
      <div className="crumbs">
        <span>Workspace</span>
        <Icon name="chevron-right" className="crumb-sep" />
        <strong>{crumb}</strong>
      </div>

      <div className="top-actions">
        <label className="search">
          <Icon name="search" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search anything…"
            className="h-auto flex-1 border-0 bg-transparent p-0 text-[12.5px] shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <kbd>⌘ K</kbd>
        </label>
        <ThemeSwitch />
        <Button
          variant="ghost"
          size="icon"
          id="chatBtn"
          aria-label="Open team chat"
          aria-haspopup="dialog"
          aria-expanded={chatOpen}
          aria-controls="chatPanel"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <Icon name="message" />
        </Button>
        <Button variant="ghost" size="icon" className="has-dot icon-btn relative" aria-label="Notifications">
          <Icon name="bell" />
        </Button>
        <span className="divider-v" />
        <span className="avatar sand">JL</span>
      </div>
    </header>
  );
}
