"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./login/logoutButton";
import logo from "@/assets/logo.png";

// Unused
export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-200">
      <section className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/" className="text-2xl font-bold">
          <Image src={logo} alt="Logo" width={80} height={80} priority />
          Ignite
        </Link>
      </section>

      <LogoutButton />
    </div>
  );
}
