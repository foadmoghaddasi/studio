"use client";

import type { Habit } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'daysCompleted' | 'isActive' | 'createdAt'>) => Habit;
  updateHabit: (habit: Habit) => void;
  completeDay: (habitId: string) => Habit | undefined;
  toggleHabitActive: (habitId: string) => void;
  getHabitById: (habitId: string) => Habit | undefined;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const HABITS_STORAGE_KEY = 'roozberooz_habits';

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
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

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'daysCompleted' | 'isActive' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Date.now().toString(),
      daysCompleted: 0,
      isActive: true,
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
        if (habit.id === habitId && habit.daysCompleted < habit.totalDays) {
          const today = new Date().toISOString().split('T')[0];
          // Prevent multiple check-ins on the same day
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
        if (habit.id === habitId) updatedHabitInstance = habit; // Store for return even if not updated
        return habit;
      })
    );
    return updatedHabitInstance;
  };

  const toggleHabitActive = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? { ...habit, isActive: !habit.isActive } : habit
      )
    );
  };
  
  const getHabitById = (habitId: string) => {
    return habits.find(habit => habit.id === habitId);
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, completeDay, toggleHabitActive, getHabitById }}>
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
