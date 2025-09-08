"use client";

import LogoutButton from "./login/logoutButton";

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-200">
        <h1 className="text-2xl font-bold">My App</h1>
        <LogoutButton />
    </div>
  );
}
