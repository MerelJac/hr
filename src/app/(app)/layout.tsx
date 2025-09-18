import Sidebar from "@/app/sidebar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen min-w-screen flex">
      {/* Sidebar: fixed */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md">
        <Sidebar />
      </div>

      {/* Content: scrolls next to sidebar */}
      <div className="ml-64 flex-1 overflow-y-auto p-6 bg-gradient-to-t from-blue-500 to-indigo-500">
        {children}
      </div>
    </main>
  );
}
