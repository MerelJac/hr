// example: src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="p-10">
      <h1 className="text-2xl">Welcome {session?.user?.email ?? "guest"}</h1>
      {!session && <a href="/login" className="underline">Login</a>}
    </main>
  );
}
