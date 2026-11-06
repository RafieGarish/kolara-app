"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/icon";
import { mkc, type CalEvent } from "@/lib/stores/calendar";
import { useTeam } from "@/lib/stores/team";
import { useProjects } from "@/lib/stores/projects";
import { TYPE_LABEL, fromISO, longDate, toISO } from "./cal-utils";

export type DetailAction = "delete" | "complete" | "task" | "proj";

export function EventDetail({
  event,
  onClose,
  onAction,
}: {
  event: CalEvent | null;
  onClose: () => void;
  onAction: (act: DetailAction, e: CalEvent) => void;
}) {
  const members = useTeam((s) => s.members);
  const e = event;
  const people = (e?.people ?? []).slice(0, 6).map((n) => members.find((x) => x.name === n)).filter(Boolean);
  return (
    <Dialog open={!!e} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false}>
        {e && (
          <>
            <span className="m-type">
              {e.type === "deadline" && <Icon name="flag-solid" />}
              {e.type === "milestone" && <Icon name="dia-solid" />}
              {TYPE_LABEL[e.type]}
              {e.risk ? " · At risk" : ""}
              {e.recurring ? " · Repeats weekly" : ""}
            </span>
            <DialogTitle style={{ marginBottom: 14 }}>{e.title}</DialogTitle>
            <DialogDescription className="sr-only">Event details</DialogDescription>
            <div className="m-row">
              <span>When</span>
              <b>
                {longDate(e.date)}
                {e.time ? ` · ${e.time}${e.end ? " – " + e.end : ""}` : ""}
              </b>
            </div>
            {e.project && (
              <div className="m-row"><span>Project</span><b>{e.project}</b></div>
            )}
            {e.type === "deadline" && (
              <div className="m-row"><span>Owner</span><b>{e.owner}</b></div>
            )}
            {people.length > 0 && (
              <div className="m-row">
                <span>People</span>
                <div className="m-people">
                  {people.map((m) => (
                    <UserAvatar key={m!.ini} ini={m!.ini} tone={m!.tone} />
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions">
              {e.custom && (
                <Button variant="outline" className="border-[var(--danger-line)] text-[var(--red)]" onClick={() => onAction("delete", e)}>
                  Delete
                </Button>
              )}
              {e.type === "task" && (
                <>
                  <Button variant="outline" onClick={() => onAction("task", e)}>Open in My tasks</Button>
                  <Button onClick={() => onAction("complete", e)}>Mark complete</Button>
                </>
              )}
              {e.type === "deadline" && (
                <Button variant="outline" onClick={() => onAction("proj", e)}>View project tasks</Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EventForm({
  date,
  onClose,
  onCreate,
}: {
  date: Date | null;
  onClose: () => void;
  onCreate: (e: CalEvent) => void;
}) {
  return (
    <Dialog open={!!date} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false}>
        {date && <FormBody key={toISO(date)} date={date} onClose={onClose} onCreate={onCreate} />}
      </DialogContent>
    </Dialog>
  );
}

function FormBody({ date, onClose, onCreate }: { date: Date; onClose: () => void; onCreate: (e: CalEvent) => void }) {
  const projects = useProjects((s) => s.projects).filter((p) => !p.archived);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"meeting" | "milestone">("meeting");
  const [ds, setDs] = useState(toISO(date));
  const [time, setTime] = useState("10:00");
  const [proj, setProj] = useState("__studio");
  const [err, setErr] = useState(false);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!title.trim() || !ds) return setErr(true);
    const t = time || "10:00";
    const [hh, mm] = t.split(":").map(Number);
    const endMin = hh * 60 + mm + 60;
    const ne = mkc(type, title.trim(), fromISO(ds), {
      custom: true,
      project: proj === "__studio" ? "" : proj,
      people: ["Jamie Lee"],
    });
    if (type === "meeting") {
      ne.time = t;
      ne.end = `${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    }
    onCreate(ne);
  };

  return (
    <form onSubmit={submit} autoComplete="off" noValidate>
      <DialogTitle>New event</DialogTitle>
      <DialogDescription style={{ marginBottom: 20 }}>Add a meeting or milestone to the shared calendar.</DialogDescription>
      <label className="fld">
        <span>Title</span>
        <Input autoFocus placeholder="e.g. Sprint planning" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="fld-row">
        <div className="fld">
          <span>Type</span>
          <Select value={type} onValueChange={(v) => setType(v as "meeting" | "milestone")}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Team meeting</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="fld">
          <span>Date</span>
          <Input type="date" value={ds} onChange={(e) => setDs(e.target.value)} />
        </label>
      </div>
      <div className="fld-row">
        <label className="fld" style={{ display: type === "meeting" ? "" : "none" }}>
          <span>Start time</span>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <div className="fld">
          <span>Project</span>
          <Select value={proj} onValueChange={setProj}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__studio">Studio-wide</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {err && <p className="fld-err">Please add a title and a date.</p>}
      <div className="modal-actions">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Add event</Button>
      </div>
    </form>
  );
}
