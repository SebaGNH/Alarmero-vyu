// R > src/components/AddTaskModal.tsx
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  Chip,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import dayjs, { Dayjs } from "dayjs";
import type { Task, TaskType } from "../types";
import { DEFAULT_RINGTONE_PATH } from "../constants";
import { computeNextRecurringTrigger, DAYS_OF_WEEK } from "../utils/recurrence";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onUpdate: (task: Task) => void;
  editingTask?: Task | null;
}

const QUICK_PRESETS = [1, 2, 3, 5, 15];

function defaultTriggerTime(): Dayjs {
  const now = dayjs();
  const extraMinute = now.second() >= 30 ? 1 : 0;
  return now.add(1 + extraMinute, "minute");
}

export default function AddTaskModal({ open, onClose, onSave, onUpdate, editingTask }: Props) {
  const [type, setType] = useState<TaskType>("alarm");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [time, setTime] = useState(defaultTriggerTime().format("HH:mm"));
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editingTask);
  const isNote = type === "note";
  const isRecurring = type === "recurring";

  useEffect(() => {
    if (!open) return;

    if (editingTask) {
      const trigger = dayjs(editingTask.triggerAt);
      setType(editingTask.type);
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDate(trigger.format("YYYY-MM-DD"));
      setTime(editingTask.type === "recurring" ? editingTask.time || trigger.format("HH:mm") : trigger.format("HH:mm"));
      setSelectedPreset(null);
      setSelectedDays(editingTask.daysOfWeek || []);
    } else {
      const def = defaultTriggerTime();
      setType("alarm");
      setTitle("");
      setDescription("");
      setDate(def.format("YYYY-MM-DD"));
      setTime(def.format("HH:mm"));
      setSelectedPreset(null);
      setSelectedDays([]);
    }
  }, [open, editingTask]);

  const handleQuickSet = (minutes: number) => {
    const now = dayjs();
    const extraMinute = now.second() >= 30 ? 1 : 0;
    const target = now.add(minutes + extraMinute, "minute");
    setDate(target.format("YYYY-MM-DD"));
    setTime(target.format("HH:mm"));
    setSelectedPreset(minutes);
    setTitle(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
  };

  const handleTypeChange = (_: unknown, newType: TaskType | null) => {
    if (newType) {
      setType(newType);
      setSelectedPreset(null);
    }
  };

  const toggleDay = (value: number) => {
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const toggleAllDays = () => {
    setSelectedDays((prev) => (prev.length === 7 ? [] : DAYS_OF_WEEK.map((d) => d.value)));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (isRecurring && selectedDays.length === 0) return;

    let triggerAt: string;
    if (isNote) {
      triggerAt = new Date().toISOString();
    } else if (isRecurring) {
      triggerAt = computeNextRecurringTrigger(selectedDays, time, dayjs());
    } else {
      triggerAt = dayjs(`${date}T${time}`).toISOString();
    }

    if (isEditing && editingTask) {
      const updated: Task = {
        ...editingTask,
        type,
        title: title.trim(),
        description: description.trim(),
        triggerAt,
        daysOfWeek: isRecurring ? selectedDays : undefined,
        time: isRecurring ? time : undefined,
      };
      onUpdate(updated);
    } else {
      const task: Task = {
        id: crypto.randomUUID(),
        type,
        title: title.trim(),
        description: description.trim(),
        triggerAt,
        ringtonePath: DEFAULT_RINGTONE_PATH,
        stopped: false,
        isRinging: false,
        hidden: false,
        completed: false,
        createdAt: new Date().toISOString(),
        daysOfWeek: isRecurring ? selectedDays : undefined,
        time: isRecurring ? time : undefined,
      };
      onSave(task);
    }
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

  const saveDisabled = !title.trim() || (isRecurring && selectedDays.length === 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} size="small">
          <ToggleButton value="alarm">Alarma</ToggleButton>
          <ToggleButton value="recurring">Repetibles</ToggleButton>
          <ToggleButton value="note">Tareas</ToggleButton>
        </ToggleButtonGroup>

        {type === "alarm" && (
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
        )}

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

          {!isNote && (
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {isRecurring ? (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Días de repetición
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
                    {DAYS_OF_WEEK.map((d, idx) => (
                      <Chip
                        key={`${d.value}-${idx}`}
                        label={d.label}
                        clickable
                        color={selectedDays.includes(d.value) ? "primary" : "default"}
                        variant={selectedDays.includes(d.value) ? "filled" : "outlined"}
                        onClick={() => toggleDay(d.value)}
                        sx={{ minWidth: 40, fontWeight: 600 }}
                      />
                    ))}
                    <Chip
                      label="Todos"
                      clickable
                      color={selectedDays.length === 7 ? "primary" : "default"}
                      variant={selectedDays.length === 7 ? "filled" : "outlined"}
                      onClick={toggleAllDays}
                    />
                  </Stack>
                </Box>
              ) : (
                <TextField
                  label="Fecha"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedPreset(null);
                  }}
                  sx={{
                    ...inputBgSx,
                    flex: 1,
                    minWidth: 0,
                    "& input::-webkit-calendar-picker-indicator": {
                      filter: "invert(1) brightness(1.5)",
                      cursor: "pointer",
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}

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
                sx={{
                  ...inputBgSx,
                  flex: isRecurring ? "0 0 160px" : 1,
                  minWidth: 0,
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1) brightness(1.5)",
                    cursor: "pointer",
                  },
                }}
                InputLabelProps={{ shrink: true }}
                inputRef={timeInputRef}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={saveDisabled} startIcon={<SaveIcon />}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
