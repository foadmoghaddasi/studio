
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label import removed as FormLabel from ui/form is used
import { useHabits } from '@/providers/habit-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const habitFormSchema = z.object({
  title: z.string().min(1, { message: "عنوان عادت نمی‌تواند خالی باشد." }),
  totalDays: z.coerce.number().min(1, { message: "تعداد روز باید حداقل ۱ باشد." }).max(365, { message: "تعداد روز نمی‌تواند بیشتر از ۳۶۵ باشد."}).default(21),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

export default function HabitForm() {
  const { addHabit } = useHabits();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: "",
      totalDays: '', 
    },
  });

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    setIsLoading(true);
    try {
      const newHabit = addHabit(data);
      toast({
        title: "عادت جدید ایجاد شد!",
        description: `عادت "${newHabit.title}" با موفقیت اضافه شد.`,
      });
      router.push('/my-habits');
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در ایجاد عادت پیش آمد.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // Simulate API call for a bit longer if needed
    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" lang="fa"> {/* Changed space-y-8 to space-y-4 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">عنوان عادت</FormLabel>
              <FormControl>
                <Input 
                  placeholder="مثلا: مطالعه روزانه" 
                  {...field} 
                  aria-label="عنوان عادت"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="totalDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">تعداد روز</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="مثلا: ۴۰ روز" 
                  {...field} 
                  aria-label="تعداد روز"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-lg p-6 rounded-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ایجاد عادت"}
        </Button>
      </form>
    </Form>
  );
}
