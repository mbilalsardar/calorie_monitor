"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { Archive, Scale, Calendar as CalendarIcon, X, Search } from "lucide-react";

type ReportsProps = {
  history: History;
};

const ITEMS_PER_PAGE = 7;

export default function Reports({ history }: ReportsProps) {
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  const allSortedDates = useMemo(() => {
    return Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [history]);

  const filteredDates = useMemo(() => {
    if (!searchDate) {
      return allSortedDates;
    }
    const formattedSearchDate = format(searchDate, 'yyyy-MM-dd');
    return allSortedDates.filter(date => date === formattedSearchDate);
  }, [searchDate, allSortedDates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate]);

  const totalPages = Math.ceil(filteredDates.length / ITEMS_PER_PAGE);

  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDates.slice(startIndex, endIndex);
  }, [filteredDates, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSearchDate(date);
  };
  
  if (allSortedDates.length === 0) {
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
        <CardDescription>Search for a specific date or browse through your history page by page.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !searchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, "PPP") : <span>Search by date...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
            {searchDate && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleDateSelect(undefined)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          
          {totalPages > 1 && !searchDate && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-[600px] pr-4">
          {paginatedDates.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {paginatedDates.map((date) => {
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
                         {dayData.weight && dayData.weight > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              Weight Logged
                            </h4>
                            <div className="p-3 border rounded-lg bg-muted/20">
                              <span className="font-medium">{dayData.weight} kg</span>
                            </div>
                          </div>
                        )}

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
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground p-8">
              <Search className="h-12 w-12 mb-4" />
              <p className="font-semibold">No reports found</p>
              <p className="text-sm">
                {searchDate ? "There is no report for the selected date." : "Try clearing the search or adding new logs."}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
