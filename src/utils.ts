import { Config } from "./config";

const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export function toISODateLocal(date: Date, _tz: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const dt = new Date(date);
  dt.setDate(dt.getDate() + days);
  return dt;
}

export function headerDateDDMonth(d: Date): string {
  const dd = String(d.getDate());
  const month = MONTHS_EN[d.getMonth()];
  return `${dd} ${month}`;
}

export function roundUSD(value: number | null): number | null {
  if (value == null) return null;
  return Math.round(value);
}

export function fmtUSDInt(value: number | null): string {
  if (value == null) return "—";
  return `$${Math.round(value)}`;
}

export async function withRetries<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

export function ensureAuthorizedUsername(cfg: Config, username?: string | null): boolean {
  if (!cfg.ALLOWED_USERNAMES.size) return true;
  if (!username) return false;
  return cfg.ALLOWED_USERNAMES.has(username.replace(/^@/, ""));
}
