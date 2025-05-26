import HabitForm from "@/components/habits/habit-form";

export default function CreateHabitPage() {
  return (
    <div className="space-y-8" lang="fa">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-center">ایجاد عادت جدید</h1>
      <HabitForm />
    </div>
  );
}
