import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Home,
  Rocket,
  User as UserIcon,
  AlignEndHorizontal,
  Gift,
  Users,
  Handbag,
  Laugh,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./login/logoutButton";
import logo from "@/assets/logo.png";
import { User } from "@/types/user";
import SupportButton from "@/components/SupportButton";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  console.log("Session in Sidebar:", session);
  const role = (session?.user as User)?.role;

  return (
    <aside
      className="
    hidden md:flex flex-col 
    fixed top-0 left-0 
    h-screen 
    p-4 space-y-3 
    justify-between 
    shadow-md bg-white 
    z-50
    w-[15%]"
    >
      {" "}
      <div className="flex flex-col space-y-3">
        {/* Centered logo */}
        <div className="flex justify-center">
          <Image src={logo} alt="Logo" className="w-32 mb-2" />
        </div>{" "}
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
          <span>Rewards</span>
        </Link>
        {role === "SUPER_ADMIN" && (
          <>
            <small className="text-gray-400 uppercase text-xs mt-2">
              Admin
            </small>
            <Link
              href="/admin/challenges"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Rocket size={18} />
              <span>Challenges</span>
            </Link>
            <Link
              href="/admin/rewards"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Handbag size={18} />
              <span>Manage Rewards</span>
            </Link>
            <Link
              href="/admin/leaderboard"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <AlignEndHorizontal size={18} />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/admin/department"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Laugh size={18} />
              <span>Departments</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Users size={18} />
              <span>Users</span>
            </Link>
          </>
        )}
        {role === "MANAGER" && (
          <>
            <small className="text-gray-400 uppercase text-xs mt-2">
              Admin
            </small>

            <Link
              href="/manager/department"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Laugh size={18} />
              <span>My Department</span>
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-col space-y-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <UserIcon size={18} />
          <span>My Profile</span>
        </Link>
        <div className="flex flex-row gap-3 justify-center items-center">
          <LogoutButton />
          <SupportButton />
        </div>
      </div>
    </aside>
  );
}
