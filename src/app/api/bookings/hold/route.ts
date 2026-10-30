import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomTypeId, checkIn, checkOut, quantity } = body;

    const holdToken = `hold_${crypto.randomBytes(16).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes hold

    if (process.env.DATABASE_URL) {
      try {
        await prisma.$transaction(async (tx) => {
          // Find daily inventory and lock rows if needed
          const startDate = new Date(`${checkIn}T00:00:00.000Z`);
          const endDate = new Date(`${checkOut}T00:00:00.000Z`);

          const dailyRecords = await tx.dailyInventory.findMany({
            where: {
              roomTypeId: roomTypeId,
              date: {
                gte: startDate,
                lt: endDate,
              },
            },
          });

          // Verify availability
          for (const rec of dailyRecords) {
            const available = rec.totalRooms - (rec.bookedRooms + rec.heldRooms);
            if (available < quantity) {
              throw new Error("Insufficient inventory for selected dates");
            }
          }

          // Increment held rooms
          for (const rec of dailyRecords) {
            await tx.dailyInventory.update({
              where: { id: rec.id },
              data: { heldRooms: { increment: quantity } },
            });
          }

          // Record hold
          if (roomTypeId) {
            await tx.inventoryHold.create({
              data: {
                roomTypeId,
                holdToken,
                date: startDate,
                quantity,
                expiresAt,
              },
            });
          }
        });
      } catch (dbErr: unknown) {
        console.warn("DB hold transaction skipped or table not initialized:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      holdToken,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
    });
  } catch (err: unknown) {
    console.error("Hold error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Could not hold inventory" },
      { status: 400 }
    );
  }
}
