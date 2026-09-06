/**
 * Injection drill for the `themeCss.*` counter family.
 *
 * THE DEFECT THIS EXISTS AGAINST. `themeCss.unreferencedSelectors` read 0 for
 * months while `daisy.classConsumers` read 0 in the same run -- two counters
 * asserting opposite facts about the same stylesheet. The consumed-class
 * scanner stripped `/* *\/` block comments only, and then swept the smallest
 * `{...}` block around every `.join(` call in the file whether or not that
 * block was reachable from a `className`. FloatButton's
 * `getFloatButtonClassName` documents the DaisyUI DRAIN in a `//` comment that
 * spells out `btn`, `btn-primary`, `btn-ghost`; that comment sits inside the
 * swept block, so eighteen dead rules in `modern/theme.css` were certified
 * alive by the sentence announcing their death.
 *
 * A counter that classifies cannot be guarded by its own output: a scanner
 * that stopped classifying reports a plausible number and looks exactly like a
 * clean tree. So the drill INJECTS through the production seam
 * (`--themecss-consumer-fixture`, read by the same `buildConsumedClassSet()`
 * the gate uses) and asserts the counter moves for a render and does not move
 * for prose.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../../../libraries/repo-root/index.mjs';

const packageDir = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const AUDIT = 'scripts/check/engine/tokens/audit/index.mjs';

/** Every counter the audit measures, with an optional injected fixture file. */
function counters(fixturePath) {
  const argv = [AUDIT, '--current-json', '--quiet'];
  if (fixturePath) argv.push(`--themecss-consumer-fixture=${fixturePath}`);
  const run = spawnSync('node', argv, { cwd: packageDir, encoding: 'utf8' });
  assert.equal(run.status, 0, `audit exited ${run.status}: ${run.stderr}`);
  return JSON.parse(run.stdout);
}

function withFixture(source, body) {
  const dir = mkdtempSync(join(tmpdir(), 'themecss-drill-'));
  const file = join(dir, 'index.tsx');
  writeFileSync(file, source, 'utf8');
  try {
    return body(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const DEAD_CLASSES = 'btn btn-primary btn-ghost checkbox radio';

const baseline = counters(null);

test('the counter is honest about the tree it measures', () => {
  assert.ok(
    baseline['themeCss.unreferencedSelectors'] > 0,
    'modern/theme.css still carries dead DaisyUI rules (drained by WO-RET-02); a 0 here means ' +
      'the scanner has gone fail-open again, not that the stylesheet is clean',
  );
});

test('a rendered className is seen as a consumer', () => {
  withFixture(
    `import React from 'react';\n\nexport function FixtureModern(): React.ReactElement {\n  return <div className="${DEAD_CLASSES}" />;\n}\n`,
    (file) => {
      assert.ok(
        counters(file)['themeCss.unreferencedSelectors'] <
          baseline['themeCss.unreferencedSelectors'],
        'a real className={"btn ..."} render site must lower the dead-selector count',
      );
    },
  );
});

test('a line comment naming the same classes is not a consumer', () => {
  withFixture(
    `import React from 'react';\n\nexport function FixtureModern(): React.ReactElement {\n  // The DaisyUI list (\`${DEAD_CLASSES}\`) is DRAINED; this sentence is prose.\n  return <div data-part="root" />;\n}\n`,
    (file) => {
      assert.equal(
        counters(file)['themeCss.unreferencedSelectors'],
        baseline['themeCss.unreferencedSelectors'],
        'prose cannot manufacture a consumer',
      );
    },
  );
});

test('the exact historical shape -- a drain comment inside a .join( block -- is not a consumer', () => {
  withFixture(
    `import React from 'react';\n\nfunction getFixtureClassName(className = ''): string {\n  // The DaisyUI class list (\`${DEAD_CLASSES}\`) is DRAINED. The skin is the\n  // single paint owner now.\n  return ['rottay-fixture', className].filter(Boolean).join(' ');\n}\n\nexport function FixtureModern(): React.ReactElement {\n  return <div className={getFixtureClassName()} data-part="root" />;\n}\n`,
    (file) => {
      assert.equal(
        counters(file)['themeCss.unreferencedSelectors'],
        baseline['themeCss.unreferencedSelectors'],
        'the block a helper joins is read for its class list, never for its comments',
      );
    },
  );
});

test('the helper a className calls IS followed, so the drill cannot pass by scanning nothing', () => {
  withFixture(
    `import React from 'react';\n\nfunction getFixtureClassName(className = ''): string {\n  return ['${DEAD_CLASSES}', className].filter(Boolean).join(' ');\n}\n\nexport function FixtureModern(): React.ReactElement {\n  return <div className={getFixtureClassName()} />;\n}\n`,
    (file) => {
      assert.ok(
        counters(file)['themeCss.unreferencedSelectors'] <
          baseline['themeCss.unreferencedSelectors'],
        'a class list reached through one helper hop is still a render site',
      );
    },
  );
});
