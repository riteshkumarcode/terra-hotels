import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/db";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { sendWhatsAppNotificationStub } from "@/lib/whatsapp";
import { formatINR } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature({
        payload: rawBody,
        signature,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    // Idempotent processing of payment.captured or order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        try {
          const booking = await prisma.booking.findFirst({
            where: { razorpayOrderId: orderId },
            include: { hotel: true },
          });

          if (booking && booking.status !== "CONFIRMED") {
            // Update to confirmed
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                status: "CONFIRMED",
                paymentStatus: "PAID",
                razorpayPaymentId: paymentId || booking.razorpayPaymentId,
              },
            });

            // Send confirmation email
            await sendBookingConfirmationEmail({
              to: booking.guestEmail,
              guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
              reference: booking.reference,
              hotelName: booking.hotel.name,
              cityName: booking.hotel.city,
              checkIn: booking.checkIn.toISOString().slice(0, 10),
              checkOut: booking.checkOut.toISOString().slice(0, 10),
              totalFormatted: formatINR(booking.totalPaise),
              payMethod: booking.paymentMethod,
            });

            // Log WhatsApp notification
            await sendWhatsAppNotificationStub({
              toMobile: booking.guestMobile,
              guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
              reference: booking.reference,
              hotelName: booking.hotel.name,
              cityName: booking.hotel.city,
              checkInDate: booking.checkIn.toISOString().slice(0, 10),
              checkOutDate: booking.checkOut.toISOString().slice(0, 10),
              totalFormatted: formatINR(booking.totalPaise),
            });
          }
        } catch (dbErr) {
          console.warn("Webhook DB update skipped (DB not connected or local mock):", dbErr);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
