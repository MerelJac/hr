import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import ManagerDepartments from "./manager-department";

export default async function ManagerDepartmentPage() {
  const session = await getServerSession(authOptions);
  console.log("Session in Department Page:", session);
  const user = session?.user as User | null;
  const role = user?.role;

  let managerDepartmentData = null;

  if (role === "MANAGER") {
    // console.log("Fetching manager department data for user:", user?.id);
    managerDepartmentData = await prisma.user.findUnique({
      where: { id: user!.id },
      include: {
        department: {
          include: {
            users: {
              where: { role: "EMPLOYEE" },
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
        },
      },
    });
  }


  return (
    <main className="space-y-8 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
      </header>
      <section className="p-6">
        { role === "MANAGER"  &&(
          <ManagerDepartments manager={managerDepartmentData} />
        )}
      </section>
    </main>
  );
}
