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
  collapseChannels,
  normalise,
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
