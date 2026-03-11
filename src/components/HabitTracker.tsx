"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { addHabit, deleteHabit, toggleHabit, getHabits } from '@/actions/habitActions';

interface HabitLog {
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  logs: HabitLog[];
}

interface ProcessedHabit {
  id: string;
  name: string;
  completedToday: boolean;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<ProcessedHabit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchHabits = async () => {
    const rawHabits = await getHabits();
    const today = new Date().toISOString().split('T')[0];

    const processed = rawHabits.map((habit) => {
      const todayLog = habit.logs.find(log => log.date === today);
      return {
        id: habit.id,
        name: habit.name,
        completedToday: todayLog?.completed || false,
      };
    });
    setHabits(processed);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleHabit = (id: string, currentCompleted: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = !currentCompleted;

    // Optimistic UI update
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, completedToday: newCompleted } : habit
    ));

    startTransition(async () => {
      await toggleHabit(id, newCompleted, today);
      await fetchHabits(); // Re-sync
    });
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const name = newHabitName.trim();
    setNewHabitName('');
    setIsAdding(false);

    startTransition(async () => {
      await addHabit(name);
      await fetchHabits();
    });
  };

  const handleDeleteHabit = (id: string) => {
    // Optimistic delete
    setHabits(habits.filter(h => h.id !== id));

    startTransition(async () => {
      await deleteHabit(id);
      await fetchHabits();
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Daily Habits</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded-full hover:bg-gray-100 text-blue-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddHabit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New habit..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      <div className={`space-y-3 ${isPending ? 'opacity-70' : ''}`}>
        {habits.length === 0 && !isAdding && (
          <p className="text-sm text-gray-500 italic text-center py-2">No habits tracked yet.</p>
        )}

        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between group">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => handleToggleHabit(habit.id, habit.completedToday)}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  habit.completedToday
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 bg-gray-50 text-transparent group-hover:border-blue-400'
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </div>
              <span className={`text-sm ${habit.completedToday ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
                {habit.name}
              </span>
            </div>

            <button
              onClick={() => handleDeleteHabit(habit.id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
