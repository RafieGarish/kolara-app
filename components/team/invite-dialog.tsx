"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUi } from "@/lib/stores/ui";
import { ROLES, useTeam } from "@/lib/stores/team";
import { notify } from "@/lib/toast";

const INVITE_ROLES = ROLES.filter((r) => r !== "Workspace admin");

export function InviteDialog() {
  const open = useUi((s) => s.inviteOpen);
  const setOpen = useUi((s) => s.setInviteOpen);
  const setInvites = useTeam((s) => s.setInvites);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(INVITE_ROLES[0]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole(INVITE_ROLES[0]);
      setErr(false);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr(true);
      return;
    }
    setInvites((l) => [{ email: v, role, sent: "Just now" }, ...l]);
    setOpen(false);
    notify(`Invite sent to ${v}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={submit} noValidate autoComplete="off">
          <DialogHeader>
            <DialogTitle>Invite teammates</DialogTitle>
            <DialogDescription>Bring your team into the flow. They’ll get an email to join Studio workspace.</DialogDescription>
          </DialogHeader>
          <div className="fld">
            <Label className="mb-1.5 text-xs font-medium text-[var(--ink-2)]" htmlFor="inviteEmail">Email address</Label>
            <Input id="inviteEmail" type="email" placeholder="name@company.com" value={email} autoFocus
              onChange={(e) => { setEmail(e.target.value); setErr(false); }} />
          </div>
          <div className="fld">
            <Label className="mb-1.5 text-xs font-medium text-[var(--ink-2)]">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {err && <p className="fld-err">Please enter a valid email address.</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
