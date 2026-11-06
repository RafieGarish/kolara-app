"use client";

import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { dayDiff, dueLabel } from "@/lib/dates";
import { PRIO_LABEL, PROJ_COLOR, STATUS, type MyTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface RowActions {
  toggle: (t: MyTask) => void;
  status: (t: MyTask) => void;
  open: (t: MyTask) => void;
  priority: (t: MyTask) => void;
  remove: (t: MyTask) => void;
}

export function TaskRow({
  t, isDone, hidden, completing, flash, actions,
}: { t: MyTask; isDone: boolean; hidden?: boolean; completing?: boolean; flash?: boolean; actions: RowActions }) {
  const over = !isDone && dayDiff(t.due) < 0;
  const s = STATUS[t.status] || STATUS.done;
  const meta = t.sub ? `${t.sub[0]} / ${t.sub[1]} subtasks` : t.comments ? `${t.comments} comment${t.comments > 1 ? "s" : ""}` : "";
  return (
    <div
      className={cn("tl-row tl-item", hidden && "hidden-row", completing && "completing", flash && "row-in")}
      data-id={t.id}
      id={`task-${t.id}`}
    >
      <div className="c-name">
        <Checkbox checked={isDone || !!completing} onCheckedChange={() => actions.toggle(t)} aria-label={`${isDone ? "Reopen" : "Complete"} task`} />
        <div style={{ minWidth: 0 }}>
          <span className="t-title" onClick={() => actions.open(t)}>{t.title}</span>
          {meta && <span className="t-meta">{meta}</span>}
        </div>
      </div>
      <div className="proj"><i style={{ background: PROJ_COLOR[t.project] }} />{t.project}</div>
      <div>
        {isDone ? (
          <Badge status={s.cls as "done"}>{s.label}</Badge>
        ) : (
          <button type="button" className="pill-btn" onClick={() => actions.status(t)}>
            <Badge status={s.cls as "todo"} title="Click to change status">{s.label}</Badge>
          </button>
        )}
      </div>
      <div><span className={`prio ${t.priority}`}><Icon name="flag" />{PRIO_LABEL[t.priority]}</span></div>
      <div className={cn("due-c", over && "over")}><Icon name="calendar" />{dueLabel(t.due)}</div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="row-more" aria-label="More actions"><Icon name="more" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => actions.toggle(t)}>
              <span className="m-i"><Icon name="check-circle" />{t.done ? "Reopen task" : "Mark complete"}</span>
            </DropdownMenuItem>
            {!t.done && (
              <DropdownMenuItem onSelect={() => actions.priority(t)}>
                <span className="m-i"><Icon name="swap" />Change priority</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onSelect={() => actions.remove(t)}>
              <span className="m-i"><Icon name="trash" />Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
