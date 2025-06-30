"use client";

import { useState, useEffect, useMemo } from "react";
import type { Meal } from "@/lib/types";
import { Logo } from "@/components/Logo";
import Summary from "@/components/dashboard/Summary";
import MealLogger from "@/components/dashboard/MealLogger";
import CalorieChart from "@/components/dashboard/CalorieChart";
import MealSuggester from "@/components/dashboard/MealSuggester";

const initialMeals: Meal[] = [
  { id: "1", name: "Oatmeal with Berries", calories: 350, type: "Breakfast" },
  { id: "2", name: "Grilled Chicken Salad", calories: 450, type: "Lunch" },
];

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedMeals = localStorage.getItem("calorie-compass-meals");
    const storedTarget = localStorage.getItem("calorie-compass-target");

    if (storedMeals) {
      setMeals(JSON.parse(storedMeals));
    } else {
      setMeals(initialMeals);
    }

    if (storedTarget) {
      setCalorieTarget(JSON.parse(storedTarget));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("calorie-compass-meals", JSON.stringify(meals));
    }
  }, [meals, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("calorie-compass-target", JSON.stringify(calorieTarget));
    }
  }, [calorieTarget, isMounted]);

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    const newMeal = { ...meal, id: new Date().toISOString() };
    setMeals((prev) => [...prev, newMeal]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const totalCalories = useMemo(() => {
    return meals.reduce((acc, meal) => acc + meal.calories, 0);
  }, [meals]);
  
  const remainingCalories = calorieTarget - totalCalories;

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border/60">
        <div className="container mx-auto">
          <Logo />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 lg:col-span-2">
            <Summary 
              totalCalories={totalCalories}
              calorieTarget={calorieTarget}
              onTargetChange={setCalorieTarget}
            />
          </div>
          <div className="lg:col-span-1 xl:col-span-2">
            <CalorieChart meals={meals} />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <MealLogger 
              meals={meals} 
              onAddMeal={handleAddMeal}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-1">
            <MealSuggester meals={meals} remainingCalories={remainingCalories} />
          </div>
        </div>
      </main>
    </div>
  );
}
