import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { FROZEN_ENGINE_BUNDLE, FROZEN_ENGINE_MOUNT } from '../../../../libraries/engine/frozen-mount/index.mjs';
import { FROZEN_GATED_IN_BASE, MODERN_BUNDLES, auditFrozenSplit } from './index.mjs';

const packageRoot = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

const RUSTIC_RULE = ".ds-x.ds-x--rustic[data-part='root'] {\n  color: red;\n}\n";
const MODERN_RULE = ".ds-x.ds-x--modern[data-part='root'] {\n  color: blue;\n}\n";

/** A minimal tree: base -> shared skin; mount -> rustic skin. */
function fixture({ baseExtra = '', sharedCss = MODERN_RULE, mountExtra = '', orphan = false, bundles = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'frozen-split-'));
  const css = join(root, 'css');
  const write = (rel, text) => {
    mkdirSync(dirname(join(css, rel)), { recursive: true });
    writeFileSync(join(css, rel), text);
  };
  write('facade/entrypoints/base/index.css', `@layer rottay-engines;\n@import "../../../presentation/skin/x/index.css" layer(rottay-engines);\n${baseExtra}`);
  write('presentation/skin/x/index.css', sharedCss);
  write('runtime/engines/rustic/skin/x/index.css', RUSTIC_RULE);
  write(FROZEN_ENGINE_MOUNT, `@import "../rustic/skin/x/index.css" layer(rottay-engines);\n${mountExtra}`);
  if (orphan) write('runtime/engines/classic/skin/orphan/index.css', ".ds-o.ds-o--classic { color: green; }\n");
  if (bundles) {
    for (const [rel, text] of Object.entries(bundles)) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), text);
    }
  }
  return { root, css, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function run(options, built = false) {
  const f = fixture(options);
  try {
    return auditFrozenSplit({ cssRoot: f.css, packageRoot: f.root, built, sharedIdentical: new Map(), frozenGatedInBase: new Map() });
  } finally {
    f.cleanup();
  }
}

test('the real tree holds the split (source and rule-text arms)', () => {
  const cssRoot = join(packageRoot, 'src/foundation/tokens/css');
  assert.deepEqual(auditFrozenSplit({ cssRoot, packageRoot }), []);
});

test('the pinned residual is exact: a new frozen-gated rule in it fails', () => {
  const cssRoot = join(packageRoot, 'src/foundation/tokens/css');
  const [[key, pin]] = [...FROZEN_GATED_IN_BASE];
  const lowered = new Map([[key, { ...pin, rules: pin.rules - 1 }]]);
  assert.ok(
    auditFrozenSplit({ cssRoot, packageRoot, frozenGatedInBase: lowered }).some((f) => f.includes('pinned residual')),
  );
});

test('a clean fixture passes, so the drills below measure one fault each', () => {
  assert.deepEqual(run({}), []);
});

test('base importing a frozen stylesheet is refused', () => {
  const failures = run({ baseExtra: '@import "../../../runtime/engines/rustic/skin/x/index.css" layer(rottay-engines);\n' });
  assert.ok(failures.some((f) => f.includes('base reaches frozen-engine stylesheet')), failures.join('\n'));
  assert.ok(failures.some((f) => f.startsWith('rule-text:')), 'the rule-text arm independently sees the leaked rule');
});

test('a frozen-engine selector in a shared base sheet is refused', () => {
  const failures = run({ sharedCss: MODERN_RULE + RUSTIC_RULE.replace('ds-x', 'ds-y').replace('ds-x--', 'ds-y--') });
  assert.ok(failures.some((f) => f.includes('ships a frozen-engine selector')), failures.join('\n'));
});

test('a frozen stylesheet the mount does not reach is refused', () => {
  const failures = run({ orphan: true });
  assert.ok(failures.some((f) => f.includes('ships in no bundle')), failures.join('\n'));
});

test('a shared sheet the mount reaches must be gated on a frozen engine rule by rule', () => {
  const failures = run({ mountExtra: '@import "../../../presentation/skin/x/index.css" layer(rottay-engines);\n' });
  assert.ok(failures.some((f) => f.includes('carries a rule not gated on a frozen engine')), failures.join('\n'));
});

test('bytes: a Modern bundle carrying a frozen rule fails, and a frozen bundle missing one fails', () => {
  const bundles = Object.fromEntries(MODERN_BUNDLES.map((rel) => [rel, MODERN_RULE]));
  bundles[FROZEN_ENGINE_BUNDLE.dist] = RUSTIC_RULE;
  bundles[FROZEN_ENGINE_BUNDLE.mirror] = RUSTIC_RULE;
  assert.deepEqual(run({ bundles }, true), [], 'clean built fixture');

  const leaked = { ...bundles, [MODERN_BUNDLES[0]]: MODERN_RULE + RUSTIC_RULE };
  const leakFailures = run({ bundles: leaked }, true);
  assert.ok(leakFailures.some((f) => f.includes(`${MODERN_BUNDLES[0]} carries 1 frozen rule`)), leakFailures.join('\n'));
  assert.ok(leakFailures.some((f) => f.includes('frozen-engine selector rule(s), expected the pinned residual 0')), 'the signature sweep sees it too');

  const emptied = { ...bundles, [FROZEN_ENGINE_BUNDLE.dist]: '' };
  assert.ok(run({ bundles: emptied }, true).some((f) => f.includes(`${FROZEN_ENGINE_BUNDLE.dist} lacks 1 frozen rule`)));
});
