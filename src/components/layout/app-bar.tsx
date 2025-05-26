
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';

export default function AppBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const userDisplayName = "کاربر روزبه‌روز"; 
  const userFirstName = userDisplayName.split(' ')[0]; 

  if (isLoading || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-card sticky top-0 z-40 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full border-b border-primary" lang="fa"> 
      <div className="container mx-auto max-w-md h-16 flex items-center justify-between px-4">
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt={userDisplayName} data-ai-hint="profile avatar" />
            <AvatarFallback>
              <User className="w-5 h-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">سلام {userFirstName}!</span>
        </Link>
        <div></div>
      </div>
    </header>
  );
}
