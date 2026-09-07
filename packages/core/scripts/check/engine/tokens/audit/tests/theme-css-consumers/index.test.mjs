/**
 * Injection drill for the `themeCss.*` counter family.
 *
 * THE DEFECT THIS EXISTS AGAINST. `themeCss.unreferencedSelectors` read 0 for
 * months while `daisy.classConsumers` read 0 in the same run -- two counters
 * asserting opposite facts about the same stylesheet. The consumed-class
 * scanner stripped `/* *\/` block comments only, and then swept the smallest
 * `{...}` block around every `.join(` call in the file whether or not that
 * block was reachable from a `className`. FloatButton's
 * `getFloatButtonClassName` documented the DaisyUI DRAIN in a `//` comment that
 * spelled out `btn`, `btn-primary`, `btn-ghost`; that comment sat inside the
 * swept block, so eighteen dead rules in the modern engine's `theme/index.css`
 * were certified alive by the sentence announcing their death.
 *
 * A counter that classifies cannot be guarded by its own output: a scanner
 * that stopped classifying reports a plausible number and looks exactly like a
 * clean tree. So the drill INJECTS through the production seam
 * (`--themecss-consumer-fixture` + `--themecss-consumer-engine`, read by the
 * same `auditEngineTheme()` / `buildConsumedClassSet()` pair the gate uses) and
 * asserts the classification moves for a render and does not move for prose.
 *
 * WHY THE INJECTION PLANE IS RUSTIC. Those eighteen rules were drained under
 * WO-RET-02 on 2026-09-07, so the modern plane now reads
 * `themeCss.unreferencedSelectors === 0` and has nothing left to lower: an
 * injection there can only re-assert a floor. Leg 1 pins that post-drain truth
 * from two independent readings (the counters, and a direct comment-stripped
 * read of the modern stylesheet). Legs 2-5 then exercise the classifier on
 * `themeCss.deadSelectorsRustic`, a frozen engine with a large, stable dead
 * population -- the same shared scan, on a plane that stays measurable without
 * anyone being asked to keep dead rules alive on the productive engine.
 *
 * EVERY LEG IS NON-VACUOUS. The two negative legs would also "pass" against a
 * scanner that read nothing at all, so each of them renders a positive control
 * class (`ds-switch__track`) in the same fixture file. The control must lower
 * the count -- proving the file was read and classified -- and the prose must
 * then add nothing on top of it.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../../../libraries/repo-root/index.mjs';

const packageDir = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const AUDIT = 'scripts/check/engine/tokens/audit/index.mjs';
const MODERN_THEME = 'src/foundation/tokens/css/runtime/engines/modern/theme/index.css';

/** Every counter the audit measures, with an optional fixture injected into one engine's corpus. */
function counters(fixturePath, engine) {
  const argv = [AUDIT, '--current-json', '--quiet'];
  if (fixturePath) {
    argv.push(`--themecss-consumer-fixture=${fixturePath}`);
    if (engine) argv.push(`--themecss-consumer-engine=${engine}`);
  }
  const run = spawnSync('node', argv, { cwd: packageDir, encoding: 'utf8' });
  assert.equal(run.status, 0, `audit exited ${run.status}: ${run.stderr}`);
  return JSON.parse(run.stdout);
}

/** `themeCss.deadSelectorsRustic` with `source` injected into the rustic consumer corpus. */
function rusticDeadWith(source) {
  const dir = mkdtempSync(join(tmpdir(), 'themecss-drill-'));
  const file = join(dir, 'index.tsx');
  writeFileSync(file, source, 'utf8');
  try {
    return counters(file, 'rustic')['themeCss.deadSelectorsRustic'];
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Dead in the rustic theme; named only in prose by the two negative legs. */
const DEAD_CLASSES = 'ds-btn ds-btn--primary ds-btn--ghost ds-checkbox__input ds-radio__input';
/** Also dead in the rustic theme; RENDERED by the negative legs as their proof-of-read. */
const CONTROL_CLASS = 'ds-switch__track';

const baseline = counters(null);
const rusticBaseline = baseline['themeCss.deadSelectorsRustic'];

test('the modern plane is drained, and the counters agree with the stylesheet itself', () => {
  assert.equal(
    baseline['themeCss.unreferencedSelectors'],
    0,
    'the modern theme carries no dead selector after the WO-RET-02 drain (2026-09-07)',
  );
  assert.equal(
    baseline['daisy.classConsumers'],
    0,
    'no modern component renders a DaisyUI class; this counter and the one above once ' +
      'asserted opposite facts about the same stylesheet',
  );
  assert.ok(
    baseline['themeCss.lineCount'] > 0,
    'a 0 here means the scanner found no stylesheet to measure, not a clean one',
  );

  // Read independently of the counter, and with the comment strip the original
  // scanner skipped: the drain record at the top of the file NAMES `.btn`,
  // `.checkbox` and `.radio` in prose, so a search that trusts comments finds
  // exactly the classes it is meant to prove are gone.
  const stripped = readFileSync(join(packageDir, MODERN_THEME), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  assert.ok(
    stripped.trim().length > 0 && /\.[a-zA-Z][\w-]*[^{}]*\{/.test(stripped),
    'the comment-stripped modern theme must still hold class rules, or this leg proves nothing',
  );
  assert.deepEqual(
    stripped.match(/\.(?:btn|checkbox|radio)(?!\w)/g) ?? [],
    [],
    'no DaisyUI .btn/.checkbox/.radio rule survives in the modern theme source',
  );
});

test('a rendered className is seen as a consumer', () => {
  assert.ok(
    rusticDeadWith(
      `import React from 'react';\n\nexport function FixtureRustic(): React.ReactElement {\n  return <div className="${DEAD_CLASSES}" />;\n}\n`,
    ) < rusticBaseline,
    'a real className={"ds-btn ..."} render site must lower the dead-selector count',
  );
});

test('a line comment naming the same classes is not a consumer', () => {
  const control = `import React from 'react';\n\nexport function FixtureRustic(): React.ReactElement {\n  return <div className="${CONTROL_CLASS}" data-part="root" />;\n}\n`;
  const withProse = `import React from 'react';\n\nexport function FixtureRustic(): React.ReactElement {\n  // The DaisyUI list (\`${DEAD_CLASSES}\`) is DRAINED; this sentence is prose.\n  return <div className="${CONTROL_CLASS}" data-part="root" />;\n}\n`;

  const controlDead = rusticDeadWith(control);
  assert.ok(
    controlDead < rusticBaseline,
    'the positive control must lower the count, or this leg would pass against a scanner ' +
      'that read the fixture file not at all',
  );
  assert.equal(rusticDeadWith(withProse), controlDead, 'prose cannot manufacture a consumer');
});

test('the exact historical shape -- a drain comment inside a .join( block -- is not a consumer', () => {
  const control = `import React from 'react';\n\nfunction getFixtureClassName(className = ''): string {\n  return ['${CONTROL_CLASS}', className].filter(Boolean).join(' ');\n}\n\nexport function FixtureRustic(): React.ReactElement {\n  return <div className={getFixtureClassName()} data-part="root" />;\n}\n`;
  const withProse = `import React from 'react';\n\nfunction getFixtureClassName(className = ''): string {\n  // The DaisyUI class list (\`${DEAD_CLASSES}\`) is DRAINED. The skin is the\n  // single paint owner now.\n  return ['${CONTROL_CLASS}', className].filter(Boolean).join(' ');\n}\n\nexport function FixtureRustic(): React.ReactElement {\n  return <div className={getFixtureClassName()} data-part="root" />;\n}\n`;

  const controlDead = rusticDeadWith(control);
  assert.ok(
    controlDead < rusticBaseline,
    'the control class sits INSIDE the joined block, so the block is provably swept before ' +
      'the prose variant is judged',
  );
  assert.equal(
    rusticDeadWith(withProse),
    controlDead,
    'the block a helper joins is read for its class list, never for its comments',
  );
});

test('the helper a className calls IS followed, so the drill cannot pass by scanning nothing', () => {
  assert.ok(
    rusticDeadWith(
      `import React from 'react';\n\nfunction getFixtureClassName(className = ''): string {\n  return ['${DEAD_CLASSES}', className].filter(Boolean).join(' ');\n}\n\nexport function FixtureRustic(): React.ReactElement {\n  return <div className={getFixtureClassName()} />;\n}\n`,
    ) < rusticBaseline,
    'a class list reached through one helper hop is still a render site',
  );
});
