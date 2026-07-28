# Alarmero

App de recordatorios/alarmas con React + TypeScript + Vite + Material UI.

## Instalación

```bash
npm install
npm run dev
```

## Ringtone

Poné tu archivo `.mp3` (menos de 3s) dentro de `public/sounds/`, por ejemplo:

```
public/sounds/mi-tono.mp3
```

Después, dentro de la app, hacé click en el ícono de nota musical (dentro del
modal de "Agregar") y escribí la ruta relativa: `/sounds/mi-tono.mp3`.
Esa configuración queda guardada en `localStorage` y se usa siempre el último
tono que hayas cargado.

> Nota: por seguridad, los navegadores no permiten reproducir archivos por ruta
> absoluta del sistema operativo (ej: `C:\Users\...\tono.mp3`). El archivo
> tiene que estar dentro de la carpeta `public` del proyecto para poder sonar.

## Funcionalidad

- Agregar recordatorios con título, descripción, fecha y hora (por defecto:
  hoy + hora actual +10 min), totalmente editables antes de guardar.
- Lista de tareas ordenada por la más próxima a sonar.
- Por cada tarea: tiempo restante, botones para sumar 1 o 10 minutos, y botón
  de detener la alarma.
- Todo se persiste en `localStorage`, así que si cerrás y volvés a abrir el
  navegador, las tareas pendientes siguen ahí y se auto-reanudan (el
  countdown sigue corriendo con la hora real).
- Si la pestaña no está en foco cuando suena una alarma, se dispara además una
  notificación del navegador (necesita que aceptes el permiso la primera vez).
