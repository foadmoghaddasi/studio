
"use client";

import DarkModeToggle from "@/components/shared/dark-mode-toggle";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-20" lang="fa">
      <h1 className="text-2xl font-bold text-foreground text-center">تنظیمات</h1>

      <div>
        <p className="text-base text-muted-foreground mb-2 pr-4 text-right">نمایش</p>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-base text-foreground">حالت شب</span>
            <DarkModeToggle showLabel={false} />
          </CardContent>
        </Card>
      </div>
      {/* Add other settings sections here if needed in the future */}
    </div>
  );
}

