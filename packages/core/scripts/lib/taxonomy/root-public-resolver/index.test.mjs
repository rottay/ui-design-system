/**
 * Drills for the root public-reachability resolver.
 *
 * The resolver is the only binding in the taxonomy gate that an incorrect
 * inventory cannot fake, which makes its own failure modes the weakest point in
 * the chain. Both defects drilled here were found in the real tree and both
 * failed silently -- one by inventing ambiguity that did not exist, one by
 * reading a real component as a plain value.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createRootPublicResolver, loadPathAliases, loadTypeScript } from './index.mjs';

function makeTree(files, { tsconfig } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'root-public-resolver-'));
  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
  if (tsconfig) fs.writeFileSync(path.join(root, 'tsconfig.json'), tsconfig);
  return root;
}

const ALIAS_TSCONFIG = `{
  // A comment and a trailing comma, because real tsconfigs have both and
  // JSON.parse refuses them.
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
    },
  },
}
`;

test('a name re-exported through both a relative and an alias path is not ambiguous', () => {
  // The real defect: `foundation/contracts` is re-exported once relatively and
  // once as `@/foundation/...`. Treating the alias as an opaque external made
  // one declaration look like two, producing 17 false AMBIGUOUS verdicts.
  const root = makeTree(
    {
      'src/thing/index.ts': 'export interface Thing { a: string }\n',
      'src/one/index.ts': "export * from '../thing';\n",
      'src/two/index.ts': "export type { Thing } from '@/thing';\n",
      'src/index.ts': "export * from './one';\nexport * from './two';\n",
    },
    { tsconfig: ALIAS_TSCONFIG },
  );

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  const resolution = resolver.resolve('Thing');

  assert.equal(resolution.state, 'TYPE_ONLY');
  assert.equal(resolution.terminal.file, path.join(root, 'src/thing/index.ts'));
});

test('without the alias table the same tree reads as ambiguous', () => {
  // Proves the previous drill is testing the alias table and not something else:
  // pass no aliases and the false ambiguity comes back.
  const root = makeTree({
    'src/thing/index.ts': 'export interface Thing { a: string }\n',
    'src/one/index.ts': "export * from '../thing';\n",
    'src/two/index.ts': "export type { Thing } from '@/thing';\n",
    'src/index.ts': "export * from './one';\nexport * from './two';\n",
  });

  const resolver = createRootPublicResolver({
    entryFile: path.join(root, 'src/index.ts'),
    aliases: [],
  });

  assert.equal(resolver.resolve('Thing').state, 'AMBIGUOUS');
});

test('an alias that points at nothing is unresolved, not external', () => {
  // Fail-closed: a broken alias is a finding. Reporting it as a third-party
  // import would hide a real dangling re-export.
  const root = makeTree(
    {
      'src/index.ts': "export * from '@/does-not-exist';\n",
    },
    { tsconfig: ALIAS_TSCONFIG },
  );

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  assert.equal(resolver.resolve('Anything').state, 'UNRESOLVED');
});

test('a genuinely third-party specifier is still external', () => {
  const root = makeTree(
    {
      'src/index.ts': "export { Something } from 'some-package';\n",
    },
    { tsconfig: ALIAS_TSCONFIG },
  );

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  const resolution = resolver.resolve('Something');
  assert.equal(resolution.state, 'VALUE');
  assert.equal(resolution.terminal.kind, 'external');
  assert.equal(resolution.terminal.file, null);
});

test('two genuinely different declarations of one name are still ambiguous', () => {
  // The alias fix must collapse duplicate spellings of ONE declaration without
  // blinding the resolver to real collisions.
  const root = makeTree(
    {
      'src/left/index.ts': 'export const Widget = () => null;\n',
      'src/right/index.ts': 'export const Widget = () => null;\n',
      'src/index.ts': "export * from './left';\nexport * from './right';\n",
    },
    { tsconfig: ALIAS_TSCONFIG },
  );

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  assert.equal(resolver.resolve('Widget').state, 'AMBIGUOUS');
});

test('an Object.assign compound is component-shaped, chasing its first argument', () => {
  // 36 public exports use this idiom, Button among them. Reading them as plain
  // values is the dangerous direction for the reverse projection.
  const root = makeTree({
    'src/button/index.tsx': [
      'const ButtonComponent = () => null;',
      'const ButtonGroup = () => null;',
      'export const Button = Object.assign(ButtonComponent, { Group: ButtonGroup });',
    ].join('\n'),
    'src/index.ts': "export * from './button';\n",
  });

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  const resolution = resolver.resolve('Button');
  assert.equal(resolution.state, 'VALUE');
  assert.ok(resolver.isComponentShaped(resolution), 'Object.assign compound must read as a component');
});

test('Object.assign over a non-component is not a component', () => {
  // The chase must follow the first argument, not wave through every
  // `Object.assign`. A merged config object is not renderable.
  const root = makeTree({
    'src/config/index.ts': [
      'const base = { a: 1 };',
      'export const Settings = Object.assign(base, { b: 2 });',
    ].join('\n'),
    'src/index.ts': "export * from './config';\n",
  });

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  const resolution = resolver.resolve('Settings');
  assert.equal(resolution.state, 'VALUE');
  assert.equal(resolver.isComponentShaped(resolution), false);
});

test('an Object.assign whose base arrives by import is still chased', () => {
  const root = makeTree({
    'src/base/index.tsx': 'export const Base = () => null;\n',
    'src/thing/index.tsx': [
      "import { Base } from '../base';",
      'export const Thing = Object.assign(Base, { Slot: () => null });',
    ].join('\n'),
    'src/index.ts': "export { Thing } from './thing';\n",
  });

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  assert.ok(resolver.isComponentShaped(resolver.resolve('Thing')));
});

test('a self-referential Object.assign terminates instead of hanging', () => {
  const root = makeTree({
    'src/loop/index.ts': 'export const Loop = Object.assign(Loop, { a: 1 });\n',
    'src/index.ts': "export * from './loop';\n",
  });

  const resolver = createRootPublicResolver({ entryFile: path.join(root, 'src/index.ts') });
  assert.equal(resolver.isComponentShaped(resolver.resolve('Loop')), false);
});

test('a malformed tsconfig throws rather than silently dropping aliases', () => {
  // Degrading to "no aliases" would reintroduce the false ambiguity quietly,
  // which is the exact failure this resolver exists to prevent.
  const root = makeTree({ 'tsconfig.json': '{ "compilerOptions": { "paths": ' });
  assert.throws(
    () => loadPathAliases(loadTypeScript(), path.join(root, 'tsconfig.json')),
    /cannot parse/,
  );
});

test('a tsconfig with no paths yields no aliases rather than throwing', () => {
  const root = makeTree({ 'tsconfig.json': '{ "compilerOptions": { "strict": true } }' });
  assert.deepEqual(loadPathAliases(loadTypeScript(), path.join(root, 'tsconfig.json')), []);
});
