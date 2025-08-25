import { DayPayload, HotelDay, PriceProvider, RoomQuote, RoomType } from "./types";
import hotels from "../data/hotels.json";

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let x = seed || 123456789;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

function genRoom(type: RoomType, r: () => number): RoomQuote {
  const base = 50 + Math.floor(r() * 70);
  const empty = r() < 0.35;
  const web = empty ? null : base + (type.includes("BB") ? 10 : 0);
  const mobile = web != null && r() < 0.5 ? Math.max(40, web - 5) : null;
  const breakfast = type.includes("BB");
  const refundable = r() < 0.5;
  return {
    type,
    web_price: web,
    mobile_price: mobile,
    breakfast_included: breakfast,
    refundable,
    payment_type: r() < 0.5 ? "prepaid" : "pay_at_property",
    cancellation_policy_short: refundable ? "Flex" : "NRF",
    taxes_fees: "incl",
  };
}

export class MockProvider implements PriceProvider {
  async fetchPrices(dateISO: string): Promise<DayPayload> {
    const list: HotelDay[] = [];
    const all = [...hotels.competitors.map((h) => h.name), hotels.base_hotel.name];
    for (const name of all) {
      const seed = hashStr(`${dateISO}:${name}`);
      const r = rng(seed);
      const rooms: RoomQuote[] = [
        genRoom("Single RO", r),
        genRoom("Single BB", r),
        genRoom("Double RO", r),
        genRoom("Double BB", r),
      ];
      list.push({ name, rooms });
    }
    return { date: dateISO, currency: "USD", hotels: list };
  }
}
