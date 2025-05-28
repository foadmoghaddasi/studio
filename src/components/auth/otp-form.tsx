
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";
import { toPersianNumerals } from "@/lib/utils";

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
    if (isLoading) return; 
    setIsLoading(true);
    setTimeout(() => {
      login(); 
    }, 1000);
  }, [isLoading, login]);

  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === OTP_LENGTH && !isLoading) {
      performSubmitLogic();
    }
  }, [otp, isLoading, performSubmitLogic]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return; 

    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1); 
    setOtp(newOtp);

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

  const formattedCountdown = () => {
    const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
    const seconds = String(countdown % 60).padStart(2, '0');
    return `${toPersianNumerals(minutes)}:${toPersianNumerals(seconds)}`;
  }

  return (
    // Updated layout to match new design
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-8rem)] p-6 sm:p-8" lang="fa">
      <div className="w-full max-w-sm text-right mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">تایید شماره تلفن</h1> {/* Slightly smaller title */}
        <p className="text-muted-foreground text-sm"> {/* Smaller description */}
          خوب حالا یه اس ام اس حاوی کد 6 رقمی برات ارسال شده، بی زحمت اونو وارد کن و تمام!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
        {/* OTP Inputs: rounded-full, slightly larger */}
        <div className="flex justify-center space-x-2 rtl:space-x-reverse" dir="ltr">
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
              className="w-12 h-12 text-xl text-center rounded-full border-border focus:border-primary" // Ensure rounded-full
              aria-label={`OTP digit ${index + 1}`}
              disabled={isLoading}
            />
          ))}
        </div>

        <div className="text-muted-foreground text-sm text-center"> {/* Smaller text */}
          {countdown > 0 ? (
            <span>ارسال مجدد کد تا {formattedCountdown()} دیگر</span>
          ) : (
            <Button variant="link" onClick={() => setCountdown(59)} className="p-0 h-auto text-sm" disabled={isLoading}>
              ارسال مجدد کد
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Buttons: rounded-full, new height */}
          <Button type="submit" className="w-full text-lg p-0 h-14 rounded-full" disabled={isLoading || otp.join("").length !== OTP_LENGTH} size="lg">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ادامه"}
          </Button>
          <Button variant="outline" className="w-full text-lg p-0 h-14 rounded-full border-border hover:bg-muted" onClick={() => router.back()} disabled={isLoading} size="lg">
            بازگشت
          </Button>
        </div>
      </form>
    </div>
  );
}

    