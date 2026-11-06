"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/dates";
import { AV_TONE, type Project } from "@/lib/types";

export const pLabel = { on: "On track", risk: "At risk" } as const;
export const pPct = (p: Project) => (p.total ? Math.round((p.done / p.total) * 100) : 0);

/** Progress bar that grows from 0 on mount, like the original. */
export function PBar({ value, risk }: { value: number; risk?: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setV(value)));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <Progress value={v} className={cn(risk && "risk")} />;
}

export function Stack({ p }: { p: Project }) {
  return (
    <div className="stack">
      {p.team.map((i) => (
        <UserAvatar key={i} ini={i} tone={AV_TONE[i]} />
      ))}
      {p.extra ? <span className="avatar more">+{p.extra}</span> : null}
    </div>
  );
}

export function StatusTag({ p }: { p: Project }) {
  return (
    <span className={`status ${p.status}`}>
      <i />
      {pLabel[p.status]}
    </span>
  );
}

export function Star({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={cn("star", on && "on")} aria-label="Toggle favorite" onClick={onClick}>
      <Icon name="star" />
    </button>
  );
}

export interface ProjActions {
  onOpen: (p: Project) => void;
  onFav: (p: Project) => void;
  onStatus: (p: Project) => void;
  onArchive: (p: Project) => void;
}

export function ProjMenu({ p, actions, row }: { p: Project; actions: ProjActions; row?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={row ? "row-more" : "icon-btn sm"} aria-label="More actions">
          <Icon name="more" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => actions.onOpen(p)}>
          <span className="m-i"><Icon name="tasks" />View my tasks</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.onFav(p)}>
          <span className="m-i"><Icon name="star" />{p.fav ? "Remove favorite" : "Add to favorites"}</span>
        </DropdownMenuItem>
        {!p.archived && (
          <DropdownMenuItem onSelect={() => actions.onStatus(p)}>
            <span className="m-i"><Icon name="swap" />Mark as {p.status === "on" ? "at risk" : "on track"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => actions.onArchive(p)}>
          <span className="m-i"><Icon name="archive" />{p.archived ? "Restore project" : "Archive"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectCard({ p, i, actions }: { p: Project; i: number; actions: ProjActions }) {
  return (
    <article className="p-card" style={{ animationDelay: `${i * 40}ms` }}>
      <div className="p-top">
        <span className={`p-ico t-${p.tone}`}><Icon name={p.icon} /></span>
        <span className="p-top-r">
          <StatusTag p={p} />
          <ProjMenu p={p} actions={actions} />
        </span>
      </div>
      <h3 className="p-title">
        <span className="t" onClick={() => actions.onOpen(p)}>{p.name}</span>
        <Star on={p.fav} onClick={() => actions.onFav(p)} />
      </h3>
      <p className="p-desc">{p.desc}</p>
      <div className="p-prog"><span>{p.done} / {p.total} tasks</span><span>{pPct(p)}%</span></div>
      <PBar value={pPct(p)} risk={p.status === "risk"} />
      <div className="p-foot">
        <div>
          <div className="p-owner">{p.owner} · Owner</div>
          <Stack p={p} />
        </div>
        <div className="p-due">
          <small>DUE DATE</small>
          <span><Icon name="calendar" />{shortDate(p.due)}</span>
        </div>
      </div>
    </article>
  );
}

export function ProjectRow({ p, i, actions }: { p: Project; i: number; actions: ProjActions }) {
  return (
    <div className="p-lrow" style={{ animationDelay: `${i * 30}ms` }}>
      <div className="p-lname">
        <span className={`p-ico t-${p.tone}`}><Icon name={p.icon} /></span>
        <div style={{ minWidth: 0 }}>
          <strong>
            <span className="t" style={{ cursor: "pointer" }} onClick={() => actions.onOpen(p)}>{p.name}</span>
            <Star on={p.fav} onClick={() => actions.onFav(p)} />
          </strong>
          <small>{p.desc}</small>
        </div>
      </div>
      <div><StatusTag p={p} /></div>
      <div className="p-lprog">
        <PBar value={pPct(p)} risk={p.status === "risk"} />
        {pPct(p)}%
      </div>
      <div>{p.owner}</div>
      <div><Stack p={p} /></div>
      <div className="due-c"><Icon name="calendar" />{shortDate(p.due)}</div>
      <div><ProjMenu p={p} actions={actions} row /></div>
    </div>
  );
}
