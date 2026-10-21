import { PrismaClient } from "@prisma/client";
import { SEED_LISTINGS, SEED_ORDERS, SEED_THREADS } from "../src/lib/server/seedData";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Safedeal PostgreSQL Database...");

  // 1. Seed Users
  const user1 = await prisma.user.upsert({
    where: { email: "alex@domain.com" },
    update: {},
    create: {
      id: "user-1",
      name: "Alex Morgan",
      email: "alex@domain.com",
      role: "buyer",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAO4ByFuwmm3kx5EHB7BqQdYYDa1D4s4_ibCaybJ_3Yza7SHR-g7q96FE-lswa01xuob9YlHEwPAuOjnwbpVW7Uyhkt-gxnGgwxWUpApbuAOIG93uFvhPQ5l6gW4UdPjINZ9Fc-FXWI0TQTzL2r8g_W0d17FcJ_qr8Sx5jf5CVyEHVIMBX1_FI8omDMrHlUcH7gEmMW0RwJ1pGJn3vCOqwz6_u3yektRb7G-Mv09q9AHTvtAMbimkIA",
      rating: 4.95,
      dealCount: 14,
      status: "Active",
      tier: "Tier 1",
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: "aero@domain.com" },
    update: {},
    create: {
      id: "seller-1",
      name: "AeroGamingDeals",
      email: "aero@domain.com",
      role: "seller",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDv4nGgf68Iciy8GAWiJE48Gp9nonE_EPvPFnG9-ga1EVfuocNmXzUkHY92_aEvu2mqfENp-Sld3TrNZzkF5K3WAixyC0Kkngnty66mn92uZuB984QEREheiuwB0CFLDfv83UuZNaurgnlETTqbnDAHCoPfSCIoZMsoSid25dif2kMRsQ2UCXvuwNJfDyGhZUEP9fqwdlr2j7pRkyFODRNRyD5DEyBoaSY_ZZRS1SYyVz-xqZkv6s_t",
      rating: 4.98,
      dealCount: 1840,
      status: "Active",
      tier: "T3 Verified",
    },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: "sarah.lin@safedeal.network" },
    update: {},
    create: {
      id: "admin-1",
      name: "Sarah Lin",
      email: "sarah.lin@safedeal.network",
      role: "admin",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAO4ByFuwmm3kx5EHB7BqQdYYDa1D4s4_ibCaybJ_3Yza7SHR-g7q96FE-lswa01xuob9YlHEwPAuOjnwbpVW7Uyhkt-gxnGgwxWUpApbuAOIG93uFvhPQ5l6gW4UdPjINZ9Fc-FXWI0TQTzL2r8g_W0d17FcJ_qr8Sx5jf5CVyEHVIMBX1_FI8omDMrHlUcH7gEmMW0RwJ1pGJn3vCOqwz6_u3yektRb7G-Mv09q9AHTvtAMbimkIA",
      rating: 5.0,
      dealCount: 9999,
      status: "Active",
      tier: "Master Officer",
    },
  });

  console.log(`Users seeded: ${user1.name}, ${seller1.name}, ${admin1.name}`);

  // 2. Seed Listings
  for (const item of SEED_LISTINGS) {
    await prisma.listing.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        sku: item.sku || `SKU-${item.id}`,
        title: item.title,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        image: item.image,
        imageAlt: item.imageAlt,
        platform: item.platform,
        region: item.region,
        deliveryType: item.deliveryType || "instant",
        deliveryTimeText: item.deliveryTimeText,
        status: item.status || "Active",
        views: item.views || 40,
        watchers: item.watchers || 5,
        stockCount: item.stockCount || 1,
        keysInVault: item.keysInVault || 0,
        priceSub: item.priceSub,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        tags: JSON.stringify(item.tags || []),
        sellerName: item.seller.name,
      },
    });
  }
  console.log(`Listings seeded: ${SEED_LISTINGS.length} items`);

  // 3. Seed Orders
  for (const ord of SEED_ORDERS) {
    await prisma.order.upsert({
      where: { orderNumber: ord.orderNumber },
      update: {},
      create: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        itemTitle: ord.itemTitle,
        image: ord.image,
        tag: ord.tag,
        category: ord.category,
        deliveryType: ord.deliveryType,
        price: ord.price,
        sellerName: ord.sellerName,
        sellerLevel: ord.sellerLevel,
        sellerRating: ord.sellerRating,
        sellerSales: ord.sellerSales,
        status: ord.status,
        statusText: ord.statusText,
        warrantyLeft: ord.warrantyLeft,
        escrowTimeRemaining: ord.escrowTimeRemaining,
        decryptedKey: (ord as any).decryptedKey,
        credentialsLogin: ord.credentials?.login,
        credentialsEmail: ord.credentials?.email,
        credentialsPass: ord.credentials?.pass,
        credentialsPin: ord.credentials?.pin,
        disputeCaseId: (ord as any).disputeCaseId,
        disputeResolutionNote: (ord as any).disputeResolutionNote,
      },
    });
  }
  console.log(`Orders seeded: ${SEED_ORDERS.length} records`);

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
