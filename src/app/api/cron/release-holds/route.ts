import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  return handleRelease(req);
}

export async function POST(req: Request) {
  return handleRelease(req);
}

async function handleRelease(_req: Request) {
  try {
    const now = new Date();
    let releasedCount = 0;

    if (process.env.DATABASE_URL) {
      try {
        const expiredHolds = await prisma.inventoryHold.findMany({
          where: {
            expiresAt: { lt: now },
          },
        });

        for (const hold of expiredHolds) {
          // Decrement held rooms on matching daily inventory
          await prisma.dailyInventory.updateMany({
            where: {
              roomTypeId: hold.roomTypeId,
              date: hold.date,
            },
            data: {
              heldRooms: { decrement: hold.quantity },
            },
          });

          // Delete hold record
          await prisma.inventoryHold.delete({
            where: { id: hold.id },
          });

          releasedCount++;
        }
      } catch (dbErr) {
        console.warn("Expired holds cleanup skipped (DB not connected):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      releasedHolds: releasedCount,
      timestamp: now.toISOString(),
    });
  } catch (err: unknown) {
    console.error("Error releasing expired holds:", err);
    return NextResponse.json({ error: "Failed to release holds" }, { status: 500 });
  }
}
