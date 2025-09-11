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

to run after adjusting schema.prisma


## Database in Dev and Prod
Dev → file:./dev.db → SQLite file stored locally in your project.

Prod → Switch your .env DATABASE_URL to something like PostgreSQL or MySQL (e.g. on Supabase, PlanetScale, Neon, or RDS).
