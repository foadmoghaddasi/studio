
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DarkModeToggle from "@/components/shared/dark-mode-toggle";
import { useAuth } from "@/providers/auth-provider";
import { useHabits } from "@/providers/habit-provider";
import { User, LogOut, BarChart3, TrendingUp, CheckSquare } from "lucide-react";

export default function ProfilePage() {
  const { logout } = useAuth();
  const { habits } = useHabits();

  // Mock data - replace with actual data if available
  const userName = "کاربر روزبه‌روز"; 
  const userPhoneNumber = "۰۹۱۲۳۴۵۶۷۸۹"; // Placeholder

  const totalHabits = habits.length;
  const successfulDays = habits.reduce((sum, habit) => sum + habit.daysCompleted, 0);
  const activeHabitsCount = habits.filter(h => h.isActive).length;

  return (
    <div className="space-y-8 pb-20" lang="fa">
      <h1 className="text-3xl font-bold text-foreground text-center">تنظیمات</h1>

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
            <AvatarImage src="https://placehold.co/100x100.png" alt={userName} data-ai-hint="profile avatar" />
            <AvatarFallback>
              <User className="w-12 h-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{userName}</CardTitle>
          <p className="text-muted-foreground">{userPhoneNumber}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background rounded-lg shadow">
              <BarChart3 className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-semibold">{totalHabits}</p>
              <p className="text-sm text-muted-foreground">مجموع عادت‌ها</p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow">
              <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-semibold">{successfulDays}</p>
              <p className="text-sm text-muted-foreground">روزهای موفق</p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow">
              <CheckSquare className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-semibold">{activeHabitsCount}</p>
              <p className="text-sm text-muted-foreground">عادت فعال</p>
            </div>
          </div>

          <div className="pt-6">
            <DarkModeToggle />
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="destructive" 
        className="w-full text-lg p-6 rounded-lg" 
        onClick={logout}
      >
        <LogOut className="ml-2 h-5 w-5" />
        خروج از حساب کاربری
      </Button>
    </div>
  );
}
