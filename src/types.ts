// R > src/types.ts
export type TaskType = "alarm" | "note";

export interface Task {
  id: string;
  /** "alarm": tiene hora de disparo y suena. "note": solo título/descripción, sin tiempo. */
  type: TaskType;
  title: string;
  description: string;
  /** ISO string con fecha + hora del disparo (para notas, se usa createdAt sin efecto real) */
  triggerAt: string;
  ringtonePath: string;
  /** true si el usuario la detuvo (no debe volver a sonar) */
  stopped: boolean;
  /** true mientras está sonando activamente */
  isRinging: boolean;
  /** true si el usuario decidió ocultarla de la lista principal */
  hidden: boolean;
  /** solo aplica a notas: marcada como completada */
  completed: boolean;
  createdAt: string;
}
