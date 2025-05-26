
"use client";

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import ProgressRing from './progress-ring';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useHabits } from '@/providers/habit-provider';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMotivationalMessage } from '@/ai/flows/personalized-motivation';
import { CheckCircle, Loader2, MoreVertical, Archive as ArchiveIconLucide, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface HabitCardProps {
  habit: Habit;
  isArchiveView?: boolean;
}

export default function HabitCard({ habit, isArchiveView = false }: HabitCardProps) {
  const { completeDay, toggleHabitActive, archiveHabit, unarchiveHabit, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(() => {
    if (!habit.lastCheckedIn || habit.isArchived) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.lastCheckedIn.startsWith(today);
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);


  const handleCompleteDay = async () => {
    if (habit.isArchived) return;
    const updatedHabit = completeDay(habit.id);
    if (updatedHabit && updatedHabit.lastCheckedIn?.startsWith(new Date().toISOString().split('T')[0])) {
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
        setMotivationalMessage("ادامه بده، تو می‌تونی!"); 
      } finally {
        setIsLoadingMotivation(false);
      }
    } else if (updatedHabit?.lastCheckedIn && !updatedHabit.lastCheckedIn.startsWith(new Date().toISOString().split('T')[0])) {
      setIsCompletedToday(false);
    }
     else {
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

  const percentage = habit.totalDays > 0 ? (habit.daysCompleted / habit.totalDays) * 100 : 0;

  if (isArchiveView) {
    return (
      <Card className="w-full shadow-md bg-muted/30">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-muted-foreground">{habit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            آرشیو شده در: {new Date(habit.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUnarchiveHabit}
            className="w-full text-md p-5 rounded-lg"
            variant="default"
          >
            <ArchiveIconLucide className="ml-2 h-5 w-5 transform rotate-180" /> فعال سازی دوباره
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(
        "w-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out",
        (!habit.isActive || habit.isArchived) && "opacity-70 bg-muted/50 scale-[0.985] transform" 
      )}>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <Link href={`/habits/${habit.id}`} legacyBehavior passHref>
            <a className={cn("hover:underline flex-grow", (!habit.isActive || habit.isArchived) && "pointer-events-none")}>
              <CardTitle className={cn("text-xl font-semibold transition-colors duration-300 ease-in-out", (!habit.isActive || habit.isArchived) && "text-muted-foreground")}>
                {habit.title}
              </CardTitle>
            </a>
          </Link>
          <div className="flex items-center space-x-2 space-x-reverse">
            {!habit.isArchived && (
              <>
                <Label htmlFor={`active-switch-${habit.id}`} className="text-sm text-muted-foreground">
                  {habit.isActive ? 'فعال' : 'غیرفعال'}
                </Label>
                <Switch
                  id={`active-switch-${habit.id}`}
                  checked={habit.isActive}
                  onCheckedChange={() => toggleHabitActive(habit.id)}
                  aria-label={habit.isActive ? ' عادت فعال است' : 'عادت غیرفعال است'}
                  disabled={habit.isArchived}
                />
              </>
            )}
             <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">گزینه‌ها</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleArchiveHabit}>
                  <ArchiveIconLucide className="ml-2 h-4 w-4" />
                  آرشیو عادت
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={() => {
                    setHabitToDelete(habit);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف عادت
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            disabled={isCompletedToday || !habit.isActive || habit.isArchived}
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
            <div className="mt-2 p-3 bg-primary/10 rounded-md text-sm text-primary text-center animate-in fade-in duration-300">
              {motivationalMessage}
            </div>
          )}
        </CardFooter>
      </Card>

      {habitToDelete && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent dir="rtl" className="rounded-3xl">
            <AlertDialogHeader className="items-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
              <AlertDialogTitle>تأیید حذف عادت</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                آیا از حذف عادت "{habitToDelete.title}" مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="flex-1">انصراف</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteHabit} className={cn(buttonVariants({ variant: "destructive" }), "flex-1")}>
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
