import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@genesis.com' },
    update: {},
    create: {
      email: 'admin@genesis.com',
      password_hash: adminPassword,
      role: 'admin'
    }
  })
  console.log(`Created admin user with id: ${admin.id}`)
}

// better task seed logic:
async function seedTasks() {
  // Clear existing task status and tasks to ensure we get the updated names and resources
  await prisma.taskStatus.deleteMany()
  await prisma.task.deleteMany()

  const tasks = [
    {
      number: 1,
      title: 'Task 1',
      description: 'Welcome to the Spider-Verse: Join Discord and read the rules.',
      order: 1,
      resources: JSON.stringify([
        { name: 'Discord Rules', url: 'https://discord.com' }
      ])
    },
    {
      number: 2,
      title: 'Task 2',
      description: 'Terminal Web-Slinger: Linux basic commands and navigation.',
      order: 2,
      resources: JSON.stringify([
        { name: 'Linux Command Cheat Sheet', url: 'https://tldp.org/LDP/intro-linux/html/' },
        { name: 'Overthewire Bandit Game', url: 'https://overthewire.org/wargames/bandit/' }
      ])
    },
    {
      number: 3,
      title: 'Task 3',
      description: "Doc Ock's Git Tentacles: Version control basics.",
      order: 3,
      resources: JSON.stringify([
        { name: 'Git Handbook', url: 'https://guides.github.com/introduction/git-handbook/' },
        { name: 'Learn Git Branching', url: 'https://learngitbranching.js.org/' }
      ])
    },
    {
      number: 4,
      title: 'Task 4',
      description: "The Vulture's HTML Vault: Basic markup structure.",
      order: 4,
      resources: JSON.stringify([
        { name: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' }
      ])
    },
    {
      number: 5,
      title: 'Task 5',
      description: "Mysterio's CSS Illusions: Styling and layout.",
      order: 5,
      resources: JSON.stringify([
        { name: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/' },
        { name: 'CSS Grid Garden', url: 'https://cssgridgarden.com/' }
      ])
    },
    {
      number: 6,
      title: 'Task 6',
      description: "Venom's JavaScript Symbiote: Interactivity and logic.",
      order: 6,
      resources: JSON.stringify([
        { name: 'JavaScript.info', url: 'https://javascript.info/' },
        { name: 'Eloquent JavaScript Book', url: 'https://eloquentjavascript.net/' }
      ])
    },
    {
      number: 7,
      title: 'Task 7',
      description: 'The Final Battle with Green Goblin: Full frontend mini-project.',
      order: 7,
      resources: JSON.stringify([
        { name: 'Next.js Documentation', url: 'https://nextjs.org/docs' }
      ])
    }
  ]
  for (const t of tasks) {
    await prisma.task.create({ data: t })
  }
  console.log('Created tasks')
}

async function run() {
  await main()
  await seedTasks()
}

run()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
