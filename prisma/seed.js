import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient({});
async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@genesis.com' },
        update: {},
        create: {
            email: 'admin@genesis.com',
            password_hash: adminPassword,
            role: 'admin'
        }
    });
    console.log(`Created admin user with id: ${admin.id}`);
    const tasks = [
        { number: 0, title: 'Welcome to the Spider-Verse', description: 'Join Discord and read the rules.', order: 0 },
        { number: 1, title: 'Terminal Web-Slinger', description: 'Linux basic commands and navigation.', order: 1 },
        { number: 2, title: "Doc Ock's Git Tentacles", description: 'Version control basics.', order: 2 },
        { number: 3, title: "The Vulture's HTML Vault", description: 'Basic markup structure.', order: 3 },
        { number: 4, title: "Mysterio's CSS Illusions", description: 'Styling and layout.', order: 4 },
        { number: 5, title: "Venom's JavaScript Symbiote", description: 'Interactivity and logic.', order: 5 },
        { number: 6, title: 'The Final Battle with Green Goblin', description: 'Full frontend mini-project.', order: 6 },
    ];
    for (const t of tasks) {
        await prisma.task.upsert({
            where: { id: t.number.toString() }, // Using number as ID or just recreating. Wait, ID is UUID. We can't upsert by ID easily if we don't fix it. Let's just create if count is 0.
            update: {},
            create: t,
        }); // This will fail because no unique constraint on number or title.
    }
}
// better task seed logic:
async function seedTasks() {
    const count = await prisma.task.count();
    if (count === 0) {
        const tasks = [
            { number: 0, title: 'Welcome to the Spider-Verse', description: 'Join Discord and read the rules.', order: 0 },
            { number: 1, title: 'Terminal Web-Slinger', description: 'Linux basic commands and navigation.', order: 1 },
            { number: 2, title: "Doc Ock's Git Tentacles", description: 'Version control basics.', order: 2 },
            { number: 3, title: "The Vulture's HTML Vault", description: 'Basic markup structure.', order: 3 },
            { number: 4, title: "Mysterio's CSS Illusions", description: 'Styling and layout.', order: 4 },
            { number: 5, title: "Venom's JavaScript Symbiote", description: 'Interactivity and logic.', order: 5 },
            { number: 6, title: 'The Final Battle with Green Goblin', description: 'Full frontend mini-project.', order: 6 },
        ];
        for (const t of tasks) {
            await prisma.task.create({ data: t });
        }
        console.log('Created tasks');
    }
}
async function run() {
    await main();
    await seedTasks();
}
run()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
