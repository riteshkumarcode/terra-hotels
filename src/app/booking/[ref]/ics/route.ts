import { NextResponse } from "next/server";
import { generateIcsCalendarFile } from "@/lib/calendar";
import { SAMPLE_HOTELS } from "@/lib/sample-data";

export async function GET(
  req: Request,
  context: { params: Promise<{ ref: string }> }
) {
  const { ref } = await context.params;

  const parts = ref.split("-");
  const code = parts[1] || "UDR";
  const hotel =
    SAMPLE_HOTELS.find((h) => h.code.toUpperCase() === code.toUpperCase()) ||
    SAMPLE_HOTELS[0];

  const ics = generateIcsCalendarFile({
    reference: ref,
    hotelName: hotel.name,
    cityName: hotel.city,
    address: hotel.address,
    checkInDate: "2026-11-13",
    checkOutDate: "2026-11-16",
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ref}.ics"`,
    },
  });
}
