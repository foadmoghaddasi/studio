
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
// useHabits and related stats calculations are removed as they are moved to my-habits page
import { User, LogOut } from "lucide-react"; // Removed unused stat icons

export default function ProfilePage() {
  const { logout } = useAuth();

  // Mock data - replace with actual data if available
  const userName = "کاربر روزبه‌روز"; 
  const userPhoneNumber = "۰۹۱۲۳۴۵۶۷۸۹"; // Placeholder

  return (
    <div className="space-y-8 pb-20" lang="fa">
      <h1 className="text-3xl font-bold text-foreground text-center">پروفایل</h1>

      <Card>
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
        {/* CardContent containing stats is removed */}
      </Card>

      <Button 
        variant="destructive" 
        className="w-full text-lg p-6 rounded-full" 
        onClick={logout}
      >
        <LogOut className="ml-2 h-5 w-5" />
        خروج از حساب کاربری
      </Button>
    </div>
  );
}

