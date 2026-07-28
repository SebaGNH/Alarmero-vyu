// R > App.tsx
import { useState } from "react";
import { Container, Box, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { useTasks } from "./hooks/useTasks";
import { useAlarmTitle } from "./hooks/useDocumentTitle";
import AddTaskModal from "./components/AddTaskModal";
import RingtoneModal from "./components/RingtoneModal";
import TaskList from "./components/TaskList";

export default function App() {
  const { visibleTasks, now, ringtone, setRingtone, addTask, removeTask, stopTask, snoozeTask, hideTask } = useTasks();
  const [addOpen, setAddOpen] = useState(false);
  const [ringtoneOpen, setRingtoneOpen] = useState(false);

  useAlarmTitle(visibleTasks, now);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            ⏰{dayjs(now).format("DD/MM/YYYY - HH:mm")}hs
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Agregar
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Tus recordatorios, siempre a mano.
        </Typography>

        <TaskList tasks={visibleTasks} now={now} onSnooze={snoozeTask} onStop={stopTask} onDelete={removeTask} onHide={hideTask} />
      </Container>

      <AddTaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={addTask}
        ringtone={ringtone}
        onChangeRingtone={() => setRingtoneOpen(true)}
      />
      <RingtoneModal open={ringtoneOpen} current={ringtone} onClose={() => setRingtoneOpen(false)} onSave={setRingtone} />
    </Box>
  );
}
