import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding the database...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User'
    }
  })

  // 1. Posts (Journal)
  await prisma.post.createMany({
    data: [
      {
        author: 'Test User',
        content: 'Feeling great after finishing the weekly goals review. Momentum is building.',
        imageUrl: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        createdAt: new Date(),
        userId: testUser.id,
      },
      {
        author: 'Test User',
        content: 'Just journaled about the new project phase. Clarity is key.',
        createdAt: new Date(Date.now() - 3600000 * 2),
        userId: testUser.id,
      },
      {
        author: 'Test User',
        content: 'Morning hike to clear the mind before a busy week.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        createdAt: new Date(Date.now() - 3600000 * 24),
        userId: testUser.id,
      }
    ]
  })

  // 2. Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Review Q3 Marketing Strategy',
        status: 'todo',
        priority: 'High',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        order: 0,
        userId: testUser.id,
      },
      {
        title: 'Draft Project Proposal',
        status: 'in_progress',
        priority: 'Medium',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        order: 1,
        userId: testUser.id,
      },
      {
        title: 'Schedule dentist appointment',
        status: 'todo',
        priority: 'Low',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        order: 2,
        userId: testUser.id,
      },
      {
        title: 'Weekly Sync with Design Team',
        status: 'done',
        priority: 'Medium',
        dueDate: new Date(),
        order: 3,
        userId: testUser.id,
      }
    ]
  })

  // 3. Habits
  const today = new Date().toISOString().split('T')[0];

  const habit1 = await prisma.habit.create({
    data: { name: 'Read 20 pages', userId: testUser.id }
  });

  const habit2 = await prisma.habit.create({
    data: { name: 'Drink 2L Water', userId: testUser.id }
  });

  await prisma.habitLog.create({
    data: { habitId: habit2.id, date: today!, completed: true }
  });

  // 4. Goals
  await prisma.goal.createMany({
    data: [
      {
        title: 'Complete DB Schema Update',
        description: 'Add timeframe to Goals table and push to DB.',
        category: 'Work',
        timeframe: 'Weekly',
        progress: 100,
        targetDate: new Date('2024-03-10'),
        userId: testUser.id,
      },
      {
        title: 'Launch Waypoint MVP',
        description: 'Complete core features including Tasks, Goals, and Calendar views.',
        category: 'Work',
        timeframe: 'Monthly',
        progress: 75,
        targetDate: new Date('2024-03-31'),
        userId: testUser.id,
      },
      {
        title: 'Read 24 Books',
        description: 'Two books per month across various genres for continuous learning.',
        category: 'Growth',
        timeframe: 'Yearly',
        progress: 30,
        targetDate: new Date('2024-12-31'),
        userId: testUser.id,
      },
      {
        title: 'Run a Half Marathon',
        description: 'Follow 12-week training plan. Current longest run: 8 miles.',
        category: 'Health',
        timeframe: 'Yearly',
        progress: 60,
        targetDate: new Date('2024-10-15'),
        userId: testUser.id,
      },
      {
        title: 'Save Emergency Fund',
        description: 'Save 6 months of living expenses in a high-yield savings account.',
        category: 'Finance',
        timeframe: 'Yearly',
        progress: 85,
        targetDate: new Date('2024-11-30'),
        userId: testUser.id,
      }
    ]
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
