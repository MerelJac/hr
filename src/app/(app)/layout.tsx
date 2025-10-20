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
      <div className="md:top-0 md:left-0 md:h-screen  md:bg-white md:shadow-md md:block">
        <Sidebar />
      </div>

      {/* Content Area MOBILE */}
      <div className="md:hidden flex-1 overflow-y-auto w-[85%] md:ml-64 pb-20">
        {children}
      </div>

      {/* Content Area WEB*/}
      <div
        className="hidden md:block ml-[15%] w-[calc(100%-15%)]">
        {children}
      </div>

      {/* Mobile bottom nav (inside Sidebar component) will overlay below */}
      <MobileNav />
    </main>
  );
}
