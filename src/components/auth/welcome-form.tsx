
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react"; // For loading state

export default function WelcomeForm() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push("/otp"); // Navigate to OTP page
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked (placeholder)");
    // Placeholder for Google login logic
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] text-center p-4" lang="fa">
      <h1 className="text-4xl font-bold text-primary mb-4">روز به روز</h1>
      <p className="text-xl text-foreground mb-2">سلام خیلی خوش اومدی</p>
      <p className="text-muted-foreground mb-8 max-w-xs">
        خوشحالم که اومدی تا یه تغییر مثبت توی زندگیت ایجاد کنی
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <Input
          type="tel"
          placeholder="شماره تلفن همراه"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="text-lg p-3 text-center rounded-lg"
          dir="ltr" // Phone numbers are usually LTR
          required
          aria-label="شماره تلفن همراه"
        />
        <Button type="submit" className="w-full text-lg p-6 rounded-lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ادامه"}
        </Button>
      </form>

      <div className="flex items-center w-full max-w-sm my-8">
        <Separator className="flex-1" />
        <span className="px-4 text-muted-foreground">یا</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="outline" className="w-full max-w-sm text-lg p-6 rounded-lg" onClick={handleGoogleLogin}>
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        ورود با حساب گوگل
      </Button>
    </div>
  );
}
