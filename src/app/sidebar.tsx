// example: src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function Sidebar() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex flex-col p-10 border-r h-screen w-60">
        <h2 className="text-lg font-semibold mb-4">Sidebar</h2>
    </main>
  );
}
