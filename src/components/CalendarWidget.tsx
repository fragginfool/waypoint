"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { getGoals } from '@/actions/goalActions';
import { Goal } from '@prisma/client';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      const dbGoals = await getGoals();
      setGoals(dbGoals);
    }
    fetchGoals();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  // Add padding for the first day of the month
  const firstDayOfWeek = start.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }).map(() => null);

  const allDays = [...paddingDays, ...days];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {allDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-8"></div>;

          const isCurrentDay = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayGoals = goals.filter(g => g.targetDate && isSameDay(new Date(g.targetDate), day));
          const hasGoals = dayGoals.length > 0;

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDate(isSelected ? null : day)}
              className={`h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-full text-sm relative cursor-pointer transition-colors ${
                isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ' : ''
              }${
                isCurrentDay
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-200'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {hasGoals && (
                <div className={`absolute bottom-0 w-1 h-1 rounded-full ${isCurrentDay ? 'bg-white' : 'bg-blue-500'}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
            <Target size={14} className="mr-1.5 text-blue-600" />
            Goals due on {format(selectedDate, 'MMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {goals.filter(g => g.targetDate && isSameDay(new Date(g.targetDate), selectedDate)).map((goal) => (
              <div key={goal.id} className="text-xs p-2 bg-blue-50/50 rounded border border-blue-100/50">
                <p className="font-medium text-gray-800">{goal.title}</p>
                {goal.category && <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">{goal.category}</span>}
              </div>
            ))}
            {goals.filter(g => g.targetDate && isSameDay(new Date(g.targetDate), selectedDate)).length === 0 && (
              <p className="text-xs text-gray-500 italic">No goals due this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
