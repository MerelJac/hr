// src/app/sidebar.tsx (server)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <aside className="w-64 border-r p-4 space-y-3">
      <Link href="/">Home</Link>
      {role === "SUPER_ADMIN" && (
        <Link href="/admin/users" className="block text-blue-600">Users & Invites</Link>
      )}
    </aside>
  );
}
