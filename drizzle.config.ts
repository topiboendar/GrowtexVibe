import { defineConfig } from "drizzle-kit";

const host = process.env.DB_HOST ?? "localhost";
const port = process.env.DB_PORT ?? "3306";
const user = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "";
const database = process.env.DB_NAME ?? "growtexvibe";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: `mysql://${user}:${password}@${host}:${port}/${database}`,
  },
});
