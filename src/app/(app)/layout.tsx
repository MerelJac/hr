import Sidebar from "@/app/sidebar";
import MobileNav from "../mobile-sidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* Sidebar: hidden on mobile */}
      <div className="md:top-0 md:left-0 md:h-screen md:w-64 md:bg-white md:shadow-md md:block">
        <Sidebar />
      </div>

      {/* Content Area */}
      <div
        className="md:hidden
          flex-1 
          overflow-y-auto 
          w-full
          md:ml-64
          pb-20
        "
      >
        {children}
      </div>

      {/* Content Area */}
      <div
        className="hidden md:block
          overflow-y-auto 
          w-full
        "
      >
        {children}
      </div>

      {/* Mobile bottom nav (inside Sidebar component) will overlay below */}
      <MobileNav />
    </main>
  );
}
