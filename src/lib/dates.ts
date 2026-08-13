const HAS_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Parse a datetime string to epoch milliseconds.
 * Values without an explicit timezone (e.g. `2026-08-15T18:29:00`) are
 * treated as UTC, since the admin panel stores deal expiry as UTC via
 * `new Date(...).toISOString()`.
 */
export function parseDateTimeUtc(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return NaN;

  let normalized = trimmed.replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized = `${normalized}T00:00:00`;
  }
  if (!HAS_ZONE.test(normalized)) {
    normalized = `${normalized}Z`;
  }

  return Date.parse(normalized);
}

/**
 * Format a datetime string for a `<input type="datetime-local">`, i.e.
 * `YYYY-MM-DDTHH:mm` in the browser's local time.
 */
export function toLocalInputValue(value: string): string {
  const ms = parseDateTimeUtc(value);
  if (Number.isNaN(ms)) return "";

  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
