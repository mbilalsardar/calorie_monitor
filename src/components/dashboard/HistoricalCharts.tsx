"use client";

import { useMemo } from 'react';
import type { History } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend } from "recharts";
import { format, parseISO } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type HistoricalChartsProps = {
  history: History;
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function HistoricalCharts({ history }: HistoricalChartsProps) {
  const weeklyTrendData = useMemo(() => {
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7);
    return sortedDates.map(date => {
      const dayData = history[date];
      const totalConsumed = dayData.meals.reduce((acc, meal) => acc + meal.calories, 0);
      const totalBurned = (dayData.activities || []).reduce((acc, activity) => acc + activity.caloriesBurned, 0);
      const netCalories = totalConsumed - totalBurned;
      return {
        date: format(parseISO(date), 'MMM d'),
        NetCalories: netCalories,
        Target: dayData.calorieTarget
      };
    }).reverse(); // reverse to show oldest to newest
  }, [history]);

  const mealTypeData = useMemo(() => {
    const mealTypes: { [key: string]: number } = { "Breakfast": 0, "Lunch": 0, "Dinner": 0, "Snack": 0 };
    let totalMeals = 0;

    Object.values(history).forEach(dayLog => {
      dayLog.meals.forEach(meal => {
        if (meal.type in mealTypes) {
          mealTypes[meal.type] += meal.calories;
          totalMeals++;
        }
      });
    });

    if (totalMeals === 0) return [];
    
    return Object.entries(mealTypes).map(([name, value]) => ({
      name,
      value,
    })).filter(item => item.value > 0);
  }, [history]);
  
  if (Object.keys(history).length < 2) {
    return null; // Don't show charts if there's not enough data
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Trend</CardTitle>
          <CardDescription>Net calories vs. target for the last 7 active days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{
                NetCalories: { label: "Net Calories", color: "hsl(var(--chart-1))" },
                Target: { label: "Target", color: "hsl(var(--chart-2))" }
            }}
            className="min-h-[250px] w-full"
          >
            <ResponsiveContainer>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="NetCalories" fill="var(--color-NetCalories)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="var(--color-Target)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Calorie Source Breakdown</CardTitle>
          <CardDescription>Total distribution of calories by meal type.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
           <ChartContainer config={{}} className="min-h-[250px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={mealTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      if (percent === 0) return null;
                      return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                  }}
                >
                  {mealTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
           </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
