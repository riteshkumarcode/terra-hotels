/**
 * Pricing, GST, and currency formatting engine for TERRAA HOTELS.
 * All internal money values are in integer PAISE (1 INR = 100 paise).
 */

export const GST_ROOM_THRESHOLD_PAISE = 750000; // ₹7,500 in paise
export const GST_RATE_LOW = 0.05; // 5%
export const GST_RATE_HIGH = 0.18; // 18%
export const GST_RATE_ADDONS = 0.18; // 18%

/**
 * Returns applicable GST rate (0.05 or 0.18) based on nightly room rate in paise.
 */
export function getRoomGstRate(nightlyRatePaise: number): number {
  return nightlyRatePaise > GST_ROOM_THRESHOLD_PAISE ? GST_RATE_HIGH : GST_RATE_LOW;
}

/**
 * Formats integer paise into Indian Rupee string (en-IN).
 * e.g. 1450000 -> "₹14,500"
 */
export function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  return "₹" + rupees.toLocaleString("en-IN");
}

/**
 * Calculates number of nights between two ISO dates (YYYY-MM-DD).
 */
export function calculateNights(arriveDate: string, departDate: string): number {
  if (!arriveDate || !departDate) return 1;
  const a = new Date(`${arriveDate}T12:00:00`);
  const d = new Date(`${departDate}T12:00:00`);
  const diffTime = d.getTime() - a.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Formats date into locale string e.g. "Fri, 13 Nov" or "Fri, 13 Nov 2026"
 */
export function formatDateLabel(dateStr: string, withYear = false): string {
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: withYear ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}

export interface RoomSelection {
  roomId: string;
  roomName: string;
  planType: "flex" | "adv";
  planName: string;
  nightlyRatePaise: number;
  quantity: number;
}

export interface AddonSelection {
  id: string;
  name: string;
  pricePaise: number;
}

export interface StayPricingBreakdown {
  nights: number;
  roomsSubtotalPaise: number;
  directDiscountPaise: number; // 10% direct discount
  discountedRoomsPaise: number;
  addonsSubtotalPaise: number;
  roomsGstPaise: number;
  addonsGstPaise: number;
  totalGstPaise: number;
  grandTotalPaise: number;
  lines: {
    label: string;
    amountPaise: number;
    nightlyRatePaise: number;
    gstRate: number;
  }[];
}

/**
 * Computes exact itemized pricing, GST tiers, and grand total.
 */
export function calculatePricing({
  arriveDate,
  departDate,
  rooms,
  addons = [],
  applyDirectDiscount = true,
}: {
  arriveDate: string;
  departDate: string;
  rooms: RoomSelection[];
  addons?: AddonSelection[];
  applyDirectDiscount?: boolean;
}): StayPricingBreakdown {
  const nights = calculateNights(arriveDate, departDate);
  let roomsSubtotalPaise = 0;
  let roomsGstPaise = 0;
  const lines: StayPricingBreakdown["lines"] = [];

  for (const r of rooms) {
    if (r.quantity <= 0) continue;
    const baseTotalPaise = r.nightlyRatePaise * nights * r.quantity;
    roomsSubtotalPaise += baseTotalPaise;

    // Direct discount (10%) applies to tariff per night
    const effectiveNightlyRate = applyDirectDiscount
      ? Math.round(r.nightlyRatePaise * 0.9)
      : r.nightlyRatePaise;

    const effectiveRoomTotal = effectiveNightlyRate * nights * r.quantity;
    const gstRate = getRoomGstRate(effectiveNightlyRate);
    const roomGst = Math.round(effectiveRoomTotal * gstRate);

    roomsGstPaise += roomGst;

    lines.push({
      label: `${r.quantity} × ${r.roomName} · ${r.planName} · ${nights} ${nights > 1 ? "nights" : "night"}`,
      amountPaise: baseTotalPaise,
      nightlyRatePaise: r.nightlyRatePaise,
      gstRate,
    });
  }

  const directDiscountPaise = applyDirectDiscount ? Math.round(roomsSubtotalPaise * 0.1) : 0;
  const discountedRoomsPaise = roomsSubtotalPaise - directDiscountPaise;

  const addonsSubtotalPaise = addons.reduce((sum, a) => sum + a.pricePaise, 0);
  const addonsGstPaise = Math.round(addonsSubtotalPaise * GST_RATE_ADDONS);

  const totalGstPaise = roomsGstPaise + addonsGstPaise;
  const grandTotalPaise = discountedRoomsPaise + addonsSubtotalPaise + totalGstPaise;

  return {
    nights,
    roomsSubtotalPaise,
    directDiscountPaise,
    discountedRoomsPaise,
    addonsSubtotalPaise,
    roomsGstPaise,
    addonsGstPaise,
    totalGstPaise,
    grandTotalPaise,
    lines,
  };
}
