// prettier-ignore
"use client";
import { cn } from "@/lib/utils";

import HabitList from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Droplet, Activity, Zap } from "lucide-react"; // Example icons for stats
import { useHabits } from "@/providers/habit-provider";
import { toPersianNumerals } from "@/lib/utils";
export default function MyHabitsPage() {
  const { habits } = useHabits();

  const totalHabits = habits.length;
  const nonArchivedHabits = habits.filter((habit) => !habit.isArchived);
  const successfulDays = nonArchivedHabits.reduce(
    (sum, habit) => sum + habit.daysCompleted,
    0
  );
  const unsuccessfulDays = nonArchivedHabits.reduce((sum, habit) => {
    const startDate = new Date(habit.createdAt.split("T")[0]);
    const todayDateStr = new Date().toISOString().split("T")[0];
    const todayStart = new Date(todayDateStr);
    const daysElapsedBeforeToday = Math.max(
      0,
      Math.floor(
        (todayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    let completionsBeforeToday = habit.daysCompleted;
    if (
      habit.lastCheckedIn?.startsWith(todayDateStr) &&
      habit.daysCompleted > 0
    ) {
      completionsBeforeToday--;
    }
    const currentHabitUnsuccessfulDays = Math.max(
      0,
      daysElapsedBeforeToday - completionsBeforeToday
    );
    return sum + currentHabitUnsuccessfulDays;
  }, 0);

  // Data for the new stat cards (placeholders)
  const statCardData = [
    {
      title: "آب مصرفی",
      value: "۱.۷ لیتر",
      goal: "۲ لیتر در روز",
      icon: Droplet,
      color: "blue",
      hint: "water intake",
    },
    {
      title: "امتیاز سلامتی",
      value: "۷۵",
      goal: "+۳٪ امروز",
      icon: Activity,
      color: "green",
      hint: "wellness score",
    },
    {
      title: "انرژی",
      value: "بالا",
      goal: "آماده برای چالش",
      icon: Zap,
      color: "orange",
      hint: "energy level",
    },
  ];

  return (
    // Added more padding at the bottom for the new BottomNav height
    <div className="space-y-6 pb-28" lang="fa">
      {" "}
      {/* Increased pb from space-y-8 and pb-28 */}
      {/* Title removed as AppBar now handles greeting */}
      {/* New Stats Section - Redesigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {statCardData.map((stat, index) => (
          <div
            key={index}
            className="bg-content-card p-4 rounded-2xl flex items-center space-x-3 space-x-reverse"
          >
            <div
              className={cn(
                "rounded-full p-3",
                stat.color === "blue" && "bg-blue-100 dark:bg-blue-900",
                stat.color === "green" && "bg-green-100 dark:bg-green-900",
                stat.color === "orange" && "bg-orange-100 dark:bg-orange-900"
              )}
            >
              <stat.icon
                className={cn(
                  "w-6 h-6",
                  stat.color === "blue" && "text-blue-600 dark:text-blue-300",
                  stat.color === "green" &&
                    "text-green-600 dark:text-green-300",
                  stat.color === "orange" &&
                    "text-orange-600 dark:text-orange-300"
                )}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-lg font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.goal}</p>
            </div>
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
      {/* FAB is removed as per new design, new habit creation likely from a dedicated button or within list */}
      {/* If a FAB is still desired, it needs to be re-evaluated with the new BottomNav */}
      <Link href="/create-habit" passHref legacyBehavior>
        <a
          aria-label="ایجاد عادت جدید"
          className="fixed bottom-24 right-6 z-30 h-14 w-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-7 w-7" />
        </a>
      </Link>
    </div>
  );
}
