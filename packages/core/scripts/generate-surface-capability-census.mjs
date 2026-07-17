#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSurfaceCapabilityCensus,
  serializeSurfaceCapabilityCensus,
  SURFACE_CAPABILITY_KINDS,
} from './lib/surface-capability-census.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = path.resolve(scriptDirectory, '../../..');
const workspaceRoot = path.dirname(designSystemRoot);
const outputDirectory = path.join(designSystemRoot, 'test-artifacts/architecture/arc-11');
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
  const outputPath = path.join(outputDirectory, `${appName}.surface-capabilities.generated.json`);
  if (check) {
    const existing = await readFile(outputPath, 'utf8').catch(() => '');
    if (existing !== serialized) {
      failed = true;
      console.error(`[arc-11] stale generated capability census: ${outputPath}`);
    }
  } else {
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, serialized);
  }

  console.log(`[arc-11] ${appName}: total=${census.total} ${SURFACE_CAPABILITY_KINDS.map((kind) => `${kind}=${census.counts[kind]}`).join(' ')}`);
}

if (failed) process.exitCode = 1;
