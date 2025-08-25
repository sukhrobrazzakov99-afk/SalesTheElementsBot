import { Telegraf, Markup } from "telegraf";
import { Config } from "./config";
import { addAuthorizedChat, AwaitingDate } from "./store";
import { PriceProvider } from "./provider/types";
import { addDays, ensureAuthorizedUsername, headerDateDDMonth, toISODateLocal, withRetries } from "./utils";
import { renderReport } from "./report";

const BTN_TODAY5 = "📊 Сегодня +5";
const BTN_PICKDATE = "📅 Выбрать дату";
const BTN_HOTELS = "🏨 Отели/типы";
const BTN_SETTINGS = "⚙️ Настройки";
const BTN_HELP = "❓ Справка";

export function createBot(cfg: Config, provider: PriceProvider) {
  const bot = new Telegraf(cfg.BOT_TOKEN);

  const keyboard = Markup.keyboard([
    [BTN_TODAY5, BTN_PICKDATE],
    [BTN_HOTELS, BTN_SETTINGS],
    [BTN_HELP],
  ]).resize();

  bot.on("message", async (ctx, next) => {
    const username = ctx.from?.username || null;
    if (!ensureAuthorizedUsername(cfg, username)) {
      await ctx.reply("Доступ запрещён.");
      return;
    }
    addAuthorizedChat(ctx.chat.id);
    return next();
  });

  bot.start(async (ctx) => {
    await ctx.reply("Готов к работе. Выберите действие.", keyboard);
  });

  bot.hears(BTN_HELP, async (ctx) => {
    await ctx.reply(
      [
        "Кнопки:",
        "• 📊 Сегодня +5 — отправит 5 сообщений на ближайшие даты",
        "• 📅 Выбрать дату — введите YYYY-MM-DD для одного отчёта",
        "• 🏨 Отели/типы — сейчас список фиксирован",
        "• ⚙️ Настройки — провайдер, часовой пояс, валюта",
      ].join("\n")
    );
  });

  bot.hears(BTN_SETTINGS, async (ctx) => {
    await ctx.reply(
      [
        `Валюта: ${cfg.CURRENCY}`,
        `TZ: ${cfg.TZ}`,
        `Провайдер: ${cfg.DATA_PROVIDER}`,
      ].join("\n")
    );
  });

  bot.hears(BTN_HOTELS, async (ctx) => {
    await ctx.reply("Список фиксирован. В следующей версии добавим on/off.");
  });

  bot.hears(BTN_PICKDATE, async (ctx) => {
    AwaitingDate.add(ctx.chat.id);
    await ctx.reply("Введите дату в формате YYYY-MM-DD");
  });

  bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    if (!AwaitingDate.has(chatId)) return;

    const m = (ctx.message as any).text.trim();
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(m);
    if (!ok) {
      await ctx.reply("Дата должна быть в формате YYYY-MM-DD. Попробуйте снова.");
      return;
    }
    AwaitingDate.delete(chatId);
    await sendOneReport(ctx, provider, m);
  });

  bot.hears(BTN_TODAY5, async (ctx) => {
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = addDays(now, i);
      const iso = toISODateLocal(d, cfg.TZ);
      await sendOneReport(ctx, provider, iso);
    }
  });

  async function sendOneReport(ctx: any, prov: PriceProvider, dateISO: string) {
    const dateObj = new Date(dateISO + "T00:00:00");
    try {
      const payload = await prov.fetchPrices(dateISO);
      const text = renderReport(payload, dateObj);
      await withRetries(() => ctx.reply(text));
    } catch (e) {
      await ctx.reply(`Ошибка при формировании отчёта на ${headerDateDDMonth(dateObj)}.`);
    }
  }

  return bot;
}
