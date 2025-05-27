
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
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
// import { faIR } from 'date-fns/locale'; // Reverted due to incompatibility
import { cn } from '@/lib/utils';
import type { HabitStrategyDetails } from '@/lib/types';
import { Label } from "@/components/ui/label"; 

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel as ShadcnFormLabel, 
  FormMessage,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const habitFormSchema = z.object({
  habitType: z.enum(['build', 'break'], { required_error: "نوع عادت را مشخص کنید." }),
  title: z.string().min(1, { message: "عنوان عادت نمی‌تواند خالی باشد." }),
  goalDescription: z.string().optional(),
  triggers: z.string().optional(),
  strategy: z.enum(['21/90', '40-day', '2-minute', 'if-then', 'none'], { required_error: "روش ساخت یا ترک عادت را انتخاب کنید." }),
  
  startDate: z.date().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "زمان معتبر نیست (HH:MM)" }).optional().or(z.literal("")),

  days2190: z.enum(['21', '90']).optional(),
  twoMinuteSteps: z.string().optional(),
  twoMinuteReminderFrequency: z.string().optional(),
  ifThenRules: z.string().optional(),
  
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

export default function HabitForm() {
  const { addHabit } = useHabits();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string } | null>(null);


  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      habitType: 'build',
      title: "",
      strategy: 'none',
      reminderTime: "",
      programDuration: 30, 
      days2190: '21',
    },
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
      totalDaysInput: totalDaysForHabit || 30 
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
          
          <FormField
            control={form.control}
            name="habitType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <ShadcnFormLabel className="text-sm pr-4">۱. نوع عادت</ShadcnFormLabel>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 rounded-full">
                      <TabsTrigger value="build" className="rounded-full">ساخت عادت جدید</TabsTrigger>
                      <TabsTrigger value="break" className="rounded-full">ترک عادت بد</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
                <ShadcnFormLabel className="text-sm">۲. نام عادت</ShadcnFormLabel>
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
                <ShadcnFormLabel className="text-sm">هدف از این عادت (اختیاری)</ShadcnFormLabel>
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
                <ShadcnFormLabel className="text-sm">۳. محرک‌ها (اختیاری)</ShadcnFormLabel>
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
                <ShadcnFormLabel className="text-sm pr-4">۴. روش ترک یا ساخت عادت</ShadcnFormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-3"
                  >
                    {strategyOptions.map((option) => {
                      const radioId = `strategy-option-${option.value}`;
                      return (
                        <div
                          key={option.value}
                          className="flex items-center justify-between p-3 border rounded-full bg-[var(--input-background)] border-[var(--input-border-color)]"
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option.value} id={radioId} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStrategyInfoClick(option.value)}
                              className="h-8 w-8 rounded-full hover:bg-primary/10"
                              aria-label={`اطلاعات بیشتر درباره ${option.label}`}
                            >
                              <Info className="h-5 w-5 text-primary" />
                            </Button>
                          </div>
                          <Label
                            htmlFor={radioId}
                            className="font-normal text-base cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
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
                    <ShadcnFormLabel className="text-sm">تاریخ شروع</ShadcnFormLabel>
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
                          // locale={faIR} // Temporarily removed due to import issues
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
                    <ShadcnFormLabel className="text-sm">زمان یادآوری (اختیاری)</ShadcnFormLabel>
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
                  <ShadcnFormLabel className="text-sm pr-4">مدت زمان هدف (قانون ۲۱/۹۰)</ShadcnFormLabel>
                  <FormDescription>۲۱ روز برای شروع تغییر، ۹۰ روز برای تثبیت.</FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2 space-x-reverse"
                    >
                      <FormItem className="flex items-center space-x-2 space-x-reverse">
                        <FormControl><RadioGroupItem value="21" /></FormControl>
                        <ShadcnFormLabel className="font-normal text-base">۲۱ روز</ShadcnFormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-x-reverse">
                        <FormControl><RadioGroupItem value="90" /></FormControl>
                        <ShadcnFormLabel className="font-normal text-base">۹۰ روز</ShadcnFormLabel>
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
                  <ShadcnFormLabel className="text-sm">مدت کل برنامه (روز)</ShadcnFormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="مثلا: ۳۰" {...field} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value)) {
                          field.onChange(''); 
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
                    <ShadcnFormLabel className="text-sm">قدم‌های کوچک (قانون ۲ دقیقه)</ShadcnFormLabel>
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
                    <ShadcnFormLabel className="text-sm">فرکانس یادآوری (اختیاری)</ShadcnFormLabel>
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
                  <ShadcnFormLabel className="text-sm">قواعد اگر-آنگاه</ShadcnFormLabel>
                  <FormDescription>هر قاعده را در یک خط جدید وارد کنید (مثال: اگر [هوس قهوه بعد از شام کردم]، آنگاه [چای گیاهی می‌نوشم]).</FormDescription>
                  <FormControl>
                    <Textarea placeholder="اگر [محرک]، آنگاه [رفتار جایگزین]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="pt-4">
            <Button type="submit" className="w-full text-lg p-6 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ایجاد عادت"}
            </Button>
          </div>
        </form>
      </Form>

      {infoModalContent && (
        <Dialog open={!!infoModalContent} onOpenChange={(isOpen) => !isOpen && setInfoModalContent(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
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
    

    

    

    

    
