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
  themeColor: "#4FD1C5", // From original, updated for new design
};

export const viewport: Viewport = {
  themeColor: "#4FD1C5", // Matches the new primary color for the new design
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
            defaultTheme="light" // Set light as default to match new design
            enableSystem={false} // Disable system preference for now
          >
            {" "}
            <HabitProvider>
              <div className="flex flex-col min-h-svh">
                <AppBar />
                <main className="flex-grow container mx-auto max-w-md p-4 sm:p-6 pt-20">
                  {" "}
                  {/* Changed pt-24 to pt-20 to align content immediately below AppBar */}
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
