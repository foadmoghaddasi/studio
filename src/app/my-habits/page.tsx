
import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MyHabitsPage() {
  return (
    <div className="space-y-8" lang="fa">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">عادت‌های من</h1>
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

