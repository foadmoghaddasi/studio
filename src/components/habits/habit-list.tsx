
"use client";

import { useHabits } from '@/providers/habit-provider';
import HabitCard from './habit-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown, ListX } from 'lucide-react';
import type { Habit } from '@/lib/types';

export default function HabitList() {
  const { habits } = useHabits();

  const activeHabits = habits.filter(habit => !habit.isArchived);

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 min-h-[calc(100svh-21rem)]"> {/* Adjusted min-h calculation */}
        <ListX className="w-20 h-20 text-primary opacity-50" />
        <h2 className="text-2xl font-semibold text-foreground">هنوز عادتی اضافه نکردی یا همه آرشیو شدن</h2>
        <p className="text-muted-foreground max-w-xs">
          خوشحالم که اینجایی... حالا می‌تونی اولین تغییر زندگیت رو از اینجا شروع کنی.
        </p>
        <ArrowDown className="w-10 h-10 text-primary animate-bounce mt-4" />
        <Link href="/create-habit" legacyBehavior>
          <Button className="text-xl px-4 py-6 rounded-xl shadow-lg">
            ایجاد اولین عادت
          </Button>
        </Link>
      </div>
    );
  }

  const sortedHabits = [...activeHabits].sort((a: Habit, b: Habit) => {
    // Active habits first
    if (a.isActive && !b.isActive) {
      return -1;
    }
    if (!a.isActive && b.isActive) {
      return 1;
    }
    // If both are active or both inactive (within non-archived), sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 pb-32"> {/* Changed pb-36 to pb-32 */}
      {sortedHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
