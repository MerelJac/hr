"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.ok) router.push(callbackUrl);
    else {
      setMessage("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-80 space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Email
        </label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Password
        </label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <Link
        href="/forgot-password"
        className="block text-xs text-right text-gray-400 hover:text-indigo-500 transition-colors"
      >
        Forgot password?
      </Link>

      {message && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" />
          </svg>
          {message}
        </div>
      )}

      <button
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white text-sm font-medium py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>

    
    </form>
  );
}

export default function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-indigo-500 p-6">
      <main className="flex items-center justify-center flex-col gap-6 p-8 shadow-xl bg-white rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Image src={logo} alt="Logo" className="w-28 h-auto" />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">Welcome back</h1>
            <p className="text-sm text-gray-400">Sign in to your account</p>
          </div>
        </div>
        <Suspense fallback={<div className="w-80 h-48 animate-pulse bg-gray-50 rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </main>
    </section>
  );
}