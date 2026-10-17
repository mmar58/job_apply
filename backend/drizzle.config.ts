import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    dialect: "mysql",
    schema: "./src/db/schema",
    out: "./src/db/migrations",
    dbCredentials: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
    }
})