
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';

export default function AppBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const userName = "کاربر روزبه‌روز"; // Placeholder, sync with profile page

  // Do not render AppBar on auth pages or if not authenticated
  if (isLoading || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full" lang="fa">
      <div className="container mx-auto max-w-md h-16 flex items-center justify-between px-4">
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9 border border-primary/50">
            <AvatarImage src="https://placehold.co/100x100.png" alt={userName} data-ai-hint="profile avatar" />
            <AvatarFallback>
              <User className="w-5 h-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{userName}</span>
        </Link>
        {/* Placeholder for potential actions like notifications or settings icon */}
        <div></div>
      </div>
    </header>
  );
}

