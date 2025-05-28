import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { HabitProvider } from "@/providers/habit-provider";
import { Toaster } from "@/components/ui/toaster";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AuthProvider from "@/providers/auth-provider";
import AppBar from "@/components/layout/app-bar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "روز به روز",
  description: "اپلیکیشن مدیریت عادت‌ها",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <head>
        <meta name="theme-color" content="#4FD1C5" />
      </head>
      <body
        className="antialiased font-sans bg-background"
        suppressHydrationWarning={true}
      >
        {" "}
        {/* Ensure bg-background is on body */}
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            {" "}
            {/* Default to light, disable system for now to match design */}
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <AppBar />
                {/* Increased pt for taller AppBar, more overall padding for the new design */}
                <main className="flex-grow container mx-auto max-w-md p-4 sm:p-6 pt-24">
                  {" "}
                  {/* pt-24 to account for h-20 AppBar + spacing */}
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
