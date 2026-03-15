"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthUserId } from "@/lib/auth"

export async function getTasks() {
  const userId = await getAuthUserId()
  if (!userId) return []

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { order: "asc" }
  })
  return tasks
}

export async function addTask(title: string, priority: string, dueDateStr?: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  const count = await prisma.task.count({ where: { userId } })
  await prisma.task.create({
    data: {
      title,
      status: "todo",
      priority,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      order: count, // append to end
      userId
    }
  })
  revalidatePath("/")
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  const newStatus = currentStatus === "done" ? "todo" : "done"

  // If we are completing the task, log it as a journal post
  if (newStatus === "done") {
    const task = await prisma.task.findUnique({ where: { id, userId } })
    if (task) {
      await prisma.post.create({
        data: {
          author: "", // Keeping author empty for schema compatibility but relying on User relation
          content: `Completed task: ${task.title}`,
          userId
        }
      })
    }
  }

  await prisma.task.updateMany({
    where: { id, userId },
    data: { status: newStatus }
  })

  revalidatePath("/")
}

export async function deleteTask(id: string) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  await prisma.task.deleteMany({
    where: { id, userId }
  })
  revalidatePath("/")
}

export async function updateTaskOrder(items: { id: string, order: number }[]) {
  const userId = await getAuthUserId()
  if (!userId) throw new Error("Unauthorized")

  // Use transaction to update all orders safely
  const updatePromises = items.map(item =>
    prisma.task.updateMany({
      where: { id: item.id, userId },
      data: { order: item.order }
    })
  )

  await prisma.$transaction(updatePromises)
  revalidatePath("/")
}
