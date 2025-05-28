
"use client";

import Link from 'next/link';
import { Home, Archive as ArchiveIcon, Settings, Users, BarChart2 } from 'lucide-react'; // Example icons
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

// Updated navItems to have 5 items as per the design image
const navItems = [
  { href: '/my-habits', label: 'عادت‌ها', icon: Home },
  { href: '/stats', label: 'آمار', icon: BarChart2 }, // Placeholder for stats
  { href: '/community', label: 'انجمن', icon: Users }, // Placeholder for community
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

  // Simple sort based on the order in navItems for now. RTL handled by flex direction.
  const displayedNavItems = navItems;


  return (
    // Bottom Nav styling: Darker background, more rounded top corners, specific height
    <nav className="bg-card fixed bottom-0 left-0 right-0 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full h-20 rounded-t-3xl z-50"> 
      <div className="flex items-center justify-around h-full px-2 pt-2"> {/* justify-around for even spacing */}
        {displayedNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/my-habits' && pathname.startsWith('/habits/')); // Highlight 'عادت‌ها' for detail pages too
          return (
            <Link key={item.href} href={item.href} legacyBehavior>
              <a
                className={cn(
                  'group flex flex-col items-center justify-center text-xs rounded-md transition-colors flex-1 min-w-0 h-full relative', 
                  isActive ? 'font-semibold' : 'text-card-foreground/70 hover:text-card-foreground' // Lighter text for inactive
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 mb-0.5 transition-all duration-200 ease-out", 
                  // Active state: pill shape background
                  isActive 
                    ? "bg-primary/20 dark:bg-primary/30 rounded-full p-1.5" // Using primary with opacity for active item background
                    : "group-hover:bg-primary/10 dark:group-hover:bg-primary/20 rounded-full p-1.5"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5", 
                    isActive 
                      ? "text-primary dark:text-primary-foreground" // Active icon color
                      : "text-inherit" 
                  )} />
                </div>
                {/* Text label, smaller and optional based on design (kept for now) */}
                <span className={cn(
                  "text-[10px]", // Smaller text
                  isActive 
                    ? "text-primary dark:text-primary-foreground" 
                    : "text-inherit"
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

    