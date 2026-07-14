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
  modern: join(packageRoot, 'src/components/patterns/misc/tenant-preview/engines/modern.tsx'),
  rustic: join(packageRoot, 'src/components/patterns/misc/tenant-preview/engines/rustic.tsx'),
  sandbox: join(packageRoot, 'src/components/patterns/misc/branding-preview-sandbox/index.tsx'),
  studio: join(packageRoot, 'src/components/patterns/misc/brand-studio/index.tsx'),
};

const PRESTEP_PAINT_COUNTS = {
  modern: 70,
  rustic: 75,
  sandbox: 54,
  studio: 36,
};

const ATTRIBUTE_STRIPPED_TREE_SHA256 = {
  modern: '7cf88eeb7b2183f5952d7f862032293102276c2ea04e4b617b2da9e7f39d1f72',
  rustic: 'db044fe1a61b05063e617ccd07f16c2799b3ff2c0fb7d242a26faa0536e03fc3',
  sandbox: '73e9f5c62652c4af18dcc092b83942b1d84de7a944d92a0f9d620f709fbd05e8',
  studio: '2efe1c89da85ef74de96f5dd3d5bbf503aecf0dade8251cf785c08541405a817',
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
 * Normalize only rendered element trees while removing the mutations authorized
 * in the CK-H1 pre-step: JSX attributes and React.createElement prop bags.
 * Non-render helpers and formatting are deliberately excluded. Tags, fragments,
 * children, nesting, maps and conditional branches remain in each printed root,
 * so an added wrapper or reparented child changes the digest while a formatter or
 * later paint extraction does not.
 */
function attributeStrippedTree(path) {
  const sourceFile = ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const transformer = (context) => {
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node)) {
        return ts.factory.updateJsxOpeningElement(
          node,
          node.tagName,
          node.typeArguments,
          ts.factory.createJsxAttributes([])
        );
      }
      if (ts.isJsxSelfClosingElement(node)) {
        return ts.factory.updateJsxSelfClosingElement(
          node,
          node.tagName,
          node.typeArguments,
          ts.factory.createJsxAttributes([])
        );
      }
      if (isReactCreateElement(node)) {
        const tag = ts.visitNode(node.arguments[0], visit);
        const children = node.arguments.slice(2).map((child) => ts.visitNode(child, visit));
        return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
          tag,
          ts.factory.createNull(),
          ...children,
        ]);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  };

  const transformed = ts.transform(sourceFile, [transformer]);
  try {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const roots = [];

    const collect = (node, insideRenderTree = false) => {
      const isRenderTree =
        ts.isJsxElement(node) ||
        ts.isJsxSelfClosingElement(node) ||
        ts.isJsxFragment(node) ||
        isReactCreateElement(node);

      if (isRenderTree && !insideRenderTree) {
        roots.push(
          printer.printNode(ts.EmitHint.Unspecified, node, transformed.transformed[0]).replace(/\s+/g, ' ').trim()
        );
      }

      ts.forEachChild(node, (child) => collect(child, insideRenderTree || isRenderTree));
    };

    collect(transformed.transformed[0]);
    return roots.join('\n');
  } finally {
    transformed.dispose();
  }
}

test('CK-H1 inert pre-step keeps the exact 70/75/54/36 paint counters', () => {
  for (const [name, path] of Object.entries(SOURCES)) {
    assert.equal(
      countArc09PaintInFile(source(path), path),
      PRESTEP_PAINT_COUNTS[name],
      `${name} paint counter moved during the inert pre-step`
    );
  }
});

test('CK-H1 inert pre-step preserves each attribute-stripped element tree', () => {
  const actual = {};
  for (const [name, path] of Object.entries(SOURCES)) {
    actual[name] = createHash('sha256').update(attributeStrippedTree(path)).digest('hex');
  }
  assert.deepEqual(actual, ATTRIBUTE_STRIPPED_TREE_SHA256, 'CK-H1 attribute-stripped trees drifted');
});
