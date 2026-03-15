import Sidebar from "@/components/Sidebar";
import CalendarWidget from "@/components/CalendarWidget";
import HabitTracker from "@/components/HabitTracker";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 text-gray-900 flex flex-col md:flex-row pb-16 md:pb-0 relative">
        <div className="flex-1 max-w-4xl mx-auto w-full h-full overflow-y-auto">
          {children}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 h-full border-l border-gray-200 bg-gray-50 p-6 hidden lg:block overflow-y-auto shrink-0 sticky top-0">
          <CalendarWidget />
          <HabitTracker />
        </aside>
      </main>

      <BottomNav />
    </>
  );
}
