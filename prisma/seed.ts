import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const email = "you@company.com";
  const passwordHash = await hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: { email, passwordHash, role: Role.SUPER_ADMIN, firstName: "Super", lastName: "Admin" },
  });
}

main().finally(()=>prisma.$disconnect());
