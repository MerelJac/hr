import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

async function user() {
  const email = "mjacobs@calloneonline.com";
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is not set.");
  }
  const passwordHash = await hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: {
      email,
      passwordHash,
      role: Role.SUPER_ADMIN,
      firstName: "Super",
      lastName: "Admin",
      department: "Human Resources",
    },
  });
}

async function reward() {
  // categories
  await prisma.rewardCategory.upsert({
    where: { name: "Gift Card" },
    update: {},
    create: { name: "Gift Card" },
  });
  await prisma.rewardCategory.upsert({
    where: { name: "Swag" },
    update: {},
    create: { name: "Swag" },
  });

  const giftCardCategory = await prisma.rewardCategory.findUnique({
    where: { name: "Gift Card" },
  });

  // rewards
  if (giftCardCategory) {
    await prisma.rewardCatalog.upsert({
      where: { label: "Amazon Gift Card" },
      update: {},
      create: {
        categoryId: giftCardCategory.id,
        label: "Amazon Gift Card",
        valueCents: 0,
        pointsCost: 0,
        type: "AMAZON",
      },
    });

    await prisma.rewardCatalog.upsert({
      where: { label: "Visa Gift Card" },
      update: {},
      create: {
        categoryId: giftCardCategory.id,
        label: "Visa Gift Card",
        valueCents: 0,
        pointsCost: 0,
        type: "VISA",
      },
    });
  }
}

async function nominationChallenge() {
  console.log("🌱 Seeding challenges...");

  await prisma.nominationChallenge.upsert({
    where: { title: "Employee of the Month" },
    update: {},
    create: {
      title: "Employee of the Month",
      description: "Recognize outstanding employees who go above and beyond this month.",
      qualification: "Nominate a coworker who demonstrates leadership, teamwork, and initiative.",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-30"),
      isActive: true,
      points: 100,
      requirements: { requiresNominee: true },
    },
  });

  console.log("✅ Challenges seeded successfully");
}

async function setupBonus() {
  console.log("🌱 Seeding Setup Bonus...");

  await prisma.nominationChallenge.upsert({
    where: { title: "Setup Bonus" },
    update: {},
    create: {
      title: "Setup Bonus",
      description: "Earn 5 points by uploading your profile picture and sending your first shoutout.",
      qualification: "Upload a profile picture and recognize a colleague.",
      startDate: new Date("2025-01-01T00:00:00Z"),
      endDate: new Date("2099-12-31T23:59:59Z"),
      isActive: true,
      points: 5,
      requirements: { requiresProfileImage: true, requiresFirstShoutout: true },
    },
  });

  console.log("🌱 Setup bonus challenge seeded.");
}

async function employeeReferral() {
  console.log("🌱 Seeding Employee Referral...");

  await prisma.nominationChallenge.upsert({
    where: { title: "Employee Referral" },
    update: {},
    create: {
      title: "Employee Referral",
      description: "After 90 days of employment for your referral, you will receive 1000 points!",
      qualification: "Briefly explain why you're claiming this challenge.",
      startDate: new Date("2025-01-01T00:00:00Z"),
      endDate: new Date("2099-12-31T23:59:59Z"),
      isActive: true,
      points: 1000,
      requirements: { requiresReason: true },
    },
  });

  console.log("🌱 Employee Referral challenge seeded.");
}

async function main() {
  await user();
  await reward();
  await nominationChallenge();
  await setupBonus();
  await employeeReferral();
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
