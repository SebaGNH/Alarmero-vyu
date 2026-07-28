export interface Task {
  id: string;
  title: string;
  description: string;
  /** ISO string con fecha + hora del disparo de la alarma */
  triggerAt: string;
  ringtonePath: string;
  /** true si el usuario la detuvo (no debe volver a sonar) */
  stopped: boolean;
  /** true mientras está sonando activamente */
  isRinging: boolean;
  createdAt: string;
}

export interface RingtoneConfig {
  /** ruta relativa dentro de /public/sounds o nombre de archivo */
  path: string;
  /** nombre visible para el usuario */
  name: string;
}
