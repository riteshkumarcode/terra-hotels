/**
 * WhatsApp notification hook - logged stub only.
 */

export interface WhatsAppNotificationPayload {
  toMobile: string;
  guestName: string;
  reference: string;
  hotelName: string;
  cityName: string;
  checkInDate: string;
  checkOutDate: string;
  totalFormatted: string;
}

export async function sendWhatsAppNotificationStub(payload: WhatsAppNotificationPayload) {
  const timestamp = new Date().toISOString();
  console.log(`\n==================================================`);
  console.log(`[WHATSAPP NOTIFICATION STUB] ${timestamp}`);
  console.log(`Recipient: ${payload.toMobile} (${payload.guestName})`);
  console.log(`Booking Reference: ${payload.reference}`);
  console.log(`Hotel: ${payload.hotelName}, ${payload.cityName}`);
  console.log(`Stay: ${payload.checkInDate} to ${payload.checkOutDate}`);
  console.log(`Total: ${payload.totalFormatted}`);
  console.log(`Message: "Namaste ${payload.guestName}. Your reservation at ${payload.hotelName} is confirmed (${payload.reference}). We look forward to welcoming you."`);
  console.log(`==================================================\n`);

  return {
    success: true,
    messageId: `wa_stub_${Date.now()}`,
    loggedAt: timestamp,
  };
}
