'use server';
/**
 * @fileOverview Calculates a suggested daily calorie target based on user metrics.
 *
 * - calculateCalorieTarget - A function that suggests a daily calorie target.
 * - CalculateCalorieTargetInput - The input type for the calculateCalorieTarget function.
 * - CalculateCalorieTargetOutput - The return type for the calculateCalorieTarget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateCalorieTargetInputSchema = z.object({
  height: z.number().describe("The user's height in centimeters."),
  weight: z.number().describe("The user's weight in kilograms."),
  age: z.number().describe("The user's age in years."),
  gender: z.enum(['male', 'female']).describe("The user's gender."),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very-active'])
    .describe(
      "The user's activity level. Sedentary (little or no exercise), Light (light exercise/sports 1-3 days/week), Moderate (moderate exercise/sports 3-5 days/week), Active (hard exercise/sports 6-7 days a week), Very Active (very hard exercise/sports & physical job)."
    ),
  goal: z
    .enum(['lose', 'maintain', 'gain'])
    .describe("The user's weight goal: lose, maintain, or gain weight."),
});
export type CalculateCalorieTargetInput = z.infer<typeof CalculateCalorieTargetInputSchema>;

const CalculateCalorieTargetOutputSchema = z.object({
  calorieTarget: z.number().describe('The suggested daily calorie target in kcal.'),
  explanation: z.string().describe('A brief explanation of how the target was calculated.'),
});
export type CalculateCalorieTargetOutput = z.infer<typeof CalculateCalorieTargetOutputSchema>;

export async function calculateCalorieTarget(
  input: CalculateCalorieTargetInput
): Promise<CalculateCalorieTargetOutput> {
  return calculateCalorieTargetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateCalorieTargetPrompt',
  input: {schema: CalculateCalorieTargetInputSchema},
  output: {schema: CalculateCalorieTargetOutputSchema},
  prompt: `You are an expert nutritionist. Your task is to calculate a daily calorie target for a user based on their personal information.

User's Data:
- Height: {{{height}}} cm
- Weight: {{{weight}}} kg
- Age: {{{age}}} years
- Gender: {{{gender}}}
- Activity Level: {{{activityLevel}}}
- Goal: {{{goal}}}

Instructions:
1.  Calculate the Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation:
    -   For men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
    -   For women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
2.  Calculate the Total Daily Energy Expenditure (TDEE) by multiplying the BMR by the appropriate activity factor:
    -   Sedentary: 1.2
    -   Lightly active: 1.375
    -   Moderately active: 1.55
    -   Active: 1.725
    -   Very active: 1.9
3.  Adjust the TDEE based on the user's goal:
    -   For 'lose' weight: Subtract 500 calories from TDEE (for a safe deficit of ~1lb/week).
    -   For 'maintain' weight: TDEE is the target.
    -   For 'gain' weight: Add 500 calories to TDEE (for a safe surplus of ~1lb/week).
4. Round the final calorie target to the nearest 10.
5. Provide the final calculated calorie target and a brief, one or two sentence explanation of the calculation (mentioning BMR, TDEE, and goal adjustment).
`,
});

const calculateCalorieTargetFlow = ai.defineFlow(
  {
    name: 'calculateCalorieTargetFlow',
    inputSchema: CalculateCalorieTargetInputSchema,
    outputSchema: CalculateCalorieTargetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
