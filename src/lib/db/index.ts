import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');

// Run initial setup to create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "settings" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "height" real,
    "weight" real,
    "age" integer,
    "gender" text,
    "activityLevel" text,
    "goal" text
  );

  CREATE TABLE IF NOT EXISTS "meals" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "calories" integer NOT NULL,
    "type" text NOT NULL,
    "date" text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "activities" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "caloriesBurned" integer NOT NULL,
    "date" text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "daily_metrics" (
    "date" text PRIMARY KEY NOT NULL,
    "calorieTarget" integer,
    "weight" real
  );
`);


export const db = drizzle(sqlite, { schema });
