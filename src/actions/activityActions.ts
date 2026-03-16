"use server"

import prisma from "@/lib/prisma"
import { subDays, format } from 'date-fns'

type Activity = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export async function getActivityData(): Promise<Activity[]> {
  const data: Activity[] = [];
  const today = new Date();
  
  // Create an array of the last 365 dates as strings 'YYYY-MM-DD'
  const dates = Array.from({ length: 365 }).map((_, i) => format(subDays(today, 364 - i), 'yyyy-MM-dd'));

  // Fetch all relevant data from the last year
  const oneYearAgo = subDays(today, 365);

  const [posts, tasks, goals, habitLogs] = await Promise.all([
    prisma.post.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true }
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { createdAt: { gte: oneYearAgo } },
          { updatedAt: { gte: oneYearAgo }, status: 'done' }
        ]
      },
      select: { createdAt: true, updatedAt: true, status: true }
    }),
    prisma.goal.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true }
    }),
    prisma.habitLog.findMany({
      where: { 
        date: { in: dates }, 
        completed: true,
      },
      select: { date: true, completed: true }
    })
  ]);

  // Aggregate counts by day
  const dailyCounts: Record<string, number> = {};
  dates.forEach(d => dailyCounts[d] = 0);

  // Helper to safely increment
  const increment = (dateObj: Date) => {
    const dStr = format(dateObj, 'yyyy-MM-dd');
    if (dailyCounts[dStr] !== undefined) {
      dailyCounts[dStr]++;
    }
  };

  posts.forEach((p: { createdAt: Date }) => increment(p.createdAt));
  goals.forEach((g: { createdAt: Date }) => increment(g.createdAt));
  
  tasks.forEach((t: { createdAt: Date, updatedAt: Date, status: string }) => {
    // Count as activity when created
    increment(t.createdAt);
    // Count as activity when completed
    if (t.status === 'done' && format(t.updatedAt, 'yyyy-MM-dd') !== format(t.createdAt, 'yyyy-MM-dd')) {
      increment(t.updatedAt);
    }
  });

  // Habit logs are already date strings
  habitLogs.forEach((h: { date: string, completed: boolean }) => {
    if (dailyCounts[h.date] !== undefined) {
      dailyCounts[h.date]++;
    }
  });

  // Calculate levels
  dates.forEach(dateStr => {
    const count = dailyCounts[dateStr];
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 6) level = 4;
    else if (count > 3) level = 3;
    else if (count > 1) level = 2;
    else if (count === 1) level = 1;

    data.push({
      date: dateStr,
      count,
      level
    });
  });

  return data;
}
