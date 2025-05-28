
import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { HabitProvider } from "@/providers/habit-provider";
import { Toaster } from "@/components/ui/toaster";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AuthProvider from "@/providers/auth-provider";
import AppBar from "@/components/layout/app-bar";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "روز به روز",
  description: "اپلیکیشن مدیریت عادت‌ها",
  manifest: "/manifest.json",
  themeColor: "#95D4E5", // Light mode primary
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#95D4E5" },
    { media: "(prefers-color-scheme: dark)", color: "#254047" }, // Dark mode secondary or a suitable dark theme color
  ],
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
      className={`${vazir.variable} ${geistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <body
        className="antialiased font-sans bg-background"
        suppressHydrationWarning={true}
      >
        {" "}
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light" 
            enableSystem={false} 
          >
            {" "}
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <AppBar />
                <main className="flex-grow container mx-auto max-w-md px-4 sm:px-6"> {/* REMOVED pt-20 */}
                  {" "}
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
