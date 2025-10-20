import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

async function seedDepartments() {
  console.log("🌱 Seeding departments...");

  const departmentNames = ["Human Resources", "eCommerce", "Sales"];
  const departments: Record<string, string> = {};

  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments[name] = dept.id;
  }

  console.log("✅ Departments seeded:", departmentNames.join(", "));
  return departments;
}

async function user(departments: Record<string, string>) {
  console.log("🌱 Seeding users...");

  const email = "mjacobs@calloneonline.com";
  if (!process.env.SYSTEM_ADMIN_PASSWORD) {
    throw new Error("SYSTEM_ADMIN_PASSWORD environment variable is not set.");
  }
  const passwordHash = await hash(process.env.SYSTEM_ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: {
      email,
      passwordHash,
      role: Role.SUPER_ADMIN,
      firstName: "Super",
      lastName: "Admin",
      departmentId: departments["Human Resources"], // ✅ use FK
    },
  });

  // System Admin
  const systemEmail = "mjacobs+system@calloneonline.com";
  const systemId = process.env.SYSTEM_ADMIN_ID;
  if (!systemId) {
    throw new Error("SYSTEM_ADMIN_ID environment variable is not set.");
  }
  if (!process.env.SYSTEM_ADMIN_PASSWORD) {
    throw new Error("SYSTEM_ADMIN_PASSWORD environment variable is not set.");
  }

  const systemPasswordHash = await hash(process.env.SYSTEM_ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: systemEmail },
    update: { role: Role.SUPER_ADMIN },
    create: {
      email: systemEmail,
      passwordHash: systemPasswordHash,
      role: Role.SUPER_ADMIN,
      firstName: "Call One",
      lastName: "Inc",
      departmentId: departments["Human Resources"], // ✅ use FK
      profileImage:
        "https://ignite-assets-bucket.s3.us-east-2.amazonaws.com/dev/profiles/cmgig6ajv0000s4179qaj1j66/62f0701f-3f6c-40d8-8986-e2a63cc9be4e.png",
    },
  });

  console.log("✅ Users seeded.");
}

async function reward() {
  console.log("🌱 Seeding rewards...");
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

  if (giftCardCategory) {
    await prisma.rewardCatalog.upsert({
      where: { label: "Amazon Gift Card" },
      update: {},
      create: {
        categoryId: giftCardCategory.id,
        label: "Amazon Gift Card",
        valueCents: 0,
        pointsCost: 0,
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
      },
    });
  }

  console.log("✅ Rewards seeded.");
}

async function nominationChallenge() {
  console.log("🌱 Seeding challenges...");

  await prisma.nominationChallenge.upsert({
    where: { title: "Employee of the Month" },
    update: {},
    create: {
      title: "Employee of the Month",
      description:
        "Recognize outstanding employees who go above and beyond this month.",
      qualification:
        "Nominate a coworker who demonstrates leadership, teamwork, and initiative.",
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
      description:
        "Earn 5 points by uploading your profile picture and sending your first shoutout.",
      qualification: "Upload a profile picture and recognize a colleague.",
      startDate: new Date("2025-01-01T00:00:00Z"),
      endDate: new Date("2099-12-31T23:59:59Z"),
      isActive: true,
      points: 5,
      requirements: {
        requiresProfileImage: true,
        requiresFirstShoutout: true,
      },
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
      description:
        "After 90 days of employment for your referral, you will receive 1000 points!",
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
  const departments = await seedDepartments(); // ✅ new step
  await user(departments);
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
