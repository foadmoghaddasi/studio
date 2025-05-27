
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHabits, type NewHabitData } from '@/providers/habit-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Loader2, Info, Plus, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
// import { faIR } from 'date-fns/locale'; // Temporarily removed due to import/versioning issues
import { cn, toPersianNumerals } from '@/lib/utils';
import type { Habit, HabitStrategyDetails } from '@/lib/types';
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormDescription,
  FormLabel, 
  FormMessage,
  FormItem,
  FormField, 
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


const habitFormSchema = z.object({
  title: z.string().min(1, { message: "عنوان عادت نمی‌تواند خالی باشد." }),
  // habitType: z.enum(['build', 'break'], { required_error: "نوع عادت را انتخاب کنید." }), No longer used
  goalDescription: z.string().optional(),
  triggers: z.string().optional(),
  strategy: z.enum(['21/90', '40-day', '2-minute', 'if-then', 'none'], { required_error: "روش ساخت یا ترک عادت را انتخاب کنید." }),
  
  startDate: z.date().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "زمان معتبر نیست (HH:MM)" }).optional().or(z.literal("")),

  days2190: z.enum(['21', '90']).optional(),
  twoMinuteSteps: z.array(z.string()).optional().default(['']), 
  twoMinuteReminderFrequency: z.string().optional(),
  ifThenRules: z.array(
    z.object({
      ifCondition: z.string(),
      thenAction: z.string(),
    })
  ).optional().default([{ ifCondition: '', thenAction: '' }]),
  
  programDuration: z.coerce.number().min(1, "حداقل ۱ روز").max(365, "حداکثر ۳۶۵ روز").optional(),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

const strategyExplanations: Record<string, { title: string; description: string }> = {
  'none': {
    title: "روش معمولی (بدون روش خاص)",
    description: "این روش ساده‌ترین راه برای شروع یک عادت جدید یا ترک یک عادت قدیمی است. شما بدون پیروی از یک قانون یا چارچوب زمانی خاص، روی انجام روزانه یا پرهیز از آن عادت تمرکز می‌کنید. این روش برای افرادی مناسب است که به انعطاف‌پذیری بیشتری نیاز دارند یا می‌خواهند با سرعت خودشان پیش بروند. مهم‌ترین اصل در این روش، تعهد و پیگیری مداوم است."
  },
  '21/90': {
    title: "قانون ۲۱/۹۰",
    description: "قانون ۲۱/۹۰ یک چارچوب زمانی محبوب برای شکل‌گیری عادت‌هاست. بر اساس این نظریه، حدود ۲۱ روز طول می‌کشد تا یک رفتار جدید به عادت تبدیل شود و ۹۰ روز زمان لازم است تا این عادت به بخشی دائمی از سبک زندگی شما تبدیل گردد. این روش با تعیین دو نقطه عطف مشخص، به شما کمک می‌کند تا با انگیزه بیشتری مسیر تغییر را طی کنید و پیشرفت خود را به وضوح ببینید."
  },
  '40-day': {
    title: "قانون ۴۰ روز",
    description: "قانون ۴۰ روز بر این ایده استوار است که ۴۰ روز زمان کافی برای ایجاد یک تغییر معنادار و پایدار در رفتار است. در بسیاری از فرهنگ‌ها و سنت‌ها، عدد چهل نمادی از تکمیل و تحول است. این روش با ایجاد یک دوره زمانی مشخص و نه چندان طولانی، به شما کمک می‌کند تا با تمرکز و اراده، عادت جدیدی را در خود نهادینه کرده یا از عادت نامطلوبی رها شوید. پیوستگی در این ۴۰ روز کلید موفقیت است."
  },
  '2-minute': {
    title: "قانون ۲ دقیقه",
    description: "قانون ۲ دقیقه یک استراتژی قدرتمند برای غلبه بر اهمال‌کاری و شروع عادت‌های جدید است. ایده اصلی این است که هر عادت جدیدی را می‌توان در کمتر از دو دقیقه شروع کرد. به جای تمرکز روی هدف نهایی بزرگ، شما روی انجام یک نسخه بسیار کوچک و آسان از آن عادت (که فقط دو دقیقه طول می‌کشد) تمرکز می‌کنید. این کار مقاومت ذهنی برای شروع را از بین می‌برد و به تدریج می‌توانید مدت زمان و پیچیدگی عادت را افزایش دهید."
  },
  'if-then': {
    title: "قانون اگر-آنگاه",
    description: "قانون «اگر-آنگاه» یا «نیت‌های اجرایی»، یک تکنیک روانشناسی برای برنامه‌ریزی پیشاپیش رفتار در موقعیت‌های خاص است. شما با فرمول «اگر [محرک X اتفاق افتاد]، آنگاه [من رفتار Y را انجام خواهم داد]» مشخص می‌کنید که در برابر یک محرک خاص، چه واکنشی نشان خواهید داد. این روش به شما کمک می‌کند تا به جای واکنش‌های ناخودآگاه و عادتی، رفتارهای آگاهانه و هدفمند را جایگزین کنید و احتمال موفقیت در ساخت عادت جدید یا ترک عادت قدیمی را به طور قابل توجهی افزایش می‌دهد."
  }
};

interface HabitFormProps {
  initialData?: Habit;
}

export default function HabitForm({ initialData }: HabitFormProps) {
  const { addHabit, updateHabit } = useHabits();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string } | null>(null);

  const isEditMode = !!initialData;

  const getDefaultValues = () => {
    if (isEditMode && initialData) {
      const strategyDetails = initialData.strategyDetails || {};
      let twoMinuteStepsArray = [''];
      if (strategyDetails.twoMinuteSteps && typeof strategyDetails.twoMinuteSteps === 'string') {
        twoMinuteStepsArray = strategyDetails.twoMinuteSteps.split('\n').filter(step => step.trim() !== '');
        if(twoMinuteStepsArray.length === 0) twoMinuteStepsArray = ['']; // ensure at least one empty string if all were empty
      }

      let ifThenRulesArray = [{ ifCondition: '', thenAction: '' }];
      if (strategyDetails.ifThenRules && typeof strategyDetails.ifThenRules === 'string') {
        const parsedRules = strategyDetails.ifThenRules.split('\n')
          .map(ruleString => {
            const match = ruleString.match(/اگر\s*\[(.*?)\]\s*،\s*آنگاه\s*\[(.*?)\]/);
            if (match && match[1] && match[2]) {
              return { ifCondition: match[1].trim(), thenAction: match[2].trim() };
            }
            return null;
          }).filter(rule => rule !== null) as { ifCondition: string; thenAction: string; }[];
        if(parsedRules.length > 0) ifThenRulesArray = parsedRules;
      }


      return {
        title: initialData.title || "",
        goalDescription: initialData.goalDescription || "",
        triggers: initialData.triggers || "",
        strategy: initialData.strategy || 'none',
        startDate: strategyDetails.startDate ? parseISO(strategyDetails.startDate) : undefined,
        reminderTime: strategyDetails.reminderTime || "",
        days2190: strategyDetails.days2190 === 90 ? '90' : (strategyDetails.days2190 === 21 ? '21' : undefined),
        twoMinuteSteps: twoMinuteStepsArray,
        twoMinuteReminderFrequency: strategyDetails.twoMinuteReminderFrequency || "",
        ifThenRules: ifThenRulesArray,
        programDuration: initialData.totalDays,
      };
    }
    return {
      title: "",
      // habitType: 'build', // No longer used
      goalDescription: "",
      triggers: "",
      strategy: 'none',
      reminderTime: "",
      programDuration: 30, 
      days2190: '21',
      twoMinuteSteps: [''], 
      ifThenRules: [{ ifCondition: '', thenAction: '' }],
    };
  };


  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: getDefaultValues(),
  });
  
  // Reset form if initialData changes (e.g., navigating between edit pages or from create to edit)
  useEffect(() => {
    form.reset(getDefaultValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.reset]);


  const { fields: twoMinuteStepsFields, append: appendTwoMinuteStep, remove: removeTwoMinuteStep } = useFieldArray({
    control: form.control,
    name: "twoMinuteSteps"
  });

  const { fields: ifThenRulesFields, append: appendIfThenRule, remove: removeIfThenRule } = useFieldArray({
    control: form.control,
    name: "ifThenRules"
  });

  const selectedStrategy = form.watch('strategy');

  const handleStrategyInfoClick = (strategyKey: string) => {
    if (strategyExplanations[strategyKey]) {
      setInfoModalContent(strategyExplanations[strategyKey]);
    }
  };

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
      if (data.twoMinuteSteps && data.twoMinuteSteps.length > 0) {
        const validSteps = data.twoMinuteSteps.filter(step => step && step.trim() !== "");
        if (validSteps.length > 0) {
          strategyDetails.twoMinuteSteps = validSteps.join('\n');
        } else {
          strategyDetails.twoMinuteSteps = undefined; // Ensure empty is stored as undefined
        }
      }
      strategyDetails.twoMinuteReminderFrequency = data.twoMinuteReminderFrequency;
    } else if (data.strategy === 'if-then') {
       if (data.ifThenRules && data.ifThenRules.length > 0) {
        const validRules = data.ifThenRules
          .filter(rule => rule.ifCondition.trim() !== "" || rule.thenAction.trim() !== "");
        if (validRules.length > 0) {
          strategyDetails.ifThenRules = validRules
            .map(rule => `اگر [${rule.ifCondition.trim()}]، آنگاه [${rule.thenAction.trim()}]`)
            .join('\n');
        } else {
          strategyDetails.ifThenRules = undefined; // Ensure empty is stored as undefined
        }
      }
    }
    
    const habitDataToSave: NewHabitData = {
      title: data.title,
      // habitType: data.habitType, // No longer used
      goalDescription: data.goalDescription,
      triggers: data.triggers,
      strategy: data.strategy,
      strategyDetails: strategyDetails,
      totalDaysInput: totalDaysForHabit || 30 
    };

    try {
      if (isEditMode && initialData) {
        const updated = updateHabit(initialData.id, habitDataToSave);
        toast({
          title: "عادت به‌روزرسانی شد!",
          description: `عادت "${updated?.title}" با موفقیت تغییر کرد.`,
        });
        router.push(`/habits/${initialData.id}`);
      } else {
        const newHabit = addHabit(habitDataToSave);
        toast({
          title: "عادت جدید ایجاد شد!",
          description: `عادت "${newHabit.title}" با موفقیت اضافه شد.`,
        });
        router.push('/my-habits');
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "مشکلی در ذخیره عادت پیش آمد.";
       console.error("Error saving habit:", error, data, habitDataToSave);
       toast({
         title: "خطا در ذخیره‌سازی",
         description: errorMessage,
         variant: "destructive",
       });
    } finally {
       setIsLoading(false);
    }
  };

  const strategyOptions = [
    { value: 'none', label: 'معمولی (بدون روش خاص)' },
    { value: '21/90', label: 'قانون ۲۱/۹۰' },
    { value: '40-day', label: 'قانون ۴۰ روز' },
    { value: '2-minute', label: 'قانون ۲ دقیقه' },
    { value: 'if-then', label: 'قانون اگر-آنگاه' },
  ];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-28" lang="fa">
          {/* Habit Type Tabs - Removed
          <FormField
            control={form.control}
            name="habitType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm pr-4">۱. نوع عادت</FormLabel>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="build" className="rounded-full h-10">ساخت عادت جدید</TabsTrigger>
                      <TabsTrigger value="break" className="rounded-full h-10">ترک عادت بد</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          */}
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">۱. نام عادت</FormLabel>
                <FormControl>
                  <Input placeholder="مثلا: مطالعه روزانه یا ترک سیگار" {...field} className="rounded-full h-12 text-base" />
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
                <FormLabel className="text-sm">۲. هدف از این عادت (اختیاری)</FormLabel>
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
                <FormLabel className="text-sm pr-4">۴. روش ترک یا ساخت عادت</FormLabel>
                 <FormControl>
                  <div className="grid grid-cols-1 gap-3">
                    {strategyOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-full cursor-pointer transition-colors h-12",
                            isSelected
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-[var(--input-background)] border-[var(--input-border-color)] hover:border-primary/70"
                          )}
                        >
                           <Label
                            className={cn(
                              "font-normal text-base flex-grow text-right", // Ensure text is right aligned
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {option.label}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); 
                              handleStrategyInfoClick(option.value);
                            }}
                            className={cn(
                              "h-8 w-8 rounded-full hover:bg-primary/10 shrink-0",
                              isSelected ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                            aria-label={`اطلاعات بیشتر درباره ${option.label}`}
                          >
                            <Info className="h-5 w-5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                              "w-full justify-start text-right font-normal rounded-full h-12 text-base", 
                              !field.value && "text-muted-foreground",
                              "bg-[var(--input-background)] border-[var(--input-border-color)] hover:bg-[var(--input-background)]"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            {field.value ? format(field.value, 'PPP EEE'/*, { locale: faIR }*/) : <span>تاریخ را انتخاب کنید</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          // locale={faIR} // Temporarily removed due to import/versioning issues
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
                      <Input type="time" placeholder="مثلا: 10:30" {...field} className="rounded-full h-12 text-base"/>
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
                  <FormLabel className="text-sm pr-4">مدت زمان هدف (قانون ۲۱/۹۰)</FormLabel>
                  <FormDescription>۲۱ روز برای شروع تغییر، ۹۰ روز برای تثبیت.</FormDescription>
                  <Controller
                    control={form.control}
                    name="days2190"
                    render={({ field: days2190Field }) => ( 
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={days2190Field.value === '21' ? 'default' : 'outline'}
                                onClick={() => days2190Field.onChange('21')}
                                className="rounded-full h-12 text-base"
                            >
                                ۲۱ روز
                            </Button>
                            <Button
                                type="button"
                                variant={days2190Field.value === '90' ? 'default' : 'outline'}
                                onClick={() => days2190Field.onChange('90')}
                                className="rounded-full h-12 text-base"
                            >
                                ۹۰ روز
                            </Button>
                        </div>
                    )}
                  />
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
                    <Input type="number" inputMode="numeric" placeholder="مثلا: ۴۰ روز" {...field} 
                      className="rounded-full h-12 text-base"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value)) {
                          field.onChange(undefined);
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
            <FormField
              control={form.control}
              name="twoMinuteSteps"
              render={() => ( 
                <FormItem>
                  <FormLabel className="text-sm">قدم‌های کوچک (قانون ۲ دقیقه)</FormLabel>
                  <FormDescription>هر قدم را در یک فیلد وارد کنید (مثال: پوشیدن کفش ورزشی - ۱ دقیقه).</FormDescription>
                  <div className="space-y-2">
                    {twoMinuteStepsFields.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-2 space-x-reverse">
                        <FormControl className="flex-grow">
                           <Input
                            {...form.register(`twoMinuteSteps.${index}` as const)}
                            placeholder={`قدم ${toPersianNumerals(index + 1)}`}
                            className="rounded-full h-12 text-base"
                          />
                        </FormControl>
                        {twoMinuteStepsFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTwoMinuteStep(index)}
                            className="text-destructive hover:bg-destructive/10 rounded-full h-10 w-10"
                            aria-label={`حذف قدم ${toPersianNumerals(index + 1)}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                     {form.formState.errors.twoMinuteSteps && typeof form.formState.errors.twoMinuteSteps === 'object' && 'message' in form.formState.errors.twoMinuteSteps && (
                        <FormMessage>{form.formState.errors.twoMinuteSteps.message}</FormMessage>
                     )}
                     {Array.isArray(form.formState.errors.twoMinuteSteps) && form.formState.errors.twoMinuteSteps.map((error, index) => 
                        error && error.message && <FormMessage key={`step_err_${index}`}>{error.message}</FormMessage>
                     )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendTwoMinuteStep("")}
                    className="mt-2 rounded-full h-10 text-sm"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    افزودن قدم
                  </Button>
                </FormItem>
              )}
            />
          )}
          {selectedStrategy === '2-minute' && (
            <FormField
              control={form.control}
              name="twoMinuteReminderFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">فرکانس یادآوری (اختیاری)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثلا: هر ۲ ساعت" {...field} className="rounded-full h-12 text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        {selectedStrategy === 'if-then' && (
            <FormField
              control={form.control}
              name="ifThenRules"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm">قواعد اگر-آنگاه</FormLabel>
                  <FormDescription>هر قاعده را به صورت جداگانه برای شرط (اگر) و عمل (آنگاه) وارد کنید.</FormDescription>
                  <div className="space-y-4">
                    {ifThenRulesFields.map((item, index) => (
                      <div key={item.id} className="space-y-2 p-3 border rounded-lg bg-[var(--input-background)] border-[var(--input-border-color)]">
                        <div className="flex items-center justify-between">
                           <p className="text-sm font-medium text-muted-foreground">قاعده {toPersianNumerals(index + 1)}</p>
                           {ifThenRulesFields.length > 0 && ( // Show remove button even for the first item to allow removing all
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIfThenRule(index)}
                                className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                                aria-label={`حذف قاعده ${toPersianNumerals(index + 1)}`}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`ifThenRules.${index}.ifCondition`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">شرط (اگر)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="مثلا: هوس قهوه بعد از شام کردم"
                                  className="rounded-full h-12 text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ifThenRules.${index}.thenAction`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">عمل (آنگاه)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="مثلا: چای گیاهی می‌نوشم"
                                  className="rounded-full h-12 text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    {form.formState.errors.ifThenRules && typeof form.formState.errors.ifThenRules === 'object' && 'message' in form.formState.errors.ifThenRules && (
                        <FormMessage>{form.formState.errors.ifThenRules.message}</FormMessage>
                     )}
                     {Array.isArray(form.formState.errors.ifThenRules) && form.formState.errors.ifThenRules.map((error, index) => 
                        error && (error.ifCondition?.message || error.thenAction?.message) && 
                        <FormMessage key={`rule_err_${index}`}>{error.ifCondition?.message || error.thenAction?.message}</FormMessage>
                     )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendIfThenRule({ ifCondition: "", thenAction: "" })}
                    className="mt-2 rounded-full h-10 text-sm"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    افزودن قاعده اگر-آنگاه
                  </Button>
                </FormItem>
              )}
            />
          )}
          
          <div className="pt-4"> {/* Removed fixed positioning div */}
            <Button type="submit" className="w-full text-lg p-6 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isEditMode ? "ثبت تغییرات" : "ایجاد عادت")}
            </Button>
          </div>
        </form>
      </Form>

      {infoModalContent && (
        <Dialog open={!!infoModalContent} onOpenChange={(isOpen) => !isOpen && setInfoModalContent(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl bg-popover" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-xl">{infoModalContent.title}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-base text-right py-4 leading-relaxed">
              {infoModalContent.description}
            </DialogDescription>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="rounded-full">
                  متوجه شدم
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
