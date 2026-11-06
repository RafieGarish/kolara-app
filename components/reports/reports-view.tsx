"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjects } from "@/lib/stores/projects";
import { useTeam } from "@/lib/stores/team";
import { MS_DAY, TODAY, shortDate } from "@/lib/dates";
import { notify } from "@/lib/toast";
import type { Project } from "@/lib/types";
import { ONTIME_OFFSET, PERIODS, P_LABEL, REP_COLS, sum, type PeriodKey } from "@/lib/data/reports";
import "./reports.css";

const pPct = (p: Project) => (p.total ? Math.round((p.done / p.total) * 100) : 0);

/** next frame x2 → true (drives the grow-in animations) */
function useGrow(dep: unknown) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    let b = 0;
    const a = requestAnimationFrame(() => { b = requestAnimationFrame(() => setOn(true)); });
    return () => { cancelAnimationFrame(a); cancelAnimationFrame(b); };
  }, [dep]);
  return on;
}

function Filter({ icon, label, set, options, value, onPick }: {
  icon: string; label: string; set?: boolean; options: [string, string][]; value: string; onPick: (v: string) => void;
}) {
  return (
    <div className="dd">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`dd-btn ${set ? "set" : ""}`}>
            <Icon name={icon} /><span className="dd-label">{label}</span><Icon name="chevron-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map(([k, l]) => (
            <DropdownMenuItem key={k} data-selected={value === k} onSelect={() => onPick(k)}>
              {l}{value === k && <Icon name="check" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ReportsView() {
  const projects = useProjects((s) => s.projects);
  const members = useTeam((s) => s.members);
  const [tab, setTab] = useState("overview");
  const [project, setProject] = useState("all");
  const [period, setPeriod] = useState<PeriodKey>("this");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "due", dir: 1 });

  const pd = PERIODS[period];
  const pool = useMemo(() => projects.filter((p) => !p.archived), [projects]);
  const proj = pool.some((p) => p.name === project) ? project : "all";
  const ps = useMemo(() => pool.filter((p) => proj === "all" || p.name === proj), [pool, proj]);
  const completed = (p: Project) => sum(pd.matrix[p.name] || []);

  const daily = useMemo(() => {
    const out = Array(7).fill(0) as number[];
    ps.forEach((p) => (pd.matrix[p.name] || []).forEach((v, i) => (out[i] += v)));
    return out;
  }, [ps, pd]);
  const ot = useMemo(
    () => (proj === "all" ? pd.ontime : pd.ontime.map((v) => Math.min(100, v + (ONTIME_OFFSET[proj] || 0)))),
    [proj, pd],
  );

  const total = sum(daily);
  const online = members.filter((m) => !m.away);
  const cap = online.length ? Math.round(online.reduce((n, m) => n + m.pct, 0) / online.length) : 0;
  const onCount = ps.filter((p) => p.status === "on").length;
  const risk = ps.length - onCount;
  const scope = proj === "all" ? `All ${ps.length} active projects` : proj;

  const up = (t: string) => <b><Icon name="arrow-trend" />{t}</b>;
  const kpis = [
    { label: "Tasks completed", icon: "check-circle", v: String(total), foot: <>{up(pd.tasksDelta)}<span className="muted">{pd.tasksVs}</span></> },
    { label: "On-time delivery", icon: "timer", v: ot[ot.length - 1] + "%", foot: <>{up(pd.ontimeDelta)}<span className="muted">{pd.ontimeVs}</span></> },
    {
      label: "Team capacity", icon: "users", v: cap + "%",
      foot: <><b>{cap <= 85 ? "Healthy" : <span className="amber">Running hot</span>}</b><span className="muted">{online.length} of {members.length} members active</span></>,
    },
    { label: "Active projects", icon: "folder-open", v: String(ps.length), foot: <><b>{onCount} on track</b><span className="muted">· {risk} at risk</span></> },
  ];

  const rows = useMemo(() => {
    const list = ps.map((p) => ({ p, completed: completed(p) }));
    const val: Record<string, (r: (typeof list)[number]) => string | number> = {
      name: (r) => r.p.name, owner: (r) => r.p.owner, completed: (r) => r.completed,
      progress: (r) => pPct(r.p), status: (r) => r.p.status, due: (r) => +r.p.due,
    };
    const f = val[sort.key];
    return list.sort((a, b) => {
      const x = f(a), y = f(b);
      const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
      return c * sort.dir || pool.indexOf(a.p) - pool.indexOf(b.p);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ps, pd, sort, pool]);

  const rowsTotal = sum(rows.map((r) => r.completed));
  const rowsOn = rows.filter((r) => r.p.status === "on").length;
  const updated = `Updated just now · ${proj === "all" ? "All projects included" : proj + " only"}`;

  const exportReport = () => {
    const data: (string | number)[][] = [["Project", "Owner", `Completed (${pd.label})`, "Tasks done", "Tasks total", "Lifetime progress %", "Status", "Due date"]];
    ps.forEach((p) => data.push([p.name, p.owner, completed(p), p.done, p.total, pPct(p), P_LABEL[p.status], shortDate(p.due)]));
    const csv = data.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `kolara-report-${period === "this" ? "2026-11-02" : "2026-10-26"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify("Report exported as CSV");
  };

  return (
    <main className="content" id="view-reports">
      <section className="page-head tasks-head">
        <div>
          <h1>Reports</h1>
          <p className="sub">A clearer picture of progress. See what’s moving your team forward.</p>
        </div>
        <div className="head-right">
          <Button size="lg" onClick={exportReport}><Icon name="download" />Export report</Button>
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <section className="tabs-row rep-tabs-row">
          <TabsList>
            <TabsTrigger value="overview">Performance overview</TabsTrigger>
            <TabsTrigger value="insights">Project insights</TabsTrigger>
          </TabsList>
          <div className="filters">
            <Filter
              icon="filter" label={proj === "all" ? "All projects" : proj} set={proj !== "all"} value={proj}
              options={[["all", "All projects"], ...pool.map((p) => [p.name, p.name] as [string, string])]}
              onPick={setProject}
            />
            <Filter
              icon="calendar" label={pd.label} value={period}
              options={(Object.entries(PERIODS) as [PeriodKey, (typeof PERIODS)[PeriodKey]][]).map(([k, p]) => [k, `${p.name} · ${p.label}`])}
              onPick={(v) => setPeriod(v as PeriodKey)}
            />
          </div>
        </section>
      </Tabs>

      <section className="kpis kpis-rep">
        {kpis.map((c) => (
          <article className="kpi" key={c.label}>
            <div className="kpi-top"><span>{c.label}</span><span><Icon name={c.icon} /></span></div>
            <div className="kpi-mid"><span className="kpi-value">{c.v}</span></div>
            <div className="kpi-foot">{c.foot}</div>
          </article>
        ))}
      </section>

      {tab === "overview" ? (
        <div>
          <section className="rep-charts">
            <Card className="rep-card">
              <header className="rep-head">
                <div>
                  <h3>Task completion</h3>
                  <p>{total} task{total === 1 ? "" : "s"} completed during {pd.label}</p>
                </div>
                <span className="rep-legend"><i />Completed tasks</span>
              </header>
              <BarChart vals={daily} days={pd.days} />
              <p className="rep-foot">Daily completions · {scope}</p>
            </Card>
            <Card className="rep-card">
              <header className="rep-head">
                <div>
                  <h3>On-time delivery</h3>
                  <p>A steadier pace, week over week.</p>
                </div>
                <span className="rep-legend"><i />On time</span>
              </header>
              <LineChart vals={ot} weeks={pd.weeks} />
              <p className="rep-foot">Weekly rate · {pd.weekNote}</p>
            </Card>
          </section>

          <Card className="rep-table-card">
            <header className="rep-table-head">
              <div>
                <h3>Project performance</h3>
                <p>{pd.name}’s completions, alongside each project’s lifetime progress.</p>
              </div>
              <span className="rep-summary">
                {rows.length} active project{rows.length === 1 ? "" : "s"} · {rowsOn} on track · {rows.length - rowsOn} at risk
              </span>
            </header>
            <PerfTable
              rows={rows} sort={sort} short={pd.short} periodKey={period + proj}
              onSort={(k) => setSort((s) => (s.key === k ? { key: k, dir: (-s.dir) as 1 | -1 } : { key: k, dir: ["completed", "progress"].includes(k) ? -1 : 1 }))}
            />
            <footer className="tl-foot">
              <span>{rows.length === pool.length ? `Showing all ${rows.length} active projects` : `Showing ${rows.length} of ${pool.length} active projects`}</span>
              <span className="rep-total">{rowsTotal} task{rowsTotal === 1 ? "" : "s"} completed {pd.short}</span>
            </footer>
          </Card>
        </div>
      ) : (
        <div>
          <div className="ins-grid">
            {ps.length ? ps.map((p, i) => {
              const pace = completed(p);
              const remaining = p.total - p.done;
              const weeks = pace ? remaining / pace : Infinity;
              const finish = pace ? new Date(TODAY.getTime() + Math.ceil(weeks * 7) * MS_DAY) : null;
              const wk = pace ? Math.ceil(weeks) : null;
              const behind = p.status === "risk" || !pace;
              const note = !pace
                ? `No tasks completed ${pd.short} — a good moment to check in on blockers.`
                : `About ${wk} more week${wk === 1 ? "" : "s"} of work at ${pd.short}’s pace.${p.status === "risk" ? " Worth a gentle check-in with the team." : " Steady and on course."}`;
              return (
                <article className="ins-card" key={p.id} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="ins-top">
                    <strong><i style={{ background: p.color }} />{p.name}</strong>
                    <span className={`status ${p.status}`}><i />{P_LABEL[p.status]}</span>
                  </div>
                  <div className="ins-stats">
                    <div><small>Progress</small><b>{pPct(p)}%</b></div>
                    <div><small>Remaining</small><b>{remaining}</b></div>
                    <div><small>Pace / wk</small><b>{pace}</b></div>
                  </div>
                  <div className="ins-line"><span>Projected finish (at this pace)</span><b>{finish ? shortDate(finish) : "—"}</b></div>
                  <div className="ins-line"><span>Due date</span><b>{shortDate(p.due)}</b></div>
                  <div className={`ins-note ${behind ? "warn" : "ok"}`}>{note}</div>
                </article>
              );
            }) : (
              <div className="p-empty" style={{ gridColumn: "1/-1" }}><h3>No projects to show</h3></div>
            )}
          </div>
        </div>
      )}

      <div className="p-meta">
        <span className="saved" style={{ margin: 0 }}><i className="online" /><span>{updated}</span></span>
        <span>Lifetime progress includes tasks completed before this reporting period.</span>
      </div>
    </main>
  );
}

function BarChart({ vals, days }: { vals: number[]; days: string[] }) {
  const m = Math.max(...vals);
  const axisMax = m <= 4 ? 4 : m <= 10 ? 10 : Math.ceil(m / 10) * 10;
  const grown = useGrow(vals.join());
  return (
    <div className="bc">
      <div className="bc-y"><span>{axisMax}</span><span>{axisMax / 2}</span><span>0</span></div>
      <div className="bc-plot">
        <div className="bc-grid"><i /><i /><i /></div>
        <div className="bc-cols">
          {vals.map((v, i) => (
            <div className="bc-col" key={i}>
              <div className={`bc-bar ${i > 4 ? "wk" : ""}`} style={{ height: grown ? `${(v / axisMax) * 100}%` : undefined }} title={`${days[i]}: ${v} task${v === 1 ? "" : "s"}`}>
                <span>{v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bc-x">{days.map((d) => <span key={d}>{d}</span>)}</div>
    </div>
  );
}

function LineChart({ vals, weeks }: { vals: number[]; weeks: string[] }) {
  const W = 520, H = 236, L = 46, Rr = 500, T = 26, B = 190;
  const lo = Math.min(70, Math.floor((Math.min(...vals) - 1) / 10) * 10);
  const hi = 100;
  const y = (v: number) => B - ((v - lo) / (hi - lo)) * (B - T);
  const x = (i: number) => L + (i * (Rr - L)) / (vals.length - 1);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 10) ticks.push(t);
  const pts = vals.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L${x(vals.length - 1)} ${B} L${x(0)} ${B} Z`;
  const go = useGrow(vals.join());
  return (
    <div className="lc">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="On-time delivery by week">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={Rr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={L - 10} y={y(t) + 4} textAnchor="end">{t}%</text>
          </g>
        ))}
        <path className={`ar ${go ? "go" : ""}`} d={area} fill="var(--green-bg)" />
        <path className={`ln ${go ? "go" : ""}`} pathLength={1} d={line} fill="none" stroke="var(--green)" strokeWidth="1.6" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle className="pt" cx={p[0]} cy={p[1]} r="3.2" fill="var(--surface)" stroke="var(--green)" strokeWidth="1.6">
              <title>{weeks[i]}: {vals[i]}%</title>
            </circle>
            <text className="v" x={p[0]} y={p[1] - 11} textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"} dx={i === 0 ? -6 : i === pts.length - 1 ? 8 : 0}>
              {vals[i]}%
            </text>
          </g>
        ))}
        {weeks.map((w, i) => <text key={w} x={x(i)} y={B + 26} textAnchor="middle">{w}</text>)}
      </svg>
    </div>
  );
}

function PerfTable({ rows, sort, short, periodKey, onSort }: {
  rows: { p: Project; completed: number }[];
  sort: { key: string; dir: 1 | -1 };
  short: string;
  periodKey: string;
  onSort: (k: string) => void;
}) {
  const grown = useGrow(periodKey);
  return (
    <div>
      <div className="rp-row rp-head">
        {REP_COLS.map(([k, l]) => (
          <span key={k}>
            <button type="button" className={sort.key === k ? "sorted" : ""} onClick={() => onSort(k)}>
              {l.replace("THIS WEEK", short.toUpperCase())}
              {sort.key === k && <span className="arr">{sort.dir === 1 ? "▲" : "▼"}</span>}
            </button>
          </span>
        ))}
      </div>
      {rows.length ? rows.map(({ p, completed }, i) => (
        <div className="rp-row rp-item" key={p.id} style={{ animationDelay: `${i * 25}ms` }}>
          <div className="nm"><i style={{ background: p.color }} />{p.name}</div>
          <div>{p.owner}</div>
          <div className="cnt">{completed}</div>
          <div className="rp-prog">
            <Progress className={p.status === "risk" ? "risk" : ""} value={grown ? pPct(p) : 0} />
            {p.done}/{p.total} tasks · {pPct(p)}%
          </div>
          <div><span className={`status ${p.status}`}><i />{P_LABEL[p.status]}</span></div>
          <div>{shortDate(p.due)}</div>
        </div>
      )) : <div className="t-empty">No projects to report on.</div>}
    </div>
  );
}
