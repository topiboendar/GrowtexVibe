import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./env";
import { health } from "./modules/health/route";

const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    name: "GrowtexVibe API",
    status: "running",
  }))
  .use(health)
  .listen({ port: env.APP_PORT, hostname: env.APP_HOST });

console.log(`🦊 GrowtexVibe API running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
