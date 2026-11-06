"use client";

import "./calendar.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { MONTHS, TODAY, dayDiff } from "@/lib/dates";
import { PROJ_COLOR } from "@/lib/types";
import { useProjects } from "@/lib/stores/projects";
import { useTasks } from "@/lib/stores/tasks";
import { useTeam } from "@/lib/stores/team";
import { useCalendar, type CalEvent } from "@/lib/stores/calendar";
import {
  DOW, DOW_FULL, MONTHS_FULL, TYPE_LABEL, addDays, calEventsOn, fromISO, plural, sameDay, toISO,
  type CalFilters,
} from "./cal-utils";
import { EventDetail, EventForm, type DetailAction } from "./event-dialogs";

type View = "month" | "week" | "day";

function Chip({ e, onOpen }: { e: CalEvent; onOpen: (e: CalEvent) => void }) {
  const click = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    onOpen(e);
  };
  if (e.type === "deadline")
    return (
      <button className={cn("ev deadline", e.risk && "risk")} onClick={click}>
        <Icon name="flag-solid" /><span className="t">{e.title}</span>
      </button>
    );
  if (e.type === "milestone")
    return (
      <button className="ev milestone" onClick={click}>
        <Icon name="dia-solid" /><span className="t">{e.title}</span>
      </button>
    );
  if (e.type === "meeting")
    return (
      <button className="ev meeting" onClick={click}>
        <span className="t"><span className="pre">·</span> {e.time} {e.short || e.title}</span>
      </button>
    );
  return (
    <button className="ev task" onClick={click}>
      <span className="t">{e.title}</span>
    </button>
  );
}

function CellEvents({
  evs, date, limit, onOpen, onDay,
}: { evs: CalEvent[]; date: Date; limit: number; onOpen: (e: CalEvent) => void; onDay: (d: Date) => void }) {
  const tasks = evs.filter((e) => e.type === "task");
  const rest = evs.filter((e) => e.type !== "task");
  const chips: React.ReactNode[] = rest.map((e) => <Chip key={e.cid} e={e} onOpen={onOpen} />);
  const dayClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    onDay(date);
  };
  if (tasks.length > 1)
    chips.push(
      <button key="grp" className="ev group" onClick={dayClick}>
        <span className="t">{tasks.length} tasks due{sameDay(date, TODAY) ? " today" : ""}</span>
      </button>,
    );
  else if (tasks.length === 1) chips.push(<Chip key={tasks[0].cid} e={tasks[0]} onOpen={onOpen} />);
  if (!limit || chips.length <= limit) return <>{chips}</>;
  return (
    <>
      {chips.slice(0, limit - 1)}
      <button className="cal-more" onClick={dayClick}>+{chips.length - limit + 1} more</button>
    </>
  );
}

export function CalendarView() {
  const router = useRouter();
  const projects = useProjects((s) => s.projects);
  const tasks = useTasks((s) => s.tasks);
  const members = useTeam((s) => s.members);
  const events = useCalendar((s) => s.events);

  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState<Date>(new Date(TODAY));
  const [filters, setFilters] = useState<CalFilters>({ project: "all", member: "all", type: "all" });
  const [detail, setDetail] = useState<CalEvent | null>(null);
  const [formDate, setFormDate] = useState<Date | null>(null);

  const active = useMemo(() => projects.filter((p) => !p.archived), [projects]);
  const src = useMemo(() => ({ projects, tasks, members, events }), [projects, tasks, members, events]);
  const on = (date: Date, ignore = false) => calEventsOn(date, src, filters, ignore);

  const goDay = (d: Date) => {
    setAnchor(d);
    setView("day");
  };

  /* ---- actions (mirror the original completeTask / navigate / goToProjectTasks) ---- */
  const completeTask = (id: number) => {
    useTasks.getState().updateTask(id, { done: true, status: "done", doneDay: 6 });
    notify("Nice — task completed");
  };
  const onAction = (act: DetailAction, e: CalEvent) => {
    setDetail(null);
    if (act === "delete") {
      useCalendar.getState().removeEvent(e.cid);
      notify("Event deleted");
    } else if (act === "complete" && e.task) completeTask(e.task.id);
    else if (act === "task") {
      useTasks.getState().setView({ tab: "all", mode: "list", collapsed: [] });
      router.push("/tasks");
    } else if (act === "proj") {
      if (PROJ_COLOR[e.project]) useTasks.getState().setView({ project: e.project, tab: "all" });
      else notify(`No tasks assigned to you in ${e.project}`);
      router.push("/tasks");
    }
  };

  const shift = (dir: number) =>
    setAnchor((a) =>
      view === "month" ? new Date(a.getFullYear(), a.getMonth() + dir, 1) : addDays(a, dir * (view === "week" ? 7 : 1)),
    );

  const title = (() => {
    const a = anchor;
    if (view === "month") return `${MONTHS_FULL[a.getMonth()]} ${a.getFullYear()}`;
    if (view === "day") return `${DOW_FULL[a.getDay()]}, ${MONTHS_FULL[a.getMonth()]} ${a.getDate()}`;
    const s = addDays(a, -a.getDay());
    const e = addDays(s, 6);
    return s.getMonth() === e.getMonth()
      ? `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`
      : `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  })();

  const countLabel = (() => {
    if (view === "month") {
      let n = 0;
      const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= last; i++)
        n += on(new Date(anchor.getFullYear(), anchor.getMonth(), i)).filter((e) => e.type === "deadline").length;
      return `${n} project deadline${n === 1 ? "" : "s"} this month`;
    }
    if (view === "week") {
      const s = addDays(anchor, -anchor.getDay());
      let n = 0;
      for (let i = 0; i < 7; i++) n += on(addDays(s, i)).length;
      return `${n} event${n === 1 ? "" : "s"} this week`;
    }
    const n = on(anchor).length;
    return `${n} event${n === 1 ? "" : "s"} on this day`;
  })();

  const tz = (() => {
    if (typeof window === "undefined") return "";
    const off = -new Date().getTimezoneOffset();
    const ab = Math.abs(off);
    return ` · GMT${off >= 0 ? "+" : "−"}${String(Math.floor(ab / 60)).padStart(2, "0")}:${String(ab % 60).padStart(2, "0")}`;
  })();

  /* ---- views ---- */
  const monthGrid = () => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = addDays(first, -first.getDay());
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    return (
      <>
        <div className="cal-dow">{DOW.map((x) => <span key={x}>{x}</span>)}</div>
        <div className="cal-grid">
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const dt = addDays(start, i);
            const inM = dt.getMonth() === anchor.getMonth();
            const isT = sameDay(dt, TODAY);
            const wk = dt.getDay() === 0 || dt.getDay() === 6;
            const tag = isT ? "TODAY" : dt.getDate() === 1 && !inM ? MONTHS[dt.getMonth()].toUpperCase() : "";
            return (
              <div
                key={toISO(dt)}
                className={cn("cal-cell", wk && "wknd", !inM && "out", isT && "today")}
                onClick={() => setFormDate(dt)}
              >
                <div className="dn-row">
                  <span className="dn">{dt.getDate()}</span>
                  {tag && <span className="dn-tag">{tag}</span>}
                </div>
                <CellEvents evs={on(dt)} date={dt} limit={3} onOpen={setDetail} onDay={goDay} />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const weekGrid = () => {
    const start = addDays(anchor, -anchor.getDay());
    return (
      <div className="cal-week">
        {Array.from({ length: 7 }, (_, i) => {
          const dt = addDays(start, i);
          return (
            <div
              key={i}
              className={cn("wk-col", dt.getDay() % 6 === 0 && "wknd", sameDay(dt, TODAY) && "today")}
              onClick={() => setFormDate(dt)}
            >
              <div className="wk-h"><span>{DOW[dt.getDay()]}</span><b>{dt.getDate()}</b></div>
              <CellEvents evs={on(dt)} date={dt} limit={0} onOpen={setDetail} onDay={goDay} />
            </div>
          );
        })}
      </div>
    );
  };

  const dayList = () => {
    const evs = on(anchor);
    if (!evs.length)
      return (
        <div className="cal-day">
          <div className="cal-empty"><h3>A quiet day</h3>Nothing scheduled. Click “New event” to add something.</div>
        </div>
      );
    return (
      <div className="cal-day">
        {evs.map((e) => {
          const sub =
            e.type === "meeting" ? e.where || e.project || "Studio team"
            : e.type === "task" ? e.project
            : e.type === "deadline" ? `Owner · ${e.owner}`
            : e.project;
          return (
            <div key={e.cid} className={cn("agenda", e.type, e.risk && "risk")} onClick={() => setDetail(e)}>
              <span className="ag-time">{e.time ? e.time : "All day"}</span>
              <i className="ag-bar" />
              <div className="ag-main"><strong>{e.title}</strong><small>{sub || ""}</small></div>
              <span className="ag-type">{TYPE_LABEL[e.type]}{e.risk ? " · At risk" : ""}</span>
            </div>
          );
        })}
      </div>
    );
  };

  /* ---- side panels ---- */
  const todayEvs = on(TODAY, true);
  const meets = todayEvs.filter((e) => e.type === "meeting");
  const dueToday = tasks.filter((t) => !t.done && dayDiff(t.due) === 0);

  const upNext = (() => {
    const items: CalEvent[] = [];
    let taskTaken = false;
    for (let i = 1; i <= 90 && items.length < 5; i++) {
      on(addDays(TODAY, i), true).forEach((e) => {
        if (items.length >= 5 || e.type === "meeting") return;
        if (e.type === "task") {
          if (taskTaken) return;
          taskTaken = true;
        }
        items.push(e);
      });
    }
    return items;
  })();

  /* ---- filter dropdown ---- */
  const Filter = ({
    icon, all, value, options, onPick,
  }: { icon: string; all: string; value: string; options: [string, string][]; onPick: (v: string) => void }) => {
    const label = value === "all" ? all : options.find(([v]) => v === value)?.[1] ?? value;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("!h-10 !gap-2.5 !px-3.5", value !== "all" && "!border-[var(--green)] !text-[var(--green)]")}>
            <Icon name={icon} /><span>{label}</span><Icon name="chevron-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {[["all", all] as [string, string], ...options].map(([v, l]) => (
            <DropdownMenuItem key={v} data-selected={v === value} onSelect={() => onPick(v)}>
              {l}{v === value && <Icon name="check" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <main className="content" id="view-calendar">
      <section className="page-head tasks-head">
        <div>
          <h1>Calendar</h1>
          <p className="sub">A shared rhythm. Every deadline, milestone, and moment together.</p>
        </div>
        <div className="head-right">
          <span className="today-date">Monday, November 2</span>
          <Button size="lg" onClick={() => setFormDate(view === "month" && anchor.getMonth() === TODAY.getMonth() ? TODAY : anchor)}>
            <Icon name="plus" />New event
          </Button>
        </div>
      </section>

      <section className="cal-filters">
        <div className="p-left">
          <Filter icon="filter" all="All projects" value={filters.project} options={active.map((p) => [p.name, p.name])} onPick={(v) => setFilters((f) => ({ ...f, project: v }))} />
          <Filter icon="users" all="All members" value={filters.member} options={members.map((m) => [m.name, m.name])} onPick={(v) => setFilters((f) => ({ ...f, member: v }))} />
          <Filter icon="calendar" all="All event types" value={filters.type} options={Object.entries(TYPE_LABEL)} onPick={(v) => setFilters((f) => ({ ...f, type: v }))} />
        </div>
        <span className="cal-ws">Studio workspace <span>·</span> {active.length} active projects</span>
      </section>

      <div className="cal-layout">
        <article className="card cal-card">
          <header className="cal-head">
            <div className="cal-nav">
              <h2>{title}</h2>
              <Button variant="ghost" size="icon-xs" aria-label="Previous" onClick={() => shift(-1)}><Icon name="chevron-left" /></Button>
              <Button variant="ghost" size="icon-xs" aria-label="Next" onClick={() => shift(1)}><Icon name="chevron-right" /></Button>
              <Button variant="outline" onClick={() => setAnchor(new Date(TODAY))}>Today</Button>
            </div>
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as View)} aria-label="Calendar view">
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
            </ToggleGroup>
          </header>
          <div>{view === "month" ? monthGrid() : view === "week" ? weekGrid() : dayList()}</div>
          <footer className="cal-foot">
            <div className="cal-legend">
              <span><i className="lg-flag" />Project deadline</span>
              <span><i className="lg-dia" />Milestone</span>
              <span><i className="lg-dot meet" />Team meeting</span>
              <span><i className="lg-dot task" />Task</span>
            </div>
            <span>{countLabel}</span>
          </footer>
        </article>

        <aside className="cal-side">
          <article className="card glance">
            <div className="gl-top"><h3>Today, at a glance</h3><Icon name="calendar" /></div>
            <p className="gl-sub">
              {DOW_FULL[TODAY.getDay()].slice(0, 3)}, {MONTHS[TODAY.getMonth()]} {TODAY.getDate()} · {plural(meets.length, "meeting")}, {plural(dueToday.length, "task")}
            </p>
            {meets.map((m) => (
              <div key={m.cid} className="gl-meet" style={{ cursor: "pointer" }} onClick={() => setDetail(m)}>
                <i />
                <div><strong>{m.title}</strong><small>{m.time} – {m.end} · {m.where || m.project || "Studio team"}</small></div>
                <Icon name="video" />
              </div>
            ))}
            <div className="gl-label"><span>YOUR TASKS DUE TODAY</span><span>{dueToday.length}</span></div>
            {dueToday.length ? (
              dueToday.map((t) => (
                <div className="gl-task" key={t.id}>
                  <Checkbox checked={false} onCheckedChange={() => completeTask(t.id)} aria-label="Complete task" />
                  <div>
                    <strong>{t.title}</strong>
                    <small><i style={{ background: PROJ_COLOR[t.project] || "#7D858D" }} />{t.project}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="gl-empty">Nothing due today. A good moment to look ahead.</p>
            )}
          </article>

          <article className="card upnext">
            <div className="up-head"><h3>Coming up</h3><span>{MONTHS_FULL[TODAY.getMonth()].toUpperCase()}</span></div>
            {upNext.length ? (
              upNext.map((e) => {
                const sub =
                  e.type === "task" ? `${e.project} · Task`
                  : e.type === "deadline" ? (e.risk ? "Project deadline · At risk" : `Project deadline · ${e.owner}`)
                  : `Milestone · ${e.project}`;
                return (
                  <button key={e.cid} className="up-item" onClick={() => setDetail(e)}>
                    <span className="up-date"><small>{DOW[e.date.getDay()]}</small><b>{String(e.date.getDate()).padStart(2, "0")}</b></span>
                    <span className="up-main"><span className="up-t">{e.title}</span><span className={cn("up-s", e.risk && "risk")}>{sub}</span></span>
                    {e.type === "milestone" && <i className="up-dia" />}
                  </button>
                );
              })
            ) : (
              <p className="gl-empty" style={{ padding: "8px 0 16px" }}>Nothing on the horizon.</p>
            )}
          </article>
        </aside>
      </div>

      <div className="p-meta">
        <span className="saved" style={{ margin: 0 }}><i className="online" />All changes saved · Updated just now</span>
        <span suppressHydrationWarning>All times in your local timezone{tz}</span>
      </div>

      <EventDetail event={detail} onClose={() => setDetail(null)} onAction={onAction} />
      <EventForm
        date={formDate}
        onClose={() => setFormDate(null)}
        onCreate={(e) => {
          useCalendar.getState().addEvent(e);
          setFormDate(null);
          setAnchor(fromISO(toISO(e.date)));
          notify("Event added");
        }}
      />
    </main>
  );
}
