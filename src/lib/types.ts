
export interface HabitStrategyDetails {
  startDate?: string; // ISO string for YYYY-MM-DD
  reminderTime?: string; // e.g., "10:30"
  // For 21/90 strategy
  days2190?: 21 | 90;
  // For 2-minute strategy
  twoMinuteSteps?: string; // User-defined steps, possibly one per line in a textarea
  twoMinuteReminderFrequency?: string; // e.g., "Every 2 hours"
  // For If-Then strategy
  ifThenRules?: string; // User-defined rules, one per line
}

export interface Habit {
  id: string;
  title: string;
  totalDays: number; // Overall duration of the habit program
  daysCompleted: number;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string; // ISO date string when the habit object was first created
  lastCheckedIn?: string; // ISO date string for the last check-in
  lastMotivationalMessage?: {
    message: string;
    date: string; // YYYY-MM-DD format
  };

  // New fields for advanced habit creation
  habitType?: 'build' | 'break';
  goalDescription?: string;
  triggers?: string; // User-defined triggers, comma-separated or one per line
  strategy?: '21/90' | '40-day' | '2-minute' | 'if-then' | 'none'; // 'none' for basic habits
  strategyDetails?: HabitStrategyDetails;
}
