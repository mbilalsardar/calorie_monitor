'use server';

/**
 * @fileOverview Provides meal adjustment suggestions based on remaining calorie target.
 *
 * - suggestMealAdjustments - A function that suggests meal adjustments based on remaining calorie target.
 * - SuggestMealAdjustmentsInput - The input type for the suggestMealAdjustments function.
 * - SuggestMealAdjustmentsOutput - The return type for the suggestMealAdjustments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMealAdjustmentsInputSchema = z.object({
  loggedMeals: z
    .string()
    .describe('A string of all meals logged for the day with their calorie counts.'),
  remainingCalories: z.number().describe('The remaining calorie target for the day.'),
  nextMealType: z.string().describe('The type of the next meal (e.g., lunch, dinner).'),
});
export type SuggestMealAdjustmentsInput = z.infer<typeof SuggestMealAdjustmentsInputSchema>;

const SuggestMealAdjustmentsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Suggestions for adjusting the next meal to stay within the calorie target.'),
});
export type SuggestMealAdjustmentsOutput = z.infer<typeof SuggestMealAdjustmentsOutputSchema>;

export async function suggestMealAdjustments(input: SuggestMealAdjustmentsInput): Promise<SuggestMealAdjustmentsOutput> {
  return suggestMealAdjustmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealAdjustmentsPrompt',
  input: {schema: SuggestMealAdjustmentsInputSchema},
  output: {schema: SuggestMealAdjustmentsOutputSchema},
  prompt: `You are a nutritional advisor. Analyze the user's logged meals and remaining calorie target, and provide suggestions for their next meal.
keep the meal suggestion according to general Pakistani cuisine.

Logged Meals: {{{loggedMeals}}}
Remaining Calories: {{{remainingCalories}}}
Next Meal Type: {{{nextMealType}}}

Suggest adjustments to the next meal to help the user stay within their daily calorie goal. Focus on practical, actionable advice.

Suggestions:`,
});

const suggestMealAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestMealAdjustmentsFlow',
    inputSchema: SuggestMealAdjustmentsInputSchema,
    outputSchema: SuggestMealAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
