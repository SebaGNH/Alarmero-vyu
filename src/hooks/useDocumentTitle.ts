// src/hooks/useAlarmTitle.ts
import { useEffect } from "react";
import dayjs from "dayjs";
import type { Task } from "../types";

const APP_NAME = "Alarmero";
const THRESHOLD_HOURS = 10;

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function useAlarmTitle(tasks: Task[], now: Date | number | dayjs.Dayjs) {
  useEffect(() => {
    const current = dayjs(now);

    // Buscamos la próxima alarma pendiente (no sonando, no oculta, en el futuro)
    const upcoming = tasks
      .filter((t) => !t.hidden && !t.isRinging && dayjs(t.triggerAt).isAfter(current))
      .sort((a, b) => dayjs(a.triggerAt).diff(dayjs(b.triggerAt)));

    const next = upcoming[0];

    if (!next) {
      document.title = APP_NAME;
      return;
    }

    const diffMs = dayjs(next.triggerAt).diff(current);
    const diffHours = diffMs / 1000 / 60 / 60;

    document.title = diffHours <= THRESHOLD_HOURS ? formatCountdown(diffMs) : APP_NAME;
  }, [tasks, now]);
}
