"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthUserId } from "@/lib/auth"

export async function getPosts() {
  const userId = await getAuthUserId()
  if (!userId) return []

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  })

  // Map back mapping the user's fetched name back to author for the component
  return posts.map((post: any) => ({
    ...post,
    author: post.user.name,
  }))
}

// We no longer need the author string param, we will just use the authenticated user
export async function addPost(content: string, imageUrl?: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.post.create({
    data: {
      author: "", // Keeping this field as it exists but will be fetched via relation. Or maybe I should drop it in schema later. Leaving empty for now.
      content,
      imageUrl: imageUrl || null,
      userId
    }
  })
  revalidatePath("/")
}

export async function captureDaySummary() {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Find all tasks marked as "done" that were updated today
  const completedTasks = await prisma.task.findMany({
    where: {
      userId,
      status: "done",
      updatedAt: {
        gte: today,
        lt: tomorrow,
      }
    }
  })

  // Find all habits completed today
  const dateStr = new Date().toISOString().split('T')[0]!
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      date: dateStr,
      completed: true,
      habit: {
        userId
      }
    },
    include: {
      habit: true
    }
  })

  // If nothing was done, just return
  if (completedTasks.length === 0 && habitLogs.length === 0) {
    return { success: false, message: "No tasks or habits completed today to capture." }
  }

  const summaryData = {
    tasks: completedTasks.map((t: { title: string }) => t.title),
    habits: habitLogs.map((l: { habit: { name: string } }) => l.habit.name)
  }

  const payloadStr = JSON.stringify(summaryData)
  const content = `Captured End of Day Summary\n\n---ACTIVITY_SUMMARY---\n\n${payloadStr}`

  await prisma.post.create({
    data: {
      author: "",
      content,
      userId
    }
  })

  revalidatePath("/")
  return { success: true }
}
