import { Resend } from "resend";

export async function sendBookingConfirmationEmail({
  to,
  guestName,
  reference,
  hotelName,
  cityName,
  checkIn,
  checkOut,
  totalFormatted,
  payMethod,
}: {
  to: string;
  guestName: string;
  reference: string;
  hotelName: string;
  cityName: string;
  checkIn: string;
  checkOut: string;
  totalFormatted: string;
  payMethod: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[RESEND STUB] Confirmation email simulated for ${to} (Booking: ${reference})`);
    return { success: true, simulated: true };
  }

  try {
    const resend = new Resend(apiKey);
    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1C1F1D; background: #F3EEE5; padding: 40px; border: 1px solid #D8CFBF;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0E1411; margin: 0; font-size: 28px; letter-spacing: 0.1em; text-transform: uppercase;">Terraa Hotels</h1>
          <p style="color: #B8955A; text-transform: uppercase; letter-spacing: 0.24em; font-size: 11px; margin-top: 6px;">Reservation Confirmed</p>
        </div>

        <p style="font-size: 18px; line-height: 1.6;">Dear ${guestName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4F4D47;">
          Your reservation at <strong>${hotelName}</strong> in ${cityName} is confirmed. Our front desk will message you the day before to plan your arrival.
        </p>

        <div style="background: #FBF8F2; border: 1px solid #D8CFBF; padding: 24px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0; color: #4F4D47;">Booking Reference:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; letter-spacing: 0.08em;">${reference}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4F4D47;">Check-in:</td>
              <td style="padding: 8px 0; text-align: right;">${checkIn} (2:00 PM)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4F4D47;">Check-out:</td>
              <td style="padding: 8px 0; text-align: right;">${checkOut} (11:00 AM)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4F4D47;">Payment:</td>
              <td style="padding: 8px 0; text-align: right;">${payMethod} (${totalFormatted})</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #4F4D47;">
          Breakfast for two is included on every flexible rate. If you need any assistance, our reservations team is available 24 hours at [RESERVATIONS PHONE].
        </p>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #D8CFBF; font-size: 12px; color: #7E5F2C;">
          Terraa Hotels · GSTIN [YOUR GSTIN]
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "reservations@terraahotels.com",
      to: [to],
      subject: `Your stay is confirmed: ${hotelName} (${reference})`,
      html: htmlContent,
    });

    if (error) {
      console.error("[RESEND ERROR]", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[RESEND EXCEPTION]", err);
    return { success: false, error: err };
  }
}
