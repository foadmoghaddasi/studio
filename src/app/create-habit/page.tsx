
import HabitForm from "@/components/habits/habit-form";

export default function CreateHabitPage() {
  return (
    <div className="space-y-4" lang="fa">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-foreground">ایجاد عادت جدید</h1>
        <p className="text-base text-muted-foreground mt-2">
          از این صفحه میتونی به راحتی یه عادت جدید برای خودت بسازی و روز به روز ادامش بدی
        </p>
      </div>
      <HabitForm />
    </div>
  );
}
