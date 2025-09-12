import Sidebar from "@/app/sidebar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen min-w-screen">
      <div className="flex flex-row">
        <Sidebar />
        <div className="flex-1 p-6 bg-linear-to-t from-blue-500 to-indigo-500">{children}</div>
      </div>
    </main>
  );
}
