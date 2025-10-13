import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import DepartmentsManager from "@/components/DepartmentManager";
import { useState } from "react";

export default async function DepartmentAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN" || role !== "ADMIN" || role !== "MANAGER")
    redirect("/");
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const [invites, users] = await Promise.all([
    prisma.userInvite.findMany({
      orderBy: { createdAt: "desc" },
      where: { consumedAt: null },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="space-y-8 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
        <button
          onClick={() => setDepartmentOpen(true)}
          className="bg-black text-white px-3 py-2 rounded-xl"
        >
          + Departments
        </button>
      </header>
      <section className="p-6">
      </section>
      <DepartmentsManager
        open={departmentOpen}
        onClose={() => setDepartmentOpen(false)}
      />
    </main>
  );
}
