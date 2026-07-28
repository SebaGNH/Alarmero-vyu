import { Stack, Typography } from '@mui/material';
import type { Task } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  now: number;
  onSnooze: (id: string, minutes: number) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, now, onSnooze, onStop, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
        No tenés recordatorios todavía. ¡Agregá el primero!
      </Typography>
    );
  }

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime()
  );

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {sorted.map((task) => (
        <TaskItem key={task.id} task={task} now={now} onSnooze={onSnooze} onStop={onStop} onDelete={onDelete} />
      ))}
    </Stack>
  );
}
