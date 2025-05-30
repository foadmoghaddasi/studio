
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react'; // Replaced Menu with Bell
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toPersianNumerals } from '@/lib/utils';

export default function AppBar() {
  const { isAuthenticated, isLoading, firstName, profilePictureUrl } = useAuth();
  const pathname = usePathname();

  const userGreetingName = firstName || "کاربر";

  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    setCurrentDate(`امروز ${today.toLocaleDateString('fa-IR', options)}`);
  }, []);

  if (isLoading || !isAuthenticated || ['/', '/otp', '/profile-setup'].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-card sticky top-0 z-50 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full">
      <div className="container mx-auto max-w-md h-20 flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/profile" passHref legacyBehavior>
          <a aria-label="پروفایل کاربر" className="flex-shrink-0">
            <Avatar className="h-10 w-10 cursor-pointer border-2 border-border">
              <AvatarImage src={profilePictureUrl || "/icons/default-profile-img.png"} alt={userGreetingName} data-ai-hint="user avatar" />
              <AvatarFallback>
                <User className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </a>
        </Link>

        <div className="flex flex-col items-center text-center flex-grow">
          <p className="text-base font-semibold text-foreground">سلام، {userGreetingName}!</p>
          {currentDate && <p className="text-xs text-muted-foreground">{currentDate}</p>}
        </div>

        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/5 text-primary flex-shrink-0" aria-label="اعلان‌ها">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
