
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppBar() {
  const { isAuthenticated, isLoading, firstName, profilePictureUrl } = useAuth(); // Added profilePictureUrl
  const pathname = usePathname();
  
  const userDisplayName = firstName || "کاربر";
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
    <header className="bg-card sticky top-0 z-50 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full border-b border-primary">
      <div className="container mx-auto max-w-md h-16 flex items-center px-4">
        <div className="flex-shrink-0">
          <Link href="/profile" passHref legacyBehavior>
            <a aria-label="پروفایل کاربر">
              <Avatar className="h-10 w-10 cursor-pointer"> {/* Increased size from h-8 w-8 */}
                <AvatarImage src={profilePictureUrl || "https://placehold.co/100x100.png"} alt={userDisplayName} data-ai-hint="profile avatar" />
                <AvatarFallback>
                  <User className="w-5 h-5 text-muted-foreground" /> {/* Increased fallback icon size */}
                </AvatarFallback>
              </Avatar>
            </a>
          </Link>
        </div>

        <div className="flex-grow text-center px-2">
          <p className="text-base font-semibold text-foreground">سلام {userGreetingName}!</p>
          {currentDate && <p className="text-xs text-muted-foreground">{currentDate}</p>}
        </div>

        <div className="flex-shrink-0">
          <Button variant="ghost" size="icon" className="bg-primary/5 text-primary">
            <Bell className="h-5 w-5" />
            <span className="sr-only">اعلان‌ها</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
