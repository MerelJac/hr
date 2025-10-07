This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
```
nvm use v18.20.8
```
to start: npm run dev
See db: npx prisma studio (note: server must be off to run)
```
npx prisma format  
npx prisma migrate dev --name {name_of_migration}
npx prisma generate
```

to debug before deploying, run 
```
npm run build
```

then push to branch dev or main for dev or prod aws deploying
to run after adjusting schema.prisma


## Database in Dev and Prod
Dev → file:./dev.db → SQLite file stored locally in your project.

Prod → Switch your .env DATABASE_URL to something like PostgreSQL or MySQL (e.g. on Supabase, PlanetScale, Neon, or RDS).


## 🔹 Workflow for Database Changes
1. In Dev (local or Amplify dev env)

When you change your Prisma schema (prisma/schema.prisma), you generate & apply a new migration against your dev DB.

npx prisma migrate dev --name add_user_invites


Creates a new SQL migration in prisma/migrations/xxxx_add_user_invites/.

Applies it to your Neon dev database immediately.

Updates Prisma Client.

You can repeat this workflow as much as you want in dev.

2. Push to GitHub → Amplify Dev Build

Amplify builds your branch (e.g. dev).

It will run migrations if you include migrate deploy in amplify.yml (I’ll show this below).

Your dev environment stays in sync automatically.

3. Promote Migration to Prod

Once you’re happy with the change:

Commit & push your migration file (prisma/migrations/...) to your repo.

Merge to main (or your prod branch).

Amplify prod build kicks in:

Runs npx prisma migrate deploy (not dev!)

That safely applies all pending migrations to the prod Neon DB.



## 🔹 Workflow for Scheduled tasks
1. Add daily or monthly tasks to route in api/[time]/route.ts
2. Automatically scheudled in AWS Lambda and AWS EventBridge 