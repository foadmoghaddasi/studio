
"use client";

import { useHabits } from '@/providers/habit-provider';
import HabitCard from '@/components/habits/habit-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArchiveX, ListX } from 'lucide-react'; // ArchiveX or ListX for empty archive
import type { Habit } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ArchivePage() {
  const { habits } = useHabits();
  const router = useRouter();

  const archivedHabits = habits.filter(habit => habit.isArchived)
                               .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first

  return (
    <div className="space-y-8 pb-20" lang="fa">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">عادت‌های آرشیو شده</h1>
        <Button variant="ghost" onClick={() => router.push('/my-habits')}>
          بازگشت به عادت‌ها
        </Button>
      </div>

      {archivedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 min-h-[calc(100svh-20rem)]">
          <ArchiveX className="w-20 h-20 text-primary opacity-50" />
          <h2 className="text-2xl font-semibold text-foreground">آرشیو خالی است</h2>
          <p className="text-muted-foreground max-w-xs">
            هنوز هیچ عادتی را آرشیو نکرده‌اید.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {archivedHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} isArchiveView={true} />
          ))}
        </div>
      )}
    </div>
  );
}

