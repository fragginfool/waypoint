import CalendarWidget from '@/components/CalendarWidget';

export default function CalendarPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 md:hidden">My Calendar</h1>
      <CalendarWidget />
    </div>
  );
}
