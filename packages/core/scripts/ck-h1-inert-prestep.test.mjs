import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = {
  modern: join(packageRoot, 'src/ui/patterns/customization/tenant-preview/engines/modern/index.tsx'),
  rustic: join(packageRoot, 'src/ui/patterns/customization/tenant-preview/engines/rustic/index.tsx'),
  sandbox: join(packageRoot, 'src/ui/patterns/customization/branding-preview-sandbox/index.tsx'),
  studio: join(packageRoot, 'src/ui/patterns/customization/brand-studio/index.tsx'),
};

const POST_MIGRATION_PAINT_COUNTS = {
  modern: 21,
  rustic: 13,
  sandbox: 0,
  studio: 9,
};

const RENDER_TOPOLOGY_SHA256 = {
  modern: '03a9e40fa5b3d8c71c372dbb810e2188c81648f5e94302814787f8d228e7ea1c',
  rustic: '709598682cf33788abab2fae40e15acf7161b42a2ae47c35bd3e95fa8418b5cb',
  sandbox: '365c4d16b7ea690ff4dcd09b27ca18217bd896d8f5f6a7b3dafa513afb6f844e',
  studio: '26d1cf0c2a1c95d176ecb02a13678fb4f1830962939ab4b75f8997a80a2d6496',
};

function source(path) {
  return readFileSync(path, 'utf8');
}

function isReactCreateElement(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === 'React' &&
    node.expression.name.text === 'createElement'
  );
}

/**
 * Fingerprint rendered topology only: element/component tags, fragments and
 * their nesting. Props, style objects, text/data expressions, callback
 * parameters and lookup arrays are intentionally absent because CK-H1 must
 * rewrite those to extract paint. Added/removed wrappers, children or
 * createElement nodes still change the digest.
 */
function renderTopology(path) {
  const sourceFile = ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const isRenderTree = (node) =>
    ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node) || isReactCreateElement(node);

  const tag = (node) => {
    if (ts.isJsxElement(node)) return node.openingElement.tagName.getText(sourceFile);
    if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText(sourceFile);
    if (ts.isJsxFragment(node)) return '<>';
    return node.arguments[0]?.getText(sourceFile) ?? '<missing-tag>';
  };

  const nestedRenderRoots = (node) => {
    const roots = [];
    const visit = (child) => {
      if (isRenderTree(child)) {
        roots.push(child);
        return;
      }
      ts.forEachChild(child, visit);
    };
    ts.forEachChild(node, visit);
    return roots;
  };

  const serialize = (node) => {
    const children = [];
    const candidates = isReactCreateElement(node)
      ? node.arguments.slice(2).flatMap((argument) => (isRenderTree(argument) ? [argument] : nestedRenderRoots(argument)))
      : nestedRenderRoots(node);
    for (const child of candidates) children.push(serialize(child));
    return `${tag(node)}(${children.join(',')})`;
  };

  const roots = [];
  const collect = (node, insideRenderTree = false) => {
    const renderTree = isRenderTree(node);
    if (renderTree && !insideRenderTree) roots.push(serialize(node));
    ts.forEachChild(node, (child) => collect(child, insideRenderTree || renderTree));
  };
  collect(sourceFile);
  return roots.join('\n');
}

test('CK-H1 migration reaches the exact 21/13/0/9 paint floors', () => {
  let total = 0;
  for (const [name, path] of Object.entries(SOURCES)) {
    const count = countArc09PaintInFile(source(path), path);
    assert.equal(
      count,
      POST_MIGRATION_PAINT_COUNTS[name],
      `${name} did not reach its exact CK-H1 floor`
    );
    total += count;
  }
  assert.equal(total, 43, 'CK-H1 must retain exactly 43 adjudicated floor sites');
});

test('CK-H1 pins the post-prohibition rendered topology', () => {
  const actual = {};
  for (const [name, path] of Object.entries(SOURCES)) {
    actual[name] = createHash('sha256').update(renderTopology(path)).digest('hex');
  }
  assert.deepEqual(actual, RENDER_TOPOLOGY_SHA256, 'CK-H1 rendered topology drifted');
});
