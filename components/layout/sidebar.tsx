"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/stores/ui";
import { useTasks } from "@/lib/stores/tasks";
import { useProjects } from "@/lib/stores/projects";
import { notify } from "@/lib/toast";
import Image from 'next/image'

const NAV = [
  { id: "overview", href: "/overview", label: "Overview", icon: "overview" },
  { id: "tasks", href: "/tasks", label: "My tasks", icon: "tasks" },
  { id: "board", href: "/board", label: "Kanban Board", icon: "board" },
  { id: "projects", href: "/projects", label: "Projects", icon: "folder" },
  { id: "team", href: "/team", label: "Team", icon: "users" },
  { id: "calendar", href: "/calendar", label: "Calendar", icon: "calendar" },
  { id: "reports", href: "/reports", label: "Reports", icon: "reports" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, setInviteOpen } = useUi();
  const openTasks = useTasks((s) => s.tasks.filter((t) => !t.done).length);
  const projects = useProjects((s) => s.projects);
  const activeCount = projects.filter((p) => !p.archived).length;
  const favs = projects.filter((p) => p.fav && !p.archived);

  const counts: Record<string, number | undefined> = { tasks: openTasks, projects: activeCount };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const demo = (e: React.MouseEvent) => {
    e.preventDefault();
    notify("Demo link");
  };

  return (
    <aside className={cn("sidebar", sidebarCollapsed && "collapsed", sidebarOpen && "open")} id="sidebar">
      <div className="brand [@media(max-width:860px)]:gap-2 [@media(max-width:860px)]:px-0">
        <span className="brand-logo">
          {/* <Icon name="layers-logo" /> */}
          <Image
            src="/kolara-icon.png"
            width={500}
            height={500}
            alt="Picture of the author"
          />
        </span>
        <span className="brand-name [@media(max-width:860px)]:text-xl">Kolara.app</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto hidden [@media(max-width:860px)]:inline-flex"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <Icon name="x" size={18} />
        </Button>
      </div>

      <button className="workspace" type="button">
        <span className="ws-avatar">S</span>
        <span className="ws-text">
          <strong>Studio workspace</strong>
          <small>Pro plan</small>
        </span>
        <Icon name="chevrons-up-down" className="ws-chevron" />
      </button>

      <nav className="nav" aria-label="Main">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className={cn("nav-item", isActive(n.href) && "active")}
            onClick={() => setSidebarOpen(false)}
          >
            {isActive(n.href) && (
              <motion.span
                layoutId="nav-pill"
                className="nav-pill"
                transition={{ type: "spring", stiffness: 480, damping: 38 }}
              />
            )}
            <Icon name={n.icon} />
            <span className="label">{n.label}</span>
            {counts[n.id] ? <span className="count">{counts[n.id]}</span> : null}
          </Link>
        ))}
      </nav>

      <div className="fav">
        <div className="fav-head">
          <span>FAVORITES</span>
          <Button variant="ghost" size="icon-xs" aria-label="Add favorite" onClick={() => notify("Pick a project to favorite")}>
            <Icon name="plus" />
          </Button>
        </div>
        <ul>
          {favs.map((f) => (
            <li key={f.id}>
              <a href="#" onClick={demo}>
                <i style={{ background: f.color }} />
                {f.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        <div className="invite">
          <Icon name="users" className="invite-icon" />
          <h4>Better, together.</h4>
          <p>Bring your team into the flow.</p>
          <Button variant="outline" className="w-full !h-8 !rounded-[7px] text-xs" onClick={() => setInviteOpen(true)}>
            Invite teammates
          </Button>
        </div>
        <a href="#" className="nav-item" onClick={demo}>
          <Icon name="sliders" />
          <span className="label">Settings</span>
        </a>
        <a href="#" className="nav-item" onClick={demo}>
          <Icon name="help" />
          <span className="label">Help &amp; getting started</span>
        </a>
        <div className="me">
          <span className="avatar sand">JL</span>
          <span className="me-text">
            <strong>Jamie Lee</strong>
            <small>Workspace admin</small>
          </span>
          <Icon name="chevrons-up-down" className="ws-chevron" />
        </div>
      </div>
    </aside>
  );
}
