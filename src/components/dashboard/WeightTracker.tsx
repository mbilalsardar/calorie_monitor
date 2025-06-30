"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import type { History } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Scale, CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const weightSchema = z.object({
  weight: z.coerce.number().positive("Weight must be a positive number.").min(1),
});

type WeightTrackerProps = {
  history: History;
  onLogWeight: (weight: number, date: string) => void;
};

export default function WeightTracker({ history, onLogWeight }: WeightTrackerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const form = useForm<z.infer<typeof weightSchema>>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      weight: 0,
    },
  });
  
  useEffect(() => {
    if (date) {
        const dateString = format(date, 'yyyy-MM-dd');
        const weightForDate = history[dateString]?.weight;
        form.reset({ weight: weightForDate || 0 });
    }
  }, [date, history, form]);

  const chartData = useMemo(() => {
    return Object.entries(history)
      .filter(([, log]) => typeof log.weight === "number" && log.weight > 0)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, log]) => ({
        date: format(parseISO(date), "MMM d"),
        Weight: log.weight,
      }));
  }, [history]);

  function onSubmit(values: z.infer<typeof weightSchema>) {
    if (date) {
      onLogWeight(values.weight, format(date, 'yyyy-MM-dd'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Tracker</CardTitle>
        <CardDescription>Log your weight for any day and see your progress over time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Log Your Weight</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </FormItem>
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <Scale className="mr-2 h-4 w-4" />
                Log Weight
              </Button>
            </form>
          </Form>
        </div>

        <div className="h-[400px]">
          <h3 className="text-lg font-semibold mb-2">Progress Chart</h3>
          {chartData.length > 1 ? (
            <ChartContainer config={{}} className="w-full h-full">
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="Weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
              <TrendingUp className="h-12 w-12 mb-4" />
              <p className="font-semibold">Not enough data to display a chart.</p>
              <p className="text-sm">Log your weight for at least two different days to see your progress.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
