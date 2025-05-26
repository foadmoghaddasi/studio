import type { Metadata } from 'next';
import { Vazirmatn, Geist_Mono } from 'next/font/google'; // Import Vazirmatn
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { HabitProvider } from '@/providers/habit-provider';
import { Toaster } from '@/components/ui/toaster';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AuthProvider from '@/providers/auth-provider';

const vazir = Vazirmatn({ // Initialize Vazirmatn
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir', // Define a CSS variable for Vazirmatn
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'روز به روز',
  description: 'اپلیکیشن مدیریت عادت‌ها',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${geistMono.variable}`}>
      <body className="antialiased"> {/* Tailwind will apply font-sans (Vazir) via globals.css */}
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <main className="flex-grow container mx-auto max-w-md p-4 pt-8">
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
