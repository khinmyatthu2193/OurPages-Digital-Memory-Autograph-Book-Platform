import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`OurPages API listening on port ${env.port}`);
});

function shutDown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    if (error) {
      console.error('Failed to close the HTTP server', error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
