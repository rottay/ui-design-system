#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSurfaceCapabilityCensus,
  serializeSurfaceCapabilityCensus,
  SURFACE_CAPABILITY_KINDS,
} from '../../libraries/taxonomy/surfaces/index.mjs';
import { repoRoot as findRepoRoot } from '../../libraries/repo-root/index.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = findRepoRoot(scriptDirectory);
const workspaceRoot = path.dirname(designSystemRoot);
const outputDirectory = path.join(
  designSystemRoot,
  'packages/core/artifacts/quality/architecture/surface-capabilities',
);
const appNames = ['app-bithire', 'app-evnto', 'app-platform'];
const check = process.argv.includes('--check');

let failed = false;
for (const appName of appNames) {
  const census = await buildSurfaceCapabilityCensus(path.join(workspaceRoot, appName));
  for (const kind of SURFACE_CAPABILITY_KINDS) {
    if (census.counts[kind] === 0) {
      throw new Error(`${appName} generated zero ${kind} registrations`);
    }
  }

  const serialized = serializeSurfaceCapabilityCensus(census);
  const outputPath = path.join(outputDirectory, appName.replace(/^app-/, ''), 'index.json');
  if (check) {
    const existing = await readFile(outputPath, 'utf8').catch(() => '');
    if (existing !== serialized) {
      failed = true;
      console.error(`[surface-capabilities] stale generated census: ${outputPath}`);
    }
  } else {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, serialized);
  }

  console.log(`[surface-capabilities] ${appName}: total=${census.total} ${SURFACE_CAPABILITY_KINDS.map((kind) => `${kind}=${census.counts[kind]}`).join(' ')}`);
}

if (failed) process.exitCode = 1;
