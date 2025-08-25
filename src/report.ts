import hotelsData from "./data/hotels.json";
import { DayPayload, HotelDay } from "./provider/types";
import { fmtUSDInt, headerDateDDMonth, roundUSD } from "./utils";

function displayName(name: string): string {
  if (name.includes("LOTTE City Hotels Tashkent Palace")) return "LOTTE Palace";
  return name;
}

function getHotel(payload: DayPayload, hotelName: string): HotelDay | undefined {
  return payload.hotels.find(h => h.name === hotelName);
}

export function renderReport(payload: DayPayload, dateObj: Date): string {
  const header = `📅 ${headerDateDDMonth(dateObj)} — Стандарт Single (1 взрослый)`;

  const lines: string[] = [];
  const order = [...hotelsData.competitors.map(h => h.name), hotelsData.base_hotel.name];

  const roPrices: { name: string; price: number }[] = [];
  const bbPrices: { name: string; price: number }[] = [];

  for (const name of order) {
    const hotel = getHotel(payload, name);
    const ro = hotel?.rooms.find(r => r.type === "Single RO")?.web_price ?? null;
    const bb = hotel?.rooms.find(r => r.type === "Single BB")?.web_price ?? null;
    const roR = roundUSD(ro);
    const bbR = roundUSD(bb);
    if (roR == null && bbR == null) {
      lines.push(`${displayName(name)}: ❌ Цены не найдены`);
    } else {
      const roS = fmtUSDInt(roR);
      const bbS = fmtUSDInt(bbR);
      lines.push(`${displayName(name)}: RO ${roS}, BB ${bbS}`);
    }
    if (roR != null) roPrices.push({ name: displayName(name), price: roR });
    if (bbR != null) bbPrices.push({ name: displayName(name), price: bbR });
  }

  const analysis: string[] = ["🤖 Анализ:"];
  if (roPrices.length >= 1) {
    roPrices.sort((a, b) => a.price - b.price);
    const cheapest = roPrices[0];
    const spread = roPrices[roPrices.length - 1].price - roPrices[0].price;
    analysis.push(`• Самый дешевый RO: ${cheapest.name} ($${cheapest.price})`);
    analysis.push(`• Разброс цен RO: $${spread}`);
  } else {
    analysis.push("• Самый дешевый RO: Недостаточно данных");
    analysis.push("• Разброс цен RO: Недостаточно данных");
  }
  if (bbPrices.length >= 1) {
    bbPrices.sort((a, b) => a.price - b.price);
    const bestBB = bbPrices[0];
    analysis.push(`• Лучший BB: ${bestBB.name} ($${bestBB.price})`);
  } else {
    analysis.push("• Лучший BB: Недостаточно данных");
  }
  analysis.push("• Источники: Booking.com");
  analysis.push("• Ограниченная надежность данных");

  return [header, "", ...lines, "", ...analysis].join("\n");
}
