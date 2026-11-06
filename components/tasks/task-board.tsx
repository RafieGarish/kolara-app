"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { PRIO_LABEL, PROJ_COLOR, type MyTask, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLS: [TaskStatus, string][] = [
  ["todo", "To do"],
  ["progress", "In progress"],
  ["review", "In review"],
  ["done", "Done"],
];

export function TaskBoard({ tasks, onDrop }: { tasks: MyTask[]; onDrop: (id: number, col: TaskStatus) => void }) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  return (
    <div id="tasksBoard" className="board">
      {COLS.map(([k, label]) => {
        const items = tasks.filter((t) => (k === "done" ? t.done : !t.done && t.status === k));
        return (
          <div
            key={k}
            className={cn("b-col", over === k && "drop")}
            data-col={k}
            onDragOver={(e) => { e.preventDefault(); setOver(k); }}
            onDrop={(e) => {
              e.preventDefault();
              const id = Number(e.dataTransfer.getData("text/plain"));
              setOver(null);
              if (id) onDrop(id, k);
            }}
          >
            <h5>{label}<span>{items.length}</span></h5>
            {items.map((t) => (
              <div
                key={t.id}
                className={cn("b-card", dragging === t.id && "dragging")}
                draggable
                data-id={t.id}
                onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(t.id)); setDragging(t.id); }}
                onDragEnd={() => { setDragging(null); setOver(null); }}
              >
                <strong>{t.title}</strong>
                <div className="b-foot">
                  <span className="proj"><i style={{ background: PROJ_COLOR[t.project] }} />{t.project.split(" ")[0]}</span>
                  <span className={`prio ${t.priority}`}><Icon name="flag" />{PRIO_LABEL[t.priority]}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
