
"use client";

import Link from 'next/link';
import { Home, Archive as ArchiveIcon, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

// Define navItems without Profile
const navItems = [
  { href: '/my-habits', label: 'عادت‌ها', icon: Home },
  { href: '/archive', label: 'آرشیو', icon: ArchiveIcon },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  if (isLoading || !mounted || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  // Order for RTL display (Right to Left): My Habits | Archive | Settings
  const displayedNavItems = [...navItems].sort((a, b) => {
    const orderMap: Record<string, number> = {
      '/my-habits': 0,  // Will be rightmost for user
      '/archive': 1,    // Middle
      '/settings': 2,   // Will be leftmost for user
    };

    const orderA = orderMap[a.href] ?? 99;
    const orderB = orderMap[b.href] ?? 99;

    return orderA - orderB;
  });


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full h-28">
      <div className="flex justify-around items-start h-full px-1 pt-4"> {/* Changed items-center to items-start, added pt-4, kept h-full (of h-28 nav) */}
        {displayedNavItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={cn(
                'flex flex-col items-center text-xs rounded-md transition-colors flex-1 min-w-0', // Removed p-2 and justify-center
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5 mb-4" /> {/* mb-4 provides 16px gap */}
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}

