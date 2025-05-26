import HabitForm from "@/components/habits/habit-form";

export default function CreateHabitPage() {
  return (
    <div className="space-y-8" lang="fa">
      <h1 className="text-2xl font-bold text-foreground text-center">ایجاد عادت جدید</h1>
      <HabitForm />
    </div>
  );
}
