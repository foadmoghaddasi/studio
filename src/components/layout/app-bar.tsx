
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Search } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const userDisplayName = "کاربر روزبه‌روز";
  const userFirstName = userDisplayName.split(' ')[0];
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    setCurrentDate(`امروز ${today.toLocaleDateString('fa-IR', options)}`);
  }, []);

  if (isLoading || !isAuthenticated || ['/', '/otp'].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-card sticky top-0 z-50 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full border-b border-primary">
      <div className="container mx-auto max-w-md h-16 flex items-center px-4">
        {/* Left: Avatar */}
        <div className="flex-shrink-0">
          <Link href="/profile" passHref legacyBehavior>
            <a aria-label="پروفایل کاربر">
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src="https://placehold.co/100x100.png" alt={userDisplayName} data-ai-hint="profile avatar" />
                <AvatarFallback>
                  <User className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </a>
          </Link>
        </div>

        {/* Center: Greeting & Date */}
        <div className="flex-grow text-center px-2">
          <p className="text-lg font-semibold text-foreground">سلام {userFirstName}!</p>
          {currentDate && <p className="text-sm text-muted-foreground">{currentDate}</p>}
        </div>

        {/* Right: Search Icon Button */}
        <div className="flex-shrink-0">
          <Button variant="ghost" size="icon" className="bg-primary/5">
            <Search className="h-5 w-5 text-primary" />
            <span className="sr-only">جستجو</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
