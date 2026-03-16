"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getGoals() {
  const goals = await prisma.goal.findMany({
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
  await prisma.goal.create({
    data: {
      title,
      timeframe,
      category,
      progress,
      description,
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
    }
  })
  revalidatePath("/")
}

export async function updateGoalProgress(id: string, newProgress: number) {
  await prisma.goal.update({
    where: { id },
    data: { progress: newProgress }
  })
  revalidatePath("/")
}

export async function updateGoalDescription(id: string, description: string) {
  await prisma.goal.update({
    where: { id },
    data: { description }
  })
  revalidatePath("/")
}

export async function deleteGoal(id: string) {
  await prisma.goal.delete({
    where: { id }
  })
  revalidatePath("/")
}
