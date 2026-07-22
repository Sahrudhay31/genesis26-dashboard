# 🕸️ Genesis Recruitment Portal

A custom Spider-Man themed recruitment tracker application built to manage recruits, tracks, and discussions.

---

## 🚀 Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Database ORM:** Prisma
- **Database Host:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4

---

## 🛠️ Local Development

### 1. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"
SESSION_SECRET="your-super-secret-session-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Sync and Seed the Database
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Credentials

- **Admin Login:**
  - **Email:** `admin@genesis.com`
  - **Password:** `admin123`
- **Recruit Registration:** Use the `/signup` page to register as a recruit.

---

## 📦 Production Deployment

The project is configured for deployment on **Vercel** with automatic database migration execution during build time:
- Make sure to set `DATABASE_URL` and `DIRECT_URL` in your Vercel project environment variables.
