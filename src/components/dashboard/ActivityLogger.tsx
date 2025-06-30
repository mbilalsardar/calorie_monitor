"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Activity } from "@/lib/types";
import { getExerciseCalorieEstimate } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Dumbbell, Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

const activitySchema = z.object({
  name: z.string().min(1, "Exercise name is required."),
  caloriesBurned: z.coerce.number().min(0, "Calories must be a positive number."),
});

type ActivityLoggerProps = {
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  onDeleteActivity: (id: string) => void;
};

export default function ActivityLogger({ activities, onAddActivity, onDeleteActivity }: ActivityLoggerProps) {
  const [isEstimating, setIsEstimating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      caloriesBurned: 0,
    },
  });

  const handleExerciseBlur = async () => {
    const exerciseName = form.getValues("name");
    if (!exerciseName) return;

    setIsEstimating(true);
    try {
      const result = await getExerciseCalorieEstimate(exerciseName);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Estimation Failed",
          description: result.error,
        });
      } else if (result.caloriesBurned) {
        form.setValue("caloriesBurned", result.caloriesBurned, { shouldValidate: true });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Could not fetch calorie estimate.",
      });
    } finally {
      setIsEstimating(false);
    }
  };


  function onSubmit(values: z.infer<typeof activitySchema>) {
    onAddActivity(values);
    form.reset();
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Log Your Activity</CardTitle>
        <CardDescription>
          Add an exercise and its calorie burn, or type an exercise and press Tab to get an AI estimate.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Exercise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Brisk Walking"
                      {...field}
                      onBlur={async (e) => {
                        field.onBlur();
                        await handleExerciseBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caloriesBurned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      Calories Burned
                      {isEstimating && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} disabled={isEstimating} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={isEstimating}>
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Add Activity
            </Button>
          </form>
        </Form>
        
        <p className="font-semibold mb-2">Today's Activities</p>
        <div className="border rounded-lg flex-grow relative">
          <ScrollArea className="h-96">
            {activities.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Exercise</TableHead>
                  <TableHead className="text-right">Calories Burned</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell className="text-right">{activity.caloriesBurned.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteActivity(activity.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Dumbbell className="h-12 w-12 mb-4" />
                <p className="font-semibold">No activities logged yet</p>
                <p className="text-sm">Add your first exercise using the form above.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
