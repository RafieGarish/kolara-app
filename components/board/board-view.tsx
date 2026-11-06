"use client";

import "./board.css";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from "radix-ui";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { nextTaskId, useTasks } from "@/lib/stores/tasks";
import { useProjects } from "@/lib/stores/projects";
import { MS_DAY, TODAY, d, dayDiff, dueLabel } from "@/lib/dates";
import { PRIO_LABEL, PRIO_ORDER, PROJ_COLOR, STATUS_ORDER, type MyTask, type Priority, type TaskStatus } from "@/lib/types";
import { notify } from "@/lib/toast";

const COLS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To do", color: "var(--ink-3)" },
  { id: "progress", label: "In progress", color: "var(--green)" },
  { id: "review", label: "In review", color: "var(--amber)" },
  { id: "done", label: "Done", color: "var(--green-2)" },
];
void STATUS_ORDER; void MS_DAY; void TODAY;

export function BoardView() {
  const { tasks, setTasks, updateTask, addTask, removeTask } = useTasks();
  const projects = useProjects((s) => s.projects);
  const [q, setQ] = useState("");
  const [project, setProject] = useState("All projects");
  const [prio, setPrio] = useState<Priority | "all">("all");
  const [showDone, setShowDone] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [quickCol, setQuickCol] = useState<TaskStatus | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [dlg, setDlg] = useState(false);
  const [nt, setNt] = useState({ title: "", project: "Website redesign", priority: "medium" as Priority });

  const projNames = projects.filter((p) => !p.archived).map((p) => p.name);
  const colorOf = (n: string) => PROJ_COLOR[n] ?? projects.find((p) => p.name === n)?.color ?? "var(--ink-3)";

  const visible = useMemo(
    () =>
      tasks
        .filter((t) => (project === "All projects" || t.project === project) && (prio === "all" || t.priority === prio))
        .filter((t) => !q.trim() || t.title.toLowerCase().includes(q.trim().toLowerCase())),
    [tasks, project, prio, q],
  );
  const byCol = (c: TaskStatus) =>
    visible.filter((t) => t.status === c).sort((a, b) => PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority] || a.due.getTime() - b.due.getTime());

  const move = (id: number, col: TaskStatus) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== id || t.status === col) return t;
        return col === "done" ? { ...t, status: col, done: true, doneDay: 6 } : { ...t, status: col, done: false, doneDay: null };
      }),
    );
    const t = tasks.find((x) => x.id === id);
    if (t && t.status !== col) notify(`Moved to ${COLS.find((c) => c.id === col)!.label}`);
  };

  const create = (title: string, col: TaskStatus, proj: string, priority: Priority) => {
    if (!title.trim()) return;
    const t: MyTask = {
      id: nextTaskId(), title: title.trim(), project: proj, status: col, priority, due: d(10, 6),
      comments: 0, sub: null, done: col === "done", doneDay: col === "done" ? 6 : null, note: "",
    };
    addTask(t);
    notify("Task added");
  };

  const total = visible.length;
  const doneN = visible.filter((t) => t.status === "done").length;
  const cols = showDone ? COLS : COLS.filter((c) => c.id !== "done");

  return (
    <main className="content" id="view-board">
      <section className="page-head tasks-head">
        <div>
          <h1>Board</h1>
          <p className="sub">See the flow. Move work forward, one card at a time.</p>
        </div>
        <div className="head-right">
          <span className="today-date">Monday, November 2</span>
          <Button size="lg" onClick={() => setDlg(true)}><Icon name="plus" />New task</Button>
        </div>
      </section>

      <div className="kb-toolbar">
        <div className="kb-left">
          <label className="kb-search">
            <Icon name="search" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards…" />
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="!h-10"><Icon name="filter" />{project}<Icon name="chevron-down" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["All projects", ...projNames].map((p) => (
                <DropdownMenuItem key={p} data-selected={p === project} onSelect={() => setProject(p)}>{p}{p === project && <Icon name="check" />}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="!h-10"><Icon name="flag" />{prio === "all" ? "Priority" : PRIO_LABEL[prio]}<Icon name="chevron-down" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <DropdownMenuItem key={p} data-selected={p === prio} onSelect={() => setPrio(p)}>{p === "all" ? "All priorities" : PRIO_LABEL[p]}{p === prio && <Icon name="check" />}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <label className="kb-toggle">
          <Switch.Root checked={showDone} onCheckedChange={setShowDone} aria-label="Show completed"><Switch.Thumb asChild><span /></Switch.Thumb></Switch.Root>
          Show completed
        </label>
      </div>

      <div className="kb-board" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(250px, 1fr))` }}>
        {cols.map((c) => {
          const items = byCol(c.id);
          return (
            <section
              key={c.id}
              className={`kb-col ${overCol === c.id ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(c.id); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null); }}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData("text/plain")) || dragId;
                if (id) move(id, c.id);
                setOverCol(null); setDragId(null);
              }}
            >
              <header className="kb-head">
                <i style={{ background: c.color }} />
                <h4>{c.label}</h4>
                <span className="kb-count">{items.length}</span>
                <Button variant="ghost" size="icon-xs" className="kb-add" aria-label={`Add to ${c.label}`} onClick={() => { setQuickCol(c.id); setQuickTitle(""); }}>
                  <Icon name="plus" />
                </Button>
              </header>

              <div className="kb-cards">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((t) => {
                    const diff = dayDiff(t.due);
                    const overdue = !t.done && diff < 0;
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 520, damping: 40 }}
                      >
                        <div
                          className={`kb-card ${t.done ? "done" : ""} ${dragId === t.id ? "dragging" : ""}`}
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(t.id)); e.dataTransfer.effectAllowed = "move"; setDragId(t.id); }}
                          onDragEnd={() => { setDragId(null); setOverCol(null); }}
                        >
                          <div className="kb-top">
                            <span className="kb-proj"><i style={{ background: colorOf(t.project) }} />{t.project}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label="Card actions"><Icon name="more" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {COLS.filter((x) => x.id !== t.status).map((x) => (
                                  <DropdownMenuItem key={x.id} onSelect={() => move(t.id, x.id)}>Move to {x.label}</DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                {(["high", "medium", "low"] as Priority[]).filter((p) => p !== t.priority).map((p) => (
                                  <DropdownMenuItem key={p} onSelect={() => updateTask(t.id, { priority: p })}>Set {PRIO_LABEL[p].toLowerCase()} priority</DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onSelect={() => { removeTask(t.id); notify("Task deleted"); }}>Delete task</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="kb-title">{t.title}</div>
                          {t.sub && <Progress value={(t.sub[0] / t.sub[1]) * 100} className="mb-3" />}
                          <div className="kb-foot">
                            <span className="kb-meta">
                              <span className={overdue ? "over-due" : ""}><Icon name="calendar" size={13} />{t.done ? "Done" : dueLabel(t.due)}</span>
                              {t.comments > 0 && <span><Icon name="message" size={13} />{t.comments}</span>}
                              {t.sub && <span><Icon name="check-circle" size={13} />{t.sub[0]}/{t.sub[1]}</span>}
                            </span>
                            <span className={`kb-prio ${t.priority}`}><Icon name="flag" size={13} />{PRIO_LABEL[t.priority]}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {items.length === 0 && quickCol !== c.id && <div className="kb-empty">Drop a card here</div>}
              </div>

              {quickCol === c.id && (
                <form
                  className="kb-quick"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create(quickTitle, c.id, project === "All projects" ? "Website redesign" : project, "medium");
                    setQuickCol(null);
                  }}
                >
                  <input autoFocus value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder="Card title, then Enter" maxLength={80} onKeyDown={(e) => e.key === "Escape" && setQuickCol(null)} />
                </form>
              )}
            </section>
          );
        })}
      </div>

      <div className="kb-sum">
        <span>{doneN} of {total} cards completed</span>
        <span>Drag cards between columns to update status</span>
      </div>

      <Dialog open={dlg} onOpenChange={setDlg}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nt.title.trim()) return;
              create(nt.title, "todo", nt.project, nt.priority);
              setNt({ ...nt, title: "" });
              setDlg(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
              <DialogDescription>It will be added to the To do column.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Input autoFocus placeholder="Task name" value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} maxLength={80} />
              <Select value={nt.project} onValueChange={(v) => setNt({ ...nt, project: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{projNames.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={nt.priority} onValueChange={(v) => setNt({ ...nt, priority: v as Priority })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{(["high", "medium", "low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{PRIO_LABEL[p]} priority</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDlg(false)}>Cancel</Button>
              <Button type="submit">Add task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
