// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.ok) router.push(callbackUrl);
    else alert(res?.error || "Login failed");
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-linear-to-t from-blue-500 to-indigo-500 p-6 ">
      <main className="flex items-center justify-center flex-col p-6 shadow bg-white rounded-lg">
        <Image src={logo} alt="Logo" className="w-32 h-auto mb-4" />
        <form
          onSubmit={onSubmit}
          className="bg-white p-6 rounded-xl  w-80 space-y-3"
        >
          <h1 className="text-xl font-semibold">Sign in</h1>
          <input
            className="w-full border-2 rounded-xl p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <input
            className="w-full border-2 rounded-xl p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button className="w-full bg-black text-white py-2 rounded-xl">
            Sign in
          </button>
          <Link
            href="/register"
            className="block text-center w-full bg-gray-200 text-black py-2 rounded-xl hover:bg-gray-300"
          >
            Register
          </Link>
        </form>
      </main>
    </section>
  );
}
