import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { FullConfig } from '@playwright/test';

// Playwright starts (or reuses) the webServer BEFORE globalSetup, so this reads the very server the
// specs will hit. The App Router embeds the serving build's id in every page's flight payload.
const SERVED_BUILD_ID = /\\?"b\\?":\\?"([A-Za-z0-9_-]+)\\?"/;

export default async function assertServedBuildIsCurrent(config: FullConfig): Promise<void> {
  const url = config.webServer?.url ?? config.projects[0]?.use.baseURL;
  if (!url) throw new Error('build-identity: the config names no webServer url or baseURL to verify');
  const port = new URL(url).port;

  const packageDir = config.configFile ? dirname(config.configFile) : join(config.rootDir, '..');
  const buildIdPath = join(packageDir, '.next', 'BUILD_ID');
  let current: string;
  try {
    current = readFileSync(buildIdPath, 'utf8').trim();
  } catch {
    throw new Error(`build-identity: ${buildIdPath} is missing -- run \`pnpm --filter @rottay/showroom run build\` first`);
  }

  const response = await fetch(new URL('/', url), { redirect: 'follow' }).catch((error: Error) => {
    throw new Error(`build-identity: nothing answered on :${port} (${error.message})`);
  });
  const served = SERVED_BUILD_ID.exec(await response.text())?.[1];
  if (!served) {
    throw new Error(`build-identity: the server on :${port} serves no Next build id (HTTP ${response.status}) -- not this showroom's production build; kill it or rebuild`);
  }
  if (served !== current) {
    throw new Error(`stale server on :${port} serving build ${served}, current build ${current} — kill it or rebuild`);
  }
}
