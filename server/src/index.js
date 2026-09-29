import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';
import redis from './config/redis.js';

const server = app.listen(env.PORT, () => {
  console.log(`GMass API server is running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
