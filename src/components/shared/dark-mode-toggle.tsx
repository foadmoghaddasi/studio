"use client";

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />;
  }

  const isDarkMode = theme === 'dark';

  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      {showLabel && (
        <Label htmlFor="dark-mode-switch" className="text-lg">
          {isDarkMode ? 'حالت تاریک' : 'حالت روشن'}
        </Label>
      )}
      <div className="flex items-center">
        <Sun className={`h-6 w-6 transition-opacity ${isDarkMode ? 'opacity-50' : 'opacity-100 text-yellow-500'}`} />
        <Switch
          id="dark-mode-switch"
          checked={isDarkMode}
          onCheckedChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="mx-2"
          aria-label={isDarkMode ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
        />
        <Moon className={`h-6 w-6 transition-opacity ${isDarkMode ? 'opacity-100 text-primary' : 'opacity-50'}`} />
      </div>
    </div>
  );
}
