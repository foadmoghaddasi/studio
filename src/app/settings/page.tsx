
"use client";

import DarkModeToggle from "@/components/shared/dark-mode-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-20" lang="fa">
      <h1 className="text-3xl font-bold text-foreground text-center">تنظیمات</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">نمایش</CardTitle>
        </CardHeader>
        <CardContent>
          <DarkModeToggle />
        </CardContent>
      </Card>
      {/* Add other settings sections here if needed in the future */}
    </div>
  );
}
