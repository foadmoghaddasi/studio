
"use client";

import Link from 'next/link';
import { Home, Archive as ArchiveIcon, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

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
  
  if (isLoading || !mounted || !isAuthenticated || ['/', '/otp', '/profile-setup'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 inset-x-4 bg-card rounded-full shadow-lg h-16 z-50 md:max-w-md md:mx-auto"> 
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                         (item.href === '/my-habits' && pathname.startsWith('/habits/')) ||
                         (item.href === '/my-habits' && pathname.startsWith('/create-habit')) ||
                         (item.href === '/my-habits' && pathname.startsWith('/edit-habit'));
          return (
            <Link key={item.href} href={item.href} legacyBehavior>
              <a
                className={cn(
                  'group flex items-center justify-center rounded-full transition-colors flex-1 h-full relative', 
                  isActive ? 'font-semibold' : 'text-card-foreground/70'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center transition-all duration-200 ease-out",
                  isActive 
                    ? "bg-primary rounded-full h-12 w-12" // Increased size for active
                    : "group-hover:bg-primary/10 group-hover:rounded-full h-12 w-12" // Increased size for hover
                )}>
                  <item.icon className={cn(
                    "h-6 w-6", 
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-inherit group-hover:text-primary" 
                  )} />
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
