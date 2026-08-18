// R > src/hooks/useTasks.ts
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import type { Task } from "../types";
import { loadTasks, saveTasks } from "../utils/storage";
import { resolveSoundPath } from "../utils/assetPath";
import { DEFAULT_RINGTONE_PATH } from "../constants";
import { computeNextRecurringTrigger } from "../utils/recurrence";

const PAUSE_BETWEEN_ROUNDS_MS = 10_000;

interface RingController {
  cancelled: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [now, setNow] = useState<number>(Date.now());

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const timeoutRefs = useRef<Record<string, number>>({});
  const controllersRef = useRef<Record<string, RingController>>({});

  useEffect(() => {
    const worker = new Worker(new URL("../workers/timerWorker.ts", import.meta.url), { type: "module" });

    worker.onmessage = (e: MessageEvent<number>) => {
      setNow(e.data);
    };

    worker.postMessage("start");

    return () => {
      worker.postMessage("stop");
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const stopAudioFor = useCallback((taskId: string) => {
    const controller = controllersRef.current[taskId];
    if (controller) {
      controller.cancelled = true;
      delete controllersRef.current[taskId];
    }

    const audio = audioRefs.current[taskId];
    if (audio) {
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
    }

    const timeoutId = timeoutRefs.current[taskId];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutRefs.current[taskId];
    }
  }, []);

  const isControllerActive = useCallback((taskId: string, controller: RingController) => {
    return !controller.cancelled && controllersRef.current[taskId] === controller;
  }, []);

  const playRound = useCallback(
    (taskId: string, path: string, roundNumber: number, controller: RingController) => {
      if (!isControllerActive(taskId, controller)) return;

      if (!audioRefs.current[taskId]) {
        audioRefs.current[taskId] = new Audio(path);
      }
      const audio = audioRefs.current[taskId];
      audio.src = path;

      let beepsLeft = roundNumber;

      const playNextBeep = () => {
        if (!isControllerActive(taskId, controller)) return;

        if (beepsLeft <= 0) {
          const timeoutId = window.setTimeout(() => {
            if (!isControllerActive(taskId, controller)) return;
            playRound(taskId, path, roundNumber + 1, controller);
          }, PAUSE_BETWEEN_ROUNDS_MS);
          timeoutRefs.current[taskId] = timeoutId;
          return;
        }

        beepsLeft -= 1;
        audio.currentTime = 0;
        audio.play().catch((err) => {
          console.error("No se pudo reproducir la alarma:", err);
          if (!isControllerActive(taskId, controller)) return;
          playNextBeep();
        });
      };

      audio.onended = playNextBeep;
      playNextBeep();
    },
    [isControllerActive],
  );

  const playAlarmFor = useCallback(
    (task: Task) => {
      const path = resolveSoundPath(task.ringtonePath || DEFAULT_RINGTONE_PATH);
      const controller: RingController = { cancelled: false };
      controllersRef.current[task.id] = controller;

      playRound(task.id, path, 1, controller);

      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Alarmero", { body: task.title || "Tenés una tarea pendiente" });
      }
    },
    [playRound],
  );

  // Las tareas "alarm" y "recurring" disparan sonido; las notas nunca entran acá.
  useEffect(() => {
    setTasks((prev) => {
      let changed = false;
      const updated = prev.map((t) => {
        if (t.type === "note" || t.stopped) return t;
        const triggerTime = new Date(t.triggerAt).getTime();
        if (!t.isRinging && triggerTime <= now) {
          changed = true;
          playAlarmFor(t);
          return { ...t, isRinging: true };
        }
        return t;
      });
      return changed ? updated : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  }, []);

  const removeTask = useCallback(
    (id: string) => {
      stopAudioFor(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [stopAudioFor],
  );

  const stopTask = useCallback(
    (id: string) => {
      stopAudioFor(id);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;

          // Las recurrentes se reprograman solas para su próxima ocurrencia
          if (t.type === "recurring" && t.daysOfWeek && t.time) {
            const nextTrigger = computeNextRecurringTrigger(t.daysOfWeek, t.time, dayjs());
            return { ...t, triggerAt: nextTrigger, isRinging: false, stopped: false };
          }

          return { ...t, stopped: true, isRinging: false };
        }),
      );
    },
    [stopAudioFor],
  );

  const snoozeTask = useCallback(
    (id: string, minutes: number) => {
      stopAudioFor(id);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const base = t.isRinging ? Date.now() : new Date(t.triggerAt).getTime();
          const newTrigger = new Date(base + minutes * 60_000).toISOString();
          return { ...t, triggerAt: newTrigger, isRinging: false, stopped: false };
        }),
      );
    },
    [stopAudioFor],
  );

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const hideTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, hidden: true } : t)));
  }, []);

  const unhideTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, hidden: false } : t)));
  }, []);

  /** Reordena las notas moviendo "draggedId" a la posición de "targetId". No afecta alarmas ni repetibles. */
  const reorderNotes = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setTasks((prev) => {
      const notes = prev
        .filter((t) => t.type === "note")
        .sort((a, b) => (a.order ?? new Date(a.createdAt).getTime()) - (b.order ?? new Date(b.createdAt).getTime()));

      const draggedIdx = notes.findIndex((n) => n.id === draggedId);
      const targetIdx = notes.findIndex((n) => n.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const reordered = [...notes];
      const [moved] = reordered.splice(draggedIdx, 1);
      reordered.splice(targetIdx, 0, moved);

      const withOrder = reordered.map((n, idx) => ({ ...n, order: idx }));

      // Mantenemos el orden relativo original de "others" (alarmas/repetibles) intercalado como estaba
      const result: Task[] = [];
      let noteCursor = 0;
      for (const t of prev) {
        if (t.type === "note") {
          result.push(withOrder[noteCursor]);
          noteCursor += 1;
        } else {
          result.push(t);
        }
      }
      return result;
    });
  }, []);

  const visibleTasks = tasks.filter((t) => !t.hidden);
  const hiddenTasks = tasks.filter((t) => t.hidden);

  return {
    tasks,
    visibleTasks,
    hiddenTasks,
    now,
    addTask,
    updateTask,
    removeTask,
    stopTask,
    snoozeTask,
    toggleComplete,
    hideTask,
    unhideTask,
    reorderNotes,
  };
}
