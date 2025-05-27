
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useHabits } from '@/providers/habit-provider';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/habits/progress-ring';
import MotivationalQuote from '@/components/habits/motivational-quote';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardSection } from '@/components/ui/card'; // CardSection might not exist, will use divs
import { ArrowRight, CheckCircle, Edit3, Loader2, CalendarDays, Clock, Info, ListChecks, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toPersianNumerals } from '@/lib/utils';
import type { HabitStrategyDetails } from '@/lib/types';
import Link from 'next/link';

const getStrategyPersianName = (strategyKey?: '21/90' | '40-day' | '2-minute' | 'if-then' | 'none'): string => {
  switch (strategyKey) {
    case '21/90': return 'قانون ۲۱/۹۰';
    case '40-day': return 'قانون ۴۰ روز';
    case '2-minute': return 'قانون ۲ دقیقه';
    case 'if-then': return 'قانون اگر-آنگاه';
    case 'none':
    default:
      return 'معمولی (بدون روش خاص)';
  }
};

const renderStrategyDetails = (details?: HabitStrategyDetails, strategy?: string) => {
  if (!details || Object.keys(details).length === 0) return null;

  const detailItems = [];

  if (details.startDate) {
    detailItems.push(
      <div key="startDate" className="flex items-center text-sm text-muted-foreground">
        <CalendarDays className="ml-2 h-4 w-4 text-primary" />
        تاریخ شروع: {new Date(details.startDate).toLocaleDateString('fa-IR')}
      </div>
    );
  }
  if (details.reminderTime) {
    detailItems.push(
      <div key="reminderTime" className="flex items-center text-sm text-muted-foreground">
        <Clock className="ml-2 h-4 w-4 text-primary" />
        زمان یادآوری: {toPersianNumerals(details.reminderTime)}
      </div>
    );
  }

  if (strategy === '21/90' && details.days2190) {
    detailItems.push(
      <div key="days2190" className="flex items-center text-sm text-muted-foreground">
        <Info className="ml-2 h-4 w-4 text-primary" />
        مدت هدف: {toPersianNumerals(details.days2190)} روز
      </div>
    );
  }

  if (strategy === '2-minute') {
    if (details.twoMinuteSteps) {
      detailItems.push(
        <div key="twoMinuteSteps" className="mt-2">
          <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
            <ListChecks className="ml-2 h-4 w-4 text-primary" />
            قدم‌های کوچک:
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{details.twoMinuteSteps}</p>
        </div>
      );
    }
    if (details.twoMinuteReminderFrequency) {
      detailItems.push(
        <div key="twoMinuteReminderFrequency" className="flex items-center text-sm text-muted-foreground mt-1">
          <Clock className="ml-2 h-4 w-4 text-primary" />
          فرکانس یادآوری (۲ دقیقه): {details.twoMinuteReminderFrequency}
        </div>
      );
    }
  }

  if (strategy === 'if-then' && details.ifThenRules) {
    detailItems.push(
      <div key="ifThenRules" className="mt-2">
        <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
          <Shuffle className="ml-2 h-4 w-4 text-primary" />
          قواعد اگر-آنگاه:
        </h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{details.ifThenRules}</p>
      </div>
    );
  }

  return detailItems.length > 0 ? <div className="space-y-2 mt-4 pt-4 border-t">{detailItems}</div> : null;
};


export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getHabitById, completeDay } = useHabits();
  const { toast } = useToast();
  
  const [habitId, setHabitId] = useState<string | null>(null);
  const [triggerMotivation, setTriggerMotivation] = useState(0);
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
    if (updatedHabit && updatedHabit.lastCheckedIn?.startsWith(new Date().toISOString().split('T')[0])) {
       toast({
        title: "عالی بود!",
        description: `عادت "${updatedHabit.title}" برای امروز ثبت شد.`,
      });
      setTriggerMotivation(prev => prev + 1); 
    } else {
       toast({
        title: "توجه",
        description: `عادت "${habit.title}" قبلاً برای امروز ثبت شده یا غیرفعال است.`,
        variant: "default",
      });
    }
    setIsLoadingComplete(false);
  };


  return (
    <div className="space-y-6 pb-28" lang="fa"> {/* Increased pb for edit button */}
      <Button variant="ghost" onClick={() => router.push('/my-habits')} className="mb-4">
        <ArrowRight className="ml-2 h-4 w-4" />
        بازگشت به لیست عادت‌ها
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{habit.title}</CardTitle>
          <CardDescription className="text-lg">
            {toPersianNumerals(habit.daysCompleted)} روز از {toPersianNumerals(habit.totalDays)} روز انجام شده
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8 py-8">
          <ProgressRing
            percentage={percentage}
            valueText={`${toPersianNumerals(habit.daysCompleted)} / ${toPersianNumerals(habit.totalDays)}`}
            size={150}
            strokeWidth={10}
          />
          <Button 
            onClick={handleCompleteDay} 
            className="w-full max-w-xs text-lg p-6 rounded-full transition-transform active:scale-95"
            disabled={isCompletedToday || !habit.isActive || isLoadingComplete}
          >
            {isLoadingComplete ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : 
              isCompletedToday ? (
              <>
                <CheckCircle className="ml-2 h-5 w-5" />
                امروز انجام شد!
              </>
            ) : (
              "امروزم انجام شد"
            )}
          </Button>
           {!habit.isActive && <p className="text-sm text-destructive">این عادت در حال حاضر غیرفعال است.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">جزئیات عادت</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {habit.goalDescription && (
            <div className="mb-3">
              <h4 className="font-medium text-foreground">هدف:</h4>
              <p className="text-muted-foreground">{habit.goalDescription}</p>
            </div>
          )}
          {habit.triggers && (
            <div className="mb-3">
              <h4 className="font-medium text-foreground">محرک‌ها:</h4>
              <p className="text-muted-foreground whitespace-pre-line">{habit.triggers}</p>
            </div>
          )}
          <div className="mb-3">
            <h4 className="font-medium text-foreground">روش پیگیری:</h4>
            <p className="text-muted-foreground">{getStrategyPersianName(habit.strategy)}</p>
          </div>
          
          {renderStrategyDetails(habit.strategyDetails, habit.strategy)}
        </CardContent>
      </Card>
      
      <MotivationalQuote
        habitName={habit.title}
        daysCompleted={habit.daysCompleted}
        totalDays={habit.totalDays}
        successful={isCompletedToday} 
        triggerFetch={triggerMotivation > 0} 
      />
      
      <div className="pt-4">
        <Link href={`/edit-habit/${habit.id}`} passHref legacyBehavior>
          <Button variant="outline" className="w-full text-lg p-6 rounded-full">
            <Edit3 className="ml-2 h-5 w-5" />
            ویرایش عادت
          </Button>
        </Link>
      </div>
    </div>
  );
}
