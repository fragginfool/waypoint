"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthUserId } from "@/lib/auth"

export async function getHabits() {
  const userId = await getAuthUserId()
  if (!userId) return []

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { logs: true }
  })
  return habits
}

export async function addHabit(name: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.habit.create({
    data: { name, userId }
  })
  revalidatePath("/")
}

export async function deleteHabit(id: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.habit.deleteMany({
    where: { id, userId }
  })
  revalidatePath("/")
}

export async function toggleHabit(id: string, completed: boolean, date: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  // Verify the habit belongs to the user before editing logs
  const habit = await prisma.habit.findFirst({
    where: { id, userId }
  })
  if (!habit) throw new Error("Habit not found or unauthorized")

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
    // If not completed, we can just delete the log or set it to false
    await prisma.habitLog.deleteMany({
      where: {
        habitId: id,
        date
      }
    })
  }
  revalidatePath("/")
}
