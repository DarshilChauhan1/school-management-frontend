/**
 * Time-of-day helpers. The backend stores wall-clock times as ISO datetimes
 * anchored to a fixed reference date, so we treat them in UTC to avoid
 * timezone drift on the clock portion.
 */

const REFERENCE_DATE = "2000-01-01";

/** ISO datetime → "HH:mm" (24h), for <input type="time">. */
export function isoToTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** "HH:mm" → ISO datetime anchored to the reference date (UTC). */
export function timeInputToIso(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const [hh, mm] = value.split(":");
  if (hh === undefined || mm === undefined) return undefined;
  const d = new Date(`${REFERENCE_DATE}T${hh}:${mm}:00.000Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** ISO datetime → friendly 12h label, e.g. "8:05 AM". */
export function formatTimeOfDay(value: string | null | undefined): string {
  const t = isoToTimeInput(value);
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}
