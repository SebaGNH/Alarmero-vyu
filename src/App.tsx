// R > src/App.tsx
import { useState } from "react";
import { Container, Box, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { useTasks } from "./hooks/useTasks";
import { useAlarmTitle } from "./hooks/useDocumentTitle";
import AddTaskModal from "./components/AddTaskModal";
import TaskList from "./components/TaskList";
import type { Task } from "./types";

export default function App() {
  const { visibleTasks, now, addTask, updateTask, removeTask, stopTask, snoozeTask, toggleComplete } = useTasks();
  useAlarmTitle(visibleTasks, now);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            ⏰{dayjs(now).format("DD/MM/YYYY - HH:mm")}hs
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Agregar
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Tus recordatorios, siempre a mano.
        </Typography>

        <TaskList
          tasks={visibleTasks}
          now={now}
          onSnooze={snoozeTask}
          onStop={stopTask}
          onDelete={removeTask}
          onEdit={handleOpenEdit}
          onToggleComplete={toggleComplete}
        />
      </Container>

      <AddTaskModal open={modalOpen} onClose={handleCloseModal} onSave={addTask} onUpdate={updateTask} editingTask={editingTask} />
    </Box>
  );
}
