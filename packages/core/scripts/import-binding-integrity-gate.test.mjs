import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runImportBindingIntegrityGate } from './import-binding-integrity-gate.mjs';

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'import-binding-gate-'));
  for (const [relativePath, source] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, source);
  }
  return root;
}

function run(root) {
  return runImportBindingIntegrityGate({ root, silent: true });
}

test('rejects a deep import of an alias that only the parent barrel publishes', () => {
  const root = fixture({
    'src/ui/primitives/Typography/compound/Text/index.tsx': 'export const TypographyText = 1;\n',
    'src/ui/primitives/Typography/index.tsx': `
import { TypographyText } from './compound/Text';
export { TypographyText as Text };
`,
    'src/ui/patterns/thing/index.tsx': `
import { Text } from '../../primitives/Typography/compound/Text';
export const Thing = Text;
`,
  });
  assert.throws(() => run(root), /imports "Text" from "\.\.\/\.\.\/primitives\/Typography\/compound\/Text"/);
});

test('accepts the same import once the compound module publishes the alias', () => {
  const root = fixture({
    'src/ui/primitives/Typography/compound/Text/index.tsx': `
export const TypographyText = 1;
export { TypographyText as Text };
`,
    'src/ui/patterns/thing/index.tsx': `
import { Text } from '../../primitives/Typography/compound/Text';
export const Thing = Text;
`,
  });
  assert.equal(run(root).checkedEdges, 1);
});

test('rejects a re-export of a binding the source module does not publish', () => {
  const root = fixture({
    'src/ui/primitives/Box/index.ts': 'export const Box = 1;\n',
    'src/entrypoints/public/box/index.ts': "export { Container } from '../../../ui/primitives/Box';\n",
  });
  assert.throws(() => run(root), /imports "Container"/);
});

test('follows export-star chains before declaring a binding absent', () => {
  const root = fixture({
    'src/ui/primitives/Box/impl/index.ts': 'export const Box = 1;\n',
    'src/ui/primitives/Box/index.ts': "export * from './impl';\n",
    'src/ui/patterns/thing/index.ts': "import { Box } from '../../primitives/Box';\nexport const Thing = Box;\n",
  });
  assert.equal(run(root).checkedEdges, 1);
});

test('skips importers of a module whose export surface cannot be resolved', () => {
  const root = fixture({
    'src/ui/primitives/Box/index.ts': "export * from 'react';\n",
    'src/ui/patterns/thing/index.ts': "import { useState } from '../../primitives/Box';\nexport const Thing = useState;\n",
  });
  const report = run(root);
  assert.equal(report.checkedEdges, 0);
  assert.equal(report.skippedIncomplete, 1);
});

test('ignores type-only imports and type-only specifiers', () => {
  const root = fixture({
    'src/foundation/contracts/index.ts': 'export type BoxProps = { id: string };\n',
    'src/ui/patterns/thing/index.ts': `
import type { BoxProps } from '../../foundation/contracts';
export const make = (props: BoxProps) => props;
`,
  });
  assert.doesNotThrow(() => run(root));
});

test('resolves a default import through both export-default and export-assignment forms', () => {
  const root = fixture({
    'src/ui/primitives/Box/index.tsx': 'const Box = 1;\nexport default Box;\n',
    'src/ui/primitives/Card/index.tsx': 'const Card = 1;\nexport { Card as default };\n',
    'src/ui/patterns/thing/index.ts': `
import { default as Box } from '../../primitives/Box';
import { default as Card } from '../../primitives/Card';
export const Thing = [Box, Card];
`,
  });
  assert.doesNotThrow(() => run(root));
});

test('resolves destructured const exports', () => {
  const root = fixture({
    'src/ui/primitives/Box/index.ts': 'export const { Box, Card } = { Box: 1, Card: 2 };\n',
    'src/ui/patterns/thing/index.ts': "import { Card } from '../../primitives/Box';\nexport const Thing = Card;\n",
  });
  assert.doesNotThrow(() => run(root));
});
