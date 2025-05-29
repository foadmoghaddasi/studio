
"use client";

import HabitForm from "@/components/habits/habit-form";
import { useHabits } from "@/providers/habit-provider";
import type { Habit } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditHabitPage() {
  const params = useParams();
  const router = useRouter();
  const { getHabitById } = useHabits();
  const [habitToEdit, setHabitToEdit] = useState<Habit | undefined | null>(undefined); // undefined for loading, null for not found

  useEffect(() => {
    if (params.id) {
      const habitId = Array.isArray(params.id) ? params.id[0] : params.id;
      const habit = getHabitById(habitId);
      if (habit) {
        setHabitToEdit(habit);
      } else {
        setHabitToEdit(null); // Habit not found
        // Optionally redirect or show a not found message
        // router.replace('/my-habits'); 
      }
    }
  }, [params.id, getHabitById, router]);

  if (habitToEdit === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] text-center p-4" lang="fa">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">در حال بارگذاری اطلاعات عادت برای ویرایش...</p>
      </div>
    );
  }

  if (habitToEdit === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] text-center p-4" lang="fa">
        <h1 className="text-2xl font-bold text-destructive mb-4">عادت یافت نشد</h1>
        <p className="text-muted-foreground">ممکن است این عادت حذف شده باشد.</p>
        <Button onClick={() => router.push('/my-habits')} className="mt-6 rounded-full">
          بازگشت به لیست عادت‌ها
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" lang="fa">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-foreground">ویرایش عادت: {habitToEdit.title}</h1>
        <p className="text-base text-muted-foreground mt-2">
          تغییرات مورد نظر خود را در اطلاعات این عادت اعمال کنید.
        </p>
      </div>
      <HabitForm initialData={habitToEdit} />
    </div>
  );
}
