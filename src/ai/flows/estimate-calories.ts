'use server';
/**
 * @fileOverview Provides a calorie estimate for a given food item.
 *
 * - estimateCalories - A function that estimates the calories for a food.
 * - EstimateCaloriesInput - The input type for the estimateCalories function.
 * - EstimateCaloriesOutput - The return type for the estimateCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateCaloriesInputSchema = z.object({
  foodName: z.string().describe('The name of the food item to estimate calories for.'),
});
export type EstimateCaloriesInput = z.infer<typeof EstimateCaloriesInputSchema>;

const EstimateCaloriesOutputSchema = z.object({
  calories: z.number().describe('The estimated calorie count for the food item.'),
});
export type EstimateCaloriesOutput = z.infer<typeof EstimateCaloriesOutputSchema>;

export async function estimateCalories(input: EstimateCaloriesInput): Promise<EstimateCaloriesOutput> {
  return estimateCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateCaloriesPrompt',
  input: {schema: EstimateCaloriesInputSchema},
  output: {schema: EstimateCaloriesOutputSchema},
  prompt: `You are a nutrition expert. Your task is to estimate the calories for a given food item.
Provide a reasonable calorie estimate for a standard serving size of the following food.
Return only the number of calories.

Food: {{{foodName}}}
`,
});

const estimateCaloriesFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesFlow',
    inputSchema: EstimateCaloriesInputSchema,
    outputSchema: EstimateCaloriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
