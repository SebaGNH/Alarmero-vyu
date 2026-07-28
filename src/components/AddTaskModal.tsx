// R > src/components/AddTaskModal.tsx
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, IconButton, Chip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import dayjs, { Dayjs } from "dayjs";
import type { Task, RingtoneConfig } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  ringtone: RingtoneConfig;
  onChangeRingtone: () => void;
}

const QUICK_PRESETS = [1, 2, 3, 5, 15];

function defaultTriggerTime(): Dayjs {
  const now = dayjs();
  const extraMinute = now.second() >= 30 ? 1 : 0;
  return now.add(1 + extraMinute, "minute");
}

export default function AddTaskModal({ open, onClose, onSave, ringtone }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [time, setTime] = useState(defaultTriggerTime().format("HH:mm"));
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const def = defaultTriggerTime();
      setTitle("");
      setDescription("");
      setDate(def.format("YYYY-MM-DD"));
      setTime(def.format("HH:mm"));
      setSelectedPreset(null);
    }
  }, [open]);

  const handleQuickSet = (minutes: number) => {
    const now = dayjs();
    // Compensamos el truncado de segundos del input HH:mm, para que el tiempo
    // real hasta la alarma sea al menos "minutes" minutos completos.
    const extraMinute = now.second() >= 30 ? 1 : 0;
    const target = now.add(minutes + extraMinute, "minute");
    setDate(target.format("YYYY-MM-DD"));
    setTime(target.format("HH:mm"));
    setSelectedPreset(minutes);
    setTitle(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
  };

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
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    onSave(task);
    onClose();
  };

  const selectMinutesSegment = () => {
    const input = timeInputRef.current;
    if (input) {
      input.setSelectionRange(3, 5);
    }
  };

  const inputBgSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#3d3f42",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h6" component="span">
          Nueva alarma
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ flex: 1, justifyContent: "flex-end" }}>
          {QUICK_PRESETS.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes}m`}
              size="small"
              clickable
              color={selectedPreset === minutes ? "primary" : "default"}
              variant={selectedPreset === minutes ? "filled" : "outlined"}
              onClick={() => handleQuickSet(minutes)}
            />
          ))}
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSelectedPreset(null);
            }}
            fullWidth
            autoFocus
            sx={inputBgSx}
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={inputBgSx}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedPreset(null);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                ...inputBgSx,
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1) brightness(1.5)",
                  cursor: "pointer",
                },
              }}
            />
            <TextField
              label="Hora"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setSelectedPreset(null);
              }}
              onClick={selectMinutesSegment}
              onFocus={selectMinutesSegment}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={timeInputRef}
              sx={{
                ...inputBgSx,
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1) brightness(1.5)",
                  cursor: "pointer",
                },
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={!title.trim()} startIcon={<SaveIcon />}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
