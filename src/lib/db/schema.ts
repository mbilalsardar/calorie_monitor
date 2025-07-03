import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  height: real('height'),
  weight: real('weight'),
  age: integer('age'),
  gender: text('gender', { enum: ['male', 'female'] }),
  activityLevel: text('activityLevel', { enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'] }),
  goal: text('goal', { enum: ['lose', 'maintain', 'gain'] }),
});

export const meals = sqliteTable('meals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  type: text('type', { enum: ["Breakfast", "Lunch", "Dinner", "Snack"] }).notNull(),
  date: text('date').notNull(),
});

export const activities = sqliteTable('activities', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    caloriesBurned: integer('caloriesBurned').notNull(),
    date: text('date').notNull(),
});

export const dailyMetrics = sqliteTable('daily_metrics', {
  date: text('date').primaryKey(),
  calorieTarget: integer('calorieTarget'),
  weight: real('weight'),
});
