export type Meal = {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
};
