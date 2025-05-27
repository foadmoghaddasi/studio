
"use client";

import type { Habit, HabitStrategyDetails } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after unarchiving

// Define more specific type for habit creation data
export interface NewHabitData {
  title: string;
  // habitType?: 'build' | 'break'; // No longer used
  goalDescription?: string;
  triggers?: string;
  strategy?: '21/90' | '40-day' | '2-minute' | 'if-then' | 'none';
  strategyDetails?: HabitStrategyDetails;
  totalDaysInput?: number; 
}


interface HabitContextType {
  habits: Habit[];
  addHabit: (habitData: NewHabitData) => Habit;
  updateHabit: (habitId: string, habitData: NewHabitData) => Habit | undefined;
  completeDay: (habitId: string) => Habit | undefined;
  toggleHabitActive: (habitId: string) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  archiveHabit: (habitId: string) => void;
  unarchiveHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  setHabitMotivationalMessage: (habitId: string, message: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const HABITS_STORAGE_KEY = 'roozberooz_habits';

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      if (storedHabits) {
        const parsedHabits: Habit[] = JSON.parse(storedHabits);
        const migratedHabits = parsedHabits.map(h => ({ 
          ...h, 
          isArchived: h.isArchived ?? false,
          lastMotivationalMessage: h.lastMotivationalMessage ?? undefined,
          // habitType: h.habitType ?? 'build', // No longer used
          goalDescription: h.goalDescription ?? '',
          triggers: h.triggers ?? '',
          strategy: h.strategy ?? 'none',
          strategyDetails: h.strategyDetails ?? {},
          totalDays: h.totalDays 
        }));
        setHabits(migratedHabits);
      }
    } catch (error) {
      console.error("Failed to load habits from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error("Failed to save habits to localStorage", error);
      }
    }
  }, [habits, isLoaded]);

  const processHabitData = (habitData: NewHabitData, existingHabit?: Habit) => {
    let calculatedTotalDays = 0;
    if (habitData.strategy === '21/90') {
      calculatedTotalDays = habitData.strategyDetails?.days2190 || 21;
    } else if (habitData.strategy === '40-day') {
      calculatedTotalDays = 40;
    } else if (habitData.totalDaysInput) {
      calculatedTotalDays = habitData.totalDaysInput;
    } else {
      calculatedTotalDays = existingHabit?.totalDays || 30; // Use existing or default
    }
    return {
      title: habitData.title,
      totalDays: calculatedTotalDays,
      goalDescription: habitData.goalDescription || '',
      triggers: habitData.triggers || '',
      strategy: habitData.strategy || 'none',
      strategyDetails: habitData.strategyDetails || {},
    };
  };

  const addHabit = (newHabitData: NewHabitData) => {
    const processedData = processHabitData(newHabitData);
    const newHabit: Habit = {
      id: Date.now().toString(),
      ...processedData,
      daysCompleted: 0,
      isActive: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      lastMotivationalMessage: undefined,
    };
    setHabits((prevHabits) => [...prevHabits, newHabit].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newHabit;
  };

  const updateHabit = (habitId: string, habitData: NewHabitData): Habit | undefined => {
    let updatedHabitInstance: Habit | undefined;
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const processedData = processHabitData(habitData, habit);
          updatedHabitInstance = {
            ...habit, // Retain id, createdAt, daysCompleted, isActive, isArchived, lastCheckedIn, lastMotivationalMessage
            ...processedData, // Apply new title, totalDays, goal, triggers, strategy, strategyDetails
          };
          return updatedHabitInstance;
        }
        return habit;
      })
    );
    return updatedHabitInstance;
  };


  const completeDay = (habitId: string): Habit | undefined => {
    let updatedHabitInstance: Habit | undefined;
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId && habit.daysCompleted < habit.totalDays && !habit.isArchived && habit.isActive) {
          const today = new Date().toISOString().split('T')[0];
          if (habit.lastCheckedIn?.startsWith(today)) {
             updatedHabitInstance = habit;
             return habit;
          }
          updatedHabitInstance = { 
            ...habit, 
            daysCompleted: habit.daysCompleted + 1,
            lastCheckedIn: new Date().toISOString(),
          };
          return updatedHabitInstance;
        }
        if (habit.id === habitId) updatedHabitInstance = habit; // Ensure instance is set for return
        return habit;
      })
    );
    return updatedHabitInstance;
  };

  const toggleHabitActive = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId && !habit.isArchived ? { ...habit, isActive: !habit.isActive } : habit
      )
    );
  };
  
  const getHabitById = (habitId: string) => {
    return habits.find(habit => habit.id === habitId);
  };

  const archiveHabit = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? { ...habit, isArchived: true, isActive: false } : habit
      )
    );
  };

  const unarchiveHabit = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? { ...habit, isArchived: false, isActive: true } : habit
      )
    );
    router.push('/my-habits');
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
  };

  const setHabitMotivationalMessage = (habitId: string, message: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              lastMotivationalMessage: {
                message,
                date: new Date().toISOString().split('T')[0],
              },
            }
          : h
      )
    );
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, completeDay, toggleHabitActive, getHabitById, archiveHabit, unarchiveHabit, deleteHabit, setHabitMotivationalMessage }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
