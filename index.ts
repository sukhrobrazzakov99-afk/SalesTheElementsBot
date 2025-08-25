import express, { json } from "express";
import { getConfig, webhookPathFromToken } from "./src/config";
import { createBot } from "./src/bot";
import { createProvider } from "./src/provider";
import { startScheduler } from "./src/scheduler";

async function main() {
  const cfg = getConfig();
  const provider = createProvider(cfg.DATA_PROVIDER);
  const bot = createBot(cfg, provider);

  const app = express();
  app.set("trust proxy", 1);
  app.use(json());

  const path = webhookPathFromToken(cfg.BOT_TOKEN);
  const webhookUrl = `${cfg.WEBHOOK_URL}${path}`;

  // Сбрасываем старый вебхук и ставим новый
  await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
  const ok = await bot.telegram.setWebhook(webhookUrl);
  const info = await bot.telegram.getWebhookInfo();
  console.log("Webhook set:", ok, "to:", webhookUrl);
  console.log("Webhook info:", info);

  // Роут вебхука (Telegraf handler)
  app.use(path, (req, res) => {
    console.log("Incoming update at", new Date().toISOString());
    return (bot.webhookCallback(path) as any)(req, res);
  });

  // Health
  app.get("/", (_req, res) => res.status(200).send("OK"));
  app.get("/healthz", (_req, res) => res.status(200).send("OK"));

  app.listen(cfg.PORT, () => {
    console.log(`Server on :${cfg.PORT}, webhook: ${webhookUrl}`);
  });

  // Планировщик
  startScheduler(cfg, bot, provider);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
