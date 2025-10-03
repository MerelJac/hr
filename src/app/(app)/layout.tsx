import Sidebar from "@/app/sidebar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen min-w-screen flex">
      {/* Sidebar: fixed */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md">
        <Sidebar />
      </div>

      {/* Content: scrolls next to sidebar */}
      <div className="ml-64 flex-1 overflow-y-auto ">
        {children}
      </div>
    </main>
  );
}
