import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Home, Rocket, User as UserIcon, Gift } from "lucide-react";
import Link from "next/link";

import { User } from "@/types/user";

export default async function MobileNav() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
      <Link
        href="/feed"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <Home size={20} />
        <span className="text-xs">Feed</span>
      </Link>
      <Link
        href="/rewards"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <Gift size={20} />
        <span className="text-xs">Rewards</span>
      </Link>

      {role === "SUPER_ADMIN" && (
        <Link
          href="/admin/challenges"
          className="flex flex-col items-center text-gray-700 hover:text-blue-600"
        >
          <Rocket size={20} />
          <span className="text-xs">Admin</span>
        </Link>
      )}

      <Link
        href="/profile"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <UserIcon size={20} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
}
