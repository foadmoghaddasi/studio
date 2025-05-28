
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Bell, Menu } from 'lucide-react'; // Added Menu for a potential logo placeholder
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
    // More concise date format as in the image (e.g., "امروز ۲۵ آبان")
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    setCurrentDate(`امروز ${today.toLocaleDateString('fa-IR', options)}`);
  }, []);

  if (isLoading || !isAuthenticated || ['/', '/otp', '/profile-setup'].includes(pathname)) {
    return null; 
  }

  return (
    // AppBar styling: floating, no bottom border, slightly more padding
    <header className="bg-transparent sticky top-0 z-50 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 w-full">
      <div className="container mx-auto max-w-md h-20 flex items-center justify-between px-4 sm:px-6 py-3"> {/* Increased height and padding */}
        {/* Logo Placeholder - Can be replaced with an actual logo later */}
        <div className="flex-shrink-0">
          {/* Using a simple Menu icon as a placeholder for the logo */}
          <Menu className="h-7 w-7 text-foreground" />
        </div>

        <div className="flex items-center space-x-3 space-x-reverse"> {/* User info on the right */}
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">سلام، {userGreetingName} 👋</p> {/* Added waving hand emoji */}
          </div>
          <Link href="/profile" passHref legacyBehavior>
            <a aria-label="پروفایل کاربر">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-border"> {/* Consistent avatar size */}
                <AvatarImage src={profilePictureUrl || "https://placehold.co/100x100.png"} alt={userGreetingName} data-ai-hint="user avatar" />
                <AvatarFallback>
                  <User className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}

    