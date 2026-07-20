import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

async function main() {
  const db = new DatabaseSync('./dev.db');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminId = crypto.randomUUID();
  const date = new Date().getTime();

  // Create or Update admin user
  const existingAdmin = db.prepare('SELECT id FROM User WHERE email = ?').get('admin@genesis.com');
  if (!existingAdmin) {
    db.prepare('INSERT INTO User (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)').run(
      adminId, 'admin@genesis.com', adminPassword, 'admin', date
    );
    console.log('Created admin user');
  }

  const tasksCount = db.prepare('SELECT count(*) as count FROM Task').get();
  
  if (tasksCount.count === 0) {
    const tasks = [
      { number: 0, title: 'Welcome to the Spider-Verse', description: 'Join Discord and read the rules.', order: 0 },
      { number: 1, title: 'Terminal Web-Slinger', description: 'Linux basic commands and navigation.', order: 1 },
      { number: 2, title: "Doc Ock's Git Tentacles", description: 'Version control basics.', order: 2 },
      { number: 3, title: "The Vulture's HTML Vault", description: 'Basic markup structure.', order: 3 },
      { number: 4, title: "Mysterio's CSS Illusions", description: 'Styling and layout.', order: 4 },
      { number: 5, title: "Venom's JavaScript Symbiote", description: 'Interactivity and logic.', order: 5 },
      { number: 6, title: 'The Final Battle with Green Goblin', description: 'Full frontend mini-project.', order: 6 },
    ];
    
    const insertTask = db.prepare('INSERT INTO Task (id, number, title, description, "order") VALUES (?, ?, ?, ?, ?)');
    for (const t of tasks) {
      insertTask.run(crypto.randomUUID(), t.number, t.title, t.description, t.order);
    }
    console.log('Created tasks');
  }
  
  db.close();
}

main().catch(console.error);
