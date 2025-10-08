"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Reset failed");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow p-6 rounded-xl text-center space-y-3">
          <h2 className="text-lg font-semibold">Password updated</h2>
          <p>Redirecting you to the sign-in page...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow p-6 rounded-xl w-80 space-y-3"
      >
        <h1 className="text-xl font-semibold text-center">
          Reset your password
        </h1>
        <input
          className="w-full border-2 rounded-xl p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
        />
        <input
          className="w-full border-2 rounded-xl p-2"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-black text-white py-2 rounded-xl">
          Update password
        </button>
      </form>
    </section>
  );
}
