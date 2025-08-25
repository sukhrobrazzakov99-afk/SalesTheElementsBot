import { DayPayload, PriceProvider } from "./types";
import hotels from "../data/hotels.json";

export class BookingAffiliateProvider implements PriceProvider {
  async fetchPrices(dateISO: string): Promise<DayPayload> {
    return {
      date: dateISO,
      currency: "USD",
      hotels: [...hotels.competitors.map(h => ({ name: h.name, rooms: [] as any[] })), { name: hotels.base_hotel.name, rooms: [] as any[] }]
    };
  }
}
