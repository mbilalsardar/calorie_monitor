export type Meal = {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
};

export type DailyLog = {
  meals: Meal[];
  calorieTarget: number;
};

export type History = {
  [date: string]: DailyLog;
};
