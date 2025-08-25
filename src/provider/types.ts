export type RoomType = "Single RO" | "Single BB" | "Double RO" | "Double BB";

export type RoomQuote = {
  type: RoomType;
  web_price: number | null;
  mobile_price: number | null;
  breakfast_included: boolean;
  refundable: boolean;
  payment_type: "pay_at_property" | "prepaid";
  cancellation_policy_short: "Flex" | "NRF";
  taxes_fees: "incl" | "plus";
  deeplink?: string;
};

export type HotelDay = { name: string; rooms: RoomQuote[] };

export type DayPayload = {
  date: string;
  currency: "USD";
  hotels: HotelDay[];
};

export interface PriceProvider {
  fetchPrices(dateISO: string): Promise<DayPayload>;
}
