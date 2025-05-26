'use server';
/**
 * @fileOverview Provides personalized motivational messages for habit tracking.
 *
 * - getMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the getMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the getMotivationalMessage function.
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
  message: z.string().describe('A personalized motivational message.'),
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

  The message should be encouraging and relevant to the user's progress. Keep it short and positive.
  If the user was successful today, congratulate them and encourage them to continue. If not, remind them of their goal and encourage them to try again tomorrow.
  The message should be in Persian (Farsi) and use a friendly tone.
  `,
});

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await motivationalMessagePrompt(input);
    return output!;
  }
);
