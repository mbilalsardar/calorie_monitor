'use server';
/**
 * @fileOverview Provides a calorie burn estimate for a given exercise.
 *
 * - estimateExerciseCalories - A function that estimates the calories burned for an exercise.
 * - EstimateExerciseCaloriesInput - The input type for the estimateExerciseCalories function.
 * - EstimateExerciseCaloriesOutput - The return type for the estimateExerciseCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateExerciseCaloriesInputSchema = z.object({
  exerciseDescription: z.string().describe('The name or description of the exercise.'),
});
export type EstimateExerciseCaloriesInput = z.infer<typeof EstimateExerciseCaloriesInputSchema>;

const EstimateExerciseCaloriesOutputSchema = z.object({
  caloriesBurned: z.number().describe('The estimated calorie burn for the exercise.'),
});
export type EstimateExerciseCaloriesOutput = z.infer<typeof EstimateExerciseCaloriesOutputSchema>;

export async function estimateExerciseCalories(input: EstimateExerciseCaloriesInput): Promise<EstimateExerciseCaloriesOutput> {
  return estimateExerciseCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateExerciseCaloriesPrompt',
  input: {schema: EstimateExerciseCaloriesInputSchema},
  output: {schema: EstimateExerciseCaloriesOutputSchema},
  prompt: `You are a fitness and exercise expert with a web search tool. Your task is to estimate the calories burned for a given exercise.
You MUST use your web search tool to find a reliable estimate for the calories burned. Base your estimate on a 30-minute session for an average person (e.g., around 150-180 lbs or 70-80 kg).
Return only the number of calories burned.

Exercise: {{{exerciseDescription}}}
`,
});

const estimateExerciseCaloriesFlow = ai.defineFlow(
  {
    name: 'estimateExerciseCaloriesFlow',
    inputSchema: EstimateExerciseCaloriesInputSchema,
    outputSchema: EstimateExerciseCaloriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
