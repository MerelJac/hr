// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome to BlastOff</h1>
        {session ? (
          <p className="text-gray-700">You are signed in as <b>{session.user?.email}</b>.</p>
        ) : (
          <p className="text-gray-700">Please sign in to access your dashboard and send recognitions.</p>
        )}
      </main>
    </>
  );
}
