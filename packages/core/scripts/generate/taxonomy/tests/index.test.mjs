/**
 * Drills for the taxonomy writer and its freshness check.
 *
 * A generated document is only trustworthy if two things hold: the render is a
 * function of the tree alone, and the check can actually tell drift from
 * agreement. Both failed here before. The output carried a `Generated on
 * <today>` line, so bytes changed when nothing else did and any comparison was
 * meaningless; and there was no check at all, only an unconditional write.
 *
 * So the drills below prove determinism, prove `--check` refuses a tampered or
 * absent document, and prove it never writes — a checker that regenerates into
 * the tree to compare has mutated the thing it was judging, and a clean result
 * from it means nothing.
 *
 * Fixtures are real component trees under `os.tmpdir()`; nothing writes into
 * the repository except the canonical writer, which these drills never invoke
 * against the real package root.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  CLI_MODES,
  main,
  outputPathFor,
  parseMode,
  renderTaxonomy,
  uiRootFor,
} from '../index.mjs';

const PACKAGE_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');

/** A minimal but real component tree, enough for every tier to render. */
function makePackage() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-'));
  const write = (relative, contents) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  };

  write('src/components/primitives/inputs/index.ts', "export * from './button';\n");
  write('src/components/primitives/inputs/button/index.tsx', 'export const Button = () => null;\n');
  write('src/components/primitives/display/index.ts', "export * from './card';\n");
  write('src/components/primitives/display/card/index.tsx', 'export const Card = () => null;\n');
  write('src/components/structures/headers/collection-header/index.tsx', 'export const H = () => null;\n');
  write('src/components/patterns/data/data-table/index.tsx', 'export const T = () => null;\n');
  write('src/components/surfaces/presentation/pages/list/index.tsx', 'export const L = () => null;\n');
  fs.mkdirSync(path.join(root, 'docs/generated/component-taxonomy'), { recursive: true });
  return root;
}

/** Captures console output and the return code of a main() invocation. */
function runMain(argv, packageRoot) {
  const logs = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => logs.push(args.join(' '));
  try {
    const code = main(argv, { packageRoot });
    return { code, output: logs.join('\n') };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

test('the render is a pure function of the tree', () => {
  const root = makePackage();
  const first = renderTaxonomy({ packageRoot: root });
  const second = renderTaxonomy({ packageRoot: root });

  assert.equal(first, second, 'two renders of one tree must be byte-identical');
  assert.ok(first.length > 0);
  assert.match(first, /# Component Taxonomy Reference/u);
});

test('the output carries no clock- or environment-dependent line', () => {
  const rendered = renderTaxonomy({ packageRoot: makePackage() });
  assert.equal(/Generated on/u.test(rendered), false, 'the generated-date line must be gone');
  assert.equal(/\d{4}-\d{2}-\d{2}/u.test(rendered), false, 'no ISO date may appear');
  // The real document must be equally clean.
  assert.equal(/Generated on/u.test(renderTaxonomy()), false);
});

test('a changed tree changes the render', () => {
  const root = makePackage();
  const before = renderTaxonomy({ packageRoot: root });
  fs.mkdirSync(path.join(root, 'src/components/patterns/data/pivot-table'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/components/patterns/data/pivot-table/index.tsx'), 'export const P = () => null;\n');
  const after = renderTaxonomy({ packageRoot: root });

  assert.notEqual(before, after, 'a new family must move the bytes');
  assert.match(after, /pivot-table/u);
});

test('write then check is byte-identical and reports clean', () => {
  const root = makePackage();
  assert.equal(runMain([], root).code, 0);

  const written = fs.readFileSync(outputPathFor(root), 'utf8');
  assert.equal(written, renderTaxonomy({ packageRoot: root }), 'the file must equal the render');

  const checked = runMain(['--check'], root);
  assert.equal(checked.code, 0);
  assert.match(checked.output, /OK/u);
});

test('--write and no argument produce the same file', () => {
  const rootA = makePackage();
  const rootB = makePackage();
  runMain([], rootA);
  runMain(['--write'], rootB);

  assert.equal(fs.readFileSync(outputPathFor(rootA), 'utf8'), fs.readFileSync(outputPathFor(rootB), 'utf8'));
});

test('RED: a tampered document is reported STALE with a useful diagnostic', () => {
  const root = makePackage();
  runMain([], root);

  const target = outputPathFor(root);
  const original = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, original.replace('# Component Taxonomy Reference', '# Tampered Heading'));

  const result = runMain(['--check'], root);
  assert.equal(result.code, 1);
  assert.match(result.output, /STALE/u);
  assert.match(result.output, /first difference at line \d+/u);
  assert.match(result.output, /Tampered Heading/u, 'the diagnostic must quote what is on disk');
  assert.match(result.output, /pnpm docs:taxonomy/u, 'it must say how to fix it');
});

test('RED: a missing document is reported MISSING, not stale', () => {
  const root = makePackage();
  const result = runMain(['--check'], root);

  assert.equal(result.code, 1);
  assert.match(result.output, /MISSING/u);
  assert.equal(/STALE/u.test(result.output), false, 'absent is a different defect from stale');
});

test('RED: a stale document caused by a tree change is detected', () => {
  const root = makePackage();
  runMain([], root);

  fs.mkdirSync(path.join(root, 'src/components/patterns/data/pivot-table'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/components/patterns/data/pivot-table/index.tsx'), 'export const P = () => null;\n');

  const result = runMain(['--check'], root);
  assert.equal(result.code, 1);
  assert.match(result.output, /STALE/u);
});

test('--check never writes: bytes and mtime both survive', () => {
  const root = makePackage();
  runMain([], root);
  const target = outputPathFor(root);

  const before = fs.statSync(target);
  const bytesBefore = fs.readFileSync(target);
  // A coarse mtime would make this drill vacuous, so the file is aged first.
  const past = new Date(Date.now() - 60_000);
  fs.utimesSync(target, past, past);
  const agedMtime = fs.statSync(target).mtimeMs;

  assert.equal(runMain(['--check'], root).code, 0);

  const after = fs.statSync(target);
  assert.equal(after.mtimeMs, agedMtime, 'a clean check must not touch mtime');
  assert.deepEqual(fs.readFileSync(target), bytesBefore, 'a clean check must not touch bytes');
  assert.equal(after.size, before.size);
});

test('--check does not write even when the document is stale', () => {
  const root = makePackage();
  runMain([], root);
  const target = outputPathFor(root);
  fs.writeFileSync(target, 'tampered\n');
  const past = new Date(Date.now() - 60_000);
  fs.utimesSync(target, past, past);
  const agedMtime = fs.statSync(target).mtimeMs;

  assert.equal(runMain(['--check'], root).code, 1);

  assert.equal(fs.readFileSync(target, 'utf8'), 'tampered\n', 'a failing check must not repair the file');
  assert.equal(fs.statSync(target).mtimeMs, agedMtime);
});

test('the CLI grammar is closed', () => {
  assert.equal(parseMode([]), 'write');
  assert.equal(parseMode(['--write']), 'write');
  assert.equal(parseMode(['--check']), 'check');
  assert.deepEqual([...CLI_MODES], ['--write', '--check']);

  for (const argv of [['--fix'], ['-c'], ['check'], ['--Check'], ['--write=1']]) {
    assert.throws(() => parseMode(argv), /unknown argument/u, `must reject ${JSON.stringify(argv)}`);
  }
  assert.throws(() => parseMode(['--write', '--check']), /at most one argument/u);
});

test('the roots resolve under the package they are given', () => {
  const root = makePackage();
  assert.equal(uiRootFor(root), path.join(root, 'src/components'));
  assert.equal(outputPathFor(root), path.join(root, 'docs/generated/component-taxonomy/index.md'));
  // Defaults point at the real package.
  assert.equal(uiRootFor(), path.join(PACKAGE_ROOT, 'src/components'));
});

test('NON-VACUITY: the real component tree renders a substantial document', () => {
  const rendered = renderTaxonomy();
  assert.ok(rendered.length > 2000, `expected a substantial document, got ${rendered.length} bytes`);
  for (const tier of ['## Primitives', '## Structures', '## Patterns', '## Surfaces']) {
    assert.ok(rendered.includes(tier), `expected ${tier} in the real render`);
  }
  assert.match(rendered, /\*\*Summary\*\*/u);
});

test('the committed document matches the real tree', () => {
  // This is the same assertion the freshness check makes, stated as a drill so
  // a stale commit fails the suite and not only the gate.
  const committed = fs.readFileSync(outputPathFor(), 'utf8');
  assert.equal(committed, renderTaxonomy(), 'run `pnpm docs:taxonomy` — the committed document is stale');
});
