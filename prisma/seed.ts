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
    create: { email, passwordHash, role: Role.SUPER_ADMIN, firstName: "Super", lastName: "Admin" , department: 'Human Resources'},
  });
}

user().finally(()=>prisma.$disconnect());


async function reward() {
await prisma.rewardCatalog.createMany({
  data: [
    { type: "AMAZON", label: "Amazon Custom", valueCents: 0, pointsCost: 0 },
    { type: "VISA", label: "Visa Custom", valueCents: 0, pointsCost: 0 },
  ]
})
};

reward().finally(() => prisma.$disconnect());


async function nominationChallenge() {
  console.log("🌱 Seeding challenges...");

  // Employee of the Month Challenge
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
      requirements: {
        requiresNominee: true,
      },
    },
  });

  // LinkedIn Post Challenge
  await prisma.nominationChallenge.upsert({
    where: { title: "LinkedIn Post Challenge" },
    update: {},
    create: {
      title: "LinkedIn Post Challenge",
      description:
        "Encourage employees to share their professional achievements on LinkedIn.",
      qualification:
        "Make a LinkedIn post with the hashtag #OurCompany and submit the link.",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-15"),
      isActive: true,
      requirements: {
        requiresPostUrl: true,
        requiresScreenshot: true,
      },
    },
  });

  console.log("✅ Challenges seeded successfully");
}

nominationChallenge()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });