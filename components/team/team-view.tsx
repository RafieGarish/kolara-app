"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { useUi } from "@/lib/stores/ui";
import { ROLES, useTeam } from "@/lib/stores/team";
import { useProjects } from "@/lib/stores/projects";
import type { Member } from "@/lib/types";
import "./team.css";

type Tab = "members" | "workload" | "invites";
type Sort = "joined" | "name" | "workload";
const SORT_LABEL: Record<Sort, string> = { joined: "Joined date", name: "Name", workload: "Workload" };
const AVAIL_LABEL = { all: "All availability", online: "Online", away: "Away" } as const;

function Wl({ m, big }: { m: Member; big?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className={cn("wl", !m.pct && "zero", big && "big")}>
      <div className="wl-top">
        <span>{m.tasks ? `${m.tasks} tasks this week` : "No work assigned"}</span>
        <b>{m.pct}%</b>
      </div>
      <Progress value={on ? m.pct : 0} />
    </div>
  );
}

function Name({ m }: { m: Member }) {
  return <strong>{m.name}{m.me && <em>You</em>}</strong>;
}

function Filter<T extends string>({
  icon, label, value, options, onPick, set, right,
}: {
  icon: string; label: string; value: T; options: [T, string][]; onPick: (v: T) => void; set?: boolean; right?: boolean;
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
          <DropdownMenuItem key={v} data-selected={v === value} onSelect={() => onPick(v)}>
            {l}{v === value && <Icon name="check" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TeamView() {
  const router = useRouter();
  const setInviteOpen = useUi((s) => s.setInviteOpen);
  const { members, invites, setMembers, setInvites } = useTeam();
  const projects = useProjects((s) => s.projects);

  const [tab, setTab] = useState<Tab>("members");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [avail, setAvail] = useState<"all" | "online" | "away">("all");
  const [sort, setSort] = useState<Sort>("joined");
  const [removing, setRemoving] = useState<Member | null>(null);

  const projColor = (n: string) => projects.find((p) => p.name === n)?.color || "#7D858D";
  const roles = useMemo(() => [...new Set(members.map((m) => m.role))], [members]);

  const online = members.filter((m) => !m.away);
  const away = members.length - online.length;
  const cap = online.length ? Math.round(online.reduce((n, m) => n + m.pct, 0) / online.length) : 0;
  const act = projects.filter((p) => !p.archived).length;
  const healthy = cap <= 85;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const idx = (m: Member) => members.indexOf(m);
    const cmp = {
      joined: (a: Member, b: Member) => idx(a) - idx(b),
      name: (a: Member, b: Member) => a.name.localeCompare(b.name),
      workload: (a: Member, b: Member) => b.pct - a.pct || idx(a) - idx(b),
    }[sort];
    return members
      .filter((m) => (role === "all" || m.role === role) && (avail === "all" || (avail === "away") === !!m.away) &&
        (!s || m.name.toLowerCase().includes(s) || m.email.includes(s)))
      .sort(cmp);
  }, [members, q, role, avail, sort]);

  const patch = (ini: string, p: Partial<Member>) => setMembers((l) => l.map((m) => (m.ini === ini ? { ...m, ...p } : m)));

  const onAction = (a: string, m: Member) => {
    if (a === "avail") {
      patch(m.ini, m.away ? { away: null, tasks: 5, pct: 60 } : { away: "Back soon", tasks: 0, pct: 0 });
    } else if (a === "role") {
      const next = ROLES[(ROLES.indexOf(m.role) + 1) % ROLES.length];
      patch(m.ini, { role: next });
      notify(`${m.name} is now ${next}`);
    } else if (a === "projects") router.push("/projects");
    else if (a === "del") setRemoving(m);
  };

  const cards = [
    { label: "Team members", icon: "users", v: members.length, note: <span className="kpi-note">One shared workspace</span> },
    { label: "Active members", icon: "check-circle", v: online.length, note: <span className="kpi-note">{away} teammate{away === 1 ? "" : "s"} away</span> },
    { label: "Team capacity", icon: "trend", v: cap + "%", note: <span className={cn("kpi-note", healthy ? "green" : "amber")}>{healthy ? "Healthy workload" : "Running hot"}</span> },
    { label: "Active projects", icon: "folder", v: act, note: <span className="kpi-note">Moving forward, together</span> },
  ];

  const tag = (m: Member): [string, string] =>
    m.away ? ["none", "Away"] : m.pct >= 85 ? ["busy", "Busy"] : m.pct >= 65 ? ["bal", "Balanced"] : ["light", "Light"];

  const showing =
    tab === "members"
      ? list.length === members.length ? `Showing all ${list.length} members` : `Showing ${list.length} of ${members.length} members`
      : tab === "workload" ? "Balanced = 65–84% · Busy = 85% and above"
      : `${invites.length} pending invitation${invites.length === 1 ? "" : "s"}`;

  return (
    <main className="content" id="view-team">
      <section className="page-head tasks-head">
        <div>
          <h1>Team</h1>
          <p className="sub">Good people. Shared momentum. A little clarity for everyone.</p>
        </div>
        <div className="head-right">
          <span className="today-date">Monday, November 2</span>
          <Button size="lg" onClick={() => setInviteOpen(true)}><Icon name="plus" />Invite teammates</Button>
        </div>
      </section>

      <section className="kpis kpis-plain">
        {cards.map((c) => (
          <article className="kpi" key={c.label}>
            <div className="kpi-top"><span>{c.label}</span><span><Icon name={c.icon} /></span></div>
            <div className="kpi-mid"><span className="kpi-value">{c.v}</span>{c.note}</div>
          </article>
        ))}
      </section>

      <div className="t-tabs-row p-tabs-row">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="members">All members <span className="badge">{members.length}</span></TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="invites">Invitations <span className="badge">{invites.length || ""}</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="week-range"><Icon name="calendar" />This week · Nov 2 – 8, 2026</span>
      </div>

      {tab === "members" && (
        <div className="p-toolbar">
          <div className="p-left">
            <label className="p-search" style={{ width: 232 }}>
              <Icon name="search" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…"
                className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
            </label>
            <Filter icon="users" label={role === "all" ? "All roles" : role} value={role} set={role !== "all"}
              options={[["all", "All roles"], ...roles.map((r) => [r, r] as [string, string])]} onPick={setRole} />
            <Filter icon="filter" label={AVAIL_LABEL[avail]} value={avail} set={avail !== "all"}
              options={[["all", "All availability"], ["online", "Online"], ["away", "Away"]]} onPick={setAvail} />
          </div>
          <Filter icon="sort" label={`Sort: ${SORT_LABEL[sort]}`} value={sort} right
            options={(Object.keys(SORT_LABEL) as Sort[]).map((k) => [k, SORT_LABEL[k]] as [Sort, string])} onPick={setSort} />
        </div>
      )}

      <Card className="tm-card">
        <div>
          {tab === "members" && (list.length ? (
            <>
              <div className="tm-row tm-head"><span>MEMBER</span><span>ROLE</span><span>PROJECTS</span><span>AVAILABILITY</span><span>WEEKLY WORKLOAD</span><span></span></div>
              {list.map((m, i) => (
                <div className="tm-row tm-item" key={m.ini} style={{ animationDelay: `${i * 25}ms` }}>
                  <div className="tm-mem">
                    <UserAvatar ini={m.ini} tone={m.tone} />
                    <div style={{ minWidth: 0 }}><Name m={m} /><small>{m.email}</small></div>
                  </div>
                  <div>{m.role}</div>
                  <div className="tm-proj"><i style={{ background: projColor(m.proj) }} />{m.proj}{m.more ? <span className="chip">+{m.more}</span> : null}</div>
                  <div className={cn("avail", !m.away && "on")}>
                    <span className="st"><i />{m.away ? "Away" : "Online"}</span>{m.away && <small>{m.away}</small>}
                  </div>
                  <Wl m={m} />
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="row-more" aria-label="More actions"><Icon name="more" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onAction("avail", m)}><span className="m-i"><Icon name="swap" />Mark as {m.away ? "online" : "away"}</span></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onAction("role", m)}><span className="m-i"><Icon name="users" />Change role</span></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onAction("projects", m)}><span className="m-i"><Icon name="tasks" />View projects</span></DropdownMenuItem>
                        {!m.me && <DropdownMenuItem variant="destructive" onSelect={() => onAction("del", m)}><span className="m-i"><Icon name="trash" />Remove from workspace</span></DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </>
          ) : <div className="tm-empty"><h3>No teammates found</h3>Try a different search or clear a filter.</div>)}

          {tab === "workload" && (
            <>
              <div className="tm-row tm-wl tm-head"><span>MEMBER</span><span>THIS WEEK</span><span>STATUS</span></div>
              {[...members].sort((a, b) => b.pct - a.pct).map((m, i) => {
                const [c, l] = tag(m);
                return (
                  <div className="tm-row tm-wl tm-item" key={m.ini} style={{ animationDelay: `${i * 25}ms` }}>
                    <div className="tm-mem"><UserAvatar ini={m.ini} tone={m.tone} /><div><Name m={m} /><small>{m.role}</small></div></div>
                    <Wl m={m} big />
                    <div><span className={cn("wl-tag", c)}>{l}</span></div>
                  </div>
                );
              })}
            </>
          )}

          {tab === "invites" && (invites.length ? (
            <>
              <div className="tm-row tm-inv tm-head"><span>EMAIL</span><span>ROLE</span><span>STATUS</span><span></span></div>
              {invites.map((v, i) => (
                <div className="tm-row tm-inv tm-item" key={v.email + i}>
                  <div className="tm-mem">
                    <span className="avatar" style={{ background: "var(--chip)", color: "var(--ink-3)" }}><Icon name="users" size={16} /></span>
                    <div><strong>{v.email}</strong><small>Sent {v.sent}</small></div>
                  </div>
                  <div>{v.role}</div>
                  <div><span className="pend"><i />Pending</span></div>
                  <div className="inv-actions">
                    <Button variant="outline" onClick={() => notify(`Invite re-sent to ${v.email}`)}>Resend</Button>
                    <Button variant="outline" onClick={() => { setInvites((l) => l.filter((_, k) => k !== i)); notify(`Invitation to ${v.email} revoked`); }}>Revoke</Button>
                  </div>
                </div>
              ))}
            </>
          ) : <div className="tm-empty"><h3>No pending invitations</h3>Invite a teammate to bring them into the flow.</div>)}
        </div>
        <footer className="tl-foot">
          <span>{showing}</span>
          <Button variant="link" className="add-task" onClick={() => setInviteOpen(true)}><Icon name="plus" />Invite a teammate</Button>
        </footer>
      </Card>

      <div className="p-meta">
        <span className="saved" style={{ margin: 0 }}><i className="online" />All changes saved · Updated just now</span>
        <span>Workload is based on assigned tasks for {online.length} active members</span>
      </div>

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>They will lose access to the workspace.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (removing) { setMembers((l) => l.filter((m) => m.ini !== removing.ini)); notify(`${removing.name} removed`); }
              setRemoving(null);
            }}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
