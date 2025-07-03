
'use server';

import { db } from '@/lib/db';
import { settings, meals, activities, dailyMetrics } from '@/lib/db/schema';
import type { Meal, Activity, UserSettings, DailyLog, History } from '@/lib/types';
import { eq, desc, inArray } from 'drizzle-orm';

const DEFAULT_TARGET = 2000;

async function ensureTodaysMetrics(date: string) {
    const existing = await db.query.dailyMetrics.findFirst({
        where: eq(dailyMetrics.date, date),
    });

    if (!existing) {
        await db.insert(dailyMetrics).values({ date, calorieTarget: DEFAULT_TARGET });
    }
}

export async function getData() {
    // Ensure default settings record exists
    let userSettings: UserSettings | null | undefined = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
    if (!userSettings) {
        await db.insert(settings).values({ 
            id: 1, 
            height: 0, 
            weight: 0, 
            age: 0, 
            gender: 'male', 
            activityLevel: 'sedentary', 
            goal: 'maintain' 
        });
        userSettings = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
    }

    const today = new Date().toISOString().split('T')[0];
    await ensureTodaysMetrics(today);
    
    // Fetch all data
    const allMeals = await db.query.meals.findMany();
    const allActivities = await db.query.activities.findMany();
    const allMetrics = await db.query.dailyMetrics.findMany();

    const history: History = {};

    allMetrics.forEach(metric => {
        history[metric.date] = {
            meals: [],
            activities: [],
            calorieTarget: metric.calorieTarget ?? DEFAULT_TARGET,
            weight: metric.weight ?? undefined
        };
    });

    allMeals.forEach(meal => {
        if (history[meal.date]) {
            history[meal.date].meals.push(meal);
        }
    });

    allActivities.forEach(activity => {
        if (history[activity.date]) {
            history[activity.date].activities.push(activity);
        }
    });

    return { history, userSettings: userSettings as UserSettings };
}

export async function addMealAction(date: string, mealData: Omit<Meal, 'id'>) {
    await ensureTodaysMetrics(date);
    const newMeal = { ...mealData, id: new Date().toISOString(), date };
    await db.insert(meals).values(newMeal);
}

export async function deleteMealAction(id: string) {
    await db.delete(meals).where(eq(meals.id, id));
}

export async function addActivityAction(date: string, activityData: Omit<Activity, 'id'>) {
    await ensureTodaysMetrics(date);
    const newActivity = { ...activityData, id: new Date().toISOString(), date };
    await db.insert(activities).values(newActivity);
}

export async function deleteActivityAction(id: string) {
    await db.delete(activities).where(eq(activities.id, id));
}

export async function updateTargetAction(date: string, newTarget: number) {
    await ensureTodaysMetrics(date);
    await db.update(dailyMetrics)
        .set({ calorieTarget: newTarget })
        .where(eq(dailyMetrics.date, date));
}

export async function logWeightAction(date: string, weight: number) {
    await ensureTodaysMetrics(date);
    await db.update(dailyMetrics)
      .set({ weight })
      .where(eq(dailyMetrics.date, date));
}

export async function updateSettingsAction(newSettings: UserSettings) {
    await db.update(settings)
        .set(newSettings)
        .where(eq(settings.id, 1));
}
