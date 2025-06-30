import { Compass } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
       <Compass className="h-8 w-8 text-primary" />
       <h1 className="text-2xl font-bold font-headline text-foreground">Calorie Compass</h1>
    </div>
  );
}
