"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      // optional: reset button after short delay if signOut fails
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`bg-red-500 text-white px-4 py-2 rounded min-w-[80%] transition ${
        isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-red-600"
      }`}
    >
      Logout
    </button>
  );
}
