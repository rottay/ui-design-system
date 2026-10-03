import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import { analyzeFile, createWorkspace, dsSubpath, reachesByPublishedName, specifierFor } from '../resolve/index.mjs';

function project(files) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-resolve-')));
  for (const [name, text] of Object.entries(files)) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  return root;
}

function tagOrigins(analysis) {
  const origins = {};
  analysis.walk((node) => {
    if (ts.isJsxSelfClosingElement(node)) {
      origins[node.tagName.getText(analysis.sourceFile)] = analysis.originOfExpression(node.tagName);
    }
  });
  return origins;
}

test('only the package name or one of its subpaths is the design system', () => {
  assert.equal(dsSubpath('@rottay/design-system'), '.');
  assert.equal(dsSubpath('@rottay/design-system/icons/presets/bithire'), './icons/presets/bithire');
  assert.equal(dsSubpath('@rottay/design-system-extras'), null);
  assert.equal(dsSubpath('@rottay/design-system-extras/primitives/badge'), null);
  assert.equal(dsSubpath('./design-system'), null);
  assert.equal(dsSubpath('design-system'), null);
  assert.equal(specifierFor('.'), '@rottay/design-system');
  assert.equal(specifierFor('./styles.css'), '@rottay/design-system/styles.css');
});

test('a tag resolves to the design system through aliases, namespaces, barrels and tsconfig paths', () => {
  const root = project({
    'tsconfig.json': JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }),
    'src/ui/index.ts': "export * from './inner';\nexport { Badge as Pill } from '@rottay/design-system';\n",
    'src/ui/inner/index.ts': "export * from '@rottay/design-system';\nexport const Local = () => null;\n",
    'src/screen.tsx': [
      "import { Badge as Chip } from '@rottay/design-system';",
      "import * as DS from '@rottay/design-system';",
      "import { Badge, Pill, Local } from '@/ui';",
      "import * as UI from '@/ui';",
      'const Alias = DS.Badge;',
      'const { Badge: Pulled } = DS;',
      'export const all = [<Chip />, <DS.Badge />, <Badge />, <Pill />, <Local />, <UI.Pill />, <Alias />, <Pulled />];',
    ].join('\n'),
  });
  try {
    const workspace = createWorkspace();
    const origins = tagOrigins(analyzeFile(workspace, path.join(root, 'src/screen.tsx')));
    for (const tag of ['Chip', 'DS.Badge', 'Badge', 'Pill', 'UI.Pill', 'Alias', 'Pulled']) {
      assert.equal(origins[tag].kind, 'ds', tag);
      assert.equal(origins[tag].subpath, '.', tag);
      assert.equal(origins[tag].name, 'Badge', tag);
    }
    assert.equal(origins.Local.kind, 'local');
    assert.equal(reachesByPublishedName(origins.Chip), true);
    assert.equal(reachesByPublishedName(origins.Badge), true, 'a chain of `export *` keeps the published name');
    assert.equal(reachesByPublishedName(origins.Pill), false, 'a named re-export makes the name consumer-owned');
    assert.equal(reachesByPublishedName(origins.Alias), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a local declaration, a shadowing binding and a foreign package never resolve to the design system', () => {
  const root = project({
    'local/index.tsx': 'export const Badge = () => null;\n',
    'screen.tsx': [
      "import { Badge } from './local';",
      "import { Tag } from 'other-kit';",
      "import { Card } from '@rottay/design-system-extras';",
      "import { Button } from '@rottay/design-system';",
      'function Inner(Button: () => null) { return <Button />; }',
      'export const all = [<Badge />, <Tag />, <Card />, Inner];',
    ].join('\n'),
  });
  try {
    const workspace = createWorkspace();
    const analysis = analyzeFile(workspace, path.join(root, 'screen.tsx'));
    const origins = tagOrigins(analysis);
    assert.equal(origins.Badge.kind, 'local');
    assert.equal(origins.Tag.kind, 'external');
    assert.equal(origins.Card.kind, 'external');
    assert.equal(origins.Button.kind, 'local', 'the parameter shadows the import');
    assert.equal(analysis.reachesPackage(), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a dynamic member of the namespace is recognised as unprovable, not guessed', () => {
  const root = project({
    'screen.ts': "import * as DS from '@rottay/design-system';\nexport const pick = (name: string) => DS[name];\n",
  });
  try {
    const analysis = analyzeFile(createWorkspace(), path.join(root, 'screen.ts'));
    let origin = null;
    analysis.walk((node) => {
      if (ts.isElementAccessExpression(node)) origin = analysis.originOfExpression(node);
    });
    assert.equal(origin.kind, 'dynamic');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a re-export cycle between consumer barrels terminates', () => {
  const root = project({
    'a/index.ts': "export * from '../b';\n",
    'b/index.ts': "export * from '../a';\n",
    'screen.tsx': "import { Ghost } from './a';\nexport const node = <Ghost />;\n",
  });
  try {
    const origins = tagOrigins(analyzeFile(createWorkspace(), path.join(root, 'screen.tsx')));
    assert.equal(origins.Ghost.kind, 'unknown');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
