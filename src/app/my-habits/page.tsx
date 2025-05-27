
"use client"; // Added use client for hooks

import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useHabits } from "@/providers/habit-provider"; // Added useHabits
import { toPersianNumerals } from "@/lib/utils"; // Added toPersianNumerals

export default function MyHabitsPage() {
  const { habits } = useHabits();

  const totalHabits = habits.length;
  
  const nonArchivedHabits = habits.filter(habit => !habit.isArchived);
  
  const successfulDays = nonArchivedHabits.reduce(
    (sum, habit) => sum + habit.daysCompleted,
    0
  );
  
  const unsuccessfulDays = nonArchivedHabits.reduce((sum, habit) => {
    const startDate = new Date(habit.createdAt.split('T')[0]);
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayDateStr);

    // Calculate days elapsed from habit start date until (but not including) today
    const daysElapsedBeforeToday = Math.max(0, Math.floor((todayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    let completionsBeforeToday = habit.daysCompleted;
    // If the habit was checked in today, one of the completions was for today,
    // so subtract it to get completions *before* today.
    if (habit.lastCheckedIn?.startsWith(todayDateStr) && habit.daysCompleted > 0) {
      completionsBeforeToday--;
    }
    
    // Unsuccessful days for this habit are days elapsed before today minus completions before today
    const currentHabitUnsuccessfulDays = Math.max(0, daysElapsedBeforeToday - completionsBeforeToday);
    
    return sum + currentHabitUnsuccessfulDays;
  }, 0);


  return (
    <div className="space-y-8" lang="fa">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">عادت‌های من</h1>
      </div>

      {/* New Stats Section */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">مجموع عادت‌ها</p>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-100 mt-1">{toPersianNumerals(totalHabits)}</p>
        </div>
        <div className="bg-sky-100 dark:bg-sky-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-sky-600 dark:text-sky-300 font-medium">روزهای موفق</p>
          <p className="text-xl font-bold text-sky-800 dark:text-sky-100 mt-1">{toPersianNumerals(successfulDays)}</p>
        </div>
        <div className="bg-violet-100 dark:bg-violet-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-violet-600 dark:text-violet-300 font-medium">روز های ناموفق</p>
          <p className="text-xl font-bold text-violet-800 dark:text-violet-100 mt-1">{toPersianNumerals(unsuccessfulDays)}</p>
        </div>
      </div>
      
      <HabitList />
      
      <Link href="/create-habit" passHref legacyBehavior>
        <a
          aria-label="ایجاد عادت جدید"
          className="fixed bottom-28 right-6 z-30 h-14 w-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-7 w-7" />
        </a>
      </Link>
    </div>
  );
}

