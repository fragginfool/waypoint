import Link from 'next/link';
import { Home, Download } from 'lucide-react';
import TasksList from './TasksList';
import GoalsList from './GoalsList';

export default async function Sidebar() {
  const links = [
    { href: '/', label: 'Home', icon: Home },
  ];

  return (
    <div className="w-[360px] bg-white text-gray-900 flex flex-col h-full shrink-0 border-r border-gray-200 overflow-y-auto">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-blue-600">Waypoint</h1>
        <p className="text-sm text-gray-500 mt-1">Plan. Track. Capture.</p>
      </div>

      <nav className="px-4 space-y-2 my-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors text-gray-700 font-medium"
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 px-6 pb-6 space-y-8 overflow-y-auto">
        <GoalsList />
        <TasksList />
      </div>

      <div className="p-4 border-t border-gray-200 shrink-0 flex flex-col gap-4">
        <a 
          href="/api/export" 
          download
          className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-xl transition-colors text-sm border border-gray-200"
        >
          <Download size={16} />
          Export Journal (.zip)
        </a>
      </div>
    </div>
  );
}
