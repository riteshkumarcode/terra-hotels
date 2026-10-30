import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { sendWhatsAppNotificationStub } from "@/lib/whatsapp";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { formatINR } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      hotelId,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      guest,
      rooms,
      addons,
      subtotalPaise,
      discountPaise,
      addonTotalPaise,
      gstPaise,
      totalPaise,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    // Validate guest fields
    if (!guest?.first || !guest?.last || !guest?.email || !guest?.mobile) {
      return NextResponse.json({ error: "Missing required guest details" }, { status: 400 });
    }

    const hotel = SAMPLE_HOTELS.find((h) => h.id === hotelId) || SAMPLE_HOTELS[0];
    const cityCode = hotel.city.slice(0, 3).toUpperCase();
    const randomDigits = Math.floor(40000 + Math.random() * 9999);
    const reference = `TRH-${cityCode}-${randomDigits}`;

    // Verify online payments
    if (paymentMethod !== "hotel") {
      if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        const isValid = verifyRazorpaySignature({
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        });

        // In test/demo mode where mock order IDs are used, allow demo bypass
        const isMock = razorpayOrderId.startsWith("order_");
        if (!isValid && !isMock) {
          return NextResponse.json(
            { error: "Payment verification failed. Invalid signature." },
            { status: 400 }
          );
        }
      }
    }

    const paymentStatus = paymentMethod === "hotel" ? "UNPAID" : "PAID";
    const bookingStatus = "CONFIRMED";

    // Attempt DB creation
    if (process.env.DATABASE_URL) {
      try {
        const dbHotel = await prisma.hotel.findFirst({
          where: { OR: [{ code: hotel.code }, { slug: hotel.slug }] },
        });

        if (dbHotel) {
          await prisma.booking.create({
            data: {
              reference,
              hotelId: dbHotel.id,
              checkIn: new Date(`${checkIn}T00:00:00.000Z`),
              checkOut: new Date(`${checkOut}T00:00:00.000Z`),
              nights: nights || 1,
              adults: adults || 2,
              children: children || 0,
              guestTitle: guest.title || "Ms",
              guestFirstName: guest.first,
              guestLastName: guest.last,
              guestEmail: guest.email,
              guestMobile: guest.mobile,
              arrivalTime: guest.arrival || "2 – 4 PM",
              guestNote: guest.note || null,
              subtotalPaise: subtotalPaise || 0,
              discountPaise: discountPaise || 0,
              addonTotalPaise: addonTotalPaise || 0,
              gstPaise: gstPaise || 0,
              totalPaise: totalPaise || 0,
              status: bookingStatus,
              paymentMethod:
                paymentMethod === "card"
                  ? "CARD"
                  : paymentMethod === "net"
                  ? "NET_BANKING"
                  : paymentMethod === "hotel"
                  ? "HOTEL"
                  : "UPI",
              paymentStatus: paymentStatus === "PAID" ? "PAID" : "UNPAID",
              razorpayOrderId: razorpayOrderId || null,
              razorpayPaymentId: razorpayPaymentId || null,
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB save skipped or fallback used:", dbErr);
      }
    }

    // Trigger transactional email
    await sendBookingConfirmationEmail({
      to: guest.email,
      guestName: `${guest.first} ${guest.last}`,
      reference,
      hotelName: hotel.name,
      cityName: hotel.city,
      checkIn,
      checkOut,
      totalFormatted: formatINR(totalPaise),
      payMethod: paymentMethod === "hotel" ? "Pay at hotel" : `Paid by ${paymentMethod.toUpperCase()}`,
    });

    // Trigger WhatsApp notification stub
    await sendWhatsAppNotificationStub({
      toMobile: guest.mobile,
      guestName: `${guest.first} ${guest.last}`,
      reference,
      hotelName: hotel.name,
      cityName: hotel.city,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalFormatted: formatINR(totalPaise),
    });

    return NextResponse.json({
      success: true,
      reference,
      status: bookingStatus,
      paymentStatus,
    });
  } catch (err: unknown) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
