import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-meal-adjustments.ts';
import '@/ai/flows/estimate-calories.ts';
import '@/ai/flows/calculate-calorie-target.ts';
import '@/ai/flows/estimate-exercise-calories.ts';
