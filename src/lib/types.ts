export interface Habit {
  id: string;
  title: string;
  totalDays: number;
  daysCompleted: number;
  isActive: boolean;
  createdAt: string; 
  lastCheckedIn?: string; // ISO date string for the last check-in
  // We can add more specific check-in history if needed later
  // checkIns: { date: string; successful: boolean }[];
}
