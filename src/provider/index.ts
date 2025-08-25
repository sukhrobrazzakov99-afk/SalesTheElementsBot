import { PriceProvider } from "./types";
import { MockProvider } from "./mock";
import { BookingAffiliateProvider } from "./booking_affiliate";

export function createProvider(kind: "mock" | "booking_affiliate"): PriceProvider {
  if (kind === "booking_affiliate") return new BookingAffiliateProvider();
  return new MockProvider();
}
