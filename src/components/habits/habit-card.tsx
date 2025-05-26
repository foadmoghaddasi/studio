
"use client";

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from './progress-ring';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useHabits } from '@/providers/habit-provider';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMotivationalMessage } from '@/ai/flows/personalized-motivation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { completeDay, toggleHabitActive } = useHabits();
  const { toast } = useToast();
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(() => {
    if (!habit.lastCheckedIn) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.lastCheckedIn.startsWith(today);
  });


  const handleCompleteDay = async () => {
    const updatedHabit = completeDay(habit.id);
    if (updatedHabit) {
      setIsCompletedToday(true);
      toast({
        title: "عالی بود!",
        description: `عادت "${updatedHabit.title}" برای امروز ثبت شد.`,
      });

      setIsLoadingMotivation(true);
      try {
        const motivation = await getMotivationalMessage({
          habitName: updatedHabit.title,
          daysCompleted: updatedHabit.daysCompleted,
          totalDays: updatedHabit.totalDays,
          successful: true,
        });
        setMotivationalMessage(motivation.message);
      } catch (error) {
        console.error("Failed to fetch motivational message", error);
        setMotivationalMessage("ادامه بده، تو می‌تونی!"); // Fallback
      } finally {
        setIsLoadingMotivation(false);
      }
    } else {
       toast({
        title: "توجه",
        description: `عادت "${habit.title}" قبلاً برای امروز ثبت شده.`,
        variant: "default",
      });
    }
  };

  const percentage = habit.totalDays > 0 ? (habit.daysCompleted / habit.totalDays) * 100 : 0;

  return (
    <Card className={cn(
      "w-full shadow-md hover:shadow-lg transition-all duration-300",
      !habit.isActive && "opacity-60 bg-muted/50"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Link href={`/habits/${habit.id}`} legacyBehavior>
          <a className={cn("hover:underline", !habit.isActive && "pointer-events-none")}>
            <CardTitle className="text-xl font-semibold">{habit.title}</CardTitle>
          </a>
        </Link>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Label htmlFor={`active-switch-${habit.id}`} className="text-sm text-muted-foreground">
            {habit.isActive ? 'فعال' : 'غیرفعال'}
          </Label>
          <Switch
            id={`active-switch-${habit.id}`}
            checked={habit.isActive}
            onCheckedChange={() => toggleHabitActive(habit.id)}
            aria-label={habit.isActive ? ' عادت فعال است' : 'عادت غیرفعال است'}
          />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">
            پیشرفت: {habit.daysCompleted} از {habit.totalDays} روز
          </p>
          <p className="text-xs text-muted-foreground">
            تاریخ شروع: {new Date(habit.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>
        <ProgressRing
          percentage={percentage}
          valueText={`${habit.daysCompleted}/${habit.totalDays}`}
          size={70}
          strokeWidth={6}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3">
        <Button 
          onClick={handleCompleteDay} 
          className="w-full text-md p-5 rounded-lg transition-transform active:scale-95"
          disabled={isCompletedToday || !habit.isActive}
        >
          {isCompletedToday ? (
            <>
              <CheckCircle className="ml-2 h-5 w-5" />
              امروز انجام شد!
            </>
          ) : (
            "امروزم تونستم!"
          )}
        </Button>
        {isLoadingMotivation && (
          <div className="flex items-center justify-center text-sm text-muted-foreground p-2">
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            در حال دریافت پیام انگیزشی...
          </div>
        )}
        {motivationalMessage && !isLoadingMotivation && (
          <div className="mt-2 p-3 bg-accent/20 rounded-md text-sm text-accent-foreground text-center animate-in fade-in duration-300">
            {motivationalMessage}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
