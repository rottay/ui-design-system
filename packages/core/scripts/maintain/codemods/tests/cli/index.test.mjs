import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { KIT_ROOT, loadFixtureCases, snapshot, workingCopy } from '../harness/index.mjs';

const CLI = path.join(KIT_ROOT, 'index.mjs');
const CASES = loadFixtureCases();

function run(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
}

function withCase(name, body) {
  const work = workingCopy(CASES.find((fixture) => fixture.name === name));
  try {
    body(work);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

test('the default mode is a dry-run: it prints the per-file plan and writes nothing', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    const result = run(['.'], work);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(snapshot(work), before);
    assert.match(result.stdout, /^index\.tsx$/m);
    assert.match(result.stdout, /REWRITE 6:21 prop-renamed\/\.#TooltipValue\.color \[attribute-renamed\]/);
    assert.match(result.stdout, /codemods mode=dry-run files=1 filesWithFindings=1 filesChanged=0 wouldChange=1 rewrite=4 report=0/);
    assert.deepEqual(run(['--dry-run', '.'], work).stdout, result.stdout);
  });
});

test('--check exits 1 while findings remain, writes nothing, and exits 0 once they are gone', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    assert.equal(run(['--check', '--quiet', '.'], work).status, 1);
    assert.deepEqual(snapshot(work), before);
    const written = run(['--write', '.'], work);
    assert.equal(written.status, 0, written.stderr);
    assert.match(written.stdout, /REWROTE 6:21/);
    assert.match(written.stdout, /mode=write files=1 filesWithFindings=1 filesChanged=1/);
    const after = snapshot(work);
    assert.notDeepEqual(after, before);
    const check = run(['--check', '.'], work);
    assert.equal(check.status, 0);
    assert.match(check.stdout, /rewrite=0 report=0/);
    assert.equal(run(['--write', '.'], work).status, 0);
    assert.deepEqual(snapshot(work), after);
  });
});

test('--check stays red on a usage the kit can only report', () => {
  withCase('prop-renamed/wrapper', (work) => {
    assert.equal(run(['--write', '.'], work).status, 0);
    const check = run(['--check', '.'], work);
    assert.equal(check.status, 1);
    assert.match(check.stdout, /REPORT {2}14:15 prop-renamed\/\.#TooltipValue\.color \[indirect\]/);
  });
});

test('--json prints the summary and the findings without touching the tree', () => {
  withCase('glyph-removed/direct', (work) => {
    const before = snapshot(work);
    const result = run(['--json', '.'], work);
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.mode, 'dry-run');
    assert.equal(parsed.line, '3.0');
    assert.deepEqual(parsed.summary.totals, { rewrite: 0, report: 3 });
    assert.equal(parsed.summary.byClass['glyph-removed'].reasons['glyph-role-map-absent'], 3);
    assert.equal(parsed.findings[0].file, 'index.tsx');
    assert.equal(parsed.findings[0].edits, undefined);
    assert.deepEqual(snapshot(work), before);
  });
});

test('the live package surface gates a re-point: a retired door moves only names the root publishes', () => {
  withCase('subpath-removed/direct', (work) => {
    const result = run(['--json', '--class', 'subpath-removed', '.'], work);
    const parsed = JSON.parse(result.stdout);
    const reasons = Object.fromEntries(parsed.findings.map((item) => [item.id, item.reason]));
    assert.equal(reasons['subpath-removed/./primitives/button#*'], 'specifier-repointed');
    assert.equal(reasons['subpath-removed/./styles#*'], 'specifier-repointed');
  });
  withCase('subpath-removed/unproven', (work) => {
    const parsed = JSON.parse(run(['--json', '.'], work).stdout);
    const row = parsed.findings.find((item) => item.reason === 'not-exported-at-target');
    assert.match(row.message, /`ButtonGroupLegacy`/);
    assert.equal(parsed.summary.totals.rewrite, 0);
  });
});

test('a bad invocation exits 2 with the usage and writes nothing', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    for (const args of [[], ['--frobnicate', '.'], ['--write', '--check', '.'], ['--class', 'prop-vanished', '.'], ['--map'],
      ['--only', 'prop-removed/.#Nothing.here', '.']]) {
      const result = run(args, work);
      assert.equal(result.status, 2, args.join(' '));
      assert.match(result.stderr, /Usage: node/);
    }
    assert.deepEqual(snapshot(work), before);
  });
});
