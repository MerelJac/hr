// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "./header";
import Sidebar from "./sidebar";
import LogoutButton from "./login/logoutButton";
import Body from "./body";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <main className="min-h-screen min-w-screen">
        <Header />

        <div className="flex flex-row">
          <Sidebar />

          <Body />
        </div>
      </main>

      {!session ? (
        <a href="/login" className="underline">
          Login
        </a>
      ) : (
        <LogoutButton />
      )}
    </>
  );
}
