
"use client";

import Link from 'next/link';
import { Home, PlusCircle, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/profile', label: 'پروفایل', icon: User },
  { href: '/create-habit', label: 'عادت جدید', icon: PlusCircle },
  { href: '/my-habits', label: 'عادت‌ها', icon: Home },
];

export default function BottomNavigation() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  if (isLoading || !mounted || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2">
      <div className="flex justify-around items-center h-16 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-primary"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={cn(
                'flex flex-col items-center justify-center text-xs p-2 rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold' // Active item
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary' // Inactive item, with its specific hover
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="h-6 w-6 mb-0.5" />
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
