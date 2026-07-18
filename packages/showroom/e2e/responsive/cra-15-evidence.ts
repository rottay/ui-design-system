import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// CRA-15 real-browser evidence recorder (audit MOT-01).
//
// The particle-runtime and spatial-runtime probes already ASSERT the governed
// runtime budgets in a real browser; this module only RECORDS the numbers those
// assertions measured so the post-run assembler
// (cra-15-assemble.mjs) can fold them into
// test-artifacts/craft/cra-15/browser-evidence.json in the schema
// packages/core/scripts/cra-15-runtime-hardening-gate.mjs validates.
//
// Each focal test writes ONE distinct partial file (never a shared merge), so a
// single-worker run accumulates a stable set with no read/modify/write race.
// The .run/ directory is intermediate: the sanctioned artifact is the assembled
// browser-evidence.json, and the caller clears .run/ before every run.
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
// e2e/responsive -> packages/showroom/e2e/responsive; the repository root is
// four levels up (responsive -> e2e -> showroom -> packages -> repo).
const REPOSITORY_ROOT = resolve(HERE, '../../../..');
const RUN_DIRECTORY = join(
  REPOSITORY_ROOT,
  'test-artifacts',
  'craft',
  'cra-15',
  '.run',
);

export type Cra15PartialName =
  | 'desktop-meta'
  | 'desktop-particle-allocation'
  | 'desktop-particle-fallback'
  | 'desktop-particle-rapid'
  | 'desktop-spatial-allocation'
  | 'desktop-spatial-fallback'
  | 'desktop-spatial-unsupported'
  | 'mobile-meta'
  | 'mobile-particle-fallback'
  | 'mobile-spatial-fallback';

export function recordCra15Measurement(
  name: Cra15PartialName,
  data: Record<string, unknown>,
): void {
  mkdirSync(RUN_DIRECTORY, { recursive: true });
  writeFileSync(
    join(RUN_DIRECTORY, `${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}
