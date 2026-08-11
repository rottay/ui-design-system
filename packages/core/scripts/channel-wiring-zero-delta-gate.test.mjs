/**
 * The drill's own negative controls.
 *
 * A verification instrument that has never been observed to FAIL proves
 * nothing — it is indistinguishable from a function that returns success. So
 * the cases that matter here are the rejections: a fallback retyped by hand, a
 * read with no fallback at all, and a stale allowance. The acceptance cases
 * exist only to show the rejections are not vacuous.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  bundleOrder,
  collapseChannels,
  normalise,
  resolveWinners,
  runChannelWiringZeroDeltaGate,
} from './channel-wiring-zero-delta-gate.mjs';

/** A one-commit repo whose HEAD is the baseline, plus a dirty working tree. */
function fixture({ committed, working }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zero-delta-gate-'));
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' });

  git('init', '--quiet');
  git('config', 'user.email', 'gate@example.test');
  git('config', 'user.name', 'gate');

  for (const [relativePath, source] of Object.entries(committed)) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, source);
  }
  git('add', '--all');
  git('commit', '--quiet', '-m', 'baseline');
  const baseline = git('rev-parse', 'HEAD').trim();

  for (const [relativePath, source] of Object.entries(working)) {
    fs.writeFileSync(path.join(root, relativePath), source);
  }
  return { root, baseline };
}

const run = ({ root, baseline }, options = {}) =>
  runChannelWiringZeroDeltaGate({ root, baseline, silent: true, ...options });

const BASE = `.panel {\n  inline-size: var(--ds-sidebar-width, 300px);\n}\n`;

test('REJECTS a fallback retyped by hand (the 300px -> 320px control)', () => {
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: {
      'skin.css': `.panel {\n  inline-size: var(--ds-sidebar-width, var(--ds-detail-rail-width, 320px));\n}\n`,
    },
  });
  assert.throws(() => run(repo), /does NOT restore the baseline/);
});

test('ACCEPTS the same wiring once the fallback is moved, not retyped', () => {
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: {
      'skin.css': `.panel {\n  inline-size: var(--ds-sidebar-width, var(--ds-detail-rail-width, 300px));\n}\n`,
    },
  });
  assert.equal(run(repo).channelsChecked, 1);
});

test('REJECTS a newly wired channel with no fallback arm, via the byte comparison', () => {
  // The rule used to be a bespoke "no fallback" error. That misfired on the
  // ordinary adoption of an existing foundation token (`var(--ds-color-bg-elevated)`
  // bare) and flagged four innocent sheets. Dropping it costs no coverage: an
  // uncollapsible read leaves the text in place, so whatever it replaced still
  // shows up as a divergence.
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: { 'skin.css': `.panel {\n  inline-size: var(--ds-detail-rail-width);\n}\n` },
  });
  assert.throws(() => run(repo), /does NOT restore the baseline/);
});

test('ACCEPTS adopting an existing foundation token bare when nothing else moves', () => {
  const repo = fixture({
    committed: { 'skin.css': `.panel {\n  background: var(--ds-surface-card);\n}\n` },
    working: { 'skin.css': `.panel {\n  background: var(--ds-surface-card);\n}\n` },
  });
  assert.equal(run(repo).channelsChecked, 0);
});

test('REJECTS a stale allowNew, because a dead allowance hides a real delta', () => {
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: {
      'skin.css': `.panel {\n  inline-size: var(--ds-sidebar-width, var(--ds-detail-rail-width, 300px));\n}\n`,
    },
  });
  assert.throws(() => run(repo, { allowNew: ['box-shadow:none'] }), /was never consumed/);
});

test('scopes an allowance to one file, so a socket legitimate in one sheet is not legitimate in all', () => {
  const repo = fixture({
    committed: { 'rail.css': `.rail {\n  background: white;\n}\n`, 'panel.css': `.panel {\n  background: white;\n}\n` },
    working: {
      'rail.css': `.rail {\n  background: white;\n  box-shadow: var(--ds-rail-shadow, none);\n}\n`,
      'panel.css': `.panel {\n  background: white;\n  box-shadow: var(--ds-panel-shadow, none);\n}\n`,
    },
  });
  const files = [path.join(repo.root, 'rail.css'), path.join(repo.root, 'panel.css')];
  // Scoped to rail.css only: panel.css keeps its uncollapsible socket and fails.
  assert.throws(
    () => run(repo, { files, allowNew: ['rail.css#box-shadow:none'] }),
    /panel\.css: collapsing/,
  );
  assert.equal(
    run(repo, { files, allowNew: ['rail.css#box-shadow:none', 'panel.css#box-shadow:none'] })
      .channelsChecked,
    2,
  );
});

test('ACCEPTS a genuine new socket only when it is declared', () => {
  const repo = fixture({
    committed: { 'skin.css': `.rail {\n  background: white;\n}\n` },
    working: {
      'skin.css': `.rail {\n  background: white;\n  box-shadow: var(--ds-list-preview-panel-shadow, none);\n}\n`,
    },
  });
  assert.throws(() => run(repo), /does NOT restore the baseline/);
  assert.equal(run(repo, { allowNew: ['box-shadow:none'] }).channelsChecked, 1);
});

test('collapses a comma-bearing shadow list without truncating it', () => {
  const collapsed = collapseChannels(
    'box-shadow: var(--ds-detail-hero-shadow, inset 0 1px 0 red, var(--ds-x, none));',
    ['--ds-detail-hero-shadow'],
  );
  assert.equal(collapsed, 'box-shadow: inset 0 1px 0 red, var(--ds-x, none);');
});

test('collapses innermost-outward when a fallback reads another added channel', () => {
  const collapsed = collapseChannels(
    'color: var(--ds-a, var(--ds-b, red));',
    ['--ds-a', '--ds-b'],
  );
  assert.equal(collapsed, 'color: red;');
});

test('a reflow or a new comment is not a delta', () => {
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: {
      'skin.css':
        `/* why this channel exists */\n.panel {\n  inline-size: var(\n    --ds-sidebar-width,\n    300px\n  );\n}\n`,
    },
  });
  assert.equal(run(repo).channelsChecked, 0);
  assert.equal(normalise('a {\n  b: c;\n}'), 'a{b:c;}');
});

test('a file absent at the baseline is skipped, never silently passed', () => {
  const repo = fixture({
    committed: { 'skin.css': BASE },
    working: { 'skin.css': BASE },
  });
  fs.writeFileSync(path.join(repo.root, 'new.css'), '.x { color: var(--ds-new, red); }\n');
  const result = run(repo, { files: [path.join(repo.root, 'new.css')] });
  assert.equal(result.report[0].skipped, 'absent at baseline');
});

/* ==========================================================================
   DELETION CERTIFICATION
   The judgement under test: a removal is inert iff the property's resolved
   winner does not move. The rejections are what matter; the acceptances exist
   only to prove the rejections are not the instrument refusing everything.
   ========================================================================== */

/** base.css imports the loser first, then the winner, both in one layer. */
const BUNDLE = {
  'entry/base.css':
    '@import "../tokens/base.css" layer(rottay-tokens);\n'
    + '@import "../tokens/theme.css" layer(rottay-tokens);\n',
  'tokens/base.css': ':root {\n  --ds-gap: 4px;\n  --ds-only-here: 9px;\n}\n',
  'tokens/theme.css': ':root {\n  --ds-gap: 8px;\n}\n',
};
const ENTRY = (repo) => [path.join(repo.root, 'entry/base.css')];

test('ACCEPTS deleting a declaration that LOSES today — the winner does not move', () => {
  const repo = fixture({
    committed: BUNDLE,
    // --ds-gap:4px loses to theme.css's 8px, so removing it renders identically.
    working: { ...BUNDLE, 'tokens/base.css': ':root {\n  --ds-only-here: 9px;\n}\n' },
  });
  const result = run(repo, {
    files: [path.join(repo.root, 'tokens/base.css')],
    entrypoints: ENTRY(repo),
  });
  assert.equal(result.removalsCertified, 1);
});

test('REJECTS deleting a declaration that WINS today — the injected violation', () => {
  const repo = fixture({
    committed: BUNDLE,
    // --ds-gap:8px is the winner. Removing it silently reverts every consumer
    // to 4px, which is precisely the delta this gate must never wave through.
    working: { ...BUNDLE, 'tokens/theme.css': ':root {\n}\n' },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/theme.css')], entrypoints: ENTRY(repo) }),
    /--ds-gap at `:root` WON in base\.css before this change/,
  );
});

test('REJECTS deleting the ONLY declaration of a property — nothing declares it after', () => {
  const repo = fixture({
    committed: BUNDLE,
    working: { ...BUNDLE, 'tokens/base.css': ':root {\n  --ds-gap: 4px;\n}\n' },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: ENTRY(repo) }),
    /--ds-only-here at `:root` WON in base\.css before this change/,
  );
});

test('REJECTS a removal PROMOTED by a second removal in the same wave', () => {
  // theme.css's 8px is inert on its own — late.css outranks it. But this wave
  // deletes late.css's too, which silently promotes base.css's 4px. Checking
  // "was it losing?" alone would wave this through; "is it STILL losing?" catches it.
  const committed = {
    'entry/base.css':
      '@import "../tokens/base.css" layer(rottay-tokens);\n'
      + '@import "../tokens/theme.css" layer(rottay-tokens);\n'
      + '@import "../tokens/late.css" layer(rottay-tokens);\n',
    'tokens/base.css': ':root {\n  --ds-gap: 4px;\n}\n',
    'tokens/theme.css': ':root {\n  --ds-gap: 8px;\n}\n',
    'tokens/late.css': ':root {\n  --ds-gap: 12px;\n}\n',
  };
  const repo = fixture({
    committed,
    working: {
      ...committed,
      'tokens/theme.css': ':root {\n}\n',
      'tokens/late.css': ':root {\n}\n',
    },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/theme.css')], entrypoints: ENTRY(repo) }),
    /is PROMOTED in base\.css/,
  );
});

test('an unrelated retune of the WINNER does not fail the loser\'s removal', () => {
  // The regression this exists for: the first cut compared winning VALUES, so
  // retuning theme.css failed base.css — a defect reported in the wrong file.
  // The removal in base.css is inert regardless of what the winner now says.
  const repo = fixture({
    committed: BUNDLE,
    working: {
      ...BUNDLE,
      'tokens/base.css': ':root {\n  --ds-only-here: 9px;\n}\n',
      'tokens/theme.css': ':root {\n  --ds-gap: 99px;\n}\n',
    },
  });
  const result = run(repo, {
    files: [path.join(repo.root, 'tokens/base.css')],
    entrypoints: ENTRY(repo),
  });
  assert.equal(result.removalsCertified, 1);
  // ...and the file that actually changed the value still fails on its own account.
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/theme.css')], entrypoints: ENTRY(repo) }),
    /does NOT restore the baseline/,
  );
});

test('REJECTS a removal in a file no entrypoint imports — uncertifiable, not innocent', () => {
  const repo = fixture({
    committed: { ...BUNDLE, 'tokens/orphan.css': ':root {\n  --ds-gap: 4px;\n}\n' },
    working: { ...BUNDLE, 'tokens/orphan.css': ':root {\n}\n' },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/orphan.css')], entrypoints: ENTRY(repo) }),
    /no entrypoint imports this file/,
  );
});

test('REJECTS a removal whose cascade group carries !important — order stops deciding', () => {
  const poisoned = { ...BUNDLE, 'tokens/theme.css': ':root {\n  --ds-gap: 8px !important;\n}\n' };
  const repo = fixture({
    committed: poisoned,
    // The loser still loses, but !important means document order is no longer
    // the reason, and this resolver refuses to certify what it cannot model.
    working: { ...poisoned, 'tokens/base.css': ':root {\n  --ds-only-here: 9px;\n}\n' },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: ENTRY(repo) }),
    /!important/,
  );
});

test('REJECTS a removal that is inert in one bundle but live in another', () => {
  // vertical.css omits the theme, so base.css's --ds-gap is the winner THERE
  // even though it loses in base.css. Certification must hold in every bundle.
  const committed = {
    ...BUNDLE,
    'entry/vertical.css': '@import "../tokens/base.css" layer(rottay-tokens);\n',
  };
  const repo = fixture({
    committed,
    working: { ...committed, 'tokens/base.css': ':root {\n  --ds-only-here: 9px;\n}\n' },
  });
  const both = [path.join(repo.root, 'entry/base.css'), path.join(repo.root, 'entry/vertical.css')];
  // Certified when only the bundle that has a later winner is considered...
  assert.equal(
    run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: ENTRY(repo) })
      .removalsCertified,
    1,
  );
  // ...and refused as soon as the bundle where it wins is in scope.
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: both }),
    /vertical\.css/,
  );
});

test('REJECTS a deletion smuggled in beside a retyped fallback', () => {
  // The removal is legitimate; the 300px -> 320px next to it is not. Accounting
  // for removals must not become an amnesty for everything else in the file.
  const committed = {
    ...BUNDLE,
    'tokens/base.css': ':root {\n  --ds-gap: 4px;\n  --ds-only-here: var(--ds-w, 300px);\n}\n',
  };
  const repo = fixture({
    committed,
    working: {
      ...committed,
      'tokens/base.css': ':root {\n  --ds-only-here: var(--ds-w, var(--ds-rail, 320px));\n}\n',
    },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: ENTRY(repo) }),
    /diverge beyond them/,
  );
});

test('ACCEPTS a deletion beside a genuine wiring, and still counts both', () => {
  const committed = {
    ...BUNDLE,
    'tokens/base.css': ':root {\n  --ds-gap: 4px;\n  --ds-only-here: 300px;\n}\n',
  };
  const repo = fixture({
    committed,
    working: {
      ...committed,
      'tokens/base.css': ':root {\n  --ds-only-here: var(--ds-rail, 300px);\n}\n',
    },
  });
  const result = run(repo, {
    files: [path.join(repo.root, 'tokens/base.css')],
    entrypoints: ENTRY(repo),
  });
  assert.equal(result.channelsChecked, 1);
  assert.equal(result.removalsCertified, 1);
});

test('a pure deletion is no longer reported as "no channel added" and passed unexamined', () => {
  // The hole this closes: with nothing added, the file used to short-circuit to
  // a green that had inspected none of its 100+ deletions.
  const repo = fixture({
    committed: BUNDLE,
    working: { ...BUNDLE, 'tokens/theme.css': ':root {\n}\n' },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, "tokens/theme.css")], entrypoints: ENTRY(repo) }),
    /--ds-gap at `:root` WON in base\.css before this change/,
  );
});

test('a dark-mode declaration does not certify the removal of its light counterpart', () => {
  // Same selector, different at-rule context: these never compete, so the
  // @media one must not be mistaken for a surviving winner.
  const committed = {
    'entry/base.css': '@import "../tokens/base.css" layer(rottay-tokens);\n',
    'tokens/base.css':
      ':root {\n  --ds-fg: black;\n}\n'
      + '@media (prefers-color-scheme: dark) {\n  :root {\n    --ds-fg: white;\n  }\n}\n',
  };
  const repo = fixture({
    committed,
    working: {
      ...committed,
      'tokens/base.css':
        ':root {\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --ds-fg: white;\n  }\n}\n',
    },
  });
  assert.throws(
    () => run(repo, { files: [path.join(repo.root, 'tokens/base.css')], entrypoints: ENTRY(repo) }),
    /--ds-fg at `:root` WON in base\.css before this change/,
  );
});

test('bundleOrder returns document order and propagates the layer through nested imports', () => {
  const repo = fixture({
    committed: {
      'entry/base.css': '@import "../tokens/index.css" layer(rottay-tokens);\n',
      'tokens/index.css': '@import "./a.css";\n@import "./b.css";\n',
      'tokens/a.css': ':root { --ds-a: 1px; }\n',
      'tokens/b.css': ':root { --ds-b: 2px; }\n',
    },
    working: {},
  });
  const { files } = bundleOrder(path.join(repo.root, 'entry/base.css'));
  assert.deepEqual(
    files.map((f) => path.basename(f.path)),
    ['a.css', 'b.css', 'index.css', 'base.css'],
  );
  // A nested import cannot escape the layer its outer import assigned.
  assert.equal(files.find((f) => path.basename(f.path) === 'a.css').layer, 'rottay-tokens');
});

test('resolveWinners takes the last declaration and poisons an !important group', () => {
  const sources = {
    '/one.css': ':root { --ds-x: 1px; --ds-y: 9px !important; }',
    '/two.css': ':root { --ds-x: 2px; }',
  };
  const { winners, poisoned } = resolveWinners(
    [{ path: '/one.css', layer: 'L' }, { path: '/two.css', layer: 'L' }],
    (p) => sources[p] ?? null,
  );
  assert.equal(winners.get('L||||:root||--ds-x').value, '2px');
  assert.ok(poisoned.has('L||||:root||--ds-y'));
});
