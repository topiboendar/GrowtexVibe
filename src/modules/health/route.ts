import { Elysia } from "elysia";
import { checkHealth } from "./service";

export const health = new Elysia({ prefix: "/health" }).get("/", async ({ set }) => {
  const result = await checkHealth();

  if (result.status === "error") {
    set.status = 503;
  }

  return result;
});
