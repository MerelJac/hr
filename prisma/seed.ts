import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";
const prisma = new PrismaClient();

async function user() {
  const email = "you@company.com";
  const passwordHash = await hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: { email, passwordHash, role: Role.SUPER_ADMIN, firstName: "Super", lastName: "Admin" },
  });
}

user().finally(()=>prisma.$disconnect());

async function reward() {
  const items = [
    { type: "AMAZON", label: "$10 Amazon Gift Card", valueCents: 1000, pointsCost: 1000 },
    { type: "AMAZON", label: "$25 Amazon Gift Card", valueCents: 2500, pointsCost: 2500 },
    { type: "VISA",   label: "$10 Visa Gift Card",   valueCents: 1000, pointsCost: 1100 }, // slight fee example
    { type: "VISA",   label: "$25 Visa Gift Card",   valueCents: 2500, pointsCost: 2700 },
  ];
  for (const it of items) {
    await prisma.rewardCatalog.upsert({
      where: { label: it.label },
      update: it,
      create: it,
    });
  }
  console.log("Seeded reward catalog.");
}

reward().finally(() => prisma.$disconnect());