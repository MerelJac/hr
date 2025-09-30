import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";
import InvitesList from "./invites-list";
import UsersList from "./users-list";
import { User } from "@/types/user";

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") redirect("/");

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
        <h1 className="text-2xl font-semibold">Users & Invites</h1>
        <InviteForm />
      </header>
      <section className="p-6">
        <InvitesList invites={invites} />
        <UsersList users={users} />
      </section>
    </main>
  );
}
