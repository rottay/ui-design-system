#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCra11Census,
  serializeCra11Census,
} from './lib/cra-11-adaptive-contract-census.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = path.resolve(scriptDirectory, '../../..');
const workspaceRoot = path.dirname(designSystemRoot);
const artifactPath = path.join(
  designSystemRoot,
  'test-artifacts/craft/cra-11/adaptive-contract-census.generated.json',
);
const check = process.argv.includes('--check');
const requireClean = process.argv.includes('--require-clean');
const printJson = process.argv.includes('--json');

const census = await buildCra11Census({ designSystemRoot, workspaceRoot });
const serialized = serializeCra11Census(census);

if (printJson) {
  process.stdout.write(serialized);
} else if (check) {
  const committed = await readFile(artifactPath, 'utf8').catch(() => '');
  if (committed !== serialized) {
    console.error(`[cra-11] stale adaptive/factory census: ${artifactPath}`);
    console.error('[cra-11] run pnpm cra11:generate after intentional contract/source changes');
    process.exitCode = 1;
  }
} else {
  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, serialized);
}

if (!printJson) {
  const { summary } = census;
  console.log(
    `[cra-11] adaptive=${summary.adaptiveFields} productive=${summary.adaptiveFieldsWithProductiveConsumers} type-only=${summary.typeOnlyAdaptiveFields}`,
  );
  console.log(
    `[cra-11] factories=${summary.configFactories} live=${summary.liveConfigFactories} dead=${summary.deadConfigFactories} analysis-errors=${summary.analysisErrors}`,
  );

  if (census.adaptiveContract.typeOnlyFields.length > 0) {
    console.log(`[cra-11] type-only fields:\n${census.adaptiveContract.typeOnlyFields.map((id) => `  - ${id}`).join('\n')}`);
  }
  if (census.configFactories.deadFactories.length > 0) {
    console.log(`[cra-11] dead factories:\n${census.configFactories.deadFactories.map((id) => `  - ${id}`).join('\n')}`);
  }
  if (census.analysisErrors.length > 0) {
    console.error(`[cra-11] fail-closed analysis errors:\n${census.analysisErrors.map((error) =>
      `  - ${error.repository}:${error.source}:${error.line}:${error.column} ${error.code} ${error.detail}`
    ).join('\n')}`);
    process.exitCode = 1;
  }
}

if (requireClean && !census.acceptance.pass) {
  console.error('[cra-11] acceptance gate is red: type-only adaptive fields and dead factories must be wired or removed');
  process.exitCode = 1;
}
