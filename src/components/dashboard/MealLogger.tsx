"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Meal } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, UtensilsCrossed } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";


const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required."),
  calories: z.coerce.number().min(0, "Calories must be a positive number."),
  type: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
});

type MealLoggerProps = {
  meals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id">) => void;
  onDeleteMeal: (id: string) => void;
};

export default function MealLogger({ meals, onAddMeal, onDeleteMeal }: MealLoggerProps) {
  const form = useForm<z.infer<typeof mealSchema>>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      calories: 0,
      type: "Breakfast",
    },
  });

  function onSubmit(values: z.infer<typeof mealSchema>) {
    onAddMeal(values as Omit<Meal, "id">);
    form.reset();
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Log Your Meal</CardTitle>
        <CardDescription>Add a new meal to your daily log.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Food</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple, Salad..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories (kcal)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 95" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto md:col-start-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </form>
        </Form>
        
        <p className="font-semibold mb-2">Today's Meals</p>
        <div className="border rounded-lg flex-grow relative">
          <ScrollArea className="h-64">
            {meals.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">{meal.type}</TableCell>
                    <TableCell>{meal.name}</TableCell>
                    <TableCell className="text-right">{meal.calories.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteMeal(meal.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <UtensilsCrossed className="h-12 w-12 mb-4" />
                <p className="font-semibold">No meals logged yet</p>
                <p className="text-sm">Add your first meal using the form above.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
