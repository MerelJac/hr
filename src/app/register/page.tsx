"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) router.push("/login");
    else {
      const data = await res.json();
      setMessage("Registration failed");
      setIsLoading(false);
      console.log("Registration failure:", data.error);
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-linear-to-t from-blue-500 to-indigo-500 p-4">
      <main className="flex items-center justify-center flex-col p-6 shadow bg-white rounded-lg">
        <Image src={logo} alt="Logo" className="w-32 h-auto mb-4" />
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl  w-96 space-y-4"
        >
          <h1 className="text-xl font-bold">Register</h1>
          <input
            className="w-full border-2 rounded-xl p-2"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            className="w-full border-2 rounded-xl p-2"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            className="w-full border-2 rounded-xl p-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border-2 rounded-xl p-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            className="bg-black text-white w-full py-2 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
          <Link
            href="/login"
            className="block text-center w-full bg-gray-200 text-black py-2 rounded-xl hover:bg-gray-300"
          >
            Login
          </Link>
          {message && (
            <p className="block text-xs text-center w-full text-red py-2">
              {message}
            </p>
          )}
        </form>
      </main>
    </section>
  );
}
