import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../src/config/env.js";
import { seed } from "../src/db/seed.js";
import { pool as dbPool } from "../src/db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setup() {
  console.log(`\n[Test Global Setup] Initializing dedicated test database "${env.DB_NAME}"...`);

  // 1. Ensure the test database exists
  const rootConn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });

  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await rootConn.end();

  // 2. Run Drizzle migrations on the test database
  const testPool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const testDb = drizzle(testPool);
  const migrationsFolder = path.resolve(__dirname, "../src/db/migrations");

  await migrate(testDb, { migrationsFolder });
  console.log(`[Test Global Setup] Migrations applied to "${env.DB_NAME}".`);
  await testPool.end();

  // 3. Seed initial permissions, roles, and default admin
  await seed();
  console.log(`[Test Global Setup] Seed data applied to "${env.DB_NAME}".`);
  await dbPool.end();
}
