
"use client"; 

import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ListChecks, TrendingUp, TrendingDown } from "lucide-react"; 
import { useHabits } from "@/providers/habit-provider"; 
import { toPersianNumerals } from "@/lib/utils"; 
import { cn } from "@/lib/utils"; 

export default function MyHabitsPage() {
  const { habits } = useHabits();

  const nonArchivedHabits = habits.filter(habit => !habit.isArchived);
  const totalActiveHabits = nonArchivedHabits.length;

  const successfulDays = nonArchivedHabits.reduce(
    (sum, habit) => sum + habit.daysCompleted,
    0
  );

  const unsuccessfulDays = nonArchivedHabits.reduce((sum, habit) => {
    const startDate = new Date(habit.createdAt.split('T')[0]);
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayDateStr);
    
    // Calculate days elapsed from habit start until *yesterday*
    const daysElapsedBeforeToday = Math.max(0, Math.floor((todayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    let completionsBeforeToday = habit.daysCompleted;
    // If the habit was checked in today, subtract one from daysCompleted for this calculation
    if (habit.lastCheckedIn?.startsWith(todayDateStr) && habit.daysCompleted > 0) {
      completionsBeforeToday--;
    }
    
    const currentHabitUnsuccessfulDays = Math.max(0, daysElapsedBeforeToday - completionsBeforeToday);
    return sum + currentHabitUnsuccessfulDays;
  }, 0);


  const statCardData = [
    { title: "کل عادت‌ها", value: toPersianNumerals(totalActiveHabits), goal: "فعال و در حال پیگیری", icon: ListChecks, color: "green", hint: "total habits" },
    { title: "روزهای موفق", value: toPersianNumerals(successfulDays), goal: "مجموع روزهای انجام شده", icon: TrendingUp, color: "blue", hint: "successful days" },
    { title: "روز های ناموفق", value: toPersianNumerals(unsuccessfulDays), goal: "روزهای از دست رفته تا امروز", icon: TrendingDown, color: "purple", hint: "unsuccessful days" },
  ];


  return (
    <div className="space-y-6 pb-28" lang="fa"> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {statCardData.map((stat, index) => (
          <div key={index} className="bg-content-card p-4 rounded-3xl flex items-center space-x-3 space-x-reverse">
            <div className={cn(
                "rounded-full p-3",
                stat.color === "blue" && "bg-sky-100 dark:bg-sky-900",
                stat.color === "green" && "bg-emerald-100 dark:bg-emerald-900",
                stat.color === "purple" && "bg-violet-100 dark:bg-violet-900"
            )}>
              <stat.icon className={cn(
                "w-6 h-6",
                stat.color === "blue" && "text-sky-600 dark:text-sky-300",
                stat.color === "green" && "text-emerald-600 dark:text-emerald-300",
                stat.color === "purple" && "text-violet-600 dark:text-violet-300"
              )} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className="text-lg font-semibold text-foreground mt-0.5">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.goal}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">عادت‌های من</h2>
        {/* Link to create habit page can be conditional or lead to a "view all" page if list is long */}
        {/* For now, it's a simple link to create habit page, could be changed later */}
        <Link href="/create-habit" passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="text-primary">
                مشاهده همه
            </Button>
        </Link>
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
    
