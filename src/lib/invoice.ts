/**
 * GST Tax Invoice generator for TERRAA HOTELS.
 */

export function generateInvoiceHtml({
  invoiceNumber,
  reference,
  date,
  hotelName,
  hotelAddress,
  guestName,
  guestEmail,
  guestMobile,
  checkIn,
  checkOut,
  nights,
  rooms,
  addons,
  subtotalPaise,
  discountPaise,
  gstPaise,
  totalPaise,
  paymentMethod,
}: {
  invoiceNumber: string;
  reference: string;
  date: string;
  hotelName: string;
  hotelAddress: string;
  guestName: string;
  guestEmail: string;
  guestMobile: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: { name: string; plan: string; qty: number; ratePaise: number }[];
  addons: { name: string; pricePaise: number }[];
  subtotalPaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
  paymentMethod: string;
}): string {
  const fmt = (p: number) => "₹" + Math.round(p / 100).toLocaleString("en-IN");

  const roomRows = rooms
    .map(
      (r) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF;">
        <strong>${r.name}</strong><br>
        <span style="font-size: 13px; color: #4F4D47;">${r.plan} · SAC 996311</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: center;">${r.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: right;">${fmt(r.ratePaise)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: right;">${fmt(r.ratePaise * r.qty * nights)}</td>
    </tr>`
    )
    .join("");

  const addonRows = addons
    .map(
      (a) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF;">
        <strong>${a.name}</strong><br>
        <span style="font-size: 13px; color: #4F4D47;">Hotel Enhancement · SAC 996331</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: center;">1</td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: right;">${fmt(a.pricePaise)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #D8CFBF; text-align: right;">${fmt(a.pricePaise)}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>GST Tax Invoice - ${reference}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; margin: 0; padding: 40px; color: #1C1F1D; background: #fff; }
    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #D8CFBF; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0E1411; padding-bottom: 20px; }
    .brand h1 { margin: 0; font-family: Georgia, serif; font-size: 28px; text-transform: uppercase; letter-spacing: 0.1em; color: #0E1411; }
    .brand p { margin: 5px 0 0; color: #B8955A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.24em; }
    .inv-details { text-align: right; font-size: 14px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 30px 0; font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th { background: #0E1411; color: #F3EEE5; padding: 12px; text-align: left; font-weight: normal; letter-spacing: 0.05em; font-size: 12px; text-transform: uppercase; }
    .totals { margin-left: auto; width: 340px; margin-top: 20px; font-size: 14px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .grand { border-top: 2px solid #0E1411; font-weight: bold; font-size: 18px; padding-top: 10px; margin-top: 6px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #D8CFBF; font-size: 12px; color: #4F4D47; text-align: center; }
    @media print {
      body { padding: 0; }
      .invoice-box { border: 0; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 20px; text-align: right;">
    <button onclick="window.print()" style="background: #0E1411; color: #F3EEE5; border: 0; padding: 10px 20px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div class="invoice-box">
    <div class="header">
      <div class="brand">
        <h1>Terraa Hotels</h1>
        <p>Tax Invoice</p>
      </div>
      <div class="inv-details">
        <strong>Invoice No:</strong> ${invoiceNumber}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Booking Ref:</strong> ${reference}<br>
        <strong>GSTIN:</strong> [YOUR GSTIN]
      </div>
    </div>

    <div class="grid2">
      <div>
        <strong style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; color: #7E5F2C;">Property / Supplier:</strong><br>
        <strong>${hotelName}</strong><br>
        ${hotelAddress}<br>
        State Code: 08 (Rajasthan) / Respective State<br>
        GSTIN: [YOUR GSTIN]
      </div>
      <div>
        <strong style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; color: #7E5F2C;">Billed To (Guest):</strong><br>
        <strong>${guestName}</strong><br>
        Email: ${guestEmail}<br>
        Mobile: ${guestMobile}<br>
        Stay: ${checkIn} to ${checkOut} (${nights} nights)
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description &amp; SAC</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate / Night</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${roomRows}
        ${addonRows}
      </tbody>
    </table>

    <div class="totals">
      <div><span>Subtotal:</span><span>${fmt(subtotalPaise)}</span></div>
      ${discountPaise > 0 ? `<div style="color: #7E5F2C;"><span>Direct Discount (10%):</span><span>−${fmt(discountPaise)}</span></div>` : ""}
      <div><span>Taxes (CGST + SGST / IGST):</span><span>${fmt(gstPaise)}</span></div>
      <div class="grand"><span>Total Amount:</span><span>${fmt(totalPaise)}</span></div>
      <div style="font-size: 12px; color: #4F4D47; margin-top: 4px;"><span>Payment Method:</span><span>${paymentMethod.toUpperCase()}</span></div>
    </div>

    <div class="footer">
      This is a computer-generated tax invoice. No signature required.<br>
      Terraa Hotels · GSTIN [YOUR GSTIN] · [RESERVATIONS PHONE]
    </div>
  </div>
</body>
</html>`;
}
