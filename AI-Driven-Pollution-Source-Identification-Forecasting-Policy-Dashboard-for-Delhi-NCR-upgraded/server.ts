import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  DEFAULT_ALLOWED_ORIGINS,
  createSecurityHeadersMiddleware,
  createRateLimiter,
} from "./server/middleware/security";
import { createApiRouter } from "./server/routes/api";

dotenv.config();

export function createApp(options?: { rateLimitMax?: number }) {
  const app = express();
  app.disable("x-powered-by");

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(createSecurityHeadersMiddleware(allowedOrigins));
  app.use("/api/", createRateLimiter(options?.rateLimitMax ?? 120, 60_000));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createApiRouter());

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1d" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    process.stdout.write(`NVY AI Server listening on http://0.0.0.0:${PORT}\n`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  startServer();
}
