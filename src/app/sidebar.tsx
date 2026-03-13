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
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./login/logoutButton";
import logo from "@/assets/logo.png";
import { User } from "@/types/user";
import SupportButton from "@/components/SupportButton";

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
    >
      <Icon
        size={16}
        className="shrink-0 group-hover:text-indigo-500 transition-colors"
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 px-3 pt-3 pb-1">
      {label}
    </p>
  );
}

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[15%] z-50 bg-white border-r border-gray-100 shadow-sm justify-between py-5 px-3">
      {/* Top section */}
      <div className="flex flex-col gap-1">
        {/* Logo */}
        <div className="flex justify-center px-2 mb-4">
          <Image
            src={logo}
            alt="Logo"
            className="w-full max-w-[140px] h-auto"
          />
        </div>

        {/* Main nav */}
        <NavLink href="/feed" icon={Home} label="Feed" />
        <NavLink href="/rewards" icon={Gift} label="Rewards" />

        {/* Super admin */}
        {role === "SUPER_ADMIN" && (
          <>
            <SectionLabel label="Admin" />
            <NavLink
              href="/admin/challenges"
              icon={Rocket}
              label="Challenges"
            />
            <NavLink
              href="/admin/recognitions"
              icon={Star}
              label="Recognitions"
            />
            <NavLink
              href="/admin/rewards"
              icon={Handbag}
              label="Manage Rewards"
            />
            <NavLink
              href="/admin/leaderboard"
              icon={AlignEndHorizontal}
              label="Leaderboard"
            />
            <NavLink
              href="/admin/department"
              icon={Laugh}
              label="Departments"
            />
            <NavLink href="/admin/users" icon={Users} label="Users" />
          </>
        )}

        {/* Admin */}
        {role === "ADMIN" && (
          <>
            <SectionLabel label="Admin" />
            <NavLink
              href="/admin/department"
              icon={Laugh}
              label="Departments"
            />
            <NavLink
              href="/admin/recognitions"
              icon={Star}
              label="Recognitions"
            />
          </>
        )}

        {/* Manager */}
        {role === "MANAGER" && (
          <>
            <SectionLabel label="Admin" />
            <NavLink
              href="/manager/department"
              icon={Laugh}
              label="My Department"
            />
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
        <NavLink href="/profile" icon={UserIcon} label="My Profile" />
        <div className="flex items-center gap-2 px-3 pt-1">
          <LogoutButton />
          <SupportButton />
        </div>
      </div>
    </aside>
  );
}
