export type Meal = {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
};

export type Activity = {
  id: string;
  name: string;
  caloriesBurned: number;
};

export type DailyLog = {
  meals: Meal[];
  activities: Activity[];
  calorieTarget: number;
  weight?: number;
};

export type History = {
  [date: string]: DailyLog;
};

export type UserSettings = {
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  goal: 'lose' | 'maintain' | 'gain';
};
