import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

// async function user() {
//   const email = "mjacobs@calloneonline.com";
//   if (!process.env.ADMIN_PASSWORD) {
//     throw new Error("ADMIN_PASSWORD environment variable is not set.");
//   }
//   const passwordHash = await hash(process.env.ADMIN_PASSWORD, 12);
//   await prisma.user.upsert({
//     where: { email },
//     update: { role: Role.SUPER_ADMIN },
//     create: {
//       email,
//       passwordHash,
//       role: Role.SUPER_ADMIN,
//       firstName: "Super",
//       lastName: "Admin",
//       department: "Human Resources",
//     },
//   });
// }

// user().finally(() => prisma.$disconnect());

async function rewardCategory() {
  await prisma.rewardCategory.createMany({
    data: [
      { id: "123", name: "Gift Card" },
      { id: "456", name: "Swag"},
    ],
  });
}

rewardCategory().finally(() => prisma.$disconnect());

async function reward() {
  await prisma.rewardCatalog.createMany({
    data: [
      { type: "AMAZON", categoryId: "123",label: "Amazon Custom", valueCents: 0, pointsCost: 0 },
      { type: "VISA", categoryId: "123", label: "Visa Custom", valueCents: 0, pointsCost: 0 },
    ],
  });
}

reward().finally(() => prisma.$disconnect());

// async function nominationChallenge() {
//   console.log("🌱 Seeding challenges...");

//   // Employee of the Month Challenge
//   await prisma.nominationChallenge.upsert({
//     where: { title: "Employee of the Month" },
//     update: {},
//     create: {
//       title: "Employee of the Month",
//       description:
//         "Recognize outstanding employees who go above and beyond this month.",
//       qualification:
//         "Nominate a coworker who demonstrates leadership, teamwork, and initiative.",
//       startDate: new Date("2025-09-01"),
//       endDate: new Date("2025-09-30"),
//       isActive: true,
//       points: 100,
//       requirements: {
//         requiresNominee: true,
//       },
//     },
//   });

//   // LinkedIn Post Challenge
//   await prisma.nominationChallenge.upsert({
//     where: { title: "LinkedIn Post Challenge" },
//     update: {},
//     create: {
//       title: "LinkedIn Post Challenge",
//       description:
//         "Encourage employees to share their professional achievements on LinkedIn.",
//       qualification:
//         "Make a LinkedIn post with the hashtag #OurCompany and submit the link.",
//       startDate: new Date("2025-09-01"),
//       endDate: new Date("2025-09-15"),
//       isActive: true,
//       requirements: {
//         requiresPostUrl: true,
//         requiresScreenshot: true,
//       },
//     },
//   });

//   console.log("✅ Challenges seeded successfully");
// }

// nominationChallenge()
//   .catch((e) => {
//     console.error("❌ Error seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// async function setupBonus() {
//   console.log("🌱 Seeding Setup Bonus...");

//   await prisma.nominationChallenge.upsert({
//     where: { title: "Setup Bonus" },
//     update: {},
//     create: {
//       title: "Setup Bonus",
//       description:
//         "Earn 5 points by uploading your profile picture and sending your first shoutout.",
//       qualification: "Upload a profile picture and recognize a colleague.",
//       startDate: new Date("2025-01-01T00:00:00Z"), // always active
//       endDate: new Date("2099-12-31T23:59:59Z"), // practically never expires
//       isActive: true,
//       points: 5,
//       requirements: {
//         requiresProfileImage: true,
//         requiresFirstShoutout: true,
//       },
//     },
//   });

//   console.log("🌱 Set up bonus challenge seeded.");
// }

// setupBonus()
//   .catch((e) => {
//     console.error("❌ Error seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

  
// async function employeeReferral() {
//   console.log("🌱 Seeding Employee Referral...");

//   await prisma.nominationChallenge.upsert({
//     where: { title: "Employee Referral" },
//     update: {},
//     create: {
//       title: "Employee Referral",
//       description:
//         "After 90 days of employment for your referral, you will receive 1000 points!",
//       qualification: "Briefly explain why you're claiming this challenge.",
//       startDate: new Date("2025-01-01T00:00:00Z"), // always active
//       endDate: new Date("2099-12-31T23:59:59Z"), // practically never expires
//       isActive: true,
//       points: 1000,
//       requirements: {
//         requiresReason: true,
//       },
//     },
//   });

//   console.log("🌱 Employee Referral challenge seeded.");
// }

// employeeReferral()
//   .catch((e) => {
//     console.error("❌ Error seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
