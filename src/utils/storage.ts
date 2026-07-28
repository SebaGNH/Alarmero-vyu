import type { Task, RingtoneConfig } from '../types';

const TASKS_KEY = 'alarmero_tasks';
const RINGTONE_KEY = 'alarmero_ringtone';

export const DEFAULT_RINGTONE: RingtoneConfig = {
  path: '/sounds/default.mp3',
  name: 'Tono por defecto',
};

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadRingtone(): RingtoneConfig {
  try {
    const raw = localStorage.getItem(RINGTONE_KEY);
    if (!raw) return DEFAULT_RINGTONE;
    return JSON.parse(raw) as RingtoneConfig;
  } catch {
    return DEFAULT_RINGTONE;
  }
}

export function saveRingtone(config: RingtoneConfig): void {
  localStorage.setItem(RINGTONE_KEY, JSON.stringify(config));
}
