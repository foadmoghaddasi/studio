
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const profileSetupSchema = z.object({
  firstName: z.string().min(1, { message: "نام نمی‌تواند خالی باشد." }),
  lastName: z.string().min(1, { message: "نام خانوادگی نمی‌تواند خالی باشد." }),
  age: z.coerce.number().min(1, { message: "سن معتبر نیست." }).max(120, { message: "سن معتبر نیست." }),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export default function ProfileSetupForm() {
  const { saveProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: undefined, // or an appropriate default number
    },
  });

  const onSubmit: SubmitHandler<ProfileSetupFormValues> = (data) => {
    setIsLoading(true);
    // Simulate API call or direct save
    setTimeout(() => {
      saveProfile({ firstName: data.firstName, lastName: data.lastName, age: String(data.age) });
      // setIsLoading(false); // Not strictly necessary as it will redirect
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] p-4" lang="fa">
      <div className="w-full max-w-sm text-right mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">تکمیل پروفایل</h1>
        <p className="text-muted-foreground">
          فقط چند قدم دیگه مونده تا بتونیم تجربه بهتری برات بسازیم.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">نام</FormLabel>
                <FormControl>
                  <Input placeholder="مثلا: علی" {...field} className="rounded-full h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">نام خانوادگی</FormLabel>
                <FormControl>
                  <Input placeholder="مثلا: محمدی" {...field} className="rounded-full h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">سن</FormLabel>
                <FormControl>
                  <Input type="number" inputMode="numeric" placeholder="مثلا: ۲۵" {...field} 
                    className="rounded-full h-12 text-base"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        field.onChange(undefined); // Or handle as per Zod schema (e.g., for empty string)
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
          <div className="pt-4">
            <Button type="submit" className="w-full text-lg p-6 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "ذخیره و ادامه"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
