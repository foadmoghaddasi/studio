
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google'; // Assuming Vazirmatn is preferred
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { HabitProvider } from '@/providers/habit-provider';
import { Toaster } from '@/components/ui/toaster';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AuthProvider from '@/providers/auth-provider';
import AppBar from '@/components/layout/app-bar';

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'], // Include subsets for Vazirmatn
  variable: '--font-vazir',
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'روز به روز',
  description: 'اپلیکیشن مدیریت عادت‌ها',
  manifest: '/manifest.json',
  themeColor: '#4FD1C5', // Moved theme-color here
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${geistMono.variable}`} suppressHydrationWarning={true}>
      {/* <head> tag removed, Next.js will generate it */}
      <body className="antialiased font-sans bg-background" suppressHydrationWarning={true}> {/* Ensure bg-background is on body */}
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}> {/* Default to light, disable system for now to match design */}
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <AppBar />
                {/* Increased pt for taller AppBar, more overall padding for the new design */}
                <main className="flex-grow container mx-auto max-w-md p-4 sm:p-6 pt-24"> {/* pt-24 to account for h-20 AppBar + spacing */}
                  {children}
                </main>
                <BottomNavigation />
              </div>
              <Toaster />
            </HabitProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
