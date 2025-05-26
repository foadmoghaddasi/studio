
'use server';
/**
 * @fileOverview Provides personalized motivational messages for habit tracking.
 *
 * - getMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the getMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for a motivational message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  habitName: z.string().describe('The name of the habit being tracked.'),
  daysCompleted: z.number().describe('The number of days the habit has been completed.'),
  totalDays: z.number().describe('The total number of days for the habit.'),
  successful: z.boolean().describe('Whether the user was successful today.'),
});
export type MotivationalMessageInput = z.infer<typeof MotivationalMessageInputSchema>;

const MotivationalMessageOutputSchema = z.object({
  message: z.string().describe('A personalized motivational message with emojis.'),
});
export type MotivationalMessageOutput = z.infer<typeof MotivationalMessageOutputSchema>;

export async function getMotivationalMessage(input: MotivationalMessageInput): Promise<MotivationalMessageOutput> {
  return motivationalMessageFlow(input);
}

const motivationalMessagePrompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are a motivational coach helping users stick to their habits.

  Generate a personalized motivational message for the user based on the following information:

  Habit Name: {{{habitName}}}
  Days Completed: {{{daysCompleted}}}
  Total Days: {{{totalDays}}}
  Successful Today: {{#if successful}}Yes{{else}}No{{/if}}

  The message should be encouraging and relevant to the user's progress.
  When crafting the message, consider the nature of the habit "{{{habitName}}}".
  If it's a positive habit (e.g., "ورزش روزانه", "مطالعه کتاب"), briefly mention a benefit of this habit.
  If it's about overcoming a negative habit (e.g., "ترک سیگار", "کاهش مصرف قند"), briefly mention a benefit of quitting or a harm of continuing that negative habit.

  Make the message more engaging by adding 1-2 relevant and positive emojis. For example: 🎉, 💪, 👍, 😊, 🌟, 📚, 💧, 🚀, 🎯, 💯. Do not overuse emojis; keep it natural and friendly.
  When you include numbers in your message, ensure they are in Persian numerals (e.g., ۱، ۲، ۳). For example, if days completed is 5 and total days is 21, you should use '۵' and '۲۱' in your Persian message.


  For example:
  - If habitName is "ترک سیگار" and successful is true: "عالیه که امروز هم سیگار نکشیدی! 🚭 هر روز یک قدم به سمت سلامتی بیشتر ریه‌هات. به این روند ادامه بده! 💪"
  - If habitName is "مطالعه روزانه" and successful is true: "فوق‌العاده‌ست که امروز هم مطالعه کردی! 📚 هر صفحه دریچه‌ای به دنیای جدیدی از دانش باز می‌کنه. همینطور پیش برو! 🌟"
  - If habitName is "نوشیدن آب کافی" and successful is false: "امروز نشد به اندازه کافی آب بنوشی، اشکالی نداره. 💧 یادت باشه که هیدراته نگه داشتن بدن چقدر برای سلامتی مهمه. فردا دوباره تلاش کن! 😊"
  - If habitName is "یادگیری زبان جدید" and successful is true: "آفرین به پشتکارت! 🚀 هر کلمه جدیدی که یاد می‌گیری، یک در به دنیای بزرگتره. ادامه بده! 👍"

  Keep the message short (around 1-2 sentences) and positive, even when the user wasn't successful today.
  If the user was successful today, congratulate them and encourage them to continue. If not, remind them of their goal and encourage them to try again tomorrow, possibly linking it to the benefit/harm.
  The message MUST be in Persian (Farsi) and use a friendly tone.
  Ensure the output strictly adheres to the MotivationalMessageOutputSchema, providing only the 'message' field.
  `,
});

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    // No need to convert numbers to Persian here, as the LLM is instructed to do so.
    const {output} = await motivationalMessagePrompt(input);
    return output!;
  }
);
