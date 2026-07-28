import { Paper, Stack, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AlarmIcon from '@mui/icons-material/Alarm';
import type { Task } from '../types';

interface Props {
  task: Task;
  now: number;
  onSnooze: (id: string, minutes: number) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '¡Ahora!';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function TaskItem({ task, now, onSnooze, onStop, onDelete }: Props) {
  const remainingMs = new Date(task.triggerAt).getTime() - now;
  const isDone = task.stopped;
  const isRinging = task.isRinging && !task.stopped;

  return (
    <Paper
      elevation={isRinging ? 6 : 1}
      sx={{
        p: 2,
        borderRadius: 3,
        borderLeft: isRinging ? '5px solid #f44336' : '5px solid transparent',
        opacity: isDone ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              {task.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {new Date(task.triggerAt).toLocaleString()}
          </Typography>
        </Stack>

        <Stack alignItems="center" spacing={1}>
          <Chip
            icon={<AlarmIcon />}
            label={isDone ? 'Detenida' : formatRemaining(remainingMs)}
            color={isRinging ? 'error' : isDone ? 'default' : 'primary'}
            variant={isRinging ? 'filled' : 'outlined'}
          />
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Sumar 1 minuto">
              <span>
                <IconButton size="small" onClick={() => onSnooze(task.id, 1)} disabled={isDone}>
                  <AddAlarmIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.2 }}>
                    1
                  </Typography>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Sumar 10 minutos">
              <span>
                <IconButton size="small" onClick={() => onSnooze(task.id, 10)} disabled={isDone}>
                  <AddAlarmIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.2 }}>
                    10
                  </Typography>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Detener alarma">
              <span>
                <IconButton size="small" color="error" onClick={() => onStop(task.id)} disabled={isDone}>
                  <StopCircleIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => onDelete(task.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
