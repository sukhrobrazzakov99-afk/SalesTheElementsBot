import { Buffer } from "node:buffer";

export type Config = {
  BOT_TOKEN: string;
  WEBHOOK_URL: string;
  ALLOWED_USERNAMES: Set<string>;
  TZ: string;
  DATA_PROVIDER: "mock" | "booking_affiliate";
  CURRENCY: "USD";
  PORT: number;
};

export function getConfig(): Config {
  const {
    BOT_TOKEN,
    WEBHOOK_URL,
    ALLOWED_USERNAMES,
    TZ = "Asia/Tashkent",
    DATA_PROVIDER = "mock",
    CURRENCY = "USD",
    PORT = "8080",
  } = process.env;

  if (!BOT_TOKEN) throw new Error("BOT_TOKEN is required");
  if (!WEBHOOK_URL) throw new Error("WEBHOOK_URL is required");

  const allowed = new Set(
    (ALLOWED_USERNAMES || "")
      .split(",")
      .map((s) => s.trim().replace(/^@/, ""))
      .filter(Boolean)
  );

  return {
    BOT_TOKEN,
    WEBHOOK_URL,
    ALLOWED_USERNAMES: allowed,
    TZ,
    DATA_PROVIDER: DATA_PROVIDER === "booking_affiliate" ? "booking_affiliate" : "mock",
    CURRENCY: "USD",
    PORT: parseInt(PORT!, 10) || 8080,
  };
}

export function webhookPathFromToken(token: string): string {
  const b64 = Buffer.from(token).toString("base64url").slice(0, 24);
  return `/tg/${b64}`;
}
