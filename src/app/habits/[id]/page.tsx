"use client";

import { useParams, useRouter } from 'next/navigation';
import { useHabits } from '@/providers/habit-provider';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/habits/progress-ring';
import MotivationalQuote from '@/components/habits/motivational-quote';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Edit3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getHabitById, completeDay } = useHabits();
  const { toast } = useToast();
  
  const [habitId, setHabitId] = useState<string | null>(null);
  const [triggerMotivation, setTriggerMotivation] = useState(0); // Change to trigger fetch
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    if (params.id) {
      setHabitId(Array.isArray(params.id) ? params.id[0] : params.id);
    }
  }, [params.id]);

  const habit = habitId ? getHabitById(habitId) : undefined;

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] text-center p-4" lang="fa">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">در حال بارگذاری اطلاعات عادت...</p>
      </div>
    );
  }

  const percentage = habit.totalDays > 0 ? (habit.daysCompleted / habit.totalDays) * 100 : 0;
  const isCompletedToday = habit.lastCheckedIn?.startsWith(new Date().toISOString().split('T')[0]) ?? false;

  const handleCompleteDay = async () => {
    setIsLoadingComplete(true);
    const updatedHabit = completeDay(habit.id);
    if (updatedHabit) {
       toast({
        title: "عالی بود!",
        description: `عادت "${updatedHabit.title}" برای امروز ثبت شد.`,
      });
      setTriggerMotivation(prev => prev + 1); // Trigger motivational message
    } else {
       toast({
        title: "توجه",
        description: `عادت "${habit.title}" قبلاً برای امروز ثبت شده.`,
        variant: "default",
      });
    }
    setIsLoadingComplete(false);
  };


  return (
    <div className="space-y-6 pb-20" lang="fa">
      <Button variant="ghost" onClick={() => router.push('/my-habits')} className="mb-4">
        <ArrowRight className="ml-2 h-4 w-4" fill="currentColor" />
        بازگشت به لیست عادت‌ها
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{habit.title}</CardTitle>
          <CardDescription className="text-lg">
            {habit.daysCompleted} روز از {habit.totalDays} روز انجام شده
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8 py-8">
          <ProgressRing
            percentage={percentage}
            valueText={`${habit.daysCompleted} / ${habit.totalDays}`}
            size={150}
            strokeWidth={10}
          />
          <Button 
            onClick={handleCompleteDay} 
            className="w-full max-w-xs text-lg p-6 rounded-lg transition-transform active:scale-95"
            disabled={isCompletedToday || !habit.isActive || isLoadingComplete}
          >
            {isLoadingComplete ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : 
              isCompletedToday ? (
              <>
                <CheckCircle className="ml-2 h-5 w-5" fill="currentColor" />
                امروز انجام شد!
              </>
            ) : (
              "امروزم انجام شد"
            )}
          </Button>
           {!habit.isActive && <p className="text-sm text-destructive">این عادت در حال حاضر غیرفعال است.</p>}
        </CardContent>
        <CardFooter>
          {/* Placeholder for future edit functionality */}
          {/* <Button variant="outline" size="sm" className="text-muted-foreground">
            <Edit3 className="ml-2 h-4 w-4" fill="currentColor"/>
            ویرایش عادت
          </Button> */}
        </CardFooter>
      </Card>
      
      <MotivationalQuote
        habitName={habit.title}
        daysCompleted={habit.daysCompleted}
        totalDays={habit.totalDays}
        successful={isCompletedToday} // Pass current successful status
        triggerFetch={triggerMotivation > 0} // Trigger on demand
      />
      
      {/* Optional: List of previous check-ins (calendar or list) - Skipped for now */}
    </div>
  );
}
