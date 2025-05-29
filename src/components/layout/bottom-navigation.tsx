
"use client";

import Link from 'next/link';
import { Home, Archive as ArchiveIcon, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/my-habits', label: 'عادت‌ها', icon: Home, dataAiHint: "home habits" },
  { href: '/archive', label: 'آرشیو', icon: ArchiveIcon, dataAiHint: "archive folder" },
  { href: '/settings', label: 'تنظیمات', icon: Settings, dataAiHint: "settings gear" },
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
    <nav 
      className={cn(
        "fixed bottom-4 bg-card rounded-full shadow-lg h-16 z-50",
        // Mobile: w-60, centered using transform
        "w-60 left-1/2 -translate-x-1/2",
        // Desktop (md and up): width auto up to max-w-sm, centered using mx-auto
        "md:w-auto md:max-w-sm md:left-auto md:translate-x-0 md:mx-auto"
      )}
      aria-label="منوی اصلی پایین صفحه"
    > 
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
                  'group flex items-center justify-center rounded-full transition-colors flex-1 h-full relative'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <div className={cn(
                  "flex items-center justify-center transition-all duration-200 ease-out h-12 w-12", // Base size for the icon container
                  isActive 
                    ? "bg-primary rounded-full" 
                    : "group-hover:bg-primary/10 group-hover:rounded-full"
                )}>
                  <item.icon className={cn(
                    "h-6 w-6", 
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-card-foreground/70 group-hover:text-primary" 
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
