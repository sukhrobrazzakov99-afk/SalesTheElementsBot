import cron from "node-cron";
import { Telegraf } from "telegraf";
import { Config } from "./config";
import { listAuthorizedChats } from "./store";
import { addDays, toISODateLocal, withRetries } from "./utils";
import { PriceProvider } from "./provider/types";
import { renderReport } from "./report";

export function startScheduler(cfg: Config, bot: Telegraf, provider: PriceProvider) {
  cron.schedule("0 13 * * *", async () => {
    const chats = listAuthorizedChats();
    if (!chats.length) return;
    const now = new Date();
    for (const chatId of chats) {
      for (let i = 0; i < 5; i++) {
        const d = addDays(now, i);
        const iso = toISODateLocal(d, cfg.TZ);
        try {
          const payload = await provider.fetchPrices(iso);
          const text = renderReport(payload, d);
          await withRetries(() => bot.telegram.sendMessage(chatId, text));
        } catch {
          // ignore single failure
        }
      }
    }
  }, { timezone: cfg.TZ });
}
