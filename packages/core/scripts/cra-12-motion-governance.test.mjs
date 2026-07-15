import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  auditFindings,
  auditWorkspace,
  buildBaselines,
  scanSource,
  scanWorkspace,
} from './cra-12-motion-governance.mjs';

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
