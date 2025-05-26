
import type { Metadata } from 'next';
// Vazirmatn import removed
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { HabitProvider } from '@/providers/habit-provider';
import { Toaster } from '@/components/ui/toaster';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AuthProvider from '@/providers/auth-provider';
import AppBar from '@/components/layout/app-bar';

// const vazir = Vazirmatn(...); // Vazirmatn const declaration removed

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
    // vazir.variable removed from className
    // font-sans class added back to body for default Tailwind font
    <html lang="fa" dir="rtl" className={`${geistMono.variable}`} suppressHydrationWarning={true}>
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <AppBar />
                <main className="flex-grow container mx-auto max-w-md p-4 pt-8"> {/* Changed pt-6 to pt-8 */}
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
