// R > src/types.ts
export type TaskType = "alarm" | "note" | "recurring";

export interface Task {
  id: string;
  /** "alarm": hora única que suena. "note": sin tiempo. "recurring": se repite ciertos días de la semana. */
  type: TaskType;
  title: string;
  description: string;
  /** ISO string con fecha + hora del próximo disparo. Para "recurring" se recalcula dinámicamente. */
  triggerAt: string;
  ringtonePath: string;
  stopped: boolean;
  isRinging: boolean;
  hidden: boolean;
  completed: boolean;
  createdAt: string;
  /** Solo para "recurring": días de la semana (0=domingo ... 6=sábado, según dayjs().day()) */
  daysOfWeek?: number[];
  /** Solo para "recurring": hora fija "HH:mm" que se repite */
  time?: string;
  /** Orden manual (usado principalmente por las notas, para drag & drop) */
  order?: number;
}
