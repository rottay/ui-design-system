import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  auditFindings,
  auditWorkspace,
  buildBaselines,
  scanSource,
  scanWorkspace,
} from './index.mjs';

function sourceFindings(source, extension = '.tsx') {
  return scanSource({
    source,
    extension,
    repo: 'app-bithire',
    path: `src/fixture${extension}`,
    scope: 'product',
  });
}

function write(path, source) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

function fixtureWorkspace() {
  const root = mkdtempSync(join(tmpdir(), 'cra12-motion-'));
  for (const repo of ['app-bithire', 'app-platform', 'app-evnto']) {
    write(join(root, repo, 'src/index.tsx'), 'export const fixture = true;\n');
    write(join(root, repo, 'package.json'), JSON.stringify({ dependencies: { motion: '12.42.2' } }));
    write(join(root, repo, 'pnpm-lock.yaml'), '  motion@12.42.2:\n  framer-motion@12.42.2:\n');
  }
  write(join(root, 'ui-design-system/packages/core/src/index.ts'), 'export const fixture = true;\n');
  write(join(root, 'ui-design-system/packages/showroom/src/index.ts'), 'export const fixture = true;\n');
  write(join(root, 'ui-design-system/packages/core/package.json'), JSON.stringify({
    peerDependencies: { motion: '12.42.2' },
    devDependencies: { motion: '12.42.2' },
  }));
  write(join(root, 'ui-design-system/packages/showroom/package.json'), JSON.stringify({ dependencies: { motion: '12.42.2' } }));
  write(join(root, 'ui-design-system/pnpm-lock.yaml'), '  motion@12.42.2:\n  framer-motion@12.42.2:\n');
  return root;
}

function registry(policy = {}) {
  return {
    schemaVersion: 1,
    policy: {
      canonicalMotionVersion: '12.42.2',
      canonicalFramerVersion: '12.42.2',
      allowedDirectImportRoots: [],
      allowedDynamicKeyframes: [],
      ...policy,
    },
    baselines: {},
  };
}

test('source scanner sees embedded CSS but masks comments and custom-property lookalikes', () => {
  const scanned = sourceFindings(`
    // @keyframes ignoredLine { to { opacity: 0 } }
    /* transition: all 1s; @keyframes ignoredBlock {} */
    const css = \`
      @keyframes barePulse { from { opacity: 0 } to { opacity: 1 } }
      .node { animation: barePulse 180ms ease; transition: all 0.2s ease; }
      :root { --fixture-transition: all 1s ease; }
    \`;
  `);

  assert.deepEqual(scanned.definitions.map((entry) => entry.name), ['barePulse']);
  assert(scanned.references.some((entry) => entry.name === 'barePulse'));
  assert.equal(scanned.findings.filter((entry) => entry.channel === 'transition-all').length, 1);
  assert.equal(scanned.findings.filter((entry) => entry.channel === 'raw-motion-timing').length, 2);
});

test('raw timing scanner covers camelCase CSS-in-JS duration and delay properties', () => {
  const scanned = sourceFindings(`
    const style = {
      transitionDuration: '180ms',
      transitionDelay: '0.1s',
      animationDuration: '240ms',
      animationDelay: '75ms',
      'transitionDuration': '320ms',
      '--fixture-animationDuration': '999ms',
    };
  `);

  assert.deepEqual(
    scanned.findings
      .filter((entry) => entry.channel === 'raw-motion-timing')
      .map((entry) => entry.symbol),
    [
      'transitionDuration',
      'transitionDelay',
      'animationDuration',
      'animationDelay',
      "'transitionDuration'",
    ],
  );
});

/*
 * A `var()` fallback is not a lookup -- it is a literal the token canon does not own. The OAuth
 * transition skin regressed exactly this way post-baseline: `var(--step-delay)` grew a `, 0ms`
 * fallback, which is raw motion debt even though it reads as indirection. The fallback also buys
 * nothing: `animation-delay` is not inherited, so an unset custom property already computes to
 * the initial `0s`. The control proves the gate stays silent on the tokenized form.
 */
test('a raw time inside a var() fallback is motion debt, but the bare lookup is not', () => {
  /*
   * The fixture is assembled from fragments and never written as a contiguous literal. A gate
   * that scans source for raw motion timings must not plant the exact debt it asserts on: the
   * scan roots are `packages/core/src` and `packages/showroom/src` today, so `scripts/` is out
   * of range, but a widened root must not turn this proof into two new findings of its own.
   */
  const property = ['animation', 'delay'].join('-');
  const literalZero = ['0', 'ms'].join('');
  const lookup = 'var(--step-delay';

  const planted = sourceFindings(`.x { ${property}: ${lookup}, ${literalZero}); }\n`, '.css');
  const raw = planted.findings.filter((entry) => entry.channel === 'raw-motion-timing');

  assert.deepEqual(
    raw.map((entry) => ({ channel: entry.channel, kind: entry.kind, symbol: entry.symbol })),
    [{ channel: 'raw-motion-timing', kind: 'css-or-style-time', symbol: property }],
  );
  assert.equal(raw[0].evidence, `${property}: ${lookup}, ${literalZero})`);

  const control = sourceFindings(`.x { ${property}: ${lookup}); }\n`, '.css');

  assert.equal(control.findings.filter((entry) => entry.channel === 'raw-motion-timing').length, 0);
});

test('transition and animation scanners cover quoted CSS-in-JS keys', () => {
  const scanned = sourceFindings(`
    const style = {
      'transition': 'all 180ms ease',
      "animationName": 'fixturePulse',
      '--transition': 'all 999ms ease',
    };
  `);

  assert.equal(
    scanned.findings.filter((entry) => entry.channel === 'transition-all').length,
    1,
  );
  assert.deepEqual(scanned.references.map((entry) => entry.name), ['fixturePulse']);
});

test('animation type unions are not misreported as runtime global references', () => {
  const scanned = sourceFindings(`
    interface SkeletonOptions { animation: "pulse" | "wave"; }
    const runtime = { animation: 'pulse 1s ease-in-out infinite' };
  `);
  assert.deepEqual(scanned.references.map((entry) => entry.name), ['pulse']);
});

test('source scanner catches direct runtime Motion imports and raw timing, not type-only imports', () => {
  const runtime = sourceFindings(`
    import type { Variants } from 'motion/react';
    import { motion } from 'motion/react';
    export const Demo = () => <motion.div transition={{ duration: 0.2, delay: 0.1 }} />;
  `);
  assert.equal(runtime.findings.filter((entry) => entry.channel === 'direct-motion-import').length, 1);
  assert.deepEqual(
    runtime.findings.filter((entry) => entry.kind === 'motion-object-time').map((entry) => entry.symbol).sort(),
    ['delay', 'duration'],
  );

  const typesOnly = sourceFindings("import type { Variants } from 'motion/react';\n");
  assert.equal(typesOnly.findings.filter((entry) => entry.channel === 'direct-motion-import').length, 0);
});

test('Motion import inventory covers every subpath and classifies multiline and inline type-only clauses', () => {
  const scanned = sourceFindings(`
    import type {
      Variants,
      Transition,
    } from 'motion/react-m';
    import {
      type MotionProps,
      motion,
    } from 'motion/dom';
    import { type AnimationOptions, type ValueAnimationTransition } from 'motion/mini';
    export type {
      MotionConfigProps,
    } from 'framer-motion/client';
    export { type FeatureBundle } from 'framer-motion/features';
    import 'motion/mini/react';
    const lazy = import('motion/react-client');
    const legacy = require('framer-motion/dom');
    void lazy; void legacy;
  `);

  assert.deepEqual(
    scanned.findings
      .filter((entry) => entry.channel === 'direct-motion-import')
      .map((entry) => entry.symbol)
      .sort(),
    ['framer-motion/dom', 'motion/dom', 'motion/mini/react', 'motion/react-client'],
  );
});

test('workspace scanner distinguishes compliant prefixes, bare definitions/references, and product imports', () => {
  const root = fixtureWorkspace();
  try {
    write(join(root, 'app-bithire/src/motion.tsx'), `
      import { motion } from 'motion/react';
      const css = \`
        @keyframes bh-owned { to { opacity: 1 } }
        @keyframes pulse { to { opacity: 1 } }
        .a { animation: pulse 1s linear; }
      \`;
      export const Demo = () => <motion.div />;
    `);
    const findings = scanWorkspace({ workspaceRoot: root, registry: registry() });
    assert(findings.some((entry) => entry.kind === 'bare-keyframe-definition' && entry.symbol === 'pulse'));
    assert(findings.some((entry) => entry.kind === 'bare-animation-reference' && entry.symbol === 'pulse'));
    assert(!findings.some((entry) => entry.channel === 'global-keyframes' && entry.symbol === 'bh-owned'));
    assert(findings.some((entry) => entry.channel === 'direct-motion-import' && entry.scope === 'product'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('dynamic keyframes require an exact path, symbol, and DS-owned source prefix', () => {
  const root = fixtureWorkspace();
  try {
    const dynamicPath = 'packages/core/src/dynamic.tsx';
    write(join(root, 'ui-design-system', dynamicPath), `
      const animationName = \`ds-fixture-\${id}\`;
      export const css = \`@keyframes \${animationName}{to{opacity:1}}\`;
    `);
    const policy = {
      allowedDynamicKeyframes: [{
        repo: 'ui-design-system',
        path: dynamicPath,
        symbol: '${animationName}',
        requiresSourcePattern: 'const animationName = `ds-fixture-',
      }],
    };
    assert(!scanWorkspace({ workspaceRoot: root, registry: registry(policy) })
      .some((entry) => entry.kind === 'dynamic-keyframe-definition'));

    policy.allowedDynamicKeyframes[0].requiresSourcePattern = 'const animationName = `wrong-prefix-';
    assert(scanWorkspace({ workspaceRoot: root, registry: registry(policy) })
      .some((entry) => entry.kind === 'dynamic-keyframe-definition'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('transitive Framer is allowed, but missing Framer and mixed direct manifests are drift', () => {
  const root = fixtureWorkspace();
  try {
    write(join(root, 'app-evnto/package.json'), JSON.stringify({ dependencies: { motion: '12.42.2' } }));
    write(join(root, 'app-evnto/pnpm-lock.yaml'), '  motion@12.42.2:\n  framer-motion@12.42.2:\n');
    let findings = scanWorkspace({ workspaceRoot: root, registry: registry() });
    assert(!findings.some((entry) => entry.repo === 'app-evnto' && entry.kind === 'mixed-direct-suppliers'));

    write(join(root, 'app-evnto/pnpm-lock.yaml'), '  motion@12.42.2:\n');
    findings = scanWorkspace({ workspaceRoot: root, registry: registry() });
    assert(findings.some((entry) => (
      entry.repo === 'app-evnto' && entry.kind === 'noncanonical-transitive-framer-resolution'
    )));

    write(join(root, 'app-evnto/package.json'), JSON.stringify({
      dependencies: { motion: '12.42.2', 'framer-motion': '^12.38.0' },
    }));
    findings = scanWorkspace({ workspaceRoot: root, registry: registry() });
    assert(findings.some((entry) => entry.repo === 'app-evnto' && entry.kind === 'mixed-direct-suppliers'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('exact snapshot passes unchanged and fails new, stale, expired, and body drift', () => {
  const finding = {
    channel: 'transition-all', kind: 'transition-all', repo: 'app-bithire',
    path: 'src/card.tsx', scope: 'product', line: 3, symbol: 'all',
    evidence: "transition: 'all 0.2s'",
  };
  const contract = registry();
  contract.baselines = buildBaselines([finding], {
    'transition-all': { owner: 'ds', reason: 'fixture debt', expires: '2099-12-31' },
  });
  assert.deepEqual(auditFindings({ findings: [finding], registry: contract }), []);

  const changed = { ...finding, evidence: "transition: 'all 0.3s'" };
  assert(auditFindings({ findings: [changed], registry: contract }).some((failure) => /hash drift/.test(failure)));
  assert(auditFindings({ findings: [], registry: contract }).some((failure) => /stale registry/.test(failure)));
  assert(auditFindings({ findings: [finding, { ...finding, path: 'src/new.tsx' }], registry: contract })
    .some((failure) => /ratchet grew|hash drift/.test(failure)));

  contract.baselines['transition-all'].expires = '2020-01-01';
  assert(auditFindings({ findings: [finding], registry: contract, now: new Date('2026-07-15T00:00:00Z') })
    .some((failure) => /expired/.test(failure)));
});

/*
 * CRA12-REGISTRY-RECONCILIATION, 2026-08-13. The reconciliation these three drills defend is
 * recorded in `registry/index.json` under
 * `baselines['raw-motion-timing'].modernRescueRegistryReconciliation`. Two of its claims are
 * mechanical, so they are provable here in memory -- no workspace scan, no temp tree, no file
 * mutation:
 *
 *   1. the ui-design-system/test row moved by PATH ONLY. Count, file count and body are all
 *      unchanged, which is exactly why the digest must still go red: a relocation the gate
 *      waves through is a relocation that could be hiding a swap. The registry states the
 *      proof constructively -- rewriting the one path back reconstructs the superseded digest
 *      -- and the first drill executes that same round trip.
 *   2. the two TableCheckboxStyles bodies were retired exactly, 2 rows in 1 file. Under the
 *      lowered ds-internal ceiling, either one coming back must fail.
 *
 * Every motion body below is assembled from fragments and never written as a contiguous
 * literal, for the reason the var()-fallback drill above states: a gate that scans source for
 * raw motion timings must not plant the exact debt it asserts on. The bodies are not hand-typed
 * either -- each drill first makes the scanner emit the string it is about to assert on, so a
 * typo shows up as a dead fixture instead of as a passing test about nothing.
 */
const durationKey = ['transition', 'Duration'].join('');
const transitionKey = ['transi', 'tion'].join('');
const millis = (amount) => `${amount}${['m', 's'].join('')}`;
const brandThemeBody = (amount) => `${durationKey}: "${millis(amount)}",`;
const checkboxBody = (property) => `${transitionKey}: ${property} ${['0.', '15', 's'].join('')} ease`;

const RELOCATED_FROM =
  'packages/core/src/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami/index.ts';
const RELOCATED_TO = 'packages/core/tests/fixtures/brand-themes/themanagementmiami/index.ts';
const CHECKBOX_PATH = 'packages/core/src/components/patterns/data/table-checkbox-styles/index.tsx';
const COLLECTION_WORKSPACE_PATH =
  'packages/core/src/foundation/tokens/css/presentation/components/skin/collection-workspace.css';

function dsFinding({ path, scope, symbol, evidence, line = 1 }) {
  return {
    channel: 'raw-motion-timing', kind: 'css-or-style-time', repo: 'ui-design-system',
    path, scope, line, symbol, evidence,
  };
}

function reconciliationContract(findings) {
  const contract = registry();
  contract.baselines = buildBaselines(findings, {
    'raw-motion-timing': {
      owner: 'design-system', reason: 'reconciliation drill', expires: '2099-12-31',
    },
  });
  return contract;
}

test('the reconciled test row moved by path only, and the digest still refuses to ignore it', () => {
  const emitted = sourceFindings(`const theme = {\n  ${brandThemeBody(220)}\n};\n`, '.ts');
  assert.deepEqual(
    emitted.findings
      .filter((entry) => entry.channel === 'raw-motion-timing')
      .map((entry) => ({ symbol: entry.symbol, evidence: entry.evidence })),
    [{ symbol: durationKey, evidence: brandThemeBody(220) }],
  );

  const before = [
    dsFinding({ path: RELOCATED_FROM, scope: 'test', symbol: durationKey, evidence: brandThemeBody(220) }),
    dsFinding({
      path: 'packages/core/tests/fixtures/tenants/quality-evidence/index.ts',
      scope: 'test', symbol: durationKey, evidence: brandThemeBody(180),
    }),
  ];
  const contract = reconciliationContract(before);
  assert.deepEqual(auditFindings({ findings: before, registry: contract }), []);

  const relocated = before.map((entry) => (
    entry.path === RELOCATED_FROM ? { ...entry, path: RELOCATED_TO } : entry
  ));
  // The relocation is invisible to every ratchet: same findings, same files, same bodies.
  assert.equal(relocated.length, before.length);
  assert.equal(new Set(relocated.map((entry) => entry.path)).size, new Set(before.map((entry) => entry.path)).size);
  assert.deepEqual(
    relocated.map((entry) => entry.evidence).sort(),
    before.map((entry) => entry.evidence).sort(),
  );

  const failures = auditFindings({ findings: relocated, registry: contract });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^raw-motion-timing: path\/body hash drift at ui-design-system\/test:/);

  const reverted = relocated.map((entry) => (
    entry.path === RELOCATED_TO ? { ...entry, path: RELOCATED_FROM } : entry
  ));
  assert.deepEqual(auditFindings({ findings: reverted, registry: contract }), []);
});

test('a single millisecond of body drift in the relocated fixture is hash drift, not a free pass', () => {
  const before = [
    dsFinding({ path: RELOCATED_TO, scope: 'test', symbol: durationKey, evidence: brandThemeBody(220) }),
  ];
  const contract = reconciliationContract(before);
  assert.deepEqual(auditFindings({ findings: before, registry: contract }), []);

  const mutated = before.map((entry) => ({ ...entry, evidence: brandThemeBody(221) }));
  assert.notEqual(mutated[0].evidence, before[0].evidence);
  assert.equal(mutated.length, before.length);

  const failures = auditFindings({ findings: mutated, registry: contract });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^raw-motion-timing: path\/body hash drift at ui-design-system\/test:/);
  assert(!failures.some((failure) => /ratchet grew/.test(failure)));
});

test('the retired TableCheckboxStyles bodies cannot come back under the lowered ds-internal ceiling', () => {
  const retired = [checkboxBody('background'), checkboxBody('opacity')];
  const emitted = sourceFindings(`.x { ${retired[0]}; ${retired[1]}; }\n`, '.css');
  assert.deepEqual(
    emitted.findings
      .filter((entry) => entry.channel === 'raw-motion-timing')
      .map((entry) => entry.evidence),
    retired,
  );

  // The reconciled ceiling is real, not a fixture: pin the row this drill is about.
  const contract = JSON.parse(readFileSync(new URL('./registry/index.json', import.meta.url), 'utf8'));
  const row = contract.baselines['raw-motion-timing'].files
    .find((entry) => entry.repo === 'ui-design-system' && entry.scope === 'ds-internal');
  assert.deepEqual(
    { maxCount: row.maxCount, maxFiles: row.maxFiles, digest: row.digest },
    {
      maxCount: 346,
      maxFiles: 139,
      digest: 'a8d87249f1f8d9aa1054d37dc9d5cc7fe71df38e1058379a5170b7bf72f922f0',
    },
  );

  const lowered = [dsFinding({
    path: COLLECTION_WORKSPACE_PATH, scope: 'ds-internal', symbol: transitionKey,
    evidence: `${transitionKey}: width var(--ds-list-preview-motion-duration, var(--ds-motion-fast, ${millis(120)}))`,
  })];
  const drill = reconciliationContract(lowered);
  assert.deepEqual(auditFindings({ findings: lowered, registry: drill }), []);

  for (const evidence of retired) {
    const failures = auditFindings({
      findings: [...lowered, dsFinding({
        path: CHECKBOX_PATH, scope: 'ds-internal', symbol: transitionKey, evidence,
      })],
      registry: drill,
    });
    assert(failures.some((failure) => (
      /raw-motion-timing: ratchet grew at ui-design-system\/ds-internal: 2 > 1/.test(failure)
    )), evidence);
    assert(failures.some((failure) => (
      /raw-motion-timing: path\/body hash drift at ui-design-system\/ds-internal/.test(failure)
    )), evidence);
  }
});

test('dependency drift is a hard failure and can never be converted into baseline debt', () => {
  const drift = {
    channel: 'dependency-drift', kind: 'legacy-direct-framer-manifest', repo: 'app-bithire',
    path: 'package.json + pnpm-lock.yaml', scope: 'repository', line: 1,
    symbol: 'framer-motion', evidence: 'fixture drift',
  };

  assert.throws(() => buildBaselines([drift]), /hard policy findings cannot be baselined/);

  const contract = registry();
  contract.baselines['dependency-drift'] = {
    owner: 'fixture', reason: 'must not be accepted', expires: '2099-12-31', files: [],
  };
  const failures = auditFindings({ findings: [drift], registry: contract });
  assert(failures.some((failure) => /hard policy violation/.test(failure)));
  assert(failures.some((failure) => /cannot be registered as baseline debt/.test(failure)));
});

test('audit fails closed when a configured repository is missing', () => {
  const root = fixtureWorkspace();
  try {
    rmSync(join(root, 'app-platform'), { recursive: true, force: true });
    const registryPath = join(root, 'registry.json');
    write(registryPath, JSON.stringify(registry()));
    const failures = auditWorkspace({ workspaceRoot: root, registryPath });
    assert(failures.some((failure) => /missing repository: app-platform/.test(failure)));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
