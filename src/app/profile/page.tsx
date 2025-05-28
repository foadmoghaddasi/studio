
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toPersianNumerals } from "@/lib/utils";


export default function ProfilePage() {
  const { logout, firstName } = useAuth();
  const [displayUserName, setDisplayUserName] = useState("کاربر روزبه‌روز");
  const [userLastName, setUserLastName] = useState<string | null>(null);


  // Placeholder for phone number, as it's not currently stored from welcome form
  const userPhoneNumber = "۰۹۱۲۳۴۵۶۷۸۹"; 

  useEffect(() => {
    if (firstName) {
      setDisplayUserName(firstName);
    }
    // Attempt to load last name from localStorage if needed for display
    // This assumes USER_LAST_NAME_KEY is the same as in AuthProvider
    const storedLastName = localStorage.getItem('roozberooz_userLastName');
    if (storedLastName) {
      setUserLastName(storedLastName);
    }
  }, [firstName]);

  const fullDisplayName = userLastName ? `${displayUserName} ${userLastName}` : displayUserName;

  return (
    <div className="space-y-8 pb-20" lang="fa">
      <h1 className="text-2xl font-bold text-foreground text-center">پروفایل</h1>

      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
            <AvatarImage src="https://placehold.co/100x100.png" alt={fullDisplayName} data-ai-hint="profile avatar" />
            <AvatarFallback>
              <User className="w-12 h-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{fullDisplayName}</CardTitle>
          <p className="text-muted-foreground">{userPhoneNumber}</p>
        </CardHeader>
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
