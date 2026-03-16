"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getHabits() {
  const habits = await prisma.habit.findMany({
    include: { logs: true }
  })
  return habits
}

export async function addHabit(name: string) {
  await prisma.habit.create({
    data: { name }
  })
  revalidatePath("/")
}

export async function deleteHabit(id: string) {
  await prisma.habit.delete({
    where: { id }
  })
  revalidatePath("/")
}

export async function toggleHabit(id: string, completed: boolean, date: string) {
  // Verify the habit exists
  const habit = await prisma.habit.findUnique({
    where: { id }
  })
  if (!habit) throw new Error("Habit not found")

  if (completed) {
    await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date
        }
      },
      update: { completed: true },
      create: {
        habitId: id,
        date,
        completed: true
      }
    })
  } else {
    // If not completed, we can just delete the log
    await prisma.habitLog.deleteMany({
      where: {
        habitId: id,
        date
      }
    })
  }
  revalidatePath("/")
}
