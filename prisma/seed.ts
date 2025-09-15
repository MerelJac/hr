import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";
const prisma = new PrismaClient();

async function user() {
  const email = "you@company.com";
  const passwordHash = await hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: { email, passwordHash, role: Role.SUPER_ADMIN, firstName: "Super", lastName: "Admin" },
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
}

;

reward().finally(() => prisma.$disconnect());