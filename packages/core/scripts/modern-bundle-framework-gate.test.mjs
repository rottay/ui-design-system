// Self-test for modern-bundle-framework-gate.mjs.
//
// Two halves, both load-bearing:
//
//   - HERMETIC DRILLS run against synthetic bundles in a temp dir. They are the
//     NEGATIVE PROOF: each one reintroduces DaisyUI through a different door
//     (the plugin's cascade layer, vendored component CSS carrying its private
//     variables, its default theme dumped over the projection) and asserts the
//     gate fails. A gate that has never been seen to fail is not evidence.
//
//   - THE LIVE ASSERTION runs against the real committed bundles, so the
//     repository's actual shipped bytes are certified by the same code path.
//
// Every drill is derived from bytes daisyui@5.5.19 really emitted into
// dist/modern-engine.css before `@plugin "daisyui";` was removed -- not from
// invented strings that only a matching regex would recognise.

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { assertModernBundlesFrameworkFree, auditBundle } from './modern-bundle-framework-gate.mjs';

const CLEAN_BUNDLE = `@layer rottay-framework {
  @layer theme {
    :root, :host { --ds-color-primary: #4f46e5; }
  }
  @layer utilities {
    .sr-only { position: absolute; }
  }
}
@layer rottay-tokens {
  [data-tenant] { --color-primary: var(--ds-color-primary); --border: var(--ds-border-width-1); }
}
`;

function scaffold(bundleBody) {
  const root = mkdtempSync(join(tmpdir(), 'modern-framework-gate-'));
  const write = (rel, body) => {
    const full = join(root, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, body);
    return full;
  };
  write('styles/modern.css', bundleBody);
  return { root, write, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function runOn(bundleBody) {
  const f = scaffold(bundleBody);
  try {
    return assertModernBundlesFrameworkFree({ packageRoot: f.root, bundles: ['styles/modern.css'] });
  } finally {
    f.cleanup();
  }
}

test('a clean first-party bundle passes', () => {
  const { ok, failures } = runOn(CLEAN_BUNDLE);
  assert.equal(ok, true, failures.join('\n'));
});

test('NEGATIVE DRILL: reintroducing the plugin ships a daisyui layer and fails the gate', () => {
  // Verbatim shape of what `@plugin "daisyui";` emitted before removal.
  const { ok, failures } = runOn(`${CLEAN_BUNDLE}
@layer daisyui.l1.l2.l3 {
  .btn {
    :where(&) { --btn-bg: var(--btn-color, var(--color-base-200)); }
  }
}
`);
  assert.equal(ok, false, 'the gate must fail when a daisyui cascade layer is shipped');
  assert.match(failures.join('\n'), /DaisyUI cascade layer shipped \(@layer daisyui\.l1\.l2\.l3\)/);
  assert.match(failures.join('\n'), /@plugin "daisyui";/);
});

test('NEGATIVE DRILL: a bare `@layer daisyui` with no nesting also fails', () => {
  const { ok, failures } = runOn(`${CLEAN_BUNDLE}\n@layer daisyui { .list-row { padding: 1rem; } }\n`);
  assert.equal(ok, false);
  assert.match(failures.join('\n'), /DaisyUI cascade layer shipped/);
});

test('NEGATIVE DRILL: vendored daisy CSS with no daisyui layer still fails on its private variables', () => {
  const { ok, failures } = runOn(`${CLEAN_BUNDLE}
@layer rottay-components {
  .ds-button { --btn-shadow: 0 3px 2px -2px var(--btn-bg); --btn-fg: var(--color-base-content); }
  .ds-field { --input-color: var(--color-base-content); }
}
`);
  assert.equal(ok, false, 'copying the CSS out of the package must not launder it');
  const joined = failures.join('\n');
  assert.match(joined, /DaisyUI private variable declared \(--btn-shadow\)/);
  assert.match(joined, /DaisyUI private variable declared \(--btn-fg\)/);
  assert.match(joined, /DaisyUI private variable declared \(--input-color\)/);
});

test('NEGATIVE DRILL: the daisy default theme dumped over the projection fails as a competing authority', () => {
  // Exactly the `:root` block the plugin shipped alongside the DS projection.
  const { ok, failures } = runOn(`${CLEAN_BUNDLE}
:root {
  --color-primary: oklch(45% 0.24 277.023);
  --color-base-100: oklch(100% 0 0);
  --radius-field: 0.25rem;
  --depth: 1;
}
`);
  assert.equal(ok, false);
  const joined = failures.join('\n');
  assert.match(joined, /--color-primary declared with a non-projected value \(oklch\(45% 0\.24 277\.023\)\)/);
  assert.match(joined, /--radius-field declared with a non-projected value/);
  assert.match(joined, /competing theme authority/);
});

test('NEGATIVE DRILL: a different visual framework fails on the layer allowlist', () => {
  const { ok, failures } = runOn(`${CLEAN_BUNDLE}\n@layer bootstrap { .btn { padding: 0.375rem; } }\n`);
  assert.equal(ok, false, 'the gate must not be DaisyUI-specific');
  assert.match(failures.join('\n'), /unrecognised cascade layer "@layer bootstrap"/);
});

test('the projection writing var(--ds-*) is NOT a finding', () => {
  const findings = auditBundle('fixture.css', '[data-tenant] { --color-primary: var(--ds-color-primary); --noise: var(--ds-effect-intensity); }');
  assert.deepEqual(findings, []);
});

test('a prose mention of DaisyUI in a comment is not CSS and is not a finding', () => {
  const findings = auditBundle(
    'fixture.css',
    '/* The pre-drain --step-neutral rule and @layer daisyui blocks are gone. */\n.ds-step { color: red; }\n',
  );
  assert.deepEqual(findings, []);
});

test('a missing committed bundle fails closed', () => {
  const f = scaffold(CLEAN_BUNDLE);
  try {
    const { ok, failures } = assertModernBundlesFrameworkFree({
      packageRoot: f.root,
      bundles: ['styles/does-not-exist.css'],
    });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /shipped bundle missing/);
  } finally {
    f.cleanup();
  }
});

test('the real committed bundles ship no third-party framework CSS', () => {
  const { ok, failures, audited } = assertModernBundlesFrameworkFree();
  assert.ok(audited >= 6, `expected the committed mirrors to be audited, got ${audited}`);
  assert.equal(ok, true, failures.slice(0, 20).join('\n'));
});
