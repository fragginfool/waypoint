"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthUserId } from "@/lib/auth"

export async function getGoals() {
  const userId = await getAuthUserId()
  if (!userId) return []

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { targetDate: "asc" }
  })
  return goals
}

export async function addGoal(
  title: string,
  timeframe: string,
  category: string,
  progress: number = 0,
  description?: string,
  targetDateStr?: string
) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.goal.create({
    data: {
      title,
      timeframe,
      category,
      progress,
      description,
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
      userId
    }
  })
  revalidatePath("/")
}

export async function updateGoalProgress(id: string, newProgress: number) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.goal.updateMany({
    where: { id, userId },
    data: { progress: newProgress }
  })
  revalidatePath("/")
}

export async function deleteGoal(id: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.goal.deleteMany({
    where: { id, userId }
  })
  revalidatePath("/")
}
