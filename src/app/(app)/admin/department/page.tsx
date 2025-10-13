import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { AllDepartments } from "./all-departments";
import { DepartmentWithUsers } from "@/types/department";

export default async function DepartmentPage() {
  const session = await getServerSession(authOptions);
  console.log("Session in Department Page:", session);
  const user = session?.user as User | null;
  const role = user?.role;

  let departmentsData: DepartmentWithUsers[] = []; // ✅ initialize as empty array

  if (role === "SUPER_ADMIN") {
    departmentsData = await prisma.department.findMany({
      include: {
        users: {
          orderBy: { lastName: "asc" },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  return (
    <main className="space-y-8 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
      </header>
      <section className="p-6">
        {role === "SUPER_ADMIN" && (
          <AllDepartments departments={departmentsData} />
        ) }
        
      </section>
    </main>
  );
}
