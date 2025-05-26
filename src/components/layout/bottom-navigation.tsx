
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
  
  if (isLoading || !mounted || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  const displayedNavItems = [...navItems].sort((a, b) => {
    const orderMap: Record<string, number> = {
      '/my-habits': 0,  
      '/archive': 1,    
      '/settings': 2,   
    };

    const orderA = orderMap[a.href] ?? 99;
    const orderB = orderMap[b.href] ?? 99;

    return orderA - orderB;
  });


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full h-24 border-t-2 border-primary"> 
      <div className="flex items-start h-full pt-4 gap-x-2">
        {displayedNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} legacyBehavior>
              <a
                className={cn(
                  'flex flex-col items-center text-xs rounded-md transition-colors flex-1 min-w-0 group',
                  isActive ? 'font-semibold' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 mb-2 transition-colors", 
                  isActive 
                    ? "bg-primary rounded-full" 
                    : "group-hover:bg-primary/10 group-hover:rounded-full"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5", 
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-inherit group-hover:text-primary"
                  )} />
                </div>
                <span className={cn(
                  isActive 
                    ? "text-primary" 
                    : "text-inherit group-hover:text-primary"
                )}> 
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
