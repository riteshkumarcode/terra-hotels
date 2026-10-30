import { NextResponse } from "next/server";
import { generateInvoiceHtml } from "@/lib/invoice";
import { SAMPLE_HOTELS } from "@/lib/sample-data";

export async function GET(
  req: Request,
  context: { params: Promise<{ ref: string }> }
) {
  const { ref } = await context.params;

  // Extract hotel code from reference e.g. TRH-UDR-48291 -> UDR
  const parts = ref.split("-");
  const code = parts[1] || "UDR";
  const hotel =
    SAMPLE_HOTELS.find((h) => h.code.toUpperCase() === code.toUpperCase()) ||
    SAMPLE_HOTELS[0];

  const html = generateInvoiceHtml({
    invoiceNumber: `INV-${ref}`,
    reference: ref,
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    hotelName: hotel.name,
    hotelAddress: hotel.address,
    guestName: "Guest",
    guestEmail: "guest@example.com",
    guestMobile: "+91 98765 43210",
    checkIn: "13 Nov 2026",
    checkOut: "16 Nov 2026",
    nights: 3,
    rooms: [
      {
        name: hotel.rooms[0]?.name || "Palace Room",
        plan: "Flexible · breakfast for two",
        qty: 1,
        ratePaise: hotel.rooms[0]?.baseRate || 1450000,
      },
    ],
    addons: [
      {
        name: "Sunset boat ride",
        pricePaise: 300000,
      },
    ],
    subtotalPaise: (hotel.rooms[0]?.baseRate || 1450000) * 3 + 300000,
    discountPaise: Math.round(((hotel.rooms[0]?.baseRate || 1450000) * 3) * 0.1),
    gstPaise: Math.round(
      ((hotel.rooms[0]?.baseRate || 1450000) * 3 * 0.9 * 0.18) + (300000 * 0.18)
    ),
    totalPaise:
      Math.round(((hotel.rooms[0]?.baseRate || 1450000) * 3) * 0.9) +
      300000 +
      Math.round(((hotel.rooms[0]?.baseRate || 1450000) * 3 * 0.9 * 0.18) + (300000 * 0.18)),
    paymentMethod: "UPI",
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
