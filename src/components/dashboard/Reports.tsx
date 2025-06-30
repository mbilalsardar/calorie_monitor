"use client";

import type { History } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { format, parseISO } from 'date-fns';
import { Archive } from "lucide-react";

type ReportsProps = {
  history: History;
};

export default function Reports({ history }: ReportsProps) {
  const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Your daily calorie tracking history will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <Archive className="h-12 w-12 mb-4" />
              <p className="font-semibold">No historical data yet</p>
              <p className="text-sm">Log some meals to start building your report.</p>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>A historical view of your daily calorie intake and expenditure.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Accordion type="single" collapsible className="w-full">
            {sortedDates.map((date) => {
              const dayData = history[date];
              if (!dayData) return null;
              
              const totalConsumed = dayData.meals.reduce((acc, meal) => acc + meal.calories, 0);
              const totalBurned = (dayData.activities || []).reduce((acc, activity) => acc + activity.caloriesBurned, 0);
              const netCalories = totalConsumed - totalBurned;
              const progress = dayData.calorieTarget > 0 ? (netCalories / dayData.calorieTarget) * 100 : 0;
              
              return (
                <AccordionItem value={date} key={date}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 text-sm md:text-base">
                      <span>{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</span>
                      <span className="text-sm text-muted-foreground">
                        {netCalories.toLocaleString()} / {dayData.calorieTarget.toLocaleString()} net kcal ({Math.round(progress)}%)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Meals Consumed</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Meal</TableHead>
                              <TableHead className="text-right">Calories</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dayData.meals.length > 0 ? dayData.meals.map((meal) => (
                              <TableRow key={meal.id}>
                                <TableCell className="font-medium">{meal.type}</TableCell>
                                <TableCell>{meal.name}</TableCell>
                                <TableCell className="text-right">{meal.calories.toLocaleString()}</TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  No meals logged for this day.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {(dayData.activities && dayData.activities.length > 0) && (
                        <div>
                          <h4 className="font-semibold mb-2">Activities Logged</h4>
                          <Table>
                             <TableHeader>
                              <TableRow>
                                <TableHead>Exercise</TableHead>
                                <TableHead className="text-right">Calories Burned</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dayData.activities.map((activity) => (
                                <TableRow key={activity.id}>
                                  <TableCell className="font-medium">{activity.name}</TableCell>
                                  <TableCell className="text-right">{activity.caloriesBurned.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
