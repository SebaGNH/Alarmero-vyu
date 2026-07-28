import { useCallback, useEffect, useRef, useState } from "react";
import type { Task, RingtoneConfig } from "../types";
import { loadTasks, saveTasks, loadRingtone, saveRingtone } from "../utils/storage";
import { resolveSoundPath } from "../utils/assetPath";

const PAUSE_BETWEEN_ROUNDS_MS = 10_000; // pausa entre "rondas" de beeps

interface RingController {
  cancelled: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [ringtone, setRingtoneState] = useState<RingtoneConfig>(() => loadRingtone());
  const [now, setNow] = useState<number>(Date.now());

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const timeoutRefs = useRef<Record<string, number>>({});
  const controllersRef = useRef<Record<string, RingController>>({});

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const setRingtone = useCallback((config: RingtoneConfig) => {
    setRingtoneState(config);
    saveRingtone(config);
  }, []);

  const stopAudioFor = useCallback((taskId: string) => {
    // cancelamos cualquier secuencia de beeps en curso
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

  // Reproduce `roundNumber` beeps seguidos y, al terminar, espera 10s
  // y arranca la siguiente ronda con roundNumber + 1 beeps.
  const playRound = useCallback((taskId: string, path: string, roundNumber: number, controller: RingController) => {
    if (controller.cancelled) return;

    if (!audioRefs.current[taskId]) {
      audioRefs.current[taskId] = new Audio(path);
    }
    const audio = audioRefs.current[taskId];
    audio.src = path;

    let beepsLeft = roundNumber;

    const playNextBeep = () => {
      if (controller.cancelled) return;

      if (beepsLeft <= 0) {
        // ronda terminada, esperar y pasar a la siguiente
        const timeoutId = window.setTimeout(() => {
          if (controller.cancelled) return;
          playRound(taskId, path, roundNumber + 1, controller);
        }, PAUSE_BETWEEN_ROUNDS_MS);
        timeoutRefs.current[taskId] = timeoutId;
        return;
      }

      beepsLeft -= 1;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // si el navegador bloquea el play, igual seguimos la cadena
        playNextBeep();
      });
    };

    audio.onended = playNextBeep;
    playNextBeep();
  }, []);

  const playAlarmFor = useCallback(
    (task: Task) => {
      const path = resolveSoundPath(task.ringtonePath || ringtone.path);
      const controller: RingController = { cancelled: false };
      controllersRef.current[task.id] = controller;

      playRound(task.id, path, 1, controller);

      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Alarmero", { body: task.title || "Tenés una tarea pendiente" });
      }
    },
    [ringtone.path, playRound],
  );

  useEffect(() => {
    setTasks((prev) => {
      let changed = false;
      const updated = prev.map((t) => {
        if (t.stopped) return t;
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
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, stopped: true, isRinging: false } : t)));
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

  const hideTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, hidden: true } : t)));
  }, []);

  const unhideTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, hidden: false } : t)));
  }, []);

  const visibleTasks = tasks.filter((t) => !t.hidden);
  const hiddenTasks = tasks.filter((t) => t.hidden);

  return {
    tasks,
    visibleTasks,
    hiddenTasks,
    now,
    ringtone,
    setRingtone,
    addTask,
    removeTask,
    stopTask,
    snoozeTask,
    hideTask,
    unhideTask,
  };
}
