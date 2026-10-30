"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { SAMPLE_ADDONS } from "@/lib/sample-data";
import { formatDateLabel, formatINR } from "@/lib/pricing";

const PAYMENT_METHODS = [
  {
    id: "upi" as const,
    label: "UPI",
    note: "Google Pay, PhonePe, Paytm, BHIM",
    info: "You will approve the payment in your UPI app. The request stays open for 5 minutes.",
  },
  {
    id: "card" as const,
    label: "Credit or debit card",
    note: "Visa, Mastercard, RuPay, Amex · EMI available",
    info: "Card details are entered on the payment gateway’s secure page, never on this site.",
  },
  {
    id: "net" as const,
    label: "Net banking",
    note: "All major Indian banks",
    info: "You will be sent to your bank to approve the payment.",
  },
  {
    id: "hotel" as const,
    label: "Pay at the hotel",
    note: "Nothing charged today",
    info: "We hold the room and you settle at check-in. Available on flexible rates only.",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    hotel,
    arrive,
    depart,
    adults,
    children: childrenCount,
    guest,
    updateGuest,
    addons,
    toggleAddon,
    paymentMethod,
    setPaymentMethod,
    pricing,
    setBookingRef,
    showToast,
  } = useBooking();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no rooms are selected, show prompt to return
  if (pricing.roomsSubtotalPaise <= 0) {
    return (
      <div className="pt-32 pb-20 wrap text-center flex flex-col items-center gap-6">
        <h1 className="disp text-[48px]">No rooms selected</h1>
        <p className="text-[17px] text-[var(--muted)]">
          Please select a room before proceeding to checkout.
        </p>
        <Link href={`/hotels/${hotel.slug}`} className="btn btn-brass">
          Choose a room
        </Link>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!guest.first.trim()) errs.first = "Enter the first name on the guest’s ID.";
    if (!guest.last.trim()) errs.last = "Enter the last name on the guest’s ID.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email.trim())) {
      errs.email = "Enter an email so we can send your confirmation.";
    }
    const cleanMobile = guest.mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      errs.mobile = "Enter a 10-digit mobile number.";
    }
    if (!termsAccepted) {
      errs.terms = "Accept the hotel policies to continue.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("A few details need your attention.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Pay at hotel flow
      if (paymentMethod === "hotel") {
        const res = await fetch("/api/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelId: hotel.id,
            checkIn: arrive,
            checkOut: depart,
            nights: pricing.nights,
            adults,
            children: childrenCount,
            guest,
            subtotalPaise: pricing.roomsSubtotalPaise,
            discountPaise: pricing.directDiscountPaise,
            addonTotalPaise: pricing.addonsSubtotalPaise,
            gstPaise: pricing.totalGstPaise,
            totalPaise: pricing.grandTotalPaise,
            paymentMethod: "hotel",
          }),
        });

        const data = await res.json();
        if (data.reference) {
          setBookingRef(data.reference);
          router.push(`/booking/${data.reference}`);
        } else {
          showToast(data.error || "Failed to confirm booking.");
        }
        return;
      }

      // 2. Online Payment via Razorpay
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaise: pricing.grandTotalPaise,
          reference: `TRH-${hotel.city.slice(0, 3).toUpperCase()}-${Math.floor(40000 + Math.random() * 9999)}`,
          hotelName: hotel.name,
        }),
      });

      const orderData = await orderRes.json();

      // Check if Razorpay JS SDK is loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayInstance = (window as any).Razorpay;

      if (!RazorpayInstance || orderData.simulated) {
        // Fallback or demo mode test completion
        const finalizeRes = await fetch("/api/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelId: hotel.id,
            checkIn: arrive,
            checkOut: depart,
            nights: pricing.nights,
            adults,
            children: childrenCount,
            guest,
            subtotalPaise: pricing.roomsSubtotalPaise,
            discountPaise: pricing.directDiscountPaise,
            addonTotalPaise: pricing.addonsSubtotalPaise,
            gstPaise: pricing.totalGstPaise,
            totalPaise: pricing.grandTotalPaise,
            paymentMethod,
            razorpayOrderId: orderData.id,
            razorpayPaymentId: `pay_demo_${Date.now()}`,
            razorpaySignature: "demo_sig",
          }),
        });

        const finalizeData = await finalizeRes.json();
        if (finalizeData.reference) {
          setBookingRef(finalizeData.reference);
          router.push(`/booking/${finalizeData.reference}`);
        } else {
          showToast("Failed to finalize booking.");
        }
        return;
      }

      // Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: "INR",
        name: "Terraa Hotels",
        description: `Stay at ${hotel.name}`,
        image: "/img/mark.png",
        order_id: orderData.id,
        prefill: {
          name: `${guest.first} ${guest.last}`,
          email: guest.email,
          contact: guest.mobile,
        },
        theme: {
          color: "#0E1411",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/bookings/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelId: hotel.id,
              checkIn: arrive,
              checkOut: depart,
              nights: pricing.nights,
              adults,
              children: childrenCount,
              guest,
              subtotalPaise: pricing.roomsSubtotalPaise,
              discountPaise: pricing.directDiscountPaise,
              addonTotalPaise: pricing.addonsSubtotalPaise,
              gstPaise: pricing.totalGstPaise,
              totalPaise: pricing.grandTotalPaise,
              paymentMethod,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.reference) {
            setBookingRef(verifyData.reference);
            router.push(`/booking/${verifyData.reference}`);
          } else {
            showToast("Payment confirmation failed.");
          }
        },
      };

      const rzp = new RazorpayInstance(options);
      rzp.open();
    } catch (err: unknown) {
      console.error("Checkout submission failed:", err);
      showToast("Something went wrong with the reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ctaText =
    paymentMethod === "hotel"
      ? "Confirm · pay at hotel"
      : paymentMethod === "net"
      ? "Continue to your bank"
      : `Pay ${formatINR(pricing.grandTotalPaise)} ${paymentMethod === "upi" ? "with UPI" : "by card"}`;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="pt-24 max-[900px]:pt-20">
        <div className="wrap pt-16 pb-[120px] flex flex-wrap gap-18 max-[900px]:gap-12 items-start">
          {/* Left Form Column */}
          <form
            onSubmit={handleSubmit}
            className="flex-[999_1_600px] min-w-0 flex flex-col gap-16"
            noValidate
            aria-label="Guest details and payment"
          >
            {/* Step Breadcrumb Header */}
            <div className="flex flex-col gap-4.5">
              <ol className="cap m-0 p-0 list-none flex gap-4.5 flex-wrap text-[11px] text-[var(--muted)]">
                <li className="text-[var(--green)]">1 · Room ✓</li>
                <li aria-current="step" className="text-[var(--ink)] font-medium">
                  2 · Details &amp; payment
                </li>
                <li>3 · Confirmed</li>
              </ol>
              <h1 className="disp text-[clamp(42px,4.6vw,68px)] font-light leading-none m-0">
                Tell us who’s arriving.
              </h1>
            </div>

            {/* Guest Details Fields */}
            <section className="flex flex-col gap-7">
              <h2 className="cap text-[12px] m-0 text-[var(--ink)]">Guest details</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-9 gap-y-7">
                {/* Title */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">Title</span>
                  <select
                    value={guest.title}
                    onChange={(e) => updateGuest("title", e.target.value)}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)] cursor-pointer"
                  >
                    {["Ms", "Mr", "Mrs", "Dr"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                {/* First Name */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">First name</span>
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={guest.first}
                    onChange={(e) => {
                      updateGuest("first", e.target.value);
                      if (errors.first) setErrors((prev) => ({ ...prev, first: "" }));
                    }}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)]"
                  />
                  <span className="text-[12px] text-[#9A3B2A] min-h-[16px]">
                    {errors.first}
                  </span>
                </label>

                {/* Last Name */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">Last name</span>
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={guest.last}
                    onChange={(e) => {
                      updateGuest("last", e.target.value);
                      if (errors.last) setErrors((prev) => ({ ...prev, last: "" }));
                    }}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)]"
                  />
                  <span className="text-[12px] text-[#9A3B2A] min-h-[16px]">
                    {errors.last}
                  </span>
                </label>

                {/* Email */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={guest.email}
                    onChange={(e) => {
                      updateGuest("email", e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)]"
                  />
                  <span className="text-[12px] text-[#9A3B2A] min-h-[16px]">
                    {errors.email}
                  </span>
                </label>

                {/* Mobile */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">
                    Mobile · WhatsApp updates
                  </span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={guest.mobile}
                    onChange={(e) => {
                      updateGuest("mobile", e.target.value);
                      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: "" }));
                    }}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)]"
                  />
                  <span className="text-[12px] text-[#9A3B2A] min-h-[16px]">
                    {errors.mobile}
                  </span>
                </label>

                {/* Arrival Time */}
                <label className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--muted)]">Arrival time</span>
                  <select
                    value={guest.arrival}
                    onChange={(e) => updateGuest("arrival", e.target.value)}
                    className="fld h-[54px] border-0 border-b border-[#B9AF9C] bg-transparent p-0 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)] cursor-pointer"
                  >
                    {[
                      "2 – 4 PM",
                      "Before 2 PM (early check-in)",
                      "4 – 8 PM",
                      "After 8 PM",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Special Note */}
              <label className="flex flex-col gap-1">
                <span className="cap text-[11px] text-[var(--muted)]">
                  A note for the hotel (optional)
                </span>
                <textarea
                  rows={2}
                  value={guest.note}
                  onChange={(e) => updateGuest("note", e.target.value)}
                  placeholder="Anniversary, high floor, dietary needs…"
                  className="fld border-0 border-b border-[#B9AF9C] bg-transparent py-2.5 disp text-[22px] text-[var(--ink)] outline-none focus:border-b-[var(--brass-text)] resize-y"
                />
              </label>
            </section>

            {/* Enhance Your Stay (Add-ons) */}
            <section className="flex flex-col gap-5.5">
              <h2 className="cap text-[12px] m-0 text-[var(--ink)]">Enhance your stay</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4.5">
                {SAMPLE_ADDONS.map((a) => {
                  const isAdded = !!addons[a.code];
                  return (
                    <button
                      key={a.code}
                      type="button"
                      onClick={() => toggleAddon(a.code)}
                      aria-pressed={isAdded}
                      className={`p-0 border text-left flex flex-col cursor-pointer transition-all duration-300 ${
                        isAdded
                          ? "border-[var(--brass-text)] bg-[var(--card)]"
                          : "border-[var(--line)] bg-transparent hover:border-[#B9AF9C]"
                      }`}
                    >
                      <div className="h-[150px] overflow-hidden relative w-full">
                        <Image
                          src={a.imageUrl}
                          alt={a.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4.5 flex flex-col gap-1.5 flex-1 justify-between">
                        <div>
                          <span className="disp text-[24px] leading-tight block">
                            {a.name}
                          </span>
                          <span className="text-[13px] text-[var(--muted)]">
                            {a.priceDisplay}
                          </span>
                        </div>
                        <span
                          className={`cap text-[11px] mt-1.5 ${
                            isAdded ? "text-[var(--green)]" : "text-[var(--brass-text)]"
                          }`}
                        >
                          {isAdded ? "Added ✓" : "Add to stay"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Payment Method Selector */}
            <section className="flex flex-col gap-5.5">
              <h2 className="cap text-[12px] m-0 text-[var(--ink)]">Payment</h2>
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="border-t border-[var(--line)]"
              >
                {PAYMENT_METHODS.map((p) => {
                  const isSelected = p.id === paymentMethod;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setPaymentMethod(p.id)}
                      className={`min-h-[76px] border-0 border-b border-[var(--line)] bg-transparent p-0 flex items-center gap-5 text-left cursor-pointer w-full transition-colors ${
                        isSelected ? "text-[var(--ink)]" : "text-[var(--muted)]"
                      }`}
                    >
                      <span className="flex-none w-5.5 h-5.5 rounded-full border border-[var(--ink)] flex items-center justify-center">
                        <i
                          className={`w-3 h-3 rounded-full transition-colors ${
                            isSelected ? "bg-[var(--brass-text)]" : "bg-transparent"
                          }`}
                        />
                      </span>
                      <span className="flex-1 flex flex-col gap-0.5">
                        <b className="disp text-[26px] font-normal text-[var(--ink)]">
                          {p.label}
                        </b>
                        <span className="text-[13px] text-[var(--muted)]">
                          {p.note}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="m-0 text-[14px] leading-[1.7] font-light text-[var(--muted)]">
                {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.info}
              </p>
            </section>
          </form>

          {/* Right Column: Sticky Booking Summary */}
          <aside
            className="flex-1 basis-[360px] min-w-0 sticky top-24 max-[900px]:static max-[900px]:basis-full bg-[var(--forest)] text-[var(--ivory)] p-0 shadow-2xl"
            aria-label="Booking summary"
          >
            {/* Hotel Thumbnail Header */}
            <div className="h-[220px] relative overflow-hidden">
              <Image
                src={hotel.images[0]?.url || "/img/hero-palace.jpg"}
                alt={hotel.name}
                fill
                sizes="360px"
                className="object-cover"
                priority
              />
              <span className="cap absolute left-5 bottom-4 text-[11px] text-[var(--ivory)] z-2 text-shadow">
                {hotel.name}
              </span>
              <div className="scrim-b pointer-events-none" />
            </div>

            {/* Summary Details */}
            <div className="p-7.5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="cap text-[11px] text-[var(--gold)]">
                  {hotel.city} · {hotel.state}
                </span>
                <span className="disp text-[34px] leading-tight font-normal">
                  {hotel.name}
                </span>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-4 text-[14px] font-light">
                <div className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--dmuted2)]">Arrive</span>
                  <span>{formatDateLabel(arrive)} · 2 PM</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="cap text-[11px] text-[var(--dmuted2)]">Depart</span>
                  <span>{formatDateLabel(depart)} · 11 AM</span>
                </div>
              </div>

              <div className="h-[1px] bg-[rgba(243,238,229,0.2)]" />

              {/* Itemized Lines */}
              <div className="flex flex-col gap-3 text-[14px] font-light tabular-nums">
                {pricing.lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between gap-3">
                    <span className="text-[var(--dmuted)]">{l.label}</span>
                    <span>{formatINR(l.amountPaise)}</span>
                  </div>
                ))}

                {pricing.directDiscountPaise > 0 && (
                  <div className="flex justify-between gap-3 text-[var(--gold)]">
                    <span>Book-direct · 10% off rooms</span>
                    <span>−{formatINR(pricing.directDiscountPaise)}</span>
                  </div>
                )}

                {/* Add-ons line items */}
                {SAMPLE_ADDONS.filter((a) => addons[a.code]).map((a) => (
                  <div key={a.code} className="flex justify-between gap-3">
                    <span className="text-[var(--dmuted)]">{a.name}</span>
                    <span>{formatINR(a.pricePaise)}</span>
                  </div>
                ))}

                <div className="flex justify-between gap-3">
                  <span className="text-[var(--dmuted)]">GST</span>
                  <span>{formatINR(pricing.totalGstPaise)}</span>
                </div>

                <div className="h-[1px] bg-[rgba(243,238,229,0.2)] my-1" />

                <div className="flex justify-between items-baseline">
                  <span className="cap text-[11px]">Total</span>
                  <span className="disp text-[40px] leading-none animate-[tick_0.45s_ease]">
                    {formatINR(pricing.grandTotalPaise)}
                  </span>
                </div>

                <span className="text-[13px] text-[var(--dmuted2)]">
                  {paymentMethod === "hotel"
                    ? `Pay ${formatINR(pricing.grandTotalPaise)} at check-in.`
                    : "Charged now in full."}
                </span>
              </div>

              {/* Terms Checkbox */}
              <label
                htmlFor="terms"
                className="flex gap-3 items-start text-[13px] leading-[1.6] font-light text-[var(--dmuted)] cursor-pointer"
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                  className="w-4.5 h-4.5 accent-[var(--brass)] flex-none mt-0.5 cursor-pointer"
                />
                <span>
                  I accept the hotel policies and the cancellation terms of this rate.
                </span>
              </label>
              {errors.terms && (
                <span className="text-[12px] text-[#F2C6B4] -mt-3">
                  {errors.terms}
                </span>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-brass w-full mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Processing…" : ctaText}
              </button>

              <span className="text-[13px] font-light text-[var(--dmuted2)] text-center">
                Secure 256-bit encrypted reservation
              </span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
