// R > src/components/TaskList.tsx
import { useState } from "react";
import { Stack, Typography, Divider } from "@mui/material";
import type { Task } from "../types";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  now: number;
  onSnooze: (id: string, minutes: number) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onReorderNotes: (draggedId: string, targetId: string) => void;
}

export default function TaskList({ tasks, now, onSnooze, onStop, onDelete, onEdit, onToggleComplete, onReorderNotes }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
        No tenés recordatorios todavía. ¡Agregá el primero!
      </Typography>
    );
  }

  const alarms = tasks.filter((t) => t.type === "alarm").sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());

  const recurring = tasks
    .filter((t) => t.type === "recurring")
    .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());

  const notes = tasks
    .filter((t) => t.type === "note")
    .sort((a, b) => (a.order ?? new Date(a.createdAt).getTime()) - (b.order ?? new Date(b.createdAt).getTime()));

  const renderItem = (task: Task) => {
    const isNote = task.type === "note";
    return (
      <TaskItem
        key={task.id}
        task={task}
        now={now}
        onSnooze={onSnooze}
        onStop={onStop}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggleComplete={onToggleComplete}
        draggable={isNote}
        isDragging={draggedId === task.id}
        onDragStart={isNote ? () => setDraggedId(task.id) : undefined}
        onDragOver={isNote ? (e: React.DragEvent) => e.preventDefault() : undefined}
        onDrop={
          isNote
            ? (e: React.DragEvent) => {
                e.preventDefault();
                if (draggedId) onReorderNotes(draggedId, task.id);
                setDraggedId(null);
              }
            : undefined
        }
        onDragEnd={isNote ? () => setDraggedId(null) : undefined}
      />
    );
  };

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {alarms.length > 0 && <Stack spacing={2}>{alarms.map(renderItem)}</Stack>}

      {alarms.length > 0 && recurring.length > 0 && <Divider sx={{ my: 1 }} />}

      {recurring.length > 0 && <Stack spacing={2}>{recurring.map(renderItem)}</Stack>}

      {(alarms.length > 0 || recurring.length > 0) && notes.length > 0 && <Divider sx={{ my: 1 }} />}

      {notes.length > 0 && <Stack spacing={2}>{notes.map(renderItem)}</Stack>}
    </Stack>
  );
}
