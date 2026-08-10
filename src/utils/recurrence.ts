// R > src/utils/recurrence.ts
import dayjs, { Dayjs } from "dayjs";

/**
 * Calcula el próximo momento (ISO string) en que debe dispararse una tarea recurrente,
 * dado un conjunto de días de la semana (0=domingo...6=sábado) y una hora "HH:mm".
 * Busca desde "from" hacia adelante, incluyendo hoy si la hora todavía no pasó.
 */
export function computeNextRecurringTrigger(daysOfWeek: number[], time: string, from: Dayjs = dayjs()): string {
  if (daysOfWeek.length === 0) return from.toISOString();

  const [h, m] = time.split(":").map(Number);

  for (let i = 0; i < 8; i++) {
    const candidate = from.add(i, "day").hour(h).minute(m).second(0).millisecond(0);
    if (daysOfWeek.includes(candidate.day()) && candidate.isAfter(from)) {
      return candidate.toISOString();
    }
  }
  // fallback (no debería pasar si daysOfWeek no está vacío)
  return from.toISOString();
}

export const DAYS_OF_WEEK = [
  { label: "L", value: 1 },
  { label: "M", value: 2 },
  { label: "M", value: 3 },
  { label: "J", value: 4 },
  { label: "V", value: 5 },
  { label: "S", value: 6 },
  { label: "D", value: 0 },
];
