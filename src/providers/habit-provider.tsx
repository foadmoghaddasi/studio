"use client";

import type { Habit } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after unarchiving

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'daysCompleted' | 'isActive' | 'createdAt' | 'isArchived'>) => Habit;
  updateHabit: (habit: Habit) => void;
  completeDay: (habitId: string) => Habit | undefined;
  toggleHabitActive: (habitId: string) => void;
  getHabitById: (habitId: string) => Habit | undefined;
  archiveHabit: (habitId: string) => void;
  unarchiveHabit: (habitId: string) => void;
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
        // Ensure all habits have the isArchived property
        const parsedHabits: Habit[] = JSON.parse(storedHabits);
        const migratedHabits = parsedHabits.map(h => ({ ...h, isArchived: h.isArchived ?? false }));
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

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'daysCompleted' | 'isActive' | 'createdAt' | 'isArchived'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Date.now().toString(),
      daysCompleted: 0,
      isActive: true,
      isArchived: false, // Initialize isArchived
      createdAt: new Date().toISOString(),
    };
    setHabits((prevHabits) => [...prevHabits, newHabit].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newHabit;
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
    );
  };

  const completeDay = (habitId: string): Habit | undefined => {
    let updatedHabitInstance: Habit | undefined;
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId && habit.daysCompleted < habit.totalDays && !habit.isArchived) {
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
        if (habit.id === habitId) updatedHabitInstance = habit;
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
    router.push('/my-habits'); // Navigate to main habits page after unarchiving
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, completeDay, toggleHabitActive, getHabitById, archiveHabit, unarchiveHabit }}>
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
