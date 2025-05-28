
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { User, LogOut, Edit2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { toPersianNumerals } from "@/lib/utils";

export default function ProfilePage() {
  const { logout, firstName, lastName, profilePictureUrl, updateProfileImage, loginIdentifier } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayUserName, setDisplayUserName] = useState("کاربر روزبه‌روز");
  const [userLastNameState, setUserLastNameState] = useState<string | null>(null);

  useEffect(() => {
    if (firstName) {
      setDisplayUserName(firstName);
    }
    if (lastName) {
      setUserLastNameState(lastName);
    }
  }, [firstName, lastName]);

  const fullDisplayName = userLastNameState ? `${displayUserName} ${userLastNameState}` : displayUserName;
  
  const displayLoginIdentifier = loginIdentifier ? toPersianNumerals(loginIdentifier) : "اطلاعات ورود در دسترس نیست";


  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "حجم عکس زیاد است",
          description: "لطفا عکسی با حجم کمتر از ۲ مگابایت انتخاب کنید.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfileImage(base64String);
        toast({
          title: "عکس پروفایل به‌روز شد",
          description: "عکس جدید پروفایل شما با موفقیت ذخیره شد.",
        });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "خطا در بارگذاری عکس",
          description: "مشکلی در خواندن فایل عکس پیش آمد. لطفا دوباره تلاش کنید.",
        });
      }
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 pb-24" lang="fa"> {/* Increased pb */}
      <h1 className="text-2xl font-bold text-foreground text-center">پروفایل</h1>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="relative group">
            <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
              <AvatarImage src={profilePictureUrl || "https://placehold.co/100x100.png"} alt={fullDisplayName} data-ai-hint="profile avatar" />
              <AvatarFallback>
                <User className="w-12 h-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleProfilePictureChange}
              aria-label="تغییر عکس پروفایل"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 -right-1 h-8 w-8 rounded-full bg-card border-primary text-primary group-hover:bg-primary/10 transition-all"
              onClick={triggerFileInput}
              aria-label="ویرایش عکس پروفایل"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl">{fullDisplayName}</CardTitle>
          <p className="text-muted-foreground">{displayLoginIdentifier}</p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <Button 
          variant="secondary" 
          className="w-full text-lg p-6 rounded-full" 
          onClick={() => router.push('/profile-setup')}
        >
          <Edit2 className="ml-2 h-5 w-5" />
          ویرایش اطلاعات
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-lg p-6 rounded-full text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive-foreground" 
          onClick={logout}
        >
          <LogOut className="ml-2 h-5 w-5" />
          خروج از حساب کاربری
        </Button>
      </div>
    </div>
  );
}
