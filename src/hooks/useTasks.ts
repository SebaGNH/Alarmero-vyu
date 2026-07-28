import { useCallback, useEffect, useRef, useState } from "react";
import type { Task, RingtoneConfig } from "../types";
import { loadTasks, saveTasks, loadRingtone, saveRingtone } from "../utils/storage";

const LOOP_INTERVAL_MS = 1500; // cada cuánto se reinicia el sonido mientras suena

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [ringtone, setRingtoneState] = useState<RingtoneConfig>(() => loadRingtone());
  const [now, setNow] = useState<number>(Date.now());

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const loopIntervalRefs = useRef<Record<string, number>>({});

  // Reloj: tick cada segundo para recalcular "tiempo restante"
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Persistir tareas cada vez que cambian
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const setRingtone = useCallback((config: RingtoneConfig) => {
    setRingtoneState(config);
    saveRingtone(config);
  }, []);

  const stopAudioFor = useCallback((taskId: string) => {
    const audio = audioRefs.current[taskId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    const loopId = loopIntervalRefs.current[taskId];
    if (loopId) {
      window.clearInterval(loopId);
      delete loopIntervalRefs.current[taskId];
    }
  }, []);

  const playAlarmFor = useCallback(
    (task: Task) => {
      const path = task.ringtonePath || ringtone.path;
      if (!audioRefs.current[task.id]) {
        audioRefs.current[task.id] = new Audio(path);
      }
      const audio = audioRefs.current[task.id];
      audio.src = path;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // el navegador puede bloquear autoplay si no hubo interacción previa
      });

      // Como el mp3 dura <3s, lo reproducimos en loop manual hasta que se detenga
      if (!loopIntervalRefs.current[task.id]) {
        loopIntervalRefs.current[task.id] = window.setInterval(() => {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }, LOOP_INTERVAL_MS);
      }

      // Notificación del navegador si la pestaña no está en foco
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Alarmero", { body: task.title || "Tenés una tarea pendiente" });
      }
    },
    [ringtone.path],
  );

  // Chequeo de disparo de alarmas
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
