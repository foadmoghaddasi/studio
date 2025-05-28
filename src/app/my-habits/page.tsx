
"use client"; 

import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ListChecks, TrendingUp, TrendingDown, Info } from "lucide-react"; 
import { useHabits } from "@/providers/habit-provider"; 
import { toPersianNumerals } from "@/lib/utils"; 
import { cn } from "@/lib/utils"; 

export default function MyHabitsPage() {
  const { habits } = useHabits();

  const nonArchivedHabits = habits.filter(habit => !habit.isArchived);
  const totalHabits = nonArchivedHabits.length;

  const successfulDays = nonArchivedHabits.reduce(
    (sum, habit) => sum + habit.daysCompleted,
    0
  );

  const unsuccessfulDays = nonArchivedHabits.reduce((sum, habit) => {
    const startDate = new Date(habit.createdAt.split('T')[0]);
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayDateStr);
    
    const daysElapsedBeforeToday = Math.max(0, Math.floor((todayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    let completionsBeforeToday = habit.daysCompleted;
    if (habit.lastCheckedIn?.startsWith(todayDateStr) && habit.daysCompleted > 0) {
      completionsBeforeToday--;
    }
    
    const currentHabitUnsuccessfulDays = Math.max(0, daysElapsedBeforeToday - completionsBeforeToday);
    return sum + currentHabitUnsuccessfulDays;
  }, 0);


  const statCardData = [
    { title: "کل عادت‌ها", value: toPersianNumerals(totalHabits), goal: "فعال و در حال پیگیری", icon: ListChecks, color: "green", hint: "total habits" },
    { title: "روزهای موفق", value: toPersianNumerals(successfulDays), goal: "مجموع روزهای انجام شده", icon: TrendingUp, color: "blue", hint: "successful days" },
    { title: "روز های ناموفق", value: toPersianNumerals(unsuccessfulDays), goal: "روزهای از دست رفته تا امروز", icon: TrendingDown, color: "purple", hint: "unsuccessful days" },
  ];


  return (
    <div className="space-y-6 pb-28" lang="fa"> 
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">عادت‌های من</h1>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4 mt-0"> {/* Added mt-0 here */}
        {statCardData.map((stat, index) => (
          <div 
            key={index} 
            className={cn(
                "flex flex-col items-center text-center p-3 rounded-2xl space-y-1.5", // Vertical layout, reduced padding and space
                stat.color === "green" && "bg-emerald-50 dark:bg-emerald-900/60",
                stat.color === "blue" && "bg-sky-50 dark:bg-sky-900/60",
                stat.color === "purple" && "bg-violet-50 dark:bg-violet-900/60"
            )}
          >
            <div className={cn(
                "rounded-full p-2.5", // Slightly smaller icon bg padding
                stat.color === "green" && "bg-emerald-100 dark:bg-emerald-800/70",
                stat.color === "blue" && "bg-sky-100 dark:bg-sky-800/70",
                stat.color === "purple" && "bg-violet-100 dark:bg-violet-800/70"
            )}>
              <stat.icon className={cn(
                "w-5 h-5", // Slightly smaller icon
                stat.color === "green" && "text-emerald-600 dark:text-emerald-300",
                stat.color === "blue" && "text-sky-600 dark:text-sky-300",
                stat.color === "purple" && "text-violet-600 dark:text-violet-300"
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
            <p className={cn(
                "text-lg font-semibold mt-0.5", // Added small margin-top for number
                 stat.color === "green" && "text-emerald-700 dark:text-emerald-200",
                 stat.color === "blue" && "text-sky-700 dark:text-sky-200",
                 stat.color === "purple" && "text-violet-700 dark:text-violet-200"
            )}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground/80">{stat.goal}</p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">عادت‌های من</h2>
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
    
