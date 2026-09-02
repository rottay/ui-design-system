import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { resolveEvidenceArtifactPath } from './index.mjs';

test('legacy F4B artifact paths resolve to the archived control proof', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'receipt-relocation-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const current =
    'packages/core/artifacts/quality/programs/modern-rescue/cascade-proofs/controls/spacing-rhythm/computed-static-db/bithire.json';
  mkdirSync(join(root, current, '..'), { recursive: true });
  writeFileSync(join(root, current), '{}\n');
  assert.equal(
    resolveEvidenceArtifactPath(
      'packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/bithire.json',
      { root }
    ),
    current
  );
});

test('an unresolved legacy path stays invalid', () => {
  const legacy =
    'packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/missing.json';
  assert.equal(resolveEvidenceArtifactPath(legacy, { root: tmpdir() }), legacy);
});
