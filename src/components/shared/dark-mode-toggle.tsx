
"use client";

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon } from 'lucide-react'; // Sun import removed
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function DarkModeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return <div className={cn("h-10 rounded-md bg-muted animate-pulse", showLabel ? "w-full" : "w-16" )} />;
  }

  const isDarkMode = theme === 'dark';

  return (
    <div className={cn("flex items-center", showLabel && "justify-between w-full")}>
      {showLabel && (
        <Label htmlFor="dark-mode-switch" className="text-sm">
          {isDarkMode ? 'حالت شب' : 'حالت روز'}
        </Label>
      )}
      <div className="flex items-center">
        {/* Sun icon and its conditional classes removed */}
        <Switch
          id="dark-mode-switch"
          checked={isDarkMode}
          onCheckedChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="mx-2"
          aria-label={isDarkMode ? "تغییر به حالت روز" : "تغییر به حالت شب"}
        />
        <Moon className={`h-6 w-6 transition-opacity ${isDarkMode ? 'opacity-100 text-primary' : 'opacity-50'}`} />
      </div>
    </div>
  );
}
