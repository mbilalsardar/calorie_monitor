'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserSettings } from '@/lib/types';
import { getCalorieTargetSuggestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Sparkles, Save, Check } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const settingsSchema = z.object({
  height: z.coerce.number().positive('Height must be a positive number.'),
  weight: z.coerce.number().positive('Weight must be a positive number.'),
  age: z.coerce.number().positive('Age must be a positive number.').int(),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum([
    'sedentary',
    'light',
    'moderate',
    'active',
    'very-active',
  ]),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type SettingsProps = {
  settings: Partial<UserSettings>;
  onSettingsChange: (settings: UserSettings) => void;
  onTargetChange: (newTarget: number) => void;
};

export default function Settings({ settings, onSettingsChange, onTargetChange }: SettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ target: number, explanation: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      height: settings.height || '',
      weight: settings.weight || '',
      age: settings.age || '',
      gender: settings.gender || 'male',
      activityLevel: settings.activityLevel || 'sedentary',
      goal: settings.goal || 'maintain',
    },
  });

  useEffect(() => {
    form.reset({
      height: settings.height || '',
      weight: settings.weight || '',
      age: settings.age || '',
      gender: settings.gender || 'male',
      activityLevel: settings.activityLevel || 'sedentary',
      goal: settings.goal || 'maintain',
    });
  }, [settings, form]);


  const onSubmit = (values: SettingsFormValues) => {
    onSettingsChange(values);
    toast({
      title: 'Settings Saved',
      description: 'Your personal information has been updated.',
    });
  };

  const handleCalculateTarget = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Invalid Information',
        description: 'Please fill out all fields correctly before calculating.',
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    const values = form.getValues();
    const result = await getCalorieTargetSuggestion(values);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Calculation Failed',
        description: result.error,
      });
    } else if (result.calorieTarget && result.explanation) {
      setSuggestion({ target: result.calorieTarget, explanation: result.explanation });
    }
    setIsLoading(false);
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onTargetChange(suggestion.target);
      toast({
        title: 'Calorie Target Updated',
        description: `Your new daily target is ${suggestion.target.toLocaleString()} kcal.`,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Provide your details to get personalized calorie recommendations. All
            data is stored locally on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 175" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 70" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="very-active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lose">Lose Weight</SelectItem>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="gain">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">
                <Save className="mr-2" /> Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Calorie Target</CardTitle>
          <CardDescription>
            Calculate a recommended daily calorie target based on your info.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Button onClick={handleCalculateTarget} disabled={isLoading}>
            <Sparkles className="mr-2" />
            {isLoading ? 'Calculating...' : 'Calculate with AI'}
          </Button>

          <div className="flex-grow p-4 bg-primary/5 border-dashed border-2 border-primary/20 rounded-lg min-h-[150px]">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : suggestion ? (
            <div className="text-center flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Suggested Target</p>
              <p className="text-4xl font-bold text-primary">{suggestion.target.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground leading-relaxed px-2">{suggestion.explanation}</p>
              <Button onClick={handleApplySuggestion} size="sm" className="mt-2">
                <Check className="mr-2" /> Apply This Target
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
              <Calculator className="h-8 w-8 mb-2" />
              <p className="text-sm">Click the button to calculate your target.</p>
            </div>
          )}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
