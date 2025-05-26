
"use client";

import Link from 'next/link';
import { Home, PlusCircle, User, Archive as ArchiveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/profile', label: 'پروفایل', icon: User },
  { href: '/create-habit', label: 'عادت جدید', icon: PlusCircle },
  { href: '/archive', label: 'آرشیو', icon: ArchiveIcon }, // New Archive Item
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

  // Ensure navItems are reordered if needed, Home should be on the right for RTL
  const displayedNavItems = [...navItems].sort((a, b) => {
    if (a.href === '/my-habits') return 1; // Moves Home to the end (right in RTL)
    if (b.href === '/my-habits') return -1;
    if (a.href === '/archive' && b.href !== '/my-habits') return 1; // Archive before home
    if (b.href === '/archive' && a.href !== '/my-habits') return -1;
    return 0; // Keep original order for others relative to each other
  });


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2">
      <div className="flex justify-around items-center h-16 px-1"> {/* Reduced px slightly for 4 items */}
        {displayedNavItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={cn(
                'flex flex-col items-center justify-center text-xs p-2 rounded-md transition-colors w-1/4', // Adjusted to w-1/4 for 4 items
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5 mb-0.5" /> {/* Slightly smaller icon for 4 items */}
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
