// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      email, password, redirect: false, callbackUrl,
    });
    if (res?.ok) router.push(callbackUrl);
    else alert(res?.error || "Login failed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-80 space-y-3">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input className="w-full border p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        <input className="w-full border p-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        <button className="w-full bg-black text-white py-2 rounded">Sign in</button>
      </form>
    </main>
  );
}
