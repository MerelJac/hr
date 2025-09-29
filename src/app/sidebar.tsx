// src/app/sidebar.tsx (server)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Home, Rocket, User, Star, Gift, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./login/logoutButton";
import logo from "@/assets/logo.png";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <aside className="flex flex-col w-[15rem] p-4 space-y-3 h-screen justify-between">
      <div className="flex flex-col space-y-3">
        <Image src={logo} alt="Logo" />
        <Link
          href="/feed"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Home size={18} />
          <span>Feed</span>
        </Link>
        <Link
          href="/rewards"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Gift size={18} />
          <span> Rewards</span>
        </Link>
        {role === "SUPER_ADMIN" && (
          <>
            <Link
              href="/admin/challenges"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Rocket size={18} />
              <span> Challenges</span>
            </Link>
            <Link
              href="/admin/rewards"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Gift size={18} />
              <span> Manage Rewards</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Users size={18} />
              <span> Users & Invites</span>
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-col space-y-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <User size={18} />
          <span>My Profile</span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
