import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from './app';
import { isAuthConfigured, readApiConfig } from './config';
import { FileBoardStore } from './modules/boards/store';

function loadEnvFiles(): void {
  for (const relativePath of ['.env', 'apps/api/.env']) {
    const envFilePath = resolve(process.cwd(), relativePath);
    if (existsSync(envFilePath)) {
      process.loadEnvFile(envFilePath);
    }
  }
}

async function main(): Promise<void> {
  loadEnvFiles();

  const config = readApiConfig();
  if (!isAuthConfigured(config)) {
    throw new Error(
      'Authentication is not configured. Set AUTH_ADMIN_EMAIL and AUTH_ADMIN_PASSWORD (or AUTH_ADMIN_PASSWORD_HASH) in apps/api/.env.'
    );
  }
  const boardDataDir = (process.env.DATA_DIR || 'data').trim() || 'data';
  const boardStore = new FileBoardStore(resolve(process.cwd(), boardDataDir, 'boards.json'));
  const app = await createServer({ config, logger: true, boardStore });

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  app.log.info(
    {
      model: config.model,
      configured: Boolean(config.apiKey),
      authDisabled: config.authDisabled,
      cookieSecure: config.cookieSecure,
      boardDataDir,
      port: config.port,
    },
    'DrawMe API listening'
  );
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
