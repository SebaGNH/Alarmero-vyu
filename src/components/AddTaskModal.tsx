import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloseIcon from '@mui/icons-material/Close';
import dayjs, { Dayjs } from 'dayjs';
import type { Task, RingtoneConfig } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  ringtone: RingtoneConfig;
  onChangeRingtone: () => void;
}

function defaultTriggerTime(): Dayjs {
  return dayjs().add(10, 'minute');
}

export default function AddTaskModal({ open, onClose, onSave, ringtone, onChangeRingtone }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState(defaultTriggerTime().format('HH:mm'));

  useEffect(() => {
    if (open) {
      const def = defaultTriggerTime();
      setTitle('');
      setDescription('');
      setDate(def.format('YYYY-MM-DD'));
      setTime(def.format('HH:mm'));
    }
  }, [open]);

  const handleSave = () => {
    if (!title.trim()) return;
    const triggerAt = dayjs(`${date}T${time}`).toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      triggerAt,
      ringtonePath: ringtone.path,
      stopped: false,
      isRinging: false,
      createdAt: new Date().toISOString(),
    };
    onSave(task);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Nueva alarma
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onChangeRingtone} color="primary">
              <MusicNoteIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Tono: {ringtone.name}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
          Guardar
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
