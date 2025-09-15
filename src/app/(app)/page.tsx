// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FeedPage from "./feed/page";
export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <>
      {session ? (
        <FeedPage />
      ) : (
        <p className="text-gray-700">
          Please sign in to access your dashboard and send recognitions.
        </p>
      )}
    </>
  );
}
