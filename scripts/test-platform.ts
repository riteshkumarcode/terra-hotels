import { calculatePricing, getRoomGstRate, formatINR } from "../src/lib/pricing";

async function runTests() {
  console.log("==================================================");
  console.log("TERRAA HOTELS — Automated Verification Suite");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // 1. GST Tier Calculation Test
  console.log("--- 1. Testing GST & Pricing Engine ---");

  // Under ₹7,500
  const rateUnder7500 = 690000; // ₹6,900 in paise
  const gstUnder = getRoomGstRate(rateUnder7500);
  assert(gstUnder === 0.05, "GST Rate for room <= ₹7,500 must be 5%", `Expected 0.05, got ${gstUnder}`);

  // Over ₹7,500
  const rateOver7500 = 1450000; // ₹14,500 in paise
  const gstOver = getRoomGstRate(rateOver7500);
  assert(gstOver === 0.18, "GST Rate for room > ₹7,500 must be 18%", `Expected 0.18, got ${gstOver}`);

  // Comprehensive Stay Calculation (10% direct discount + GST tiers + Addon)
  const stay = calculatePricing({
    arriveDate: "2026-11-13",
    departDate: "2026-11-16", // 3 nights
    rooms: [
      {
        roomId: "palace",
        roomName: "Palace Room",
        planType: "flex",
        planName: "Flexible",
        nightlyRatePaise: 1450000, // ₹14,500
        quantity: 1,
      },
    ],
    addons: [
      {
        id: "boat",
        name: "Sunset boat ride",
        pricePaise: 300000, // ₹3,000
      },
    ],
    applyDirectDiscount: true,
  });

  // Base rooms = 14,500 * 3 = ₹43,500 (4,350,000 paise)
  assert(stay.roomsSubtotalPaise === 4350000, "Room subtotal matches 3 nights @ ₹14,500");

  // 10% direct discount = ₹4,350 (435,000 paise)
  assert(stay.directDiscountPaise === 435000, "Direct booking discount is exactly 10%");

  // Discounted room = ₹39,150 (3,915,000 paise). Nightly rate after discount = ₹13,050 > ₹7,500 -> 18% GST = ₹7,047 (704,700 paise)
  assert(stay.roomsGstPaise === 704700, "18% GST applies to discounted room tariff above ₹7,500", `Got ${stay.roomsGstPaise}`);

  // Addon = ₹3,000 + 18% GST = ₹540 (54,000 paise)
  assert(stay.addonsGstPaise === 54000, "18% GST applies to add-ons", `Got ${stay.addonsGstPaise}`);

  // Total GST = ₹7,047 + ₹540 = ₹7,587 (758,700 paise)
  assert(stay.totalGstPaise === 758700, "Total GST combined matches", `Got ${stay.totalGstPaise}`);

  // Grand Total = 39,150 + 3,000 + 7,587 = ₹49,737 (4,973,700 paise)
  assert(stay.grandTotalPaise === 4973700, "Grand total matches exact sum", `Got ${stay.grandTotalPaise}`);
  assert(formatINR(stay.grandTotalPaise) === "₹49,737", "en-IN formatting formats ₹49,737 correctly");

  // 2. HTTP Endpoints Connectivity Test
  console.log("\n--- 2. Testing HTTP Endpoints ---");
  const baseUrl = "http://localhost:3000";

  try {
    // Home page
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, "GET / (Home page returns 200 OK)");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("Terraa Hotels"), "Home page contains brand name");
    assert(homeHtml.includes("Hotel of the season"), "Home page contains Featured hotel section");
    assert(homeHtml.includes("Eight houses across India"), "Home page contains intro narrative");

    // Search page
    const searchRes = await fetch(`${baseUrl}/hotels`);
    assert(searchRes.status === 200, "GET /hotels (Search page returns 200 OK)");
    const searchHtml = await searchRes.text();
    assert(searchHtml.includes("Palaces &amp; havelis") || searchHtml.includes("Palaces & havelis"), "Search page contains filter chips");
    assert(searchHtml.includes("Interactive hotel pins"), "Search page contains map pins");

    // Hotel details page
    const hotelRes = await fetch(`${baseUrl}/hotels/terraa-lake-palace-udaipur`);
    assert(hotelRes.status === 200, "GET /hotels/terraa-lake-palace-udaipur returns 200 OK");
    const hotelHtml = await hotelRes.text();
    assert(hotelHtml.includes("Terraa Lake Palace"), "Hotel detail contains hotel name");
    assert(hotelHtml.includes("schema.org"), "Hotel detail includes JSON-LD structured data");

    // Checkout page
    const checkoutRes = await fetch(`${baseUrl}/checkout`);
    assert(checkoutRes.status === 200, "GET /checkout returns 200 OK");

    // 3. API Booking Creation & Verification Flow
    console.log("\n--- 3. Testing Booking Creation & Confirmation Flow ---");
    const bookingPayload = {
      hotelId: "udr",
      checkIn: "2026-11-13",
      checkOut: "2026-11-16",
      nights: 3,
      adults: 2,
      children: 0,
      guest: {
        title: "Ms",
        first: "Aadya",
        last: "Sharma",
        email: "aadya@example.com",
        mobile: "+919876543210",
        arrival: "2 – 4 PM",
        note: "Lake view preferred",
      },
      rooms: [
        {
          name: "Palace Room",
          plan: "Flexible",
          qty: 1,
          nightlyRatePaise: 1450000,
        },
      ],
      subtotalPaise: stay.roomsSubtotalPaise,
      discountPaise: stay.directDiscountPaise,
      addonTotalPaise: stay.addonsSubtotalPaise,
      gstPaise: stay.totalGstPaise,
      totalPaise: stay.grandTotalPaise,
      paymentMethod: "hotel",
    };

    const createRes = await fetch(`${baseUrl}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload),
    });

    assert(createRes.status === 200, "POST /api/bookings/create returns 200 OK");
    const createData = await createRes.json();
    assert(!!createData.reference && createData.reference.startsWith("TRH-"), `Booking reference generated: ${createData.reference}`);

    // Test Confirmation Page
    const confirmRes = await fetch(`${baseUrl}/booking/${createData.reference}`);
    assert(confirmRes.status === 200, `GET /booking/${createData.reference} returns 200 OK`);

    // Test Invoice generation
    const invoiceRes = await fetch(`${baseUrl}/booking/${createData.reference}/invoice`);
    assert(invoiceRes.status === 200, "GET /booking/[ref]/invoice returns 200 OK (GST Tax Invoice)");
    const invoiceHtml = await invoiceRes.text();
    assert(invoiceHtml.includes("[YOUR GSTIN]"), "Invoice includes GSTIN placeholder");
    assert(invoiceHtml.includes("SAC 996311"), "Invoice includes SAC 996311 code");

    // Test Calendar .ics export
    const icsRes = await fetch(`${baseUrl}/booking/${createData.reference}/ics`);
    assert(icsRes.status === 200, "GET /booking/[ref]/ics returns 200 OK");
    const icsText = await icsRes.text();
    assert(icsText.includes("BEGIN:VCALENDAR"), "Calendar output contains valid iCalendar header");

    // 4. Testing Hold & Cron Release
    console.log("\n--- 4. Testing 15-Minute Inventory Hold & Scheduled Release ---");
    const holdRes = await fetch(`${baseUrl}/api/bookings/hold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomTypeId: "palace",
        checkIn: "2026-11-13",
        checkOut: "2026-11-16",
        quantity: 1,
      }),
    });
    assert(holdRes.status === 200, "POST /api/bookings/hold creates temporary hold");
    const holdData = await holdRes.json();
    assert(holdData.expiresInMinutes === 15, "Inventory hold is set for 15 minutes");

    const releaseRes = await fetch(`${baseUrl}/api/cron/release-holds`, {
      method: "POST",
    });
    assert(releaseRes.status === 200, "POST /api/cron/release-holds executes successfully");

    // 5. Admin & CSV Export Test
    console.log("\n--- 5. Testing Admin Portal & CSV Export ---");
    const adminRes = await fetch(`${baseUrl}/admin`);
    assert(adminRes.status === 200, "GET /admin returns 200 OK");

    const exportRes = await fetch(`${baseUrl}/api/admin/bookings/export`);
    assert(exportRes.status === 200, "GET /api/admin/bookings/export returns 200 OK");
    const csvContent = await exportRes.text();
    assert(csvContent.includes("Booking Reference,Hotel,City,Guest Name"), "CSV export contains standard audit header row");
  } catch (err) {
    console.error("Test error:", err);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
