
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

const profileSetupSchema = z.object({
  firstName: z.string().min(1, { message: "نام نمی‌تواند خالی باشد." }),
  lastName: z.string().min(1, { message: "نام خانوادگی نمی‌تواند خالی باشد." }),
  age: z.coerce.number().min(1, { message: "سن معتبر نیست." }).max(120, { message: "سن معتبر نیست." }),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export default function ProfileSetupForm() {
  const { 
    saveProfile, 
    firstName: currentFirstName, 
    lastName: currentLastName, 
    age: currentAge,
    // isProfileSetupComplete // This is now managed more granularly by AuthProvider based on loginIdentifier
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Determine if it's an initial setup or an edit based on whether currentFirstName exists from AuthProvider
  const isEditMode = !!currentFirstName; 

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      firstName: currentFirstName || "",
      lastName: currentLastName || "",
      age: currentAge ? parseInt(currentAge) : undefined,
    },
  });

  // Pre-fill form if data changes (e.g. on refresh or after Google sign-in prefill)
  useEffect(() => {
    form.reset({
      firstName: currentFirstName || "",
      lastName: currentLastName || "",
      age: currentAge ? parseInt(currentAge) : undefined,
    });
  }, [currentFirstName, currentLastName, currentAge, form]);


  const onSubmit: SubmitHandler<ProfileSetupFormValues> = (data) => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      saveProfile({ firstName: data.firstName, lastName: data.lastName, age: String(data.age) });
      setIsLoading(false);
      // AuthProvider's useEffect will handle redirection to /my-habits or /profile
      if(isEditMode) {
        router.push('/profile'); 
      } else {
        router.push('/my-habits'); // Default for initial setup
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-10rem)] p-4" lang="fa">
      <div className="w-full max-w-sm text-right mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {isEditMode ? "ویرایش پروفایل" : "تکمیل پروفایل"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? "اطلاعات پروفایل خود را به‌روزرسانی کنید." : "فقط چند قدم دیگه مونده تا بتونیم تجربه بهتری برات بسازیم."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm pr-4">نام</FormLabel>
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
                <FormLabel className="text-sm pr-4">نام خانوادگی</FormLabel>
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
                <FormLabel className="text-sm pr-4">سن</FormLabel>
                <FormControl>
                  <Input type="number" inputMode="numeric" placeholder="مثلا: ۲۵" {...field} 
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
          <div className="pt-4">
            <Button type="submit" className="w-full text-lg p-0 h-14 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
                (isEditMode ? "ثبت تغییرات" : "ذخیره و ادامه")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
