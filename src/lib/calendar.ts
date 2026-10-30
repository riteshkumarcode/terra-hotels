/**
 * iCalendar (.ics) generator for confirmed hotel stays.
 */

export function generateIcsCalendarFile({
  reference,
  hotelName,
  cityName,
  address,
  checkInDate,
  checkOutDate,
}: {
  reference: string;
  hotelName: string;
  cityName: string;
  address: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
}): string {
  const dtStart = checkInDate.replace(/-/g, "");
  const dtEnd = checkOutDate.replace(/-/g, "");
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Terraa Hotels//Booking Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${reference}@terraahotels.com`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:Stay at ${hotelName} (${cityName})`,
    `DESCRIPTION:Reservation Confirmed\\nBooking Reference: ${reference}\\nHotel: ${hotelName}\\nCheck-in: 2:00 PM\\nCheck-out: 11:00 AM\\nReservations: [RESERVATIONS PHONE]`,
    `LOCATION:${address}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
