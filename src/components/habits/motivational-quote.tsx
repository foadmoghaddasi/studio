
"use client";

import { getMotivationalMessage, type MotivationalMessageInput } from "@/ai/flows/personalized-motivation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";
import React, { useState, useEffect } from "react";

interface MotivationalQuoteProps {
  habitName: string;
  daysCompleted: number;
  totalDays: number;
  successful: boolean;
  triggerFetch?: boolean; // To manually trigger fetch on demand
}

export default function MotivationalQuote({
  habitName,
  daysCompleted,
  totalDays,
  successful,
  triggerFetch = false, // Default to not fetching on mount, fetch on button click or specific event
}: MotivationalQuoteProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const input: MotivationalMessageInput = {
        habitName,
        daysCompleted,
        totalDays,
        successful,
      };
      const result = await getMotivationalMessage(input);
      setMessage(result.message);
    } catch (err) {
      console.error("Failed to get motivational message:", err);
      setError("خطا در دریافت پیام انگیزشی.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (triggerFetch) {
        fetchMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerFetch, habitName, daysCompleted, totalDays, successful]); // Re-fetch if trigger or core data changes

  // Expose a function to allow parent to trigger fetch
  // This can be done via a ref, or by changing `triggerFetch` prop
  // For now, using `triggerFetch` prop change is simpler.

  if (isLoading) {
    return (
      <Alert className="bg-secondary border-secondary-foreground/20 text-secondary-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <AlertTitle className="mr-6">کمی صبر کنید...</AlertTitle>
        <AlertDescription className="mr-6">در حال آماده‌سازی پیام انگیزشی شما.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>خطا</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!message && !triggerFetch) { // Only show if not triggered yet and no message
    return null; // Don't show anything if not triggered and no message yet
  }

  if (!message && triggerFetch && !isLoading) { // If triggered but no message and not loading (e.g. initial state before fetch)
    return null;
  }
  
  if (!message) return null;


  return (
    <Alert className="bg-primary/10 border-primary/30 text-primary-foreground shadow-lg animate-in fade-in duration-500">
       <Sparkles className="h-5 w-5 text-primary" />
      <AlertTitle className="mr-6 font-semibold text-primary">پیام روز</AlertTitle>
      <AlertDescription className="mr-6 text-foreground">
        {message}
      </AlertDescription>
    </Alert>
  );
}

