"use client";

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useHabits } from '@/providers/habit-provider';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMotivationalMessage } from '@/ai/flows/personalized-motivation';
import { CheckCircle, Loader2, MoreVertical, Archive as ArchiveIconLucide, Trash2, AlertTriangle } from 'lucide-react';
import { cn, toPersianNumerals } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

interface HabitCardProps {
  habit: Habit;
  isArchiveView?: boolean;
}

const getStrategyPersianName = (strategyKey?: '21/90' | '40-day' | '2-minute' | 'if-then' | 'none'): string => {
  switch (strategyKey) {
    case "21/90":
      return "۲۱/۹۰";
    case "40-day":
      return "۴۰ روز";
    case "2-minute":
      return "۲ دقیقه";
    case "if-then":
      return "اگر-آنگاه";
    default:
      return '';
  }
};

export default function HabitCard({
  habit,
  isArchiveView = false,
}: HabitCardProps) {
  const {
    completeDay,
    toggleHabitActive,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    setHabitMotivationalMessage,
  } = useHabits();
  const { toast } = useToast();
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(
    null
  );
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const isCurrentlyCompletedToday = habit.lastCheckedIn?.startsWith(new Date().toISOString().split('T')[0]) ?? false;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.lastCheckedIn?.startsWith(today) ?? false;

    if (isCompletedToday && habit.lastMotivationalMessage && habit.lastMotivationalMessage.date === today) {
      if (motivationalMessage !== habit.lastMotivationalMessage.message) {
        setMotivationalMessage(habit.lastMotivationalMessage.message);
      }
      setIsLoadingMotivation(false);
    } else if (!isCompletedToday) {
      if (motivationalMessage !== null) {
        setMotivationalMessage(null);
      }
    }
  }, [habit, motivationalMessage]);

  const handleCompleteDay = async () => {
    if (habit.isArchived || !habit.isActive) return;
    const updatedHabit = completeDay(habit.id);

    if (
      updatedHabit &&
      updatedHabit.lastCheckedIn?.startsWith(
        new Date().toISOString().split("T")[0]
      )
    ) {
      toast({
        title: "عالی بود!",
        description: `عادت "${updatedHabit.title}" برای امروز ثبت شد.`,
      });

      const today = new Date().toISOString().split("T")[0];
      if (
        updatedHabit.lastMotivationalMessage &&
        updatedHabit.lastMotivationalMessage.date === today
      ) {
        setMotivationalMessage(updatedHabit.lastMotivationalMessage.message);
        setIsLoadingMotivation(false);
      } else {
        setIsLoadingMotivation(true);
        try {
          const motivation = await getMotivationalMessage({
            habitName: updatedHabit.title,
            daysCompleted: updatedHabit.daysCompleted,
            totalDays: updatedHabit.totalDays,
            successful: true,
          });
          setHabitMotivationalMessage(updatedHabit.id, motivation.message);
          setMotivationalMessage(motivation.message);
        } catch (error) {
          console.error("Failed to fetch motivational message", error);
          setMotivationalMessage("ادامه بده، تو می‌تونی!");
        } finally {
          setIsLoadingMotivation(false);
        }
      }
    } else {
      toast({
        title: "توجه",
        description: `عادت "${habit.title}" قبلاً برای امروز ثبت شده یا امکان ثبت وجود ندارد.`,
        variant: "default",
      });
    }
  };

  const handleArchiveHabit = () => {
    archiveHabit(habit.id);
    toast({
      title: "عادت آرشیو شد",
      description: `عادت "${habit.title}" به آرشیو منتقل شد.`,
    });
  };

  const handleUnarchiveHabit = () => {
    unarchiveHabit(habit.id);
    toast({
      title: "عادت فعال شد",
      description: `عادت "${habit.title}" از آرشیو خارج و فعال شد.`,
    });
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      toast({
        title: "عادت حذف شد",
        description: `عادت "${habitToDelete.title}" با موفقیت حذف شد.`,
        variant: "destructive",
      });
      setHabitToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const percentage =
    habit.totalDays > 0 ? (habit.daysCompleted / habit.totalDays) * 100 : 0;
  const strategyName = getStrategyPersianName(habit.strategy);
  const isActiveAndNotArchived = habit.isActive && !habit.isArchived;

  if (isArchiveView) {
    return (
      <Card className="w-full bg-content-card p-4 rounded-2xl">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-content-card-foreground">
              {habit.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              آرشیو شده در:{" "}
              {new Date(habit.createdAt).toLocaleDateString("fa-IR")}
              {strategyName && ` (${strategyName})`}
            </p>
          </div>
          <Button
            onClick={handleUnarchiveHabit}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            فعال سازی
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(
        "w-full p-4 rounded-2xl transition-opacity duration-300 ease-in-out relative",
        isActiveAndNotArchived ? "bg-[var(--card-effective-background)] dark:bg-muted/50" : "bg-muted/50 opacity-70 scale-[0.985] transform dark:bg-[var(--card-effective-background)]"
      )}>
        <div className="absolute top-3 left-3 z-10"> {/* Changed right-3 to left-3 */}
            <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full data-[state=open]:bg-muted"
              >
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">گزینه‌ها</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover">
              <DropdownMenuItem
                onSelect={handleArchiveHabit}
                className="rounded-md"
              >
                <ArchiveIconLucide className="ml-2 h-4 w-4" />
                آرشیو عادت
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                onSelect={() => {
                  setHabitToDelete(habit);
                  setShowDeleteConfirm(true);
                }}
                className="text-destructive hover:!bg-destructive/10 focus:!bg-destructive/10 focus:!text-destructive data-[highlighted]:!bg-destructive/10 data-[highlighted]:!text-destructive rounded-md"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف عادت
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href={`/habits/${habit.id}`} passHref legacyBehavior>
          <a className={cn("block", (!habit.isActive || habit.isArchived) && "pointer-events-none")}>
            <CardHeader className="flex flex-row justify-between items-center p-0 mb-2">
              <div className="flex-grow">
                <CardTitle className={cn(
                  "text-lg font-semibold",
                  isActiveAndNotArchived ? "text-content-card-foreground" : "text-muted-foreground"
                )}>{habit.title}</CardTitle>
                 <p className="text-xs text-muted-foreground mt-2">
                  تاریخ شروع: {new Date(habit.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>
                  {toPersianNumerals(habit.daysCompleted)} / {toPersianNumerals(habit.totalDays)} روز
                  {strategyName && <span className="mr-2 text-xs">({strategyName})</span>}
                </span>
                <span>{toPersianNumerals(Math.round(percentage))}%</span>
              </div>
              <Progress value={percentage} className="h-2 rounded-full bg-muted" indicatorClassName="bg-primary" />
            </CardContent>
          </a>
        </Link>

        <CardFooter className="mt-4 flex items-center justify-between p-0">
          <div className="flex items-center space-x-2 space-x-reverse">
             <Switch
                id={`active-switch-${habit.id}`}
                checked={habit.isActive}
                onCheckedChange={() => toggleHabitActive(habit.id)}
                aria-label={habit.isActive ? 'عادت فعال است' : 'عادت غیرفعال است'}
                disabled={habit.isArchived}
              />
            <Label htmlFor={`active-switch-${habit.id}`} className="text-sm text-muted-foreground">
              {habit.isActive ? 'فعال' : 'غیرفعال'}
            </Label>
          </div>

          <Button
            onClick={handleCompleteDay}
            size="sm"
            className="rounded-full"
            disabled={isCurrentlyCompletedToday || !habit.isActive || habit.isArchived}
          >
            {isCurrentlyCompletedToday ? (
              <>
                <CheckCircle className="ml-1.5 h-4 w-4" />
                انجام شد
              </>
            ) : (
              "تکمیل امروز"
            )}
          </Button>
        </CardFooter>

        {isLoadingMotivation && (
          <div className="flex items-center justify-center text-sm text-muted-foreground p-2 mt-2">
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            در حال دریافت پیام انگیزشی...
          </div>
        )}
        {motivationalMessage && !isLoadingMotivation && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg text-sm text-primary text-center animate-in fade-in duration-300">
            {motivationalMessage}
          </div>
        )}
      </Card>

{habitToDelete && (
  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
    <AlertDialogContent
      dir="rtl"
      className="rounded-3xl bg-secondary"
    >
      <AlertDialogHeader className="items-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <AlertDialogTitle>تأیید حذف عادت</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          آیا از حذف عادت "{habitToDelete.title}" مطمئن هستید؟ این عمل
          قابل بازگشت نیست.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="mt-4 flex flex-row gap-2">
        <AlertDialogCancel className="flex-1 rounded-full h-12 bg-background text-foreground hover:bg-muted/90">
          انصراف
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={confirmDeleteHabit}
          className={cn(buttonVariants({ variant: "destructive" }), "flex-1 rounded-full h-12")}
        >
          حذف
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
    </>
  );
}

declare module "@/components/ui/progress" {
  interface ProgressProps extends React.ComponentPropsWithoutRef<typeof import("@radix-ui/react-progress").Root> {
    indicatorClassName?: string;
  }
}

    
