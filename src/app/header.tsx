"use client";

import Link from "next/link";
import LogoutButton from "./login/logoutButton";

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-200">
       <Link href="/" className="text-2xl font-bold">My App</Link>
        <LogoutButton />
    </div>
  );
}
