"use client";

import { useHabits } from '@/providers/habit-provider';
import HabitCard from './habit-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown, ListX } from 'lucide-react'; // ListX for empty habits

export default function HabitList() {
  const { habits } = useHabits();

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 min-h-[calc(100svh-15rem)]">
        <ListX className="w-20 h-20 text-primary opacity-50" />
        <h2 className="text-2xl font-semibold text-foreground">هنوز عادتی اضافه نکردی</h2>
        <p className="text-muted-foreground max-w-xs">
          خوشحالم که اینجایی... حالا می‌تونی اولین تغییر زندگیت رو از اینجا شروع کنی.
        </p>
        <ArrowDown className="w-10 h-10 text-primary animate-bounce mt-4" />
        <Link href="/create-habit" legacyBehavior>
          <Button size="lg" className="text-lg p-7 rounded-xl shadow-lg">
            ایجاد اولین عادت
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24"> {/* Padding bottom to avoid overlap with bottom nav */}
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
