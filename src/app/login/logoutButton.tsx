"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut size={13} />
      {isLoading ? "Signing out…" : "Sign out"}
    </button>
  );
}