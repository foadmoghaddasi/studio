import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyHabitsPage() {
  return (
    <div className="space-y-8" lang="fa">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">عادت‌های من</h1>
      </div>
      <HabitList />
       {/* Floating Action Button style for "ایجاد عادت جدید" */}
       {/* This button is now part of BottomNavigation for better UX consistency */}
    </div>
  );
}
