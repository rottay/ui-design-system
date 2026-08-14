import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  readFirstPartyRosterSource,
  validateExecutableRoster,
} from './first-party-roster-source.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '../..');
const ROSTER_PATH = resolve(
  CORE_ROOT,
  'src/foundation/tokens/ts/presentation/brand-themes/index.ts',
);

test('executes the authored TypeScript roster rather than parsing its text', () => {
  const rows = readFirstPartyRosterSource(ROSTER_PATH);
  assert.deepEqual(rows.map((row) => row.slug), ['rottay', 'bithire', 'evnto']);
  assert.ok(rows.every((row) => row.verticalKey === row.slug && row.themeId === row.slug));
});

test('fails closed when the executable module does not export a roster', () => {
  const root = mkdtempSync(join(tmpdir(), 'roster-executable-'));
  try {
    const fixture = join(root, 'missing.mjs');
    writeFileSync(fixture, 'export const notTheRoster = [];\n');
    assert.throws(() => readFirstPartyRosterSource(fixture), /FIRST_PARTY_VERTICAL_ROSTER/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects semantic drift in an otherwise executable projection', () => {
  const valid = readFirstPartyRosterSource(ROSTER_PATH)[0];
  assert.throws(
    () => validateExecutableRoster([{ ...valid, selector: '[data-vertical=platform]' }]),
    /selector drifted/,
  );
  assert.throws(
    () => validateExecutableRoster([valid, { ...valid }]),
    /duplicate slug/,
  );
  assert.throws(
    () => validateExecutableRoster([{ ...valid, themeId: 'platform' }]),
    /slug, verticalKey and theme.id identical/,
  );
});
