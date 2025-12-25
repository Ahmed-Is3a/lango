'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/learn', label: 'Vocabs', icon: '🔤' },
  { href: '/stories', label: 'Stories', icon: '📖' },
  { href: '/quiz', label: 'Quiz', icon: '✏️' },
  { href: '/progress', label: 'Progress', icon: '📊' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / Web Navigation */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-white/80 backdrop-blur dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Lango
          </Link>

          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center py-2 text-sm transition-colors ${
              pathname === item.href
                ? 'text-indigo-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="text-1xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
