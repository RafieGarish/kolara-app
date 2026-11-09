"use client";

import "./tasks.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { d } from "@/lib/dates";
import { notify } from "@/lib/toast";
import { nextTaskId, useTasks, type TaskView } from "@/lib/stores/tasks";
import { PRIO_LABEL, PROJ_COLOR, STATUS_ORDER, type MyTask, type Priority, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { groupsFor, passes } from "./task-helpers";
import { TaskRow, type RowActions } from "./task-row";
import { TaskBoard } from "./task-board";
import { TaskSide } from "./task-side";
import { TasksKpis } from "./tasks-kpis";
import DateDisplay from "../date-display";

const GROUP_LABEL = { due: "Due date", project: "Project", priority: "Priority", status: "Status" } as const;

function Check() {
  return <Icon name="check" />;
}

function FilterMenu<V extends string>({
  options, current, onPick, children, trigger, align = "start",
}: {
  options: [V, string][];
  current: V;
  onPick: (v: V) => void;
  children?: React.ReactNode;
  trigger: React.ReactNode;
  align?: "start" | "end";
}) {
  void children;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {options.map(([val, label]) => (
          <DropdownMenuItem key={val} data-selected={val === current} onSelect={() => onPick(val)}>
            {label}
            {val === current && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TasksView() {
  const { tasks, view, setView, setTasks, updateTask, addTask, removeTask } = useTasks();
  const [completing, setCompleting] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirmAll, setConfirmAll] = useState(false);
  const [saved, setSaved] = useState("All changes saved · Updated just now");
  const addRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);
  // any change refreshes the "saved" message like refreshTasks() did
  useEffect(() => setSaved("All changes saved · Updated just now"), [tasks]);

  const open = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const doneCount = tasks.filter((t) => t.done).length;
  const ok = useMemo(() => passes(view), [view]);
  const isList = view.mode === "list";

  const complete = useCallback(
    (t: MyTask, animate = false) => {
      const finish = () => {
        updateTask(t.id, { done: true, status: "done", doneDay: 6 });
        setCompleting((c) => c.filter((x) => x !== t.id));
        notify("Nice — task completed");
      };
      if (animate) {
        setCompleting((c) => [...c, t.id]);
        timers.current.push(window.setTimeout(finish, 320));
      } else finish();
    },
    [updateTask],
  );
  const reopen = useCallback(
    (t: MyTask) => {
      updateTask(t.id, { done: false, status: "todo", doneDay: null });
      notify("Task reopened");
    },
    [updateTask],
  );

  const actions: RowActions = {
    toggle: (t) => (t.done ? reopen(t) : complete(t, true)),
    status: (t) => {
      const c: TaskStatus[] = ["todo", "progress", "review"];
      updateTask(t.id, { status: c[(c.indexOf(t.status) + 1) % 3] });
    },
    open: (t) => notify(`Opening “${t.title}”`),
    priority: (t) => {
      const o: Priority[] = ["low", "medium", "high"];
      const p = o[(o.indexOf(t.priority) + 1) % 3];
      updateTask(t.id, { priority: p });
      notify(`Priority set to ${PRIO_LABEL[p]}`);
    },
    remove: (t) => {
      removeTask(t.id);
      notify("Task deleted");
    },
  };

  const patchView = (p: Partial<TaskView>) => setView(p);
  const toggleGroup = (k: string) =>
    setView({ collapsed: view.collapsed.includes(k) ? view.collapsed.filter((x) => x !== k) : [...view.collapsed, k] });

  const onTab = (v: string) => {
    const tab = v as TaskView["tab"];
    patchView(tab === "completed" && view.mode === "board" ? { tab, mode: "list" } : { tab });
  };
  const onMode = (v: string) => {
    if (!v) return;
    const mode = v as TaskView["mode"];
    patchView(mode === "board" && view.tab !== "all" ? { mode, tab: "all" } : { mode });
  };

  const flashTask = (id: number) => {
    setView({ tab: "all", mode: "list", collapsed: [] });
    setFlash(id);
    window.setTimeout(() => {
      document.getElementById(`task-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 30);
    timers.current.push(window.setTimeout(() => setFlash(null), 1200));
  };

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const project = view.project !== "All projects" ? view.project : "Website redesign";
    const t: MyTask = {
      id: nextTaskId(), title, project, status: "todo", priority: "medium", due: d(10, 3),
      comments: 0, sub: null, done: false, doneDay: null, note: "",
    };
    addTask(t);
    setAdding(false);
    setNewTitle("");
    setView({ tab: "all", mode: "list", collapsed: view.collapsed.filter((k) => k !== "due:upcoming") });
    setFlash(t.id);
    window.setTimeout(() => document.getElementById(`task-${t.id}`)?.scrollIntoView({ block: "nearest" }), 30);
    timers.current.push(window.setTimeout(() => setFlash(null), 1200));
    notify("Task added");
  };

  const visibleOpen = open.filter(ok);
  const completedList = tasks.filter((t) => t.done && ok(t)).sort((a, b) => (b.doneDay ?? 0) - (a.doneDay ?? 0));
  const groups = groupsFor(visibleOpen, view);
  const shown = groups.reduce((n, g) => n + (view.collapsed.includes(`${view.group}:${g.key}`) ? 0 : g.items.length), 0);
  const shownText =
    view.tab === "all"
      ? isList
        ? `${shown} of ${open.length} open tasks shown`
        : `${visibleOpen.length} of ${open.length} open tasks shown`
      : `${doneCount} completed this week`;

  const dropTask = (id: number, col: TaskStatus) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        if (col === "done") return t.done ? t : { ...t, done: true, status: "done", doneDay: 6 };
        return { ...t, done: false, doneDay: null, status: col };
      }),
    );
  };

  const selectAll = () => {
    if (view.tab !== "all" || !visibleOpen.length) return;
    setConfirmAll(true);
  };
  const confirmComplete = () => {
    const ids = new Set(visibleOpen.map((t) => t.id));
    setTasks((ts) => ts.map((t) => (ids.has(t.id) ? { ...t, done: true, status: "done", doneDay: 6 } : t)));
    setConfirmAll(false);
  };

  const projOptions: [string, string][] = [["All projects", "All projects"], ...Object.keys(PROJ_COLOR).map((p): [string, string] => [p, p])];
  const prioOptions: [string, string][] = [["", "All priorities"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]];
  const groupOptions = (Object.keys(GROUP_LABEL) as (keyof typeof GROUP_LABEL)[]).map((k): [string, string] => [k, GROUP_LABEL[k]]);

  return (
    <main className="content" id="view-tasks">
      <section className="page-head tasks-head">
        <div>
          <h1>My tasks</h1>
          <p className="sub">A little focus. A lot of progress. Here’s what’s on your plate, Jamie.</p>
        </div>
        <div className="head-right">
          <span className="today-date"><DateDisplay/></span>
          <Button
            size="lg"
            onClick={() => {
              addRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
              setAdding(true);
            }}
          >
            <Icon name="plus" />New task
          </Button>
        </div>
      </section>

      <TasksKpis tasks={tasks} />

      <div className="t-layout">
        <div className="t-main">
          <div className="t-tabs-row">
            <Tabs value={view.tab} onValueChange={onTab}>
              <TabsList>
                <TabsTrigger value="all">All tasks <span className="badge">{open.length}</span></TabsTrigger>
                <TabsTrigger value="completed">Completed <span className="badge">{doneCount}</span></TabsTrigger>
              </TabsList>
            </Tabs>
            <ToggleGroup type="single" value={view.mode} onValueChange={onMode} aria-label="View">
              <ToggleGroupItem value="list"><Icon name="list" />List</ToggleGroupItem>
              <ToggleGroupItem value="board"><Icon name="board" />Board</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Card className="t-card">
            <div className="t-toolbar">
              <div className="t-filters">
                <div className="dd">
                  <FilterMenu
                    options={projOptions}
                    current={view.project}
                    onPick={(v) => patchView({ project: v })}
                    trigger={
                      <Button variant="outline" className={cn("dd-btn", view.project !== "All projects" && "set")}>
                        <Icon name="filter" /><span className="dd-label">{view.project}</span><Icon name="chevron-down" />
                      </Button>
                    }
                  />
                </div>
                <div className="dd">
                  <FilterMenu
                    options={prioOptions}
                    current={view.priority ?? ""}
                    onPick={(v) => patchView({ priority: (v || null) as Priority | null })}
                    trigger={
                      <Button variant="outline" className={cn("dd-btn", view.priority && "set")}>
                        <Icon name="flag" />
                        <span className="dd-label">{view.priority ? `${PRIO_LABEL[view.priority]} priority` : "Priority"}</span>
                        <Icon name="chevron-down" />
                      </Button>
                    }
                  />
                </div>
              </div>
              <div className="t-tools">
                <div className="dd" style={{ visibility: isList && view.tab === "all" ? "visible" : "hidden" }}>
                  <FilterMenu
                    align="end"
                    options={groupOptions}
                    current={view.group as string}
                    onPick={(v) => patchView({ group: v as TaskView["group"] })}
                    trigger={
                      <button className="tool-btn" type="button">
                        <Icon name="group" /><span className="dd-label">Group: {GROUP_LABEL[view.group]}</span><Icon name="chevron-down" />
                      </button>
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Reverse sort order"
                  onClick={() => {
                    const sortDir = (view.sortDir * -1) as 1 | -1;
                    setView({ sortDir });
                    notify(sortDir === 1 ? "Sorted: soonest first" : "Sorted: latest first");
                  }}
                >
                  <Icon name="sort" />
                </Button>
              </div>
            </div>

            {isList ? (
              <div id="tasksList">
                <div className="tl-head tl-row">
                  <span className="c-name">
                    <Checkbox aria-label="Select all" checked={false} onCheckedChange={selectAll} />
                    <span>TASK NAME</span>
                  </span>
                  <span>PROJECT</span><span>STATUS</span><span>PRIORITY</span><span>DUE DATE</span><span />
                </div>
                <div id="tlBody">
                  {view.tab === "completed" ? (
                    completedList.length ? (
                      completedList.map((t) => <TaskRow key={t.id} t={t} isDone actions={actions} flash={flash === t.id} />)
                    ) : (
                      <div className="t-empty">Nothing completed yet — you’ve got this.</div>
                    )
                  ) : !groups.length ? (
                    <div className="t-empty">No tasks match these filters.</div>
                  ) : (
                    groups.map((g) => {
                      const k = `${view.group}:${g.key}`;
                      const col = view.collapsed.includes(k);
                      return (
                        <div key={k} style={{ display: "contents" }}>
                          <div className={cn("tl-group", g.cls, col && "collapsed")} onClick={() => toggleGroup(k)} role="button" tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleGroup(k); } }}>
                            <span className="g-caret"><Icon name="chevron-down" /></span>
                            <strong>{g.label}</strong><span className="g-count">{g.items.length}</span>
                            {g.sub ? <span className="g-sub">· {g.sub}</span> : null}
                          </div>
                          {g.items.map((t) => (
                            <TaskRow key={t.id} t={t} isDone={false} hidden={col} completing={completing.includes(t.id)} flash={flash === t.id} actions={actions} />
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <TaskBoard tasks={tasks.filter(ok)} onDrop={dropTask} />
            )}

            <footer className="tl-foot">
              <div className="add-wrap">
                {!adding && (
                  <Button ref={addRef} variant="link" className="add-task" onClick={() => { setNewTitle(""); setAdding(true); }}>
                    <Icon name="plus" />Add task
                  </Button>
                )}
                {adding && (
                  <form className="add-form" autoComplete="off" onSubmit={submitNew}>
                    <Input
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
                      placeholder="Task name, then press Enter"
                      maxLength={80}
                      className="h-8 flex-1 !rounded-lg text-[12.5px]"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                  </form>
                )}
              </div>
              <span>{shownText}</span>
            </footer>
          </Card>
          <p className="saved"><i className="online" /><span>{saved}</span></p>
        </div>

        <TaskSide tasks={tasks} onOpen={flashTask} />
      </div>

      <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete visible tasks?</DialogTitle>
            <DialogDescription>
              Mark {visibleOpen.length} visible task{visibleOpen.length > 1 ? "s" : ""} as complete?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAll(false)}>Cancel</Button>
            <Button onClick={confirmComplete}>Mark complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

void STATUS_ORDER;
