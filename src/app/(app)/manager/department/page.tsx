import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import ManagerDepartments from "./manager-department";

export default async function ManagerDepartmentPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as User | null;
  const role = user?.role;

  if (role !== "MANAGER") {
    return (
      <main className="space-y-8 bg-white rounded-xl h-full p-6">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </main>
    );
  }

  // ✅ Fetch the manager’s department and employees
  const managerDepartmentData = await prisma.user.findUnique({
    where: { id: user!.id },
    include: {
      department: {
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
      },
    },
  });

  const departmentName =
    managerDepartmentData?.department?.name ?? "Your Department";

  return (
    <main className="space-y-8 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">{departmentName}</h1>
      </header>
      <section className="p-6">
        <ManagerDepartments manager={managerDepartmentData} />
      </section>
    </main>
  );
}
