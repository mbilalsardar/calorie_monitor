"use client";

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { Meal } from "@/lib/types";

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

type CalorieChartProps = {
  meals: Meal[];
};

export default function CalorieChart({ meals }: CalorieChartProps) {
  const chartData = useMemo(() => {
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const data = mealTypes.map(type => ({
      name: type,
      total: 0
    }));

    meals.forEach(meal => {
      const mealTypeData = data.find(d => d.name === meal.type);
      if (mealTypeData) {
        mealTypeData.total += meal.calories;
      }
    });

    return data;
  }, [meals]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Calorie Distribution</CardTitle>
        <CardDescription>Calories per meal type</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ChartContainer config={{}} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              accessibilityLayer
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
               <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar 
                dataKey="total"
                radius={[8, 8, 0, 0]} 
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
