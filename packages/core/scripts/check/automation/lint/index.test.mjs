/**
 * Drill for `packages/core/eslint.config.ts`.
 *
 * The design system published `@rottay/no-raw-html`,
 * `@rottay/no-hardcoded-colors` and four more rules to every Rottay app while
 * having no ESLint config of its own and a `lint` script that never invoked
 * ESLint (audit F-57). A config that exists but reports nothing would look
 * identical to a clean tree, and a config whose exemptions are wider than they
 * read would be worse than none.
 *
 * These drills run the REAL config against planted files, so each assertion is
 * about the shipped configuration and not about a fixture of one.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { auditNoLucideBoundary } from '../../graphics-packaging/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const packageDir = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/**
 * Lint one planted file at a path INSIDE the package, so the config's
 * path-scoped blocks apply exactly as they would in the real tree.
 * `src/__eslint-drill__/` is created and removed per case.
 */
function lintPlanted(relativePath, source) {
  const absolute = join(packageDir, relativePath);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, source, 'utf8');
  try {
    const run = spawnSync(
      'node',
      [join(packageDir, '../../node_modules/eslint/bin/eslint.js'), relativePath, '-f', 'json'],
      { cwd: packageDir, encoding: 'utf8' },
    );
    const [report] = JSON.parse(run.stdout || '[]');
    return report?.messages ?? [];
  } finally {
    // Remove the whole planted subtree, whatever depth it sits at: the drill
    // root is the ancestor named `__eslint-drill__`.
    const root = relativePath.slice(0, relativePath.indexOf('__eslint-drill__') + '__eslint-drill__'.length);
    rmSync(join(packageDir, root), { recursive: true, force: true });
  }
}

const COLOURED_COMPONENT = `import React from 'react';

export function DrillComponent(): React.ReactElement {
  return <div style={{ backgroundColor: '#ff00ff' }} />;
}
`;

/** The rule ids a planted file reported. */
const rulesOf = (messages) => messages.map((message) => message.ruleId);

test('DRILL: the config reports a hardcoded colour in a production component', () => {
  const rules = rulesOf(lintPlanted('src/__eslint-drill__/component/index.tsx', COLOURED_COMPONENT));
  assert.ok(
    rules.includes('@rottay/no-hardcoded-colors'),
    `expected the colour rule to fire; got ${JSON.stringify(rules)}`,
  );
});

test('DRILL: the frozen-engine exemption does not leak into a modern engine', () => {
  const modern = rulesOf(lintPlanted('src/components/__eslint-drill__/engines/modern/index.tsx', COLOURED_COMPONENT));
  assert.ok(
    modern.includes('@rottay/no-hardcoded-colors'),
    'the exemption is for classic/rustic only; a modern engine file must still be linted',
  );

  const classic = rulesOf(lintPlanted('src/components/__eslint-drill__/engines/classic/index.tsx', COLOURED_COMPONENT));
  assert.ok(
    !classic.includes('@rottay/no-hardcoded-colors'),
    'the frozen-engine exemption must actually apply where it is declared',
  );
});

test('DRILL: raw HTML is off deliberately, and the rule is still installed', () => {
  // The rule is OFF for this package with a written reason. The distinction
  // that matters is "off by decision" versus "absent because the plugin never
  // loaded": if the plugin were missing, an inline disable directive naming
  // one of its rules would report `Definition for rule ... was not found`.
  const messages = lintPlanted(
    'src/__eslint-drill__/raw/index.tsx',
    `import React from 'react';

export function DrillRaw(): React.ReactElement {
  // eslint-disable-next-line @rottay/no-raw-html
  return <div />;
}
`,
  );
  assert.ok(
    !rulesOf(messages).includes('@rottay/no-raw-html'),
    'no-raw-html is off for this package by decision',
  );
  assert.ok(
    !messages.some((message) => /was not found/.test(message.message ?? '')),
    `the @rottay plugin must be loaded, not merely named; got ${JSON.stringify(messages.map((m) => m.message))}`,
  );
});

const MOTION_LITERAL_SOURCE = `export const style = { transition: 'opacity 150ms cubic-bezier(0.2, 0, 0, 1)' };
`;

test('DRILL: no-motion-literals reaches graphics/motion and the deep modern engine paths', () => {
  // Both halves of the scope this work order widened (audit F-57). The rule
  // matched `engines/modern(/[^/]+)?` only, so a file one level deeper was
  // unlinted; and the `--ds-motion-*` canon the rule points every engine AT was
  // itself outside the rule's subject.
  const canon = rulesOf(lintPlanted('src/graphics/motion/__eslint-drill__/index.ts', MOTION_LITERAL_SOURCE));
  assert.ok(
    canon.includes('@rottay/no-motion-literals'),
    `the motion vocabulary must be linted by the rule it publishes; got ${JSON.stringify(canon)}`,
  );

  const deepEngine = rulesOf(
    lintPlanted('src/components/__eslint-drill__/engines/modern/cell-editor/index.ts', MOTION_LITERAL_SOURCE),
  );
  assert.ok(
    deepEngine.includes('@rottay/no-motion-literals'),
    `a modern engine file below the first level must be linted; got ${JSON.stringify(deepEngine)}`,
  );
});

test('DRILL: the motion-suite exemption applies where declared and nowhere else', () => {
  // A motion suite drives the transition it measures, so a concrete duration is
  // its subject. That exemption is scoped to `graphics/motion/**` suites; a
  // suite anywhere else must still report, or the exemption would be the
  // rule-wide escape this config exists to avoid.
  const motionSuite = rulesOf(
    lintPlanted('src/graphics/motion/__eslint-drill__/tests/index.test.ts', MOTION_LITERAL_SOURCE),
  );
  assert.ok(
    !motionSuite.includes('@rottay/no-motion-literals'),
    `the motion-suite exemption must actually apply; got ${JSON.stringify(motionSuite)}`,
  );

  const engineSuite = rulesOf(
    lintPlanted('src/components/__eslint-drill__/engines/modern/tests/index.test.ts', MOTION_LITERAL_SOURCE),
  );
  assert.ok(
    engineSuite.includes('@rottay/no-motion-literals'),
    `the exemption must not leak into a modern-engine suite; got ${JSON.stringify(engineSuite)}`,
  );
});

test('DRILL: the supplier boundary lets this config NAME the ban and nothing more', () => {
  // `eslint.config.ts` has to write `@rottay/no-direct-lucide` to switch the ban
  // on, and `noLucideBoundary` scans every `*.config.*` under `packages/`. The
  // exemption is therefore token-level, not path-level: the rule identifier is
  // neutralised, everything else in the same file is still supplier
  // reintroduction. These four cases are what "narrow" has to mean.
  const root = mkdtempSync(join(tmpdir(), 'ds-lucide-boundary-drill-'));
  const plant = (relative, source) => {
    const absolute = join(root, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, source, 'utf8');
    return absolute;
  };

  const ESLINT_CONFIG = 'packages/core/eslint.config.ts';
  const enablesTheBan = "export default [{ rules: { '@rottay/no-direct-lucide': 'error' } }];\n";

  // 1. Naming the ban is allowed, and ONLY in this exact file.
  const config = plant(ESLINT_CONFIG, enablesTheBan);
  assert.deepEqual(
    auditNoLucideBoundary({ repoRoot: root, paths: [config] }),
    [],
    'the config that enables the ban must be able to name it',
  );

  // 2. A REAL supplier import in that same file still fails. This is the case a
  //    path exemption would have let through.
  writeFileSync(config, `import { Search } from 'lucide-react';\n${enablesTheBan}`, 'utf8');
  assert.deepEqual(
    auditNoLucideBoundary({ repoRoot: root, paths: [config] }),
    [{ path: ESLINT_CONFIG, occurrences: 1, lines: [1] }],
    'a real lucide-react specifier in the config is still supplier reintroduction',
  );

  // 3. A neighbouring config gets nothing: this is not a `*.config.*` exemption.
  const vite = plant('packages/core/vite.config.ts', `${enablesTheBan}`);
  assert.deepEqual(
    auditNoLucideBoundary({ repoRoot: root, paths: [vite] }),
    [{ path: 'packages/core/vite.config.ts', occurrences: 1, lines: [1] }],
    'only packages/core/eslint.config.* may name the rule',
  );

  // 4. Production source is untouched by any of this.
  const component = plant(
    'packages/core/src/components/drill/index.tsx',
    "import { Search } from 'lucide-react';\nexport const Drill = Search;\n",
  );
  assert.deepEqual(
    auditNoLucideBoundary({ repoRoot: root, paths: [component] }),
    [{ path: 'packages/core/src/components/drill/index.tsx', occurrences: 1, lines: [1] }],
    'a production component importing the supplier must still fail',
  );

  rmSync(root, { recursive: true, force: true });
});

test('DRILL: the whole package lints clean, so the drills above are not the only green', () => {
  const run = spawnSync(
    'node',
    [join(packageDir, '../../node_modules/eslint/bin/eslint.js'), '.', '-f', 'json'],
    { cwd: packageDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const report = JSON.parse(run.stdout || '[]');
  const errors = report.flatMap((file) =>
    file.messages
      .filter((message) => message.severity === 2)
      .map((message) => `${file.filePath}:${message.line} ${message.ruleId ?? message.message}`),
  );
  assert.deepEqual(errors, [], `packages/core must lint clean with its own plugin:\n${errors.join('\n')}`);
  assert.ok(report.length > 500, `expected the real corpus, got ${report.length} files`);
});
