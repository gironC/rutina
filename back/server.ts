import { app } from "./app";
import { env } from "./src/config/env";

async function startServer(): Promise<void> {
  try {
    await app.listen({ host: "0.0.0.0", port: env.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
