"use client";

import { useState, useEffect, useMemo } from "react";
import type { Meal, History, DailyLog } from "@/lib/types";
import { Logo } from "@/components/Logo";
import Summary from "@/components/dashboard/Summary";
import MealLogger from "@/components/dashboard/MealLogger";
import CalorieChart from "@/components/dashboard/CalorieChart";
import MealSuggester from "@/components/dashboard/MealSuggester";
import Reports from "@/components/dashboard/Reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialMeals: Meal[] = [
  { id: "1", name: "Oatmeal with Berries", calories: 350, type: "Breakfast" },
  { id: "2", name: "Grilled Chicken Salad", calories: 450, type: "Lunch" },
];

const getToday = () => new Date().toISOString().split('T')[0];

export default function Home() {
  const [history, setHistory] = useState<History>({});
  const [isMounted, setIsMounted] = useState(false);
  const [today, setToday] = useState(getToday());

  const todayLog: DailyLog = useMemo(() => {
    return history[today] || { meals: [], calorieTarget: 2000 };
  }, [history, today]);

  useEffect(() => {
    const newToday = getToday();
    if (newToday !== today) {
        setToday(newToday);
    }

    const storedHistory = localStorage.getItem("calorie-compass-history");
    let loadedHistory: History = {};

    if (storedHistory) {
      loadedHistory = JSON.parse(storedHistory);
    } else {
      const storedMeals = localStorage.getItem("calorie-compass-meals");
      const storedTarget = localStorage.getItem("calorie-compass-target");

      if (storedMeals) {
        const meals: Meal[] = JSON.parse(storedMeals);
        const calorieTarget: number = storedTarget ? JSON.parse(storedTarget) : 2000;
        loadedHistory[today] = { meals, calorieTarget };

        localStorage.removeItem("calorie-compass-meals");
        localStorage.removeItem("calorie-compass-target");
      }
    }
    
    if (!loadedHistory[today]) {
        loadedHistory[today] = { meals: initialMeals, calorieTarget: 2000 };
    }

    setHistory(loadedHistory);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("calorie-compass-history", JSON.stringify(history));
    }
  }, [history, isMounted]);

  const updateTodayLog = (newLog: Partial<DailyLog>) => {
    setHistory(prev => ({
      ...prev,
      [today]: { ...(prev[today] || { meals: [], calorieTarget: 2000 }), ...newLog },
    }));
  };

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    const newMeal = { ...meal, id: new Date().toISOString() };
    updateTodayLog({ meals: [...todayLog.meals, newMeal] });
  };

  const handleDeleteMeal = (id: string) => {
    updateTodayLog({ meals: todayLog.meals.filter((meal) => meal.id !== id) });
  };

  const handleTargetChange = (newTarget: number) => {
    updateTodayLog({ calorieTarget: newTarget });
  };
  
  const totalCalories = useMemo(() => {
    return todayLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
  }, [todayLog.meals]);
  
  const remainingCalories = todayLog.calorieTarget - totalCalories;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Logo />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border/60">
        <div className="container mx-auto">
          <Logo />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
         <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 lg:col-span-2">
                <Summary 
                  totalCalories={totalCalories}
                  calorieTarget={todayLog.calorieTarget}
                  onTargetChange={handleTargetChange}
                />
              </div>
              <div className="lg:col-span-1 xl:col-span-2">
                <CalorieChart meals={todayLog.meals} />
              </div>
              <div className="lg:col-span-2 xl:col-span-2">
                <MealLogger 
                  meals={todayLog.meals} 
                  onAddMeal={handleAddMeal}
                  onDeleteMeal={handleDeleteMeal}
                />
              </div>
              <div className="lg:col-span-2 xl:col-span-1">
                <MealSuggester meals={todayLog.meals} remainingCalories={remainingCalories} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reports">
            <Reports history={history} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
