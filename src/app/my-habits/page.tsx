
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
        <div className="bg-green-200 p-4 rounded-2xl text-center">
          <p className="text-xs text-green-700 font-medium">مجموع عادت‌ها</p>
          <p className="text-xl font-bold text-green-900">{toPersianNumerals(totalHabits)}</p>
        </div>
        <div className="bg-blue-200 p-4 rounded-2xl text-center">
          <p className="text-xs text-blue-700 font-medium">روزهای موفق</p>
          <p className="text-xl font-bold text-blue-900">{toPersianNumerals(successfulDays)}</p>
        </div>
        <div className="bg-orange-200 p-4 rounded-2xl text-center">
          <p className="text-xs text-orange-700 font-medium">عادت فعال</p>
          <p className="text-xl font-bold text-orange-900">{toPersianNumerals(activeHabitsCount)}</p>
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

