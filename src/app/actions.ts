'use server';

import { suggestMealAdjustments } from '@/ai/flows/suggest-meal-adjustments';
import { estimateCalories } from '@/ai/flows/estimate-calories';
import { calculateCalorieTarget } from '@/ai/flows/calculate-calorie-target';
import { estimateExerciseCalories } from '@/ai/flows/estimate-exercise-calories';
import type { Meal, UserSettings, Activity } from '@/lib/types';

export async function getCalorieEstimate(foodName: string) {
  if (!foodName) {
    return { error: 'Food name is required.' };
  }
  try {
    const result = await estimateCalories({ foodName });
    return result;
  } catch (error) {
    console.error('Error getting calorie estimate:', error);
    return { error: 'Failed to get calorie estimate. Please try again later.' };
  }
}

export async function getExerciseCalorieEstimate(exerciseDescription: string) {
  if (!exerciseDescription) {
    return { error: 'Exercise description is required.' };
  }
  try {
    const result = await estimateExerciseCalories({ exerciseDescription });
    return result;
  } catch (error) {
    console.error('Error getting exercise calorie estimate:', error);
    return { error: 'Failed to get exercise calorie estimate. Please try again later.' };
  }
}

export async function getMealSuggestions(
  meals: Meal[],
  remainingCalories: number,
  nextMealType: string
) {
  try {
    const loggedMealsString = meals
      .map((meal) => `${meal.type} - ${meal.name}: ${meal.calories} kcal`)
      .join('; ');

    if (remainingCalories < 0) {
       return { suggestions: "You've already exceeded your daily calorie target. For your next meal, consider something very light, like a simple salad with vinaigrette or a cup of broth-based soup to minimize exceeding your goal further." };
    }
    
    if (meals.length === 0) {
        return { suggestions: `You have ${remainingCalories} calories remaining. For ${nextMealType}, you could have a balanced meal. For example, a piece of grilled fish with roasted vegetables and a side of quinoa.` };
    }

    const result = await suggestMealAdjustments({
      loggedMeals: loggedMealsString,
      remainingCalories,
      nextMealType,
    });

    return result;
  } catch (error) {
    console.error('Error getting meal suggestions:', error);
    return { error: 'Failed to get meal suggestions. Please try again later.' };
  }
}

export async function getCalorieTargetSuggestion(settings: UserSettings) {
  try {
    const result = await calculateCalorieTarget(settings);
    return result;
  } catch (error) {
    console.error('Error getting calorie target suggestion:', error);
    return { error: 'Failed to get calorie target suggestion. Please try again later.' };
  }
}
