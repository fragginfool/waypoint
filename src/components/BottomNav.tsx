'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, CheckSquare, Activity, Calendar } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Feed', icon: Home },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/habits', label: 'Habits', icon: Activity },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <ul className="flex items-center justify-between">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={24} className={isActive ? 'fill-blue-50' : ''} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
