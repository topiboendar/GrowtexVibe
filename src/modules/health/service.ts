import { pool } from "../../db";

export type HealthStatus = {
  status: "ok" | "error";
  database: "up" | "down";
  timestamp: string;
};

export async function checkHealth(): Promise<HealthStatus> {
  let database: "up" | "down" = "down";

  try {
    await pool.query("SELECT 1");
    database = "up";
  } catch {
    database = "down";
  }

  return {
    status: database === "up" ? "ok" : "error",
    database,
    timestamp: new Date().toISOString(),
  };
}
