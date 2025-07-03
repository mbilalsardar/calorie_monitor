
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Meal, History, DailyLog, UserSettings, Activity } from "@/lib/types";
import { 
  addMealAction, 
  deleteMealAction, 
  addActivityAction, 
  deleteActivityAction, 
  updateTargetAction, 
  logWeightAction,
  updateSettingsAction
} from "@/app/data-actions";

import { Logo } from "@/components/Logo";
import Summary from "@/components/dashboard/Summary";
import MealLogger from "@/components/dashboard/MealLogger";
import CalorieChart from "@/components/dashboard/CalorieChart";
import MealSuggester from "@/components/dashboard/MealSuggester";
import Reports from "@/components/dashboard/Reports";
import Settings from "@/components/dashboard/Settings";
import ActivityLogger from "@/components/dashboard/ActivityLogger";
import WeightTracker from "@/components/dashboard/WeightTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getToday = () => new Date().toISOString().split('T')[0];

type MainAppProps = {
  initialHistory: History;
  initialSettings: UserSettings;
};

export default function MainApp({ initialHistory, initialSettings }: MainAppProps) {
  const router = useRouter();
  const [history, setHistory] = useState<History>(initialHistory);
  const [userSettings, setUserSettings] = useState<Partial<UserSettings>>(initialSettings);
  const [isMounted, setIsMounted] = useState(false);
  const [today, setToday] = useState(getToday());

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    setUserSettings(initialSettings);
  }, [initialSettings]);
  
  useEffect(() => {
    setIsMounted(true);
    const newToday = getToday();
    if (newToday !== today) {
        setToday(newToday);
    }
  }, []);

  const todayLog: DailyLog = useMemo(() => {
    return history[today] || { meals: [], activities: [], calorieTarget: 2000 };
  }, [history, today]);

  const handleAddMeal = async (meal: Omit<Meal, "id">) => {
    await addMealAction(today, meal);
    router.refresh();
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMealAction(id);
    router.refresh();
  };
  
  const handleAddActivity = async (activity: Omit<Activity, "id">) => {
    await addActivityAction(today, activity);
    router.refresh();
  };

  const handleDeleteActivity = async (id: string) => {
    await deleteActivityAction(id);
    router.refresh();
  };

  const handleTargetChange = async (newTarget: number) => {
    await updateTargetAction(today, newTarget);
    router.refresh();
  };

  const handleSettingsChange = async (newSettings: UserSettings) => {
    await updateSettingsAction(newSettings);
    router.refresh();
  };

  const handleLogWeight = async (weight: number, date: string) => {
    await logWeightAction(date, weight);
    router.refresh();
  };
  
  const totalConsumedCalories = useMemo(() => {
    return todayLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
  }, [todayLog.meals]);

  const totalBurnedCalories = useMemo(() => {
    return (todayLog.activities || []).reduce((acc, activity) => acc + activity.caloriesBurned, 0);
  }, [todayLog.activities]);
  
  const netCalories = totalConsumedCalories - totalBurnedCalories;
  const remainingCalories = todayLog.calorieTarget - netCalories;

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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 lg:col-span-2">
                <Summary 
                  totalConsumedCalories={totalConsumedCalories}
                  totalBurnedCalories={totalBurnedCalories}
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
           <TabsContent value="activity">
            <ActivityLogger
              activities={todayLog.activities || []}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          </TabsContent>
          <TabsContent value="weight">
            <WeightTracker
              history={history}
              onLogWeight={handleLogWeight}
            />
          </TabsContent>
          <TabsContent value="reports">
            <Reports history={history} />
          </TabsContent>
          <TabsContent value="settings">
            <Settings 
              settings={userSettings}
              onSettingsChange={handleSettingsChange}
              onTargetChange={handleTargetChange}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
