import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function Body() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Welcome {session?.user?.email ?? "guest"}</h1>
    </div>
  );
}
