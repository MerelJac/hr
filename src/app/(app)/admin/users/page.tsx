import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";
import InvitesList from "./invites-list";
import UsersList from "./users-list";
import { User } from "@/types/user";
import { PanelsTopLeft } from "lucide-react";

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") redirect("/");

  const [invites, users] = await Promise.all([
    prisma.userInvite.findMany({
      orderBy: { createdAt: "desc" },
      where: { consumedAt: null },
    }),
    prisma.user.findMany({
      where: { NOT: { id: process.env.SYSTEM_ADMIN_ID } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="space-y-8 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md flex flex-row justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <PanelsTopLeft size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Admin
            </p>
            <h1 className="text-lg font-semibold text-gray-800 leading-tight">
              Manage Users & Departments
            </h1>
          </div>
        </div>{" "}
        <InviteForm />
      </header>
      <section className="p-6">
        <InvitesList invites={invites} />
        <UsersList users={users} />
      </section>
    </main>
  );
}
