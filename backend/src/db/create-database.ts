import mysql from "mysql2/promise";
import { env } from "../config/env.js";

// Drizzle migrations create tables, not the database itself, so create it if missing.
const conn = await mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

await conn.query(
  `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
);
console.log(`Database "${env.DB_NAME}" is ready.`);
await conn.end();
