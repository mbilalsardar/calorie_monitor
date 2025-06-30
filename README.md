# Calorie Compass: AI-Powered Meal Tracker

Calorie Compass is a modern, responsive web application built with Next.js that helps users track their daily caloric intake and achieve their health goals. It leverages the power of Generative AI to provide smart features like automatic calorie estimation, personalized meal suggestions, and tailored daily calorie targets.

The application is designed to be intuitive and user-friendly, with all data stored locally in the browser for privacy and simplicity.

## Key Features

- **Daily Dashboard:** A central hub to view your progress, including consumed calories, remaining calories, and your daily target.
- **Meal Logging:** Easily log your breakfast, lunch, dinner, and snacks.
- **AI Calorie Estimation:** Simply type the name of a food, and the app's AI will estimate its calorie count for you.
- **AI Meal Suggester:** Get smart suggestions for your next meal based on your remaining calorie budget for the day.
- **Historical Reports:** Track your progress over time with a detailed history of your daily logs.
- **Personalized Settings:** Input your height, weight, age, and activity level to let the AI calculate a personalized daily calorie target tailored to your goals (lose, maintain, or gain weight).
- **Responsive Design:** A clean, modern UI that works seamlessly on both desktop and mobile devices.
- **Local Data Storage:** All your data is saved securely in your browser's local storage—no account required.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with the Google AI Gemini models.
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)

## How It Works: Core Components

The application is structured around a few key components:

-   **`src/app/page.tsx` (Main Page):** This is the heart of the application. It manages the overall state, including meal logs, user settings, and historical data, using React hooks and `localStorage` for persistence. It renders the main tabbed interface for navigating between the Dashboard, Reports, and Settings.

-   **Dashboard Components (`src/components/dashboard`):**
    -   **`Summary.tsx`:** Displays the daily calorie progress with a visual progress bar and allows for quick editing of the calorie target.
    -   **`MealLogger.tsx`:** Contains the form for adding new meals. It integrates with the `estimateCalories` AI flow to automatically fill in calorie data when a user types a food name.
    -   **`MealSuggester.tsx`:** Interacts with the `suggestMealAdjustments` AI flow to provide meal ideas based on remaining daily calories.
    -   **`CalorieChart.tsx`:** Provides a visual breakdown of calorie intake by meal type (Breakfast, Lunch, etc.) for the current day.

-   **`Reports.tsx`:** Renders the historical data. It displays each day as a collapsible accordion item, showing total calories and a detailed list of meals when expanded.

-   **`Settings.tsx`:** Allows users to input their personal metrics. It uses the `calculateCalorieTarget` AI flow to generate and apply a scientifically-backed daily calorie goal.

-   **AI Flows (`src/ai/flows`):** These server-side functions define the application's AI logic using Genkit.
    -   **`estimate-calories.ts`:** Prompts the Gemini model to return a calorie estimate for a given food.
    -   **`calculate-calorie-target.ts`:** Uses the Mifflin-St Jeor equation (as instructed in the prompt) to calculate a user's BMR and TDEE, then adjusts it based on their goals.
    -   **`suggest-meal-adjustments.ts`:** Analyzes logged meals and remaining calories to suggest appropriate food choices for the next meal.

## Running the Project Locally

To run Calorie Compass on your local machine, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or later recommended)
-   [npm](https://www.npmjs.com/) (or another package manager like `yarn` or `pnpm`)

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install the necessary Node.js packages:

```bash
npm install
```

### 3. Set Up Environment Variables

The application uses the Google Gemini API for its AI features. You'll need an API key to use it.

1.  Create a new file named `.env` in the root of your project directory.
2.  Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add your API key to the `.env` file:

    ```
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```

    *Note: This key is used by Genkit and is not exposed on the client side.*

### 4. Run the Development Servers

This project requires two separate processes to run concurrently in development: the Next.js frontend server and the Genkit AI server.

1.  **Start the Genkit Server:**
    In your terminal, run the following command to start the Genkit development server, which makes the AI flows available to the application.

    ```bash
    npm run genkit:dev
    ```

2.  **Start the Next.js Server:**
    Open a *second* terminal window, and run the command to start the Next.js development server.

    ```bash
    npm run dev
    ```

### 5. Open the Application

Once both servers are running, you can view the application by navigating to [http://localhost:9002](http://localhost:9002) in your web browser.

You can also inspect the Genkit flows and traces by visiting the Genkit developer UI at [http://localhost:4000](http://localhost:4000).
