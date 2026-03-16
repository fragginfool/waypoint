"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  })
  
  return posts.map((post: any) => ({
    ...post,
    author: post.author || "Me",
  }))
}

export async function addPost(content: string, imageUrl?: string) {
  await prisma.post.create({
    data: {
      author: "Me",
      content,
      imageUrl: imageUrl || null,
    }
  })
  revalidatePath("/")
}

export async function captureDaySummary() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Find all tasks marked as "done" that were updated today
  const completedTasks = await prisma.task.findMany({
    where: {
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
      author: "Me", 
      content,
    }
  })

  revalidatePath("/")
  return { success: true }
}

export async function updatePost(id: string, content: string) {
  await prisma.post.update({
    where: { id },
    data: { content }
  })
  revalidatePath("/")
}

export async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id }
  })
  revalidatePath("/")
}
