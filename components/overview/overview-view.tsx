"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notify } from "@/lib/toast";
import { useUi } from "@/lib/stores/ui";
import { STATUS, STATUS_ORDER } from "@/lib/types";
import { DAYS, FEED, OV_PROJECTS, OV_TASKS, PEOPLE, type OvTask } from "@/lib/data/overview";
import { VizBars, VizRing, VizSpark, VizSteps } from "./kpi-viz";

const useMountedGrow = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
};

const Trend = ({ children }: { children: React.ReactNode }) => (
  <b>
    <Icon name="arrow-trend" />
    {children}
  </b>
);

function Kpis() {
  const cards = [
    { label: "Active projects", icon: "folder-open", value: "6", foot: <><Trend>2 new</Trend><span>this month</span></>, viz: <VizSteps /> },
    { label: "Tasks completed", icon: "check-circle", value: "42", foot: <><Trend>16%</Trend><span>vs. last week</span></>, viz: <VizBars /> },
    { label: "On-time delivery", icon: "timer", value: "92%", foot: <><Trend>8%</Trend><span>vs. last month</span></>, viz: <VizRing pct={92} /> },
    { label: "Team capacity", icon: "users", value: "78%", foot: <><b>Healthy</b><span>8 of 10 members active</span></>, viz: <VizSpark /> },
  ];
  return (
    <section className="kpis">
      {cards.map((k) => (
        <article className="kpi" key={k.label}>
          <div className="kpi-top">
            <span>{k.label}</span>
            <span><Icon name={k.icon} /></span>
          </div>
          <div className="kpi-mid">
            <span className="kpi-value">{k.value}</span>
            <span className="kpi-viz">{k.viz}</span>
          </div>
          <div className="kpi-foot">{k.foot}</div>
        </article>
      ))}
    </section>
  );
}

function Gantt({ filter }: { filter: string }) {
  const grown = useMountedGrow();
  return (
    <div className="gantt">
      <div className="g-head">
        <span>PROJECT</span>
        <div className="g-days">
          {DAYS.map((d, i) => (
            <span key={d} className={i === 0 ? "today" : ""}>{d}</span>
          ))}
        </div>
      </div>
      <div className="g-body">
        <div className="g-grid">{DAYS.map((d) => <span key={d} />)}</div>
        <div className="g-today" />
        {OV_PROJECTS.map((p, i) => (
          <div className="g-row" key={p.name} style={{ display: filter === "All projects" || filter === p.name ? "" : "none" }}>
            <div className="g-name">
              <strong>{p.name}</strong>
              <small>{p.done} / {p.total} tasks · {p.pct}%</small>
            </div>
            <div className="g-track">
              <div
                className={`g-bar gb-${i}`}
                style={{ left: `${p.start * 100}%`, width: `${(p.end - p.start) * 100}%` }}
                title={`${p.name} – ${p.pct}% complete`}
              >
                <div className="g-fill" style={{ width: grown ? `${p.pct}%` : 0 }}>{p.pct}% complete</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamMomentum() {
  const grown = useMountedGrow();
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Team momentum</CardTitle>
          <CardDescription>Everyone moving forward.</CardDescription>
        </div>
        <Link href="/team" className="link">View team <Icon name="arrow-up-right" /></Link>
      </CardHeader>
      <ul className="people">
        {PEOPLE.map((p) => (
          <li className="person" key={p.ini}>
            <UserAvatar ini={p.ini} tone={p.tone} large />
            <div className="who">
              <strong>{p.name}</strong>
              <small>{p.role}</small>
            </div>
            <div className="prog">
              {p.done} / {p.total} tasks
              <Progress value={grown ? (p.done / p.total) * 100 : 0} />
            </div>
          </li>
        ))}
      </ul>
      <footer className="people-foot"><i className="online" />8 teammates online <span>·</span> Updated just now</footer>
    </Card>
  );
}

function TasksCard({ filter }: { filter: string }) {
  const [tasks, setTasks] = useState<OvTask[]>(OV_TASKS);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const toggle = (i: number) =>
    setTasks((ts) => ts.map((t, k) => (k === i ? { ...t, status: t.status === "done" ? "todo" : "done" } : t)));
  const cycle = (i: number) =>
    setTasks((ts) =>
      ts.map((t, k) => (k === i ? { ...t, status: STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length] } : t)),
    );
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((ts) => [...ts, { title: title.trim(), project: "Website redesign", status: "todo", due: "This week", who: "JL", tone: "sand" }]);
    setTitle("");
    setAdding(false);
    notify("Task added");
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tasks to keep in sight</CardTitle>
          <CardDescription>A clear view of what’s next.</CardDescription>
        </div>
        <Link href="/tasks" className="link">View all tasks <Icon name="arrow-up-right" /></Link>
      </CardHeader>
      <div className="table">
        <div className="tr th"><span>TASK NAME</span><span>STATUS</span><span>DUE DATE</span><span>ASSIGNEE</span></div>
        <div>
          {tasks.map((t, i) => {
            const done = t.status === "done";
            const s = STATUS[t.status];
            return (
              <div
                className={`tr task ${done ? "done" : ""}`}
                key={`${t.title}-${i}`}
                style={{ display: filter === "All projects" || t.project === filter ? "" : "none" }}
              >
                <div className="name">
                  <Checkbox checked={done} onCheckedChange={() => toggle(i)} aria-label="Toggle complete" />
                  <div>
                    <strong>{t.title}</strong>
                    <small>{t.project}</small>
                  </div>
                </div>
                <div>
                  <button type="button" onClick={() => cycle(i)}>
                    <Badge status={s.cls as OvTask["status"]} title="Click to change status">{s.label}</Badge>
                  </button>
                </div>
                <div className="due"><Icon name="calendar" />{t.due}</div>
                <div><UserAvatar ini={t.who} tone={t.tone} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <footer className="tasks-foot">
        <Button variant="link" className="add-task" onClick={() => setAdding(true)}>
          <Icon name="plus" />Add a task
        </Button>
        <span>{tasks.length} of 24 tasks</span>
      </footer>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Add a task</DialogTitle>
              <DialogDescription>It will be added to Website redesign.</DialogDescription>
            </DialogHeader>
            <Input autoFocus placeholder="Task name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              <Button type="submit">Add task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Feed() {
  return (
    <Card>
      <CardHeader>
        <div><CardTitle>The latest, together</CardTitle></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More"><Icon name="more" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => notify("Marked all as read")}>Mark all as read</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => notify("Demo link")}>Notification settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <ul className="feed">
        {FEED.map((f) => (
          <li key={f.target}>
            <UserAvatar ini={f.ini} tone={f.tone} />
            <div className="txt">
              <b>{f.who}</b> {f.text} <b>{f.target}</b>
              <small>{f.meta}</small>
            </div>
            <time>{f.time}</time>
          </li>
        ))}
      </ul>
      <a href="#" className="see-all" onClick={(e) => { e.preventDefault(); notify("Demo link"); }}>
        See all activity <Icon name="arrow-right" />
      </a>
    </Card>
  );
}

export function OverviewView() {
  const { setInviteOpen } = useUi();
  void setInviteOpen;
  const [greeting, setGreeting] = useState("Good morning");
  const [filterIdx, setFilterIdx] = useState(0);
  const options = useMemo(() => ["All projects", ...OV_PROJECTS.map((p) => p.name)], []);
  const filter = options[filterIdx];

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(`Good ${h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"}`);
  }, []);

  return (
    <main className="content" id="view-overview">
      <section className="page-head">
        <div>
          <div className="title-row"><h1>A little clarity. A lot of progress.</h1></div>
          <p className="sub">{greeting}, Jamie. Here’s where your team stands today.</p>
        </div>
        <Button size="lg" onClick={() => notify("New project – coming soon")}>
          <Icon name="plus" />New project
        </Button>
      </section>

      <Tabs defaultValue="team">
        <section className="tabs-row">
          <TabsList>
            <TabsTrigger value="team">Team overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <div className="filters">
            <Button variant="outline" className="!h-[38px]" onClick={() => setFilterIdx((i) => (i + 1) % options.length)}>
              <Icon name="filter" /><span>{filter}</span>
            </Button>
            <Button variant="outline" className="!h-[38px]">
              <Icon name="calendar" /><span>Nov 2 – 8, 2026</span>
            </Button>
          </div>
        </section>

        <TabsContent value="team">
          <Kpis />

          <section className="row row-a">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Project timeline</CardTitle>
                  <CardDescription>Small steps. Shared momentum.</CardDescription>
                </div>
                <Link href="/projects" className="link">View projects <Icon name="arrow-up-right" /></Link>
              </CardHeader>
              <Gantt filter={filter} />
              <footer className="gantt-foot">
                <span>Showing 3 of 6 active projects</span>
                <span className="legend"><i className="l-done" />Completed <i className="l-rem" />Remaining</span>
              </footer>
            </Card>
            <TeamMomentum />
          </section>

          <section className="row row-b">
            <TasksCard filter={filter} />
            <Feed />
          </section>
        </TabsContent>

        <TabsContent value="insights">
          <div className="card empty">
            <Icon name="reports" className="empty-icon" />
            <h3>Insights are on their way</h3>
            <p>Trends, velocity and workload breakdowns will show up here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
