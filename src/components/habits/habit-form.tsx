
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHabits, type NewHabitData } from '@/providers/habit-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns'; // Using standard date-fns format
// import fa from 'date-fns-jalali/locale/fa'; // Removed Jalali locale import
import { cn } from '@/lib/utils';
import type { HabitStrategyDetails } from '@/lib/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const habitFormSchema = z.object({
  habitType: z.enum(['build', 'break'], { required_error: "نوع عادت را مشخص کنید." }),
  title: z.string().min(1, { message: "عنوان عادت نمی‌تواند خالی باشد." }),
  goalDescription: z.string().optional(),
  triggers: z.string().optional(),
  strategy: z.enum(['21/90', '40-day', '2-minute', 'if-then', 'none'], { required_error: "روش ساخت یا ترک عادت را انتخاب کنید." }),
  
  // Common strategy fields
  startDate: z.date().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "زمان معتبر نیست (HH:MM)" }).optional().or(z.literal("")),

  // Strategy specific
  days2190: z.enum(['21', '90']).optional(),
  twoMinuteSteps: z.string().optional(),
  twoMinuteReminderFrequency: z.string().optional(),
  ifThenRules: z.string().optional(),
  
  programDuration: z.coerce.number().min(1, "حداقل ۱ روز").max(365, "حداکثر ۳۶۵ روز").optional(),
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
      habitType: 'build',
      title: "",
      strategy: 'none',
      reminderTime: "",
      programDuration: 30, // Default duration if no strategy defines it
    },
  });

  const selectedStrategy = form.watch('strategy');

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    setIsLoading(true);
    
    const strategyDetails: HabitStrategyDetails = {
      startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
      reminderTime: data.reminderTime || undefined,
    };

    let totalDaysForHabit: number | undefined = data.programDuration;

    if (data.strategy === '21/90') {
      strategyDetails.days2190 = data.days2190 === '90' ? 90 : 21;
      totalDaysForHabit = strategyDetails.days2190;
    } else if (data.strategy === '40-day') {
      totalDaysForHabit = 40;
    } else if (data.strategy === '2-minute') {
      strategyDetails.twoMinuteSteps = data.twoMinuteSteps;
      strategyDetails.twoMinuteReminderFrequency = data.twoMinuteReminderFrequency;
    } else if (data.strategy === 'if-then') {
      strategyDetails.ifThenRules = data.ifThenRules;
    }
    
    const habitDataToSave: NewHabitData = {
      title: data.title,
      habitType: data.habitType,
      goalDescription: data.goalDescription,
      triggers: data.triggers,
      strategy: data.strategy,
      strategyDetails: strategyDetails,
      totalDaysInput: totalDaysForHabit || 30 // Fallback if not set by strategy
    };

    try {
      const newHabit = addHabit(habitDataToSave);
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-28" lang="fa"> {/* Removed pb-20, added pb-28 */}
        
        <FormField
          control={form.control}
          name="habitType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm">۱. نوع عادت</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-2 space-x-reverse"
                >
                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                    <FormControl><RadioGroupItem value="build" /></FormControl>
                    <FormLabel className="font-normal">ساخت عادت جدید</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                    <FormControl><RadioGroupItem value="break" /></FormControl>
                    <FormLabel className="font-normal">ترک عادت بد</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">۲. نام عادت</FormLabel>
              <FormControl>
                <Input placeholder="مثلا: مطالعه روزانه یا ترک سیگار" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goalDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">هدف از این عادت (اختیاری)</FormLabel>
              <FormControl>
                <Textarea placeholder="مثلا: ورزش حداقل ۳۰ دقیقه در روز یا ترک کامل سیگار..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="triggers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">۳. محرک‌ها (اختیاری)</FormLabel>
              <FormDescription>موقعیت‌ها، زمان‌ها یا احساساتی که این عادت را تحریک می‌کنند (هر کدام در یک خط یا با کاما جدا کنید).</FormDescription>
              <FormControl>
                <Textarea placeholder="مثلا: بعد از بیدار شدن، وقتی استرس دارم، ساعت ۱۰ شب" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm">۴. روش ترک یا ساخت عادت</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-x-reverse p-3 border rounded-md">
                    <FormControl><RadioGroupItem value="none" /></FormControl>
                    <FormLabel className="font-normal">معمولی (بدون روش خاص)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-x-reverse p-3 border rounded-md">
                    <FormControl><RadioGroupItem value="21/90" /></FormControl>
                    <FormLabel className="font-normal">قانون ۲۱/۹۰</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-x-reverse p-3 border rounded-md">
                    <FormControl><RadioGroupItem value="40-day" /></FormControl>
                    <FormLabel className="font-normal">قانون ۴۰ روز</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-x-reverse p-3 border rounded-md">
                    <FormControl><RadioGroupItem value="2-minute" /></FormControl>
                    <FormLabel className="font-normal">قانون ۲ دقیقه</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-x-reverse p-3 border rounded-md">
                    <FormControl><RadioGroupItem value="if-then" /></FormControl>
                    <FormLabel className="font-normal">قانون اگر-آنگاه</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Strategy Specific Fields */}
        {(selectedStrategy === '21/90' || selectedStrategy === '40-day') && (
          <>
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm">تاریخ شروع</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-right font-normal rounded-full", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          {field.value ? format(field.value, 'PPP EEE') : <span>تاریخ را انتخاب کنید</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        // locale prop removed
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">زمان یادآوری (اختیاری)</FormLabel>
                  <FormControl>
                    <Input type="time" placeholder="مثلا: 10:30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedStrategy === '21/90' && (
          <FormField
            control={form.control}
            name="days2190"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm">مدت زمان هدف (قانون ۲۱/۹۰)</FormLabel>
                 <FormDescription>۲۱ روز برای شروع تغییر، ۹۰ روز برای تثبیت.</FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value || '21'}
                    className="flex space-x-2 space-x-reverse"
                  >
                    <FormItem className="flex items-center space-x-2 space-x-reverse">
                      <FormControl><RadioGroupItem value="21" /></FormControl>
                      <FormLabel className="font-normal">۲۱ روز</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-x-reverse">
                      <FormControl><RadioGroupItem value="90" /></FormControl>
                      <FormLabel className="font-normal">۹۰ روز</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {(selectedStrategy === '2-minute' || selectedStrategy === 'if-then' || selectedStrategy === 'none') && (
           <FormField
            control={form.control}
            name="programDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">مدت کل برنامه (روز)</FormLabel>
                <FormControl>
                  <Input type="number" inputMode="numeric" placeholder="مثلا: ۳۰" {...field} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        field.onChange(''); // or some other appropriate non-numeric placeholder for empty
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value === undefined || field.value === null || isNaN(Number(field.value)) ? '' : Number(field.value)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedStrategy === '2-minute' && (
          <>
            <FormField
              control={form.control}
              name="twoMinuteSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">قدم‌های کوچک (قانون ۲ دقیقه)</FormLabel>
                  <FormDescription>هر قدم را در یک خط جدید وارد کنید (مثال: پوشیدن کفش ورزشی - ۱ دقیقه).</FormDescription>
                  <FormControl>
                    <Textarea placeholder="قدم ۱: ... (۱ دقیقه)&#x0a;قدم ۲: ... (۲ دقیقه)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="twoMinuteReminderFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">فرکانس یادآوری (اختیاری)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثلا: هر ۲ ساعت" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedStrategy === 'if-then' && (
          <FormField
            control={form.control}
            name="ifThenRules"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">قواعد اگر-آنگاه</FormLabel>
                <FormDescription>هر قاعده را در یک خط جدید وارد کنید (مثال: اگر [هوس قهوه بعد از شام کردم]، آنگاه [چای گیاهی می‌نوشم]).</FormDescription>
                <FormControl>
                  <Textarea placeholder="اگر [محرک]، آنگاه [رفتار جایگزین]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Removed fixed positioning div, button is now in normal flow */}
        <Button type="submit" className="w-full text-lg p-6 rounded-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ایجاد عادت"}
        </Button>
      </form>
    </Form>
  );
}
    
