// R > src/components/TaskList.tsx
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
}

export default function TaskList({ tasks, now, onSnooze, onStop, onDelete, onEdit, onToggleComplete }: Props) {
  if (tasks.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
        No tenés recordatorios todavía. ¡Agregá el primero!
      </Typography>
    );
  }

  const alarms = tasks.filter((t) => t.type === "alarm").sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());

  const notes = tasks.filter((t) => t.type === "note").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const renderItem = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      now={now}
      onSnooze={onSnooze}
      onStop={onStop}
      onDelete={onDelete}
      onEdit={onEdit}
      onToggleComplete={onToggleComplete}
    />
  );

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {alarms.length > 0 && <Stack spacing={2}>{alarms.map(renderItem)}</Stack>}

      {alarms.length > 0 && notes.length > 0 && <Divider sx={{ my: 1 }} />}

      {notes.length > 0 && <Stack spacing={2}>{notes.map(renderItem)}</Stack>}
    </Stack>
  );
}
