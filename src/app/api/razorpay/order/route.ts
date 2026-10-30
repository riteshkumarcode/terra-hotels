import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountPaise, reference, hotelName } = body;

    if (!amountPaise || amountPaise <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live keys are not configured yet, generate a realistic test order ID
    if (!keyId || !keySecret || keyId === "rzp_test_placeholder") {
      const mockOrderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      return NextResponse.json({
        id: mockOrderId,
        amount: amountPaise,
        currency: "INR",
        receipt: reference || `TRH-RCPT-${Date.now()}`,
        simulated: true,
      });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: reference || `TRH-RCPT-${Date.now()}`,
      notes: {
        hotelName: hotelName || "Terraa Hotels",
        reference: reference || "",
      },
    });

    return NextResponse.json(order);
  } catch (err: unknown) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json(
      { error: "Could not create payment order" },
      { status: 500 }
    );
  }
}
