import assert from 'node:assert/strict';
import { test } from 'node:test';

import ts from 'typescript';

import { resolveShape } from '../index.mjs';

/* `n0` is aliased ten deep and only the last alias is written. The coarse
 * mutation walk stops following a chain past eight names, so its answer for
 * one binding depends on where the walk started: asked directly, `n2` reaches
 * the write; reached from `n0`, it does not. */
const CHAIN = [
  'const n0 = { color: "red" };',
  ...Array.from({ length: 10 }, (_, i) => `const n${i + 1} = n${i};`),
  'n10.k = 1;',
];
const MUTATED = 'reassignment-or-mutation-present';

/** One fresh parse; the sinks are resolved in the order given. */
const resolveInOrder = (names) => {
  const code = [...CHAIN, ...names.map((name, i) => `export const C${i} = () => <div style={${name}} />;`)].join('\n');
  const source = ts.createSourceFile('fixture/index.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const sinks = [];
  const walk = (node) => {
    if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer)) sinks.push(node.initializer.expression);
    ts.forEachChild(node, walk);
  };
  walk(source);
  assert.equal(sinks.length, names.length, 'fixture must contain one style sink per name');
  return sinks.map((sink) => {
    const shape = resolveShape(sink, { source, fileRel: source.fileName, depth: 0, path: [] });
    return `${sink.text}:${shape.reason === MUTATED ? 'mutated' : shape.kind}`;
  });
};

test('MW-1 the depth guard answers per starting binding: n0 and n1 fall short of the write, n2 and n3 reach it', () => {
  assert.deepEqual(resolveInOrder(['n0']), ['n0:object']);
  assert.deepEqual(resolveInOrder(['n1']), ['n1:object']);
  assert.deepEqual(resolveInOrder(['n2']), ['n2:mutated']);
  assert.deepEqual(resolveInOrder(['n3']), ['n3:mutated']);
});

test('MW-2 a walk that passed THROUGH a binding never answers for it: n0 first, then n2', () => {
  assert.deepEqual(resolveInOrder(['n0', 'n1', 'n2', 'n3']), ['n0:object', 'n1:object', 'n2:mutated', 'n3:mutated']);
});

test('MW-3 a walk never borrows an earlier direct answer mid-chain: n2 first, then n0', () => {
  assert.deepEqual(resolveInOrder(['n3', 'n2', 'n1', 'n0']), ['n3:mutated', 'n2:mutated', 'n1:object', 'n0:object']);
});

test('MW-4 asking twice in one parse answers the same, and a new parse of edited text answers anew', () => {
  assert.deepEqual(resolveInOrder(['n2', 'n2', 'n0', 'n0']), ['n2:mutated', 'n2:mutated', 'n0:object', 'n0:object']);
  const edited = (line) => {
    const code = `const base = { color: "red" };\n${line}\nexport const C = () => <div style={base} />;`;
    const source = ts.createSourceFile('fixture/index.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let sink = null;
    const walk = (node) => {
      if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer)) sink = node.initializer.expression;
      ts.forEachChild(node, walk);
    };
    walk(source);
    return resolveShape(sink, { source, fileRel: source.fileName, depth: 0, path: [] });
  };
  assert.equal(edited('void 0;').kind, 'object');
  assert.equal(edited('delete base.color;').reason, MUTATED);
  assert.equal(edited('void 0;').kind, 'object');
});
