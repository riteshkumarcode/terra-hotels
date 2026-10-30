"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SAMPLE_HOTELS, SampleHotel } from "@/lib/sample-data";
import { formatINR } from "@/lib/pricing";

interface AdminBookingRecord {
  reference: string;
  hotelName: string;
  cityName: string;
  guestName: string;
  email: string;
  mobile: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPaise: number;
  status: "CONFIRMED" | "CANCELLED" | "REFUND_REQUESTED" | "REFUNDED";
  paymentMethod: string;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  createdAt: string;
}

const INITIAL_BOOKINGS: AdminBookingRecord[] = [
  {
    reference: "TRH-UDR-48291",
    hotelName: "Terraa Lake Palace",
    cityName: "Udaipur",
    guestName: "Aadya Sharma",
    email: "aadya@example.com",
    mobile: "+91 98765 43210",
    checkIn: "2026-11-13",
    checkOut: "2026-11-16",
    nights: 3,
    totalPaise: 4284000,
    status: "CONFIRMED",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    createdAt: "2026-10-30",
  },
  {
    reference: "TRH-JAI-41092",
    hotelName: "Terraa Hawa Haveli",
    cityName: "Jaipur",
    guestName: "Rohit Varma",
    email: "rohit.v@example.com",
    mobile: "+91 91234 56789",
    checkIn: "2026-11-20",
    checkOut: "2026-11-22",
    nights: 2,
    totalPaise: 1840000,
    status: "CONFIRMED",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    createdAt: "2026-10-29",
  },
  {
    reference: "TRH-KUM-45812",
    hotelName: "Terraa Backwaters",
    cityName: "Kumarakom",
    guestName: "Elena Rostova",
    email: "elena@example.com",
    mobile: "+91 94567 89012",
    checkIn: "2026-12-05",
    checkOut: "2026-12-08",
    nights: 3,
    totalPaise: 3720000,
    status: "REFUND_REQUESTED",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    createdAt: "2026-10-28",
  },
  {
    reference: "TRH-GOA-49210",
    hotelName: "Terraa Baga Shores",
    cityName: "Goa",
    guestName: "Karan Johar",
    email: "karan@example.com",
    mobile: "+91 99887 76655",
    checkIn: "2026-12-14",
    checkOut: "2026-12-17",
    nights: 3,
    totalPaise: 3240000,
    status: "CONFIRMED",
    paymentMethod: "HOTEL",
    paymentStatus: "UNPAID",
    createdAt: "2026-10-27",
  },
];

const INITIAL_PROMOS = [
  { code: "TERRAA10", discountPercent: 10, minNights: 1, active: true },
  { code: "SUITE20", discountPercent: 20, minNights: 2, active: true },
  { code: "DIRECT500", discountFlatPaise: 50000, minNights: 1, active: true },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "hotels" | "inventory" | "offers">("bookings");
  const [bookings, setBookings] = useState<AdminBookingRecord[]>(INITIAL_BOOKINGS);
  const [hotels, setHotels] = useState<SampleHotel[]>(SAMPLE_HOTELS);
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRecord | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.reference.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.mobile.includes(q) ||
      b.hotelName.toLowerCase().includes(q)
    );
  });

  // Action handlers
  const handleCancelBooking = (ref: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.reference === ref ? { ...b, status: "CANCELLED" } : b))
    );
    if (selectedBooking?.reference === ref) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
    }
  };

  const handleFlagRefund = (ref: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.reference === ref ? { ...b, status: "REFUND_REQUESTED" } : b))
    );
    if (selectedBooking?.reference === ref) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: "REFUND_REQUESTED" } : null));
    }
  };

  const handleApproveRefund = (ref: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.reference === ref ? { ...b, status: "REFUNDED", paymentStatus: "REFUNDED" } : b
      )
    );
    if (selectedBooking?.reference === ref) {
      setSelectedBooking((prev) =>
        prev ? { ...prev, status: "REFUNDED", paymentStatus: "REFUNDED" } : null
      );
    }
  };

  const handleUpdatePrice = (hotelId: string, newPriceRupees: number) => {
    setHotels((prev) =>
      prev.map((h) =>
        h.id === hotelId ? { ...h, basePrice: newPriceRupees * 100 } : h
      )
    );
  };

  const totalRevenuePaise = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + b.totalPaise, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* KPI Cards Overview */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-5">
        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.1)] flex flex-col gap-2">
          <span className="cap text-[11px] text-[var(--gold)]">Total Bookings</span>
          <span className="disp text-[36px] font-normal">{bookings.length}</span>
          <span className="text-[12px] text-[var(--dmuted)]">Active reservations</span>
        </div>

        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.1)] flex flex-col gap-2">
          <span className="cap text-[11px] text-[var(--gold)]">Confirmed Revenue</span>
          <span className="disp text-[36px] font-normal">{formatINR(totalRevenuePaise)}</span>
          <span className="text-[12px] text-[var(--green)]">↑ 18% direct bookings</span>
        </div>

        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.1)] flex flex-col gap-2">
          <span className="cap text-[11px] text-[var(--gold)]">Active Properties</span>
          <span className="disp text-[36px] font-normal">{hotels.length}</span>
          <span className="text-[12px] text-[var(--dmuted)]">8 cities across India</span>
        </div>

        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.1)] flex flex-col gap-2">
          <span className="cap text-[11px] text-[var(--gold)]">Total Rooms</span>
          <span className="disp text-[36px] font-normal">
            {hotels.reduce((sum, h) => sum + h.totalRooms, 0)}
          </span>
          <span className="text-[12px] text-[var(--dmuted)]">Live inventory</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 border-b border-[rgba(243,238,229,0.15)] pb-1">
        {[
          ["bookings", "Bookings & Refunds"],
          ["hotels", "Hotels & Room Tariffs"],
          ["inventory", "Daily Inventory Matrix"],
          ["offers", "Promo Codes & Offers"],
        ].map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey as typeof activeTab)}
            className={`pb-3 px-2 border-b-2 cap text-[12px] tracking-[0.16em] cursor-pointer transition-colors ${
              activeTab === tabKey
                ? "border-[var(--brass)] text-[var(--gold)] font-medium"
                : "border-transparent text-[var(--dmuted)] hover:text-[var(--ivory)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by reference, guest name, email, or mobile…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-[480px] h-12 bg-[var(--forest2)] border border-[rgba(243,238,229,0.2)] px-4 text-[14px] text-[var(--ivory)] outline-none focus:border-[var(--gold)]"
            />
            <div className="flex gap-3">
              <a
                href="/api/admin/bookings/export"
                download
                className="btn btn-brass !min-h-[44px] !px-5 !text-[11px]"
              >
                Download CSV
              </a>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto border border-[rgba(243,238,229,0.15)] bg-[var(--forest2)]">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[rgba(243,238,229,0.15)] bg-[#142019] text-[var(--dmuted2)] cap text-[11px]">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Hotel</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.reference}
                    className="border-b border-[rgba(243,238,229,0.08)] hover:bg-[rgba(243,238,229,0.03)] transition-colors"
                  >
                    <td className="p-4 font-['Marcellus',serif] text-[var(--gold)]">
                      {b.reference}
                    </td>
                    <td className="p-4">
                      {b.hotelName}
                      <span className="block text-[12px] text-[var(--dmuted)]">{b.cityName}</span>
                    </td>
                    <td className="p-4">
                      {b.guestName}
                      <span className="block text-[12px] text-[var(--dmuted)]">{b.mobile}</span>
                    </td>
                    <td className="p-4 text-[13px]">
                      {b.checkIn} to {b.checkOut}
                      <span className="block text-[11px] text-[var(--dmuted)]">
                        {b.nights} {b.nights > 1 ? "nights" : "night"}
                      </span>
                    </td>
                    <td className="p-4 tabular-nums font-medium">
                      {formatINR(b.totalPaise)}
                      <span className="block text-[11px] text-[var(--dmuted)]">
                        {b.paymentMethod} · {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] cap rounded ${
                          b.status === "CONFIRMED"
                            ? "bg-[rgba(47,93,78,0.2)] text-[#57B093] border border-[#2F5D4E]"
                            : b.status === "REFUND_REQUESTED"
                            ? "bg-[rgba(184,149,90,0.2)] text-[var(--gold)] border border-[var(--brass)]"
                            : b.status === "REFUNDED"
                            ? "bg-[rgba(169,162,150,0.2)] text-[var(--dmuted)]"
                            : "bg-[rgba(154,59,42,0.2)] text-[#F2C6B4] border border-[#9A3B2A]"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 text-[11px] border border-[rgba(243,238,229,0.3)] bg-transparent text-[var(--ivory)] cursor-pointer hover:border-[var(--ivory)]"
                        >
                          View
                        </button>
                        {b.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => handleFlagRefund(b.reference)}
                            className="px-2.5 py-1 text-[11px] border border-[var(--brass)] text-[var(--gold)] bg-transparent cursor-pointer hover:bg-[var(--brass)] hover:text-[var(--forest)]"
                          >
                            Flag Refund
                          </button>
                        )}
                        {b.status === "REFUND_REQUESTED" && (
                          <button
                            type="button"
                            onClick={() => handleApproveRefund(b.reference)}
                            className="px-2.5 py-1 text-[11px] border border-[#2F5D4E] text-[#57B093] bg-transparent cursor-pointer hover:bg-[#2F5D4E] hover:text-[var(--ivory)]"
                          >
                            Approve Refund
                          </button>
                        )}
                        {b.status !== "CANCELLED" && b.status !== "REFUNDED" && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.reference)}
                            className="px-2.5 py-1 text-[11px] border border-[#9A3B2A] text-[#F2C6B4] bg-transparent cursor-pointer hover:bg-[#9A3B2A] hover:text-[var(--ivory)]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HOTELS & ROOMS */}
      {activeTab === "hotels" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-6">
            {hotels.map((h) => (
              <div
                key={h.id}
                className="bg-[var(--forest2)] border border-[rgba(243,238,229,0.15)] p-6 flex flex-col gap-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 relative overflow-hidden flex-none">
                    <Image
                      src={h.images[0]?.url || "/img/hero-palace.jpg"}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="cap text-[10px] text-[var(--gold)]">
                      {h.city} · {h.state}
                    </span>
                    <h3 className="disp text-[24px] font-normal leading-tight m-0">
                      {h.name}
                    </h3>
                    <span className="text-[13px] text-[var(--dmuted)]">
                      {h.totalRooms} total rooms · {h.rating} ★ ({h.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="border-t border-[rgba(243,238,229,0.1)] pt-3 flex flex-col gap-2">
                  <span className="cap text-[11px] text-[var(--dmuted2)]">
                    Base Nightly Tariff (INR)
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      defaultValue={h.basePrice / 100}
                      onBlur={(e) => handleUpdatePrice(h.id, +e.target.value)}
                      className="w-36 h-10 bg-[#0E1411] border border-[rgba(243,238,229,0.3)] px-3 text-[16px] text-[var(--ivory)] outline-none focus:border-[var(--gold)] font-mono"
                    />
                    <span className="text-[12px] text-[var(--dmuted)]">
                      Applied across flexible &amp; advance rate formulas
                    </span>
                  </div>
                </div>

                {/* Rooms List */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(243,238,229,0.1)]">
                  <span className="cap text-[11px] text-[var(--dmuted2)]">Room Types</span>
                  {h.rooms.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center text-[13px] py-1 border-b border-[rgba(243,238,229,0.06)]"
                    >
                      <span>{r.name}</span>
                      <span className="text-[var(--gold)] tabular-nums">
                        {formatINR(r.baseRate)} ({r.inventory} rooms)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY MATRIX */}
      {activeTab === "inventory" && (
        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.15)] flex flex-col gap-5">
          <div>
            <h3 className="disp text-[28px] font-normal m-0">Daily Availability Calendar</h3>
            <p className="text-[13px] text-[var(--dmuted)] m-0">
              Real-time room inventory and booked counts across the next 14 days.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[rgba(243,238,229,0.15)] text-[var(--dmuted2)] cap text-[10px]">
                  <th className="p-3">Hotel &amp; Room</th>
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const d = new Date();
                    d.setDate(d.getDate() + idx);
                    return (
                      <th key={idx} className="p-3 text-center">
                        {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {hotels.slice(0, 4).map((h) => (
                  <React.Fragment key={h.id}>
                    <tr className="bg-[rgba(243,238,229,0.04)] font-medium text-[var(--gold)]">
                      <td colSpan={8} className="p-2.5">
                        {h.name} ({h.city})
                      </td>
                    </tr>
                    {h.rooms.map((r) => (
                      <tr key={r.id} className="border-b border-[rgba(243,238,229,0.06)]">
                        <td className="p-3 pl-6">{r.name}</td>
                        {Array.from({ length: 7 }).map((_, idx) => (
                          <td key={idx} className="p-3 text-center">
                            <span className="px-2 py-1 bg-[rgba(47,93,78,0.25)] text-[#57B093] rounded text-[12px] font-mono">
                              {Math.max(1, r.inventory - (idx % 2))} left
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OFFERS & PROMO CODES */}
      {activeTab === "offers" && (
        <div className="bg-[var(--forest2)] p-6 border border-[rgba(243,238,229,0.15)] flex flex-col gap-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h3 className="disp text-[28px] font-normal m-0">Promo Codes &amp; Seasonal Offers</h3>
              <p className="text-[13px] text-[var(--dmuted)] m-0">
                Active promotional vouchers applied at checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const code = prompt("Enter new promo code (e.g. FESTIVE15):");
                if (code) {
                  setPromos((prev) => [
                    ...prev,
                    { code: code.toUpperCase(), discountPercent: 15, minNights: 1, active: true },
                  ]);
                }
              }}
              className="btn btn-brass !min-h-[40px] !px-4 !text-[11px]"
            >
              + Add Promo Code
            </button>
          </div>

          <div className="overflow-x-auto border border-[rgba(243,238,229,0.1)]">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(243,238,229,0.15)] bg-[#142019] text-[var(--dmuted2)] cap text-[11px]">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min. Nights</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.code} className="border-b border-[rgba(243,238,229,0.08)]">
                    <td className="p-4 font-mono font-medium text-[var(--gold)]">{p.code}</td>
                    <td className="p-4">
                      {p.discountPercent ? `${p.discountPercent}% Off` : `₹500 Flat Off`}
                    </td>
                    <td className="p-4">{p.minNights} nights</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[11px] rounded ${
                          p.active ? "bg-[#2F5D4E]/20 text-[#57B093]" : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {p.active ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setPromos((prev) =>
                            prev.map((item) =>
                              item.code === p.code ? { ...item, active: !item.active } : item
                            )
                          )
                        }
                        className="px-3 py-1 text-[11px] border border-[rgba(243,238,229,0.2)] bg-transparent text-[var(--ivory)] cursor-pointer hover:border-[var(--ivory)]"
                      >
                        {p.active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-80 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-[var(--forest2)] border border-[rgba(243,238,229,0.2)] p-8 max-w-[560px] w-full flex flex-col gap-5 text-[var(--ivory)] shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="cap text-[11px] text-[var(--gold)]">Reservation Details</span>
                <h3 className="disp text-[28px] font-normal leading-tight m-0">
                  {selectedBooking.reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full border-0 bg-transparent text-[var(--ivory)] text-[20px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[14px] border-y border-[rgba(243,238,229,0.1)] py-4">
              <div>
                <strong className="text-[var(--dmuted)]">Hotel:</strong>
                <div>{selectedBooking.hotelName}</div>
              </div>
              <div>
                <strong className="text-[var(--dmuted)]">Guest:</strong>
                <div>{selectedBooking.guestName}</div>
              </div>
              <div>
                <strong className="text-[var(--dmuted)]">Contact:</strong>
                <div>{selectedBooking.mobile}</div>
                <div className="text-[12px] text-[var(--dmuted)]">{selectedBooking.email}</div>
              </div>
              <div>
                <strong className="text-[var(--dmuted)]">Dates:</strong>
                <div>
                  {selectedBooking.checkIn} to {selectedBooking.checkOut}
                </div>
              </div>
              <div>
                <strong className="text-[var(--dmuted)]">Total Tariff:</strong>
                <div className="font-medium text-[var(--gold)]">
                  {formatINR(selectedBooking.totalPaise)}
                </div>
              </div>
              <div>
                <strong className="text-[var(--dmuted)]">Payment:</strong>
                <div>
                  {selectedBooking.paymentMethod} ({selectedBooking.paymentStatus})
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-3 pt-2">
              <a
                href={`/booking/${selectedBooking.reference}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost !min-h-[40px] !px-4 !text-[11px]"
              >
                View Tax Invoice
              </a>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="btn btn-brass !min-h-[40px] !px-6 !text-[11px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
