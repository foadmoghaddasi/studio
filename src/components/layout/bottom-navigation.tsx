
"use client";

import Link from 'next/link';
import { Home, PlusCircle, Archive as ArchiveIcon } from 'lucide-react'; // Removed User icon
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

const navItems = [
  // { href: '/profile', label: 'پروفایل', icon: User }, // Removed Profile item
  { href: '/create-habit', label: 'عادت جدید', icon: PlusCircle },
  { href: '/archive', label: 'آرشیو', icon: ArchiveIcon },
  { href: '/my-habits', label: 'عادت‌ها', icon: Home },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  if (isLoading || !mounted || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  const displayedNavItems = [...navItems].sort((a, b) => {
    if (a.href === '/my-habits') return 1; 
    if (b.href === '/my-habits') return -1;
    if (a.href === '/archive' && b.href !== '/my-habits') return 1;
    if (b.href === '/archive' && a.href !== '/my-habits') return -1;
    // For 'create-habit', ensure it's in the middle if possible, or keep a consistent order
    // Given 3 items, the middle item based on current sorting logic would be 'archive'.
    // Let's ensure 'create-habit' is visually centered if an odd number of items.
    // Current order after sort: Create Habit, Archive, My Habits (RTL: My Habits, Archive, Create Habit)
    // If we want Create Habit to be middle visually on LTR for 3 items [item1, create-habit, item3]
    // No, the current sort is fine. It will be Home, Archive, Create Habit (right to left).
    return 0; 
  });


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full">
      <div className="flex justify-around items-center h-16 px-1">
        {displayedNavItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={cn(
                'flex flex-col items-center justify-center text-xs p-2 rounded-md transition-colors flex-1 min-w-0', // Use flex-1 for equal distribution
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
