import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  CLIENT_ROOT_SPECIFIER,
  DRILLS,
  SERVER_BOUNDARY_SPECIFIER,
  audit,
  boundarySymbols,
  hasClientDirective,
  runDrill,
} from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '../../../..');

test('the repository tree is clean', () => {
  const result = audit();
  assert.equal(
    result.findings.length,
    0,
    result.findings.map((finding) => `${finding.file}:${finding.line} ${finding.symbol}`).join('\n'),
  );
  assert.ok(result.symbols.length > 0, 'the gate policed nothing');
});

test('the policed set is read from the boundary, not spelled in the gate', () => {
  const symbols = boundarySymbols(CORE_ROOT);
  assert.ok(symbols.size > 0, 'the boundary republishes nothing from the identity owner');
  const gate = readFileSync(resolve(HERE, 'index.mjs'), 'utf8');
  for (const symbol of symbols) {
    assert.ok(!gate.includes(symbol), `${symbol} is spelled in the gate; the set must be derived`);
  }
});

test('every drill class lands in the direction it declares', () => {
  for (const name of Object.keys(DRILLS)) {
    const { twin, planted } = runDrill(name);
    assert.equal(twin.length, 0, `${name}: the unmutated twin reported ${twin.length} finding(s)`);
    assert.ok(planted.length > 0, `${name}: the planted violation was not reported`);
  }
});

test('a module is a client module only through its directive prologue', () => {
  assert.equal(hasClientDirective("'use client';\nexport const a = 1;\n"), true);
  assert.equal(hasClientDirective('export const a = 1;\n'), false);
  assert.equal(hasClientDirective('/* note */\n"use client";\n'), true);
  assert.equal(hasClientDirective("export const a = 1;\n'use client';\n"), false);
});

test('the two specifiers are distinct doors', () => {
  assert.notEqual(CLIENT_ROOT_SPECIFIER, SERVER_BOUNDARY_SPECIFIER);
  assert.ok(SERVER_BOUNDARY_SPECIFIER.startsWith(`${CLIENT_ROOT_SPECIFIER}/`));
});

/**
 * The detector's own arms, each with the twin that must stay green.
 *
 * R102-01: the first draft read names off the import declaration only, so a
 * dynamic `import()` or a `require()` destructure bound the roster invisibly,
 * and an erased `import type` was reported as if it shipped.
 */
const VALUE = [...boundarySymbols(CORE_ROOT)].sort().find((name) => name.startsWith('ADMITTED'));
const TYPE = [...boundarySymbols(CORE_ROOT)].find((name) => name === 'EngineName');
const ROOT = "'@rottay/design-system'";
const DOOR = "'@rottay/design-system/server'";

const ARMS = [
  ['static named import',
    `import { ${VALUE} } from ${ROOT};\nexport const a = [...${VALUE}];\n`,
    `import { ${VALUE} } from ${DOOR};\nexport const a = [...${VALUE}];\n`],
  ['static named import, aliased',
    `import { ${VALUE} as r } from ${ROOT};\nexport const a = [...r];\n`,
    `import { ${VALUE} as r } from ${DOOR};\nexport const a = [...r];\n`],
  ['type-only import clause',
    `import { ${VALUE} } from ${ROOT};\nexport const a = ${VALUE};\n`,
    `import type { ${TYPE} } from ${ROOT};\nexport type A = ${TYPE};\n`],
  ['inline type modifier',
    `import { ${VALUE}, type ${TYPE} } from ${ROOT};\nexport const a: ${TYPE}[] = [...${VALUE}];\n`,
    `import { type ${TYPE} } from ${ROOT};\nexport type A = ${TYPE};\n`],
  ['re-export',
    `export { ${VALUE} } from ${ROOT};\n`,
    `export type { ${TYPE} } from ${ROOT};\n`],
  ['namespace import',
    `import * as ds from ${ROOT};\nexport const a = ds;\n`,
    `import * as ds from ${DOOR};\nexport const a = ds;\n`],
  ['dynamic import destructure',
    `export async function a() {\n  const { ${VALUE} } = await import(${ROOT});\n  return [...${VALUE}];\n}\n`,
    `export async function a() {\n  const { ${VALUE} } = await import(${DOOR});\n  return [...${VALUE}];\n}\n`],
  ['dynamic import destructure, aliased',
    `export async function a() {\n  const { ${VALUE}: r } = await import(${ROOT});\n  return [...r];\n}\n`,
    `export async function a() {\n  const { unpoliced: r } = await import(${ROOT});\n  return r;\n}\n`],
  ['dynamic import property access',
    `export async function a() {\n  return [...(await import(${ROOT})).${VALUE}];\n}\n`,
    `export async function a() {\n  return (await import(${ROOT})).unpoliced;\n}\n`],
  ['require destructure',
    `const { ${VALUE} } = require(${ROOT});\nexport const a = [...${VALUE}];\n`,
    `const { ${VALUE} } = require(${DOOR});\nexport const a = [...${VALUE}];\n`],
  ['require destructure, aliased',
    `const { ${VALUE}: r } = require(${ROOT});\nexport const a = [...r];\n`,
    `const { unpoliced: r } = require(${ROOT});\nexport const a = r;\n`],
  ['client module keeps the client root',
    `import { ${VALUE} } from ${ROOT};\nexport const a = [...${VALUE}];\n`,
    `'use client';\nimport { ${VALUE} } from ${ROOT};\nexport const a = [...${VALUE}];\n`],
  ['import type position',
    `import { ${VALUE} } from ${ROOT};\nexport const a = ${VALUE};\n`,
    `export type A = typeof import(${ROOT});\n`],
];

function findingsFor(source) {
  const root = mkdtempSync(join(tmpdir(), 'rsc-client-root-arm-'));
  try {
    writeFileSync(join(root, 'index.ts'), source);
    return audit({ coreRoot: CORE_ROOT, consumerRoots: [root] }).findings;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('the policed set carries both a value and a type name', () => {
  assert.ok(VALUE, 'no value symbol on the boundary');
  assert.ok(TYPE, 'no type symbol on the boundary');
});

test('every detector arm reports its violation and clears its twin', () => {
  for (const [label, red, green] of ARMS) {
    assert.ok(findingsFor(red).length > 0, `${label}: the violation was not reported`);
    assert.equal(
      findingsFor(green).length,
      0,
      `${label}: the twin reported ${JSON.stringify(findingsFor(green))}`,
    );
  }
});
