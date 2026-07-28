export function resolveSoundPath(path: string): string {
  // Si ya viene con el base incluido o es una URL completa, no tocar
  if (path.startsWith("http")) return path;
  const base = import.meta.env.BASE_URL; // '/Alarmero-vyu/' en prod, '/' en dev
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}
