import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";
import InvitesList from "./invites-list";
import UsersList from "./users-list";

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") redirect("/");

  const [invites, users] = await Promise.all([
    prisma.userInvite.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Users & Invites</h1>
      <InviteForm />
      <InvitesList invites={invites} />
      <UsersList users={users} />
    </main>
  );
}
