"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTasks() {
  const tasks = await prisma.task.findMany({
    orderBy: { order: "asc" }
  })
  return tasks
}

export async function addTask(title: string, priority: string, dueDateStr?: string) {
  const count = await prisma.task.count()
  await prisma.task.create({
    data: {
      title,
      status: "todo",
      priority,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      order: count, // append to end
    }
  })
  revalidatePath("/")
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "done" ? "todo" : "done"

  // If we are completing the task, log it as a journal post
  if (newStatus === "done") {
    const task = await prisma.task.findUnique({ where: { id } })
    if (task) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Look for an existing "Captured End of Day Summary" post from today
      const existingSummary = await prisma.post.findFirst({
        where: {
          content: { contains: '---ACTIVITY_SUMMARY---' },
          createdAt: {
            gte: today,
            lt: tomorrow,
          }
        }
      })

      if (existingSummary) {
        // Append to existing summary
        const parts = existingSummary.content.split('---ACTIVITY_SUMMARY---');
        const mainText = parts[0]?.trim() || "Captured End of Day Summary";
        const summaryJson = parts[1]?.trim();
        let summaryData = { tasks: [] as string[], habits: [] as string[] };
        
        try {
          if (summaryJson) summaryData = JSON.parse(summaryJson);
        } catch (e) {
          console.error("Failed to parse existing summary JSON", e);
        }

        if (!summaryData.tasks) summaryData.tasks = [];
        // Add task if not already there
        if (!summaryData.tasks.includes(task.title)) {
          summaryData.tasks.push(task.title);
        }

        const newContent = `${mainText}\n\n---ACTIVITY_SUMMARY---\n\n${JSON.stringify(summaryData)}`;
        
        await prisma.post.update({
          where: { id: existingSummary.id },
          data: { content: newContent }
        })
      } else {
        // Create a new summary post
        const summaryData = {
          tasks: [task.title],
          habits: []
        };
        const content = `Captured End of Day Summary\n\n---ACTIVITY_SUMMARY---\n\n${JSON.stringify(summaryData)}`;
        
        await prisma.post.create({
          data: {
            author: "Me", 
            content,
          }
        })
      }
    }
  }

  await prisma.task.update({
    where: { id },
    data: { status: newStatus }
  })

  revalidatePath("/")
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id }
  })
  revalidatePath("/")
}

export async function updateTaskOrder(items: { id: string, order: number }[]) {
  // Use transaction to update all orders safely
  const updatePromises = items.map(item =>
    prisma.task.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  )

  await prisma.$transaction(updatePromises)
  revalidatePath("/")
}
