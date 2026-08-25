import { PrismaClient } from "@prisma/client";

// Prisma is our "translator" between JavaScript and SQL. Instead of writing
// raw SQL queries by hand, we call functions like prisma.user.findMany()
// and Prisma turns that into the right SQL for Postgres.
//
// We create exactly ONE PrismaClient for the whole app and reuse it
// everywhere (this variable). Creating a new one per request would open a
// new database connection every time, which is wasteful and eventually
// crashes the app.
export const prisma = new PrismaClient();
