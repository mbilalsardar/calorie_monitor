"use client";

import { useState } from "react";
import type { Meal } from "@/lib/types";
import { getMealSuggestions } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type MealSuggesterProps = {
  meals: Meal[];
  remainingCalories: number;
};

export default function MealSuggester({ meals, remainingCalories }: MealSuggesterProps) {
  const [nextMealType, setNextMealType] = useState("Dinner");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion("");
    const result = await getMealSuggestions(meals, remainingCalories, nextMealType);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error,
      });
    } else if(result.suggestions) {
      setSuggestion(result.suggestions);
    }
    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Meal Planner AI</CardTitle>
        <CardDescription>Get suggestions for your next meal.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-grow">
            <label className="text-sm font-medium">Next Meal</label>
            <Select value={nextMealType} onValueChange={setNextMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
                <SelectItem value="Snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGetSuggestion} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Suggest
          </Button>
        </div>

        <div className="flex-grow p-4 bg-primary/5 border-dashed border-2 border-primary/20 rounded-lg">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : suggestion ? (
            <p className="text-sm leading-relaxed">{suggestion}</p>
          ) : (
            <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
              <Lightbulb className="h-8 w-8 mb-2" />
              <p>Click "Suggest" to get an AI-powered meal idea!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
