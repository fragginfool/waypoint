import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CalendarWidget from "@/components/CalendarWidget";
import HabitTracker from "@/components/HabitTracker";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Waypoint | Plan, Track, Capture",
  description: "A hub for tracking tasks, goals, appointments, and visual journaling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex bg-gray-50 text-gray-900`}
      >
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto bg-gray-50 text-gray-900 flex flex-col md:flex-row pb-16 md:pb-0 relative">
          <div className="flex-1 max-w-4xl mx-auto w-full h-full overflow-y-auto">
            {children}
          </div>

          {/* Right Sidebar */}
          <aside className="w-80 h-full border-l border-gray-200 bg-gray-50 p-6 hidden lg:block overflow-y-auto shrink-0 sticky top-0 space-y-8">
            <CalendarWidget />
            <ActivityHeatmap />
            <HabitTracker />
          </aside>
        </main>
        
        <BottomNav />
      </body>
    </html>
  );
}