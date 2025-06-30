"use client"

import { useState } from 'react';
import { Target, Flame, Edit, Check, Activity as ActivityIcon, Goal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SummaryProps = {
  totalConsumedCalories: number;
  totalBurnedCalories: number;
  calorieTarget: number;
  onTargetChange: (newTarget: number) => void;
};

export default function Summary({ totalConsumedCalories, totalBurnedCalories, calorieTarget, onTargetChange }: SummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(calorieTarget);

  const netCalories = totalConsumedCalories - totalBurnedCalories;
  const remainingCalories = calorieTarget - netCalories;
  const progress = calorieTarget > 0 ? (netCalories / calorieTarget) * 100 : 0;

  const handleSaveTarget = () => {
    onTargetChange(newTarget);
    setIsEditing(false);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Your progress for today.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2 font-medium">
              <span>Net Progress</span>
              <span className={cn(
                "font-bold",
                progress > 100 ? "text-destructive" : "text-primary"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress > 100 ? 100 : progress} className={cn(progress > 100 && "[&>div]:bg-destructive")} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Flame className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Consumed</p>
              <p className="text-xl font-bold">{totalConsumedCalories.toLocaleString()}</p>
            </div>
             <div className="p-4 bg-green-500/10 rounded-lg">
              <ActivityIcon className="mx-auto h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Burned</p>
              <p className="text-xl font-bold">{totalBurnedCalories.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <Goal className="mx-auto h-6 w-6 text-accent mb-2" />
               <p 
                className={cn("text-sm text-muted-foreground", remainingCalories < 0 && "text-destructive/80")}>
                Remaining
              </p>
              <p className={cn("text-xl font-bold", remainingCalories < 0 && "text-destructive")}>
                {remainingCalories.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 border rounded-lg flex items-center justify-between gap-4">
          <div className='flex items-center gap-3'>
            <Target className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Daily Target</p>
              {isEditing ? (
                 <Input 
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="h-8 w-24"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTarget()}
                 />
              ) : (
                <p className="font-bold text-lg">{calorieTarget.toLocaleString()} kcal</p>
              )}
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => isEditing ? handleSaveTarget() : setIsEditing(true)}>
            {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
