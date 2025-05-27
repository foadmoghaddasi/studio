
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
  const successfulDays = habits.reduce((sum, habit) => sum + habit.daysCompleted, 0);
  const activeHabitsCount = habits.filter(h => h.isActive && !h.isArchived).length; // Ensure active habits are not archived

  return (
    <div className="space-y-8" lang="fa">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">عادت‌های من</h1>
      </div>

      {/* New Stats Section */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">مجموع عادت‌ها</p>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-100">{toPersianNumerals(totalHabits)}</p>
        </div>
        <div className="bg-sky-100 dark:bg-sky-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-sky-600 dark:text-sky-300 font-medium">روزهای موفق</p>
          <p className="text-xl font-bold text-sky-800 dark:text-sky-100">{toPersianNumerals(successfulDays)}</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-3xl text-center">
          <p className="text-xs text-amber-600 dark:text-amber-300 font-medium">عادت فعال</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-100">{toPersianNumerals(activeHabitsCount)}</p>
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
