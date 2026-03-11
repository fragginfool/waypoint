const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get today's date
  const today = new Date();

  // create a goal for today
  await prisma.goal.create({
    data: {
      title: 'Finish Project Alpha',
      description: 'Complete all final testing and deploy.',
      category: 'Work',
      timeframe: 'Monthly',
      targetDate: today,
    }
  });

  console.log('Test goal seeded successfully for today');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
