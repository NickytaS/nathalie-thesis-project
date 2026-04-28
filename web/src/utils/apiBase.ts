/** Base URL for API calls. Empty means same origin (Vite dev proxy to chat-api). */
export function apiUrl(path: string): string {
  const o = import.meta.env.VITE_CHAT_API_ORIGIN;
  const base = typeof o === 'string' ? o.replace(/\/$/, '') : '';
  return base ? `${base}${path}` : path;
}
