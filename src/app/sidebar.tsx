// src/app/sidebar.tsx (server)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./login/logoutButton";
import logo from "@/assets/logo.png";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <aside className="flex flex-col w-[15rem] border-r p-4 space-y-3 h-screen justify-between">
      <div className="flex flex-col space-y-3">
        <Image src={logo} alt="Logo"  />
        <Link href="/feed">Feed</Link>
        <Link href="/recognize">Recognize</Link>
        {role === "SUPER_ADMIN" && (
          <>
            <Link href="/admin/users" className="block text-blue-600">
              Users & Invites
            </Link>
            <Link href="/admin/nominations" className="block text-blue-600">
              Nominations
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-col space-y-3">
        <Link href="/profile">My Profile</Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
