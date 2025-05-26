
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

const OTP_LENGTH = 6;

export default function OtpForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const performSubmitLogic = useCallback(() => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    // Simulate API call & login
    setTimeout(() => {
      login(); // This will redirect to /my-habits
      // setIsLoading(false); // Not strictly necessary as it will redirect and unmount
    }, 1000);
  }, [isLoading, login]);

  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === OTP_LENGTH && !isLoading) {
      performSubmitLogic();
    }
  }, [otp, isLoading, performSubmitLogic]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1); // Take only the last digit entered
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSubmitLogic();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] text-center p-4" lang="fa">
      <h1 className="text-2xl font-semibold text-foreground mb-4">تایید شماره تلفن</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        کد ۶ رقمی برای تایید به شماره شما فرستاده شده است.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
        <div className="flex justify-center space-x-2" dir="ltr">
          {otp.map((data, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target as HTMLInputElement, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-14 text-2xl text-center rounded-lg border-2 focus:border-primary focus:ring-primary transition-all"
              aria-label={`OTP digit ${index + 1}`}
              disabled={isLoading}
            />
          ))}
        </div>

        <div className="text-muted-foreground">
          {countdown > 0 ? (
            <span>ارسال مجدد کد تا {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')} دیگر</span>
          ) : (
            <Button variant="link" onClick={() => setCountdown(59)} className="p-0 h-auto" disabled={isLoading}>
              ارسال مجدد کد
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Button type="submit" className="w-full text-lg p-6 rounded-lg" disabled={isLoading || otp.join("").length !== OTP_LENGTH}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ادامه"}
          </Button>
          <Button variant="outline" className="w-full text-lg p-6 rounded-lg" onClick={() => router.back()} disabled={isLoading}>
            بازگشت
          </Button>
        </div>
      </form>
    </div>
  );
}
