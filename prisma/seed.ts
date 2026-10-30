import { PrismaClient, RatePlanType } from "@prisma/client";
import { SAMPLE_HOTELS, SAMPLE_ADDONS } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Terraa Hotels database seed...");

  // 1. Seed Addons
  for (const addon of SAMPLE_ADDONS) {
    await prisma.addon.upsert({
      where: { code: addon.code },
      update: {
        name: addon.name,
        description: addon.description,
        pricePaise: addon.pricePaise,
        imageUrl: addon.imageUrl,
      },
      create: {
        code: addon.code,
        name: addon.name,
        description: addon.description,
        pricePaise: addon.pricePaise,
        imageUrl: addon.imageUrl,
      },
    });
  }
  console.log("✓ Addons seeded");

  // 2. Seed Promo Codes
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 2);

  const promoCodes = [
    { code: "TERRAA10", discountPercent: 10, minNights: 1 },
    { code: "SUITE20", discountPercent: 20, minNights: 2 },
    { code: "DIRECT500", discountFlatPaise: 50000, minNights: 1 },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {
        discountPercent: promo.discountPercent,
        discountFlatPaise: promo.discountFlatPaise,
        minNights: promo.minNights,
        validFrom: now,
        validTo: nextYear,
        isActive: true,
      },
      create: {
        code: promo.code,
        discountPercent: promo.discountPercent,
        discountFlatPaise: promo.discountFlatPaise,
        minNights: promo.minNights,
        validFrom: now,
        validTo: nextYear,
        isActive: true,
      },
    });
  }
  console.log("✓ Promo codes seeded");

  // 3. Seed Hotels, Images, Rooms, Rate Plans & Daily Inventory
  for (const hotelData of SAMPLE_HOTELS) {
    const hotel = await prisma.hotel.upsert({
      where: { code: hotelData.code },
      update: {
        slug: hotelData.slug,
        name: hotelData.name,
        city: hotelData.city,
        state: hotelData.state,
        kind: hotelData.kind,
        rating: hotelData.rating,
        reviewsCount: hotelData.reviewsCount,
        basePrice: hotelData.basePrice,
        badge: hotelData.badge,
        tags: hotelData.tags,
        mapX: hotelData.mapX,
        mapY: hotelData.mapY,
        blurb: hotelData.blurb,
        intro: hotelData.intro,
        body: hotelData.body,
        address: hotelData.address,
        nearPlaces: hotelData.nearPlaces,
        airportDist: hotelData.airportDist,
        totalRooms: hotelData.totalRooms,
      },
      create: {
        slug: hotelData.slug,
        code: hotelData.code,
        name: hotelData.name,
        city: hotelData.city,
        state: hotelData.state,
        kind: hotelData.kind,
        rating: hotelData.rating,
        reviewsCount: hotelData.reviewsCount,
        basePrice: hotelData.basePrice,
        badge: hotelData.badge,
        tags: hotelData.tags,
        mapX: hotelData.mapX,
        mapY: hotelData.mapY,
        blurb: hotelData.blurb,
        intro: hotelData.intro,
        body: hotelData.body,
        address: hotelData.address,
        nearPlaces: hotelData.nearPlaces,
        airportDist: hotelData.airportDist,
        totalRooms: hotelData.totalRooms,
      },
    });

    // Images
    await prisma.hotelImage.deleteMany({ where: { hotelId: hotel.id } });
    for (let i = 0; i < hotelData.images.length; i++) {
      const img = hotelData.images[i];
      await prisma.hotelImage.create({
        data: {
          hotelId: hotel.id,
          url: img.url,
          caption: img.caption,
          order: i,
        },
      });
    }

    // Rooms
    for (const roomData of hotelData.rooms) {
      const room = await prisma.roomType.upsert({
        where: {
          hotelId_code: {
            hotelId: hotel.id,
            code: roomData.code,
          },
        },
        update: {
          name: roomData.name,
          facts: roomData.facts,
          imageUrl: roomData.imageUrl,
          baseRate: roomData.baseRate,
          inventory: roomData.inventory,
        },
        create: {
          hotelId: hotel.id,
          code: roomData.code,
          name: roomData.name,
          facts: roomData.facts,
          imageUrl: roomData.imageUrl,
          baseRate: roomData.baseRate,
          inventory: roomData.inventory,
        },
      });

      // Rate Plans
      await prisma.ratePlan.deleteMany({ where: { roomTypeId: room.id } });
      await prisma.ratePlan.createMany({
        data: [
          {
            roomTypeId: room.id,
            type: RatePlanType.FLEXIBLE,
            name: "Flexible · breakfast for two",
            policyText: "Free cancellation up to 48 hours before arrival",
            discountPercent: 0,
            isRefundable: true,
          },
          {
            roomTypeId: room.id,
            type: RatePlanType.ADVANCE_PURCHASE,
            name: "Advance purchase · breakfast for two",
            policyText: "Save 12% · non-refundable",
            discountPercent: 12,
            isRefundable: false,
          },
        ],
      });

      // Daily Inventory for 90 days
      const daysToSeed = 90;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let d = 0; d < daysToSeed; d++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + d);

        await prisma.dailyInventory.upsert({
          where: {
            roomTypeId_date: {
              roomTypeId: room.id,
              date: targetDate,
            },
          },
          update: {
            totalRooms: roomData.inventory,
          },
          create: {
            roomTypeId: room.id,
            date: targetDate,
            totalRooms: roomData.inventory,
            bookedRooms: 0,
            heldRooms: 0,
          },
        });
      }
    }
  }
  console.log("✓ Hotels, rooms, rate plans & 90-day inventory seeded");

  // 4. Seed Admin User
  await prisma.adminUser.upsert({
    where: { email: "admin@terraahotels.com" },
    update: {
      name: "Terraa Concierge Admin",
      passwordHash: "terraa2026admin", // In production will be compared via crypto
    },
    create: {
      email: "admin@terraahotels.com",
      name: "Terraa Concierge Admin",
      passwordHash: "terraa2026admin",
    },
  });
  console.log("✓ Admin user seeded (admin@terraahotels.com)");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
