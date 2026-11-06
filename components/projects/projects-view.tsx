"use client";

import "./projects.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { MONTHS, d, dayDiff } from "@/lib/dates";
import { PROJ_COLOR, type Project } from "@/lib/types";
import { useProjects } from "@/lib/stores/projects";
import { useTasks } from "@/lib/stores/tasks";
import { ProjectCard, ProjectRow, pLabel, pPct, type ProjActions } from "./project-parts";

type Tab = "active" | "favorites" | "archived";
type Sort = "due" | "progress" | "name";
const SORT_LABEL: Record<Sort, string> = { due: "Due date", progress: "Progress", name: "Name" };

function Filter({
  icon, label, set, options, value, onPick, right,
}: {
  icon: string; label: string; set: boolean; options: [string, string][]; value: string; onPick: (v: string) => void; right?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("dd-btn", set && "set")}>
          <Icon name={icon} /><span className="dd-label">{label}</span><Icon name="chevron-down" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={right ? "end" : "start"}>
        {options.map(([v, l]) => (
          <DropdownMenuItem key={v} data-selected={v === value} onSelect={() => onPick(v)}>{l}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectsView() {
  const router = useRouter();
  const { projects, updateProject, addProject } = useProjects();
  const tasks = useTasks((s) => s.tasks);
  const [tab, setTab] = useState<Tab>("active");
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [sort, setSort] = useState<Sort>("due");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const owners = useMemo(() => [...new Set(projects.map((p) => p.owner))], [projects]);

  const goToProjectTasks = (name: string) => {
    if (PROJ_COLOR[name]) useTasks.getState().setView({ project: name, tab: "all" });
    else notify(`No tasks assigned to you in ${name}`);
    router.push("/tasks");
  };

  const actions: ProjActions = {
    onOpen: (p) => goToProjectTasks(p.name),
    onFav: (p) => {
      updateProject(p.id, { fav: !p.fav });
      notify(!p.fav ? "Added to favorites" : "Removed from favorites");
    },
    onStatus: (p) => updateProject(p.id, { status: p.status === "on" ? "risk" : "on" }),
    onArchive: (p) => {
      updateProject(p.id, { archived: !p.archived });
      notify(!p.archived ? `${p.name} archived` : `${p.name} restored`);
    },
  };

  const act = projects.filter((p) => !p.archived);
  const on = act.filter((p) => p.status === "on").length;
  const riskList = act.filter((p) => p.status === "risk");
  const week = act.filter((p) => { const n = dayDiff(p.due); return n >= 0 && n <= 6; }).length;
  const archivedCount = projects.filter((p) => p.archived).length;
  const favCount = act.filter((p) => p.fav).length;

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const l = projects.filter((p) => {
      if (tab === "archived" ? !p.archived : p.archived) return false;
      if (tab === "favorites" && !p.fav) return false;
      if (status !== "all" && p.status !== status) return false;
      if (owner !== "all" && p.owner !== owner) return false;
      return !qq || p.name.toLowerCase().includes(qq) || p.desc.toLowerCase().includes(qq);
    });
    const cmp: Record<Sort, (a: Project, b: Project) => number> = {
      due: (a, b) => a.due.getTime() - b.due.getTime() || projects.indexOf(a) - projects.indexOf(b),
      progress: (a, b) => pPct(b) - pPct(a),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return l.sort(cmp[sort]);
  }, [projects, tab, status, owner, q, sort]);

  const pool = projects.filter((p) => (tab === "archived" ? p.archived : !p.archived) && (tab !== "favorites" || p.fav)).length;
  const noun = tab === "archived" ? "archived" : tab === "favorites" ? "favorite" : "active";
  const showing = list.length === pool
    ? `Showing all ${list.length} ${noun} project${list.length === 1 ? "" : "s"}`
    : `Showing ${list.length} of ${pool} ${noun} projects`;

  const empty =
    tab === "archived"
      ? ["No archived projects", "Projects you archive will rest here until you need them."]
      : tab === "favorites" && favCount === 0
        ? ["No favorites yet", "Tap the star on a project to keep it close."]
        : ["No projects found", "Try a different search or clear a filter."];

  const risk = riskList[0];
  const riskTasks = risk ? tasks.filter((t) => !t.done && t.project === risk.name && dayDiff(t.due) <= 0).length : 0;
  const next = [...act].sort((a, b) => a.due.getTime() - b.due.getTime())[0];

  const kpis = [
    { label: "Active projects", icon: "folder-open", v: act.length, note: <span className="kpi-note green">2 new this month</span> },
    { label: "On track", icon: "check-circle", v: on, note: <span className="kpi-note">Steady, shared momentum</span> },
    {
      label: "At risk", icon: "alert-circle", v: riskList.length,
      note: risk ? <span className="kpi-note amber">{risk.name} needs attention</span> : <span className="kpi-note green">Nothing at risk</span>,
    },
    { label: "Due this week", icon: "calendar", v: week, note: <span className="kpi-note">Nov 2 – 8, 2026</span> },
  ];

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const tones = [
      ["p-layout", "mint", "#317B67"],
      ["p-route", "sand", "#C9B48A"],
      ["p-chart", "blue", "#6E9BB5"],
      ["p-panel", "lilac", "#7D858D"],
    ] as const;
    const [icon, tone, color] = tones[projects.length % tones.length];
    addProject({
      id: name, name, desc: "A fresh start. Add a description when you’re ready.", icon, tone, color,
      owner: "Jamie Lee", team: ["JL"], extra: 0, done: 0, total: 0, due: d(11, 18), status: "on", fav: false, archived: false,
    });
    setTab("active");
    setNewName("");
    setCreating(false);
    notify("Project created");
  };

  return (
    <main className="content" id="view-projects">
      <section className="page-head tasks-head">
        <div>
          <h1>Projects</h1>
          <p className="sub">One shared view. Every project moving forward.</p>
        </div>
        <div className="head-right">
          <span className="today-date">Monday, November 2</span>
          <Button size="lg" onClick={() => setCreating(true)}><Icon name="plus" />New project</Button>
        </div>
      </section>

      <section className="kpis kpis-plain">
        {kpis.map((c) => (
          <article className="kpi" key={c.label}>
            <div className="kpi-top"><span>{c.label}</span><span><Icon name={c.icon} /></span></div>
            <div className="kpi-mid"><span className="kpi-value">{c.v}</span>{c.note}</div>
          </article>
        ))}
      </section>

      <div className="t-tabs-row p-tabs-row">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="active">Active projects <span className="badge">{act.length}</span></TabsTrigger>
            <TabsTrigger value="favorites">Favorites <span className="badge">{favCount}</span></TabsTrigger>
            <TabsTrigger value="archived">Archived <span className="badge">{archivedCount || ""}</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as "grid" | "list")} aria-label="Layout">
          <ToggleGroupItem value="grid"><Icon name="grid" />Grid</ToggleGroupItem>
          <ToggleGroupItem value="list"><Icon name="list" />List</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="p-toolbar">
        <div className="p-left">
          <label className="p-search">
            <Icon name="search" />
            <Input type="text" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)}
              className="h-auto flex-1 border-0 bg-transparent p-0 text-[12.5px] shadow-none focus-visible:ring-0" />
          </label>
          <Filter icon="filter" label={status === "all" ? "All statuses" : pLabel[status as "on" | "risk"]} set={status !== "all"}
            value={status} onPick={setStatus} options={[["all", "All statuses"], ["on", "On track"], ["risk", "At risk"]]} />
          <Filter icon="users" label={owner === "all" ? "All owners" : owner} set={owner !== "all"}
            value={owner} onPick={setOwner} options={[["all", "All owners"], ...owners.map((o) => [o, o] as [string, string])]} />
        </div>
        <Filter icon="sort" label={`Sort: ${SORT_LABEL[sort]}`} set={false} right value={sort} onPick={(v) => setSort(v as Sort)}
          options={(Object.keys(SORT_LABEL) as Sort[]).map((k) => [k, SORT_LABEL[k]])} />
      </div>

      <div className={cn("p-grid", mode === "list" && !!list.length && "as-list")}>
        {!list.length ? (
          <div className="p-empty"><h3>{empty[0]}</h3><p>{empty[1]}</p></div>
        ) : mode === "list" ? (
          <>
            <div className="p-lhead">
              <span>PROJECT</span><span>STATUS</span><span>PROGRESS</span><span>OWNER</span><span>TEAM</span><span>DUE DATE</span><span />
            </div>
            {list.map((p, i) => <ProjectRow key={p.id} p={p} i={i} actions={actions} />)}
          </>
        ) : (
          list.map((p, i) => <ProjectCard key={p.id} p={p} i={i} actions={actions} />)
        )}
      </div>

      <div className="p-meta">
        <span className="saved" style={{ margin: 0 }}><i className="online" />All changes saved · Updated just now</span>
        <span>{showing}</span>
      </div>

      <section className="p-bottom">
        <div className="p-banner">
          {risk ? (
            <>
              <span style={{ display: "inline-flex" }}><Icon name="alert-circle" /></span>
              <div className="b-txt">
                <strong>A little attention goes a long way.</strong>
                {risk.name} · {riskTasks} of your tasks are due today or earlier.
              </div>
              <button className="link" type="button" onClick={() => goToProjectTasks(risk.name)}>
                View tasks <Icon name="arrow-right" />
              </button>
            </>
          ) : (
            <>
              <span style={{ display: "inline-flex" }}><Icon name="check-circle" /></span>
              <div className="b-txt"><strong>Everything is moving forward.</strong>No projects need attention right now.</div>
            </>
          )}
        </div>
        {next && (
          <button className="p-next" type="button" onClick={() => goToProjectTasks(next.name)}>
            <span className="p-date"><small>{MONTHS[next.due.getMonth()].toUpperCase()}</small><b>{next.due.getDate()}</b></span>
            <span className="n-txt"><small>NEXT PROJECT DEADLINE</small><strong>{next.name}</strong></span>
            <Icon name="arrow-ne" />
          </button>
        )}
      </section>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <form onSubmit={create}>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>A fresh start. You can add details whenever you’re ready.</DialogDescription>
            </DialogHeader>
            <Label className="fld mb-0 block">
              <span>Project name</span>
              <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Brand refresh" maxLength={60} />
            </Label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit">Create project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
