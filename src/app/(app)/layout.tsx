import Header from "@/app/header";
import Sidebar from "@/app/sidebar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen min-w-screen">
      <div className="flex flex-row">
        <Sidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </main>
  );
}
