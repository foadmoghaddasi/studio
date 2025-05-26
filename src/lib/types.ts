
export interface Habit {
  id: string;
  title: string;
  totalDays: number;
  daysCompleted: number;
  isActive: boolean;
  isArchived: boolean; // Added for archiving
  createdAt: string; 
  lastCheckedIn?: string; // ISO date string for the last check-in
  lastMotivationalMessage?: { // Added to store the last shown motivational message and its date
    message: string;
    date: string; // YYYY-MM-DD format
  };
  // We can add more specific check-in history if needed later
  // checkIns: { date: string; successful: boolean }[];
}
