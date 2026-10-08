/**
 * Drills for the chrome emitter authority.
 *
 * Every drill plants a whole emitter folder in a tmpdir core root; the real
 * tree is only read. A planted tree that passes must be refused the moment one
 * file is orphaned, unimported, undeclared or stops being data.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { packageRoot } from '../../../repo-root/index.mjs';
import {
  CHROME_EMITTER_DIR,
  CHROME_EMITTER_FILES,
  chromeEmitterClosure,
  chromeEmitterInventory,
  chromeEmitterSources,
  dataOnlyViolations,
} from '../index.mjs';

const CORE_ROOT = packageRoot(dirname(fileURLToPath(import.meta.url)));

const ROOT_SOURCE = `import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";
import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";

import { DRILL_CHROME_VARIABLES } from "./tables";

export function chromeToVariables(chrome: BrandChrome): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [field, name] of Object.entries(DRILL_CHROME_VARIABLES)) vars[name] = String(applyRadiusDial(field));
  return vars;
}
`;

const TABLES_SOURCE = `import type { BrandDrillChrome } from "@/foundation/contracts/composition/tenants/themes";

const chromeVariableMap = <T extends object>(
  prefix: string,
  fields: readonly (keyof T)[]
): Readonly<Record<keyof T, string>> =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      \`\${prefix}\${String(field).replace(
        /[A-Z]/g,
        (letter) => \`-\${letter.toLowerCase()}\`
      )}\`,
    ])
  ) as Readonly<Record<keyof T, string>>;

const DRILL_FAMILY_VARIABLES = chromeVariableMap<BrandDrillChrome>("--ds-drill-", ["bg", "border"] as const);

export const DRILL_CHROME_VARIABLES = {
  bg: "--ds-drill-bg",
  nested: [["drill", DRILL_FAMILY_VARIABLES]],
} as const satisfies Readonly<Record<string, unknown>>;
`;

function plant(overrides = {}) {
  const core = mkdtempSync(join(tmpdir(), 'chrome-emitter-drill-'));
  const files = {
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE,
    [`${CHROME_EMITTER_DIR}/tables/index.ts`]: TABLES_SOURCE,
    [`${CHROME_EMITTER_DIR}/tests/frozen.test.ts`]: 'import { chromeToVariables } from "..";\n',
    'src/foundation/kernel/geometry/radius-dial/index.ts': 'export const applyRadiusDial = (value: string) => value;\n',
    ...overrides,
  };
  for (const [rel, text] of Object.entries(files)) {
    if (text === null) continue;
    mkdirSync(dirname(join(core, rel)), { recursive: true });
    writeFileSync(join(core, rel), text);
  }
  test.after(() => rmSync(core, { recursive: true, force: true }));
  return core;
}

const emitterDir = (core) => join(core, CHROME_EMITTER_DIR);

test('the shipped emitter is exactly its two declared members, root first', () => {
  assert.deepEqual(
    CHROME_EMITTER_FILES.map((entry) => `${entry.role}:${entry.path}`),
    ['root:index.ts', 'data:tables/index.ts'],
  );
  assert.deepEqual(
    chromeEmitterSources(CORE_ROOT),
    CHROME_EMITTER_FILES.map((entry) => join(CORE_ROOT, CHROME_EMITTER_DIR, entry.path)),
  );
  assert.deepEqual(chromeEmitterClosure(CORE_ROOT), ['index.ts', 'tables/index.ts']);
  assert.deepEqual(chromeEmitterInventory(emitterDir(CORE_ROOT)), ['index.ts', 'tables/index.ts']);
  const tables = join(CORE_ROOT, CHROME_EMITTER_DIR, 'tables/index.ts');
  assert.deepEqual(dataOnlyViolations(tables, readFileSync(tables, 'utf8')), []);
});

test('a planted two-member emitter is admitted', () => {
  const core = plant();
  assert.deepEqual(chromeEmitterSources(core), [
    join(emitterDir(core), 'index.ts'),
    join(emitterDir(core), 'tables/index.ts'),
  ]);
});

test('an orphan productive file under the folder is refused', () => {
  const core = plant({ [`${CHROME_EMITTER_DIR}/orphan/index.ts`]: 'export const ORPHAN = { a: "--ds-orphan" } as const;\n' });
  assert.throws(() => chromeEmitterSources(core), /orphan orphan\/index\.ts is not imported by the root/);
});

test('a free-standing leaf file is inventory too, so it cannot hide as an orphan', () => {
  const core = plant({ [`${CHROME_EMITTER_DIR}/tables/extra.ts`]: 'export const EXTRA = ["--ds-extra"] as const;\n' });
  assert.throws(() => chromeEmitterSources(core), /orphan tables\/extra\.ts/);
});

test('a declared member the root does not import is refused (the one-member tree)', () => {
  const core = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export function chromeToVariables() { return {}; }\n' });
  assert.throws(() => chromeEmitterSources(core), /declared tables\/index\.ts is not imported by the root/);
});

test('a new undeclared import inside the folder is refused', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { WRITER } from "./writers";\n`,
    [`${CHROME_EMITTER_DIR}/writers/index.ts`]: 'export const WRITER = { a: "--ds-writer" } as const;\n',
  });
  assert.throws(() => chromeEmitterSources(core), /undeclared writers\/index\.ts is imported by the root/);
});

test('an import that resolves to no file inside the folder is refused', () => {
  const core = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { GONE } from "./gone";\n` });
  assert.throws(() => chromeEmitterSources(core), /imports "\.\/gone", which resolves to no file/);
});

test('type-only imports are not edges', () => {
  for (const line of [
    'import type { DRILL_CHROME_VARIABLES } from "./tables";',
    'import { type DRILL_CHROME_VARIABLES } from "./tables";',
    'export type { DRILL_CHROME_VARIABLES } from "./tables";',
  ]) {
    const core = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: `${line}\nexport function chromeToVariables() { return {}; }\n` });
    assert.deepEqual(chromeEmitterClosure(core), ['index.ts'], line);
    assert.throws(() => chromeEmitterSources(core), /declared tables\/index\.ts is not imported/, line);
  }
});

test('an import inside a comment or a string is not an edge', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]:
      '// import { DRILL_CHROME_VARIABLES } from "./tables";\n' +
      '/* export * from "./tables"; */\n' +
      'export const NOTE = \'import { DRILL_CHROME_VARIABLES } from "./tables"\';\n',
  });
  assert.deepEqual(chromeEmitterClosure(core), ['index.ts']);
});

test('the @/ alias resolves to the same member as the relative specifier', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE.replace(
      '"./tables"',
      `"@/${CHROME_EMITTER_DIR.slice('src/'.length)}/tables"`,
    ),
  });
  assert.deepEqual(chromeEmitterClosure(core), ['index.ts', 'tables/index.ts']);
  assert.equal(chromeEmitterSources(core).length, 2);
});

test('re-exports and dynamic imports are value edges', () => {
  const reexport = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export { DRILL_CHROME_VARIABLES } from "./tables";\n' });
  assert.deepEqual(chromeEmitterClosure(reexport), ['index.ts', 'tables/index.ts']);
  const dynamic = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export const load = () => import("./tables");\n' });
  assert.deepEqual(chromeEmitterClosure(dynamic), ['index.ts', 'tables/index.ts']);
});

test('tests/ is neither inventory nor an edge', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { helper } from "./tests/helper";\n`,
    [`${CHROME_EMITTER_DIR}/tests/helper/index.ts`]: 'export const helper = 1;\n',
  });
  assert.deepEqual(chromeEmitterInventory(emitterDir(core)), ['index.ts', 'tables/index.ts']);
  assert.deepEqual(chromeEmitterClosure(core), ['index.ts', 'tables/index.ts']);
  assert.equal(chromeEmitterSources(core).length, 2);
});

test('an import that leaves the folder (radius-dial) is not a member', () => {
  const core = plant();
  assert.ok(!chromeEmitterClosure(core).some((member) => member.includes('radius-dial')));
});

test('the data-only grammar admits the shipped shapes', () => {
  assert.deepEqual(dataOnlyViolations('tables.ts', TABLES_SOURCE), []);
});

test('every writer shape planted in a data member is refused', () => {
  const header = 'import type { BrandDrillChrome } from "@/foundation/contracts/composition/tenants/themes";\n';
  const mutants = {
    'element-assignment': 'const vars: Record<string, string> = {};\nvars["--ds-x"] = "1";\n',
    'function declaration': 'export function setDrillVars(vars: Record<string, string>) { vars["--ds-x"] = "1"; }\n',
    'value import': 'import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";\n',
    'mixed type import': 'import { type BrandChrome } from "@/foundation/contracts/composition/tenants/themes";\n',
    'expression statement': 'console.log("--ds-x");\n',
    'second helper': 'const writeVars = (vars: Record<string, string>) => vars;\n',
    'computed initializer': 'export const NAMES = Object.keys({ a: 1 });\n',
    'non-const binding': 'export let NAMES = ["--ds-x"];\n',
    'computed key': 'export const NAMES = { ["--ds-x"]: "a" };\n',
    'writer inside the admitted helper': 'const chromeVariableMap = (vars: Record<string, string>) => { vars.a = "--ds-x"; return vars; };\n',
    're-export': 'export { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";\n',
  };
  for (const [label, body] of Object.entries(mutants)) {
    assert.notDeepEqual(dataOnlyViolations('tables.ts', `${header}${body}`), [], label);
    const core = plant({ [`${CHROME_EMITTER_DIR}/tables/index.ts`]: `${TABLES_SOURCE}${body}` });
    assert.throws(() => chromeEmitterSources(core), /data member tables\/index\.ts is not data only/, label);
  }
});

test('the root is not held to the data grammar: writers live there', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}function setExtraVars(vars: Record<string, string>) { vars["--ds-extra"] = "1"; }\n`,
  });
  assert.equal(chromeEmitterSources(core).length, 2);
});

test('the canonical API has no member override: extra options cannot change the authority', () => {
  assert.equal(chromeEmitterSources.length, 1);
  const oneMember = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export function chromeToVariables() { return {}; }\n' });
  const override = { files: [{ path: 'index.ts', role: 'root' }], emitterDir: emitterDir(oneMember) };
  assert.throws(() => chromeEmitterSources(oneMember, override), /declared tables\/index\.ts is not imported by the root/);
  const valid = plant();
  const elsewhere = plant({ [`${CHROME_EMITTER_DIR}/orphan/index.ts`]: 'export const ORPHAN = ["--ds-orphan"] as const;\n' });
  assert.deepEqual(
    chromeEmitterSources(valid, { files: [{ path: 'orphan/index.ts', role: 'root' }], emitterDir: emitterDir(elsewhere) }),
    [join(emitterDir(valid), 'index.ts'), join(emitterDir(valid), 'tables/index.ts')],
  );
});

test('only the exact existing helper is admitted; formatting and comments do not matter', () => {
  const header = 'import type { BrandDrillChrome } from "@/foundation/contracts/composition/tenants/themes";\n';
  const reformatted = TABLES_SOURCE.replace(
    /const chromeVariableMap[\s\S]*?as Readonly<Record<keyof T, string>>;\n/,
    '// identity of the shipped helper, reflowed\nconst chromeVariableMap = <T extends object>(prefix: string, fields: readonly (keyof T)[]): Readonly<Record<keyof T, string>> => Object.fromEntries(fields.map((field) => [field, `${prefix}${String(field).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`])) as Readonly<Record<keyof T, string>>;\n',
  );
  assert.notEqual(reformatted, TABLES_SOURCE);
  assert.deepEqual(dataOnlyViolations('tables.ts', reformatted), []);
  const signature = 'const chromeVariableMap = <T extends object>(prefix: string, fields: readonly (keyof T)[]): Readonly<Record<keyof T, string>> =>';
  const helpers = {
    'side-effect call, no assignment': `${signature} (console.log(prefix), Object.fromEntries(fields.map((field) => [field, prefix]))) as Readonly<Record<keyof T, string>>;\n`,
    'network call': `${signature} (fetch(prefix) as never);\n`,
    'identity of a parameter': 'const chromeVariableMap = <T extends object>(fields: Readonly<Record<keyof T, string>>) => fields;\n',
    'wrong identifier': 'const chromeVariableMap = (fields: unknown) => other;\n',
    'block body': `${signature} { return Object.fromEntries(fields.map((field) => [field, prefix])) as Readonly<Record<keyof T, string>>; };\n`,
    'IIFE': 'const chromeVariableMap = (() => { globalThis.x = 1; return (fields: unknown) => fields; })();\n',
    'async arrow': 'const chromeVariableMap = async (fields: unknown) => fields;\n',
    'function expression': 'const chromeVariableMap = function (fields: unknown) { return fields; };\n',
    'one-token semantic change': TABLES_SOURCE.match(/const chromeVariableMap[\s\S]*?as Readonly<Record<keyof T, string>>;\n/)[0].replace('toLowerCase', 'toUpperCase'),
  };
  for (const [label, helper] of Object.entries(helpers)) {
    assert.match(dataOnlyViolations('tables.ts', `${header}${helper}`).join(' '), /chromeVariableMap/, label);
    const core = plant({
      [`${CHROME_EMITTER_DIR}/tables/index.ts`]: TABLES_SOURCE.replace(/const chromeVariableMap[\s\S]*?as Readonly<Record<keyof T, string>>;\n/, helper),
    });
    assert.throws(() => chromeEmitterSources(core), /data member tables\/index\.ts is not data only/, label);
  }
});

test('whitespace inside a helper literal is significant; formatting outside literals is not', () => {
  const header = 'import type { BrandDrillChrome } from "@/foundation/contracts/composition/tenants/themes";\n';
  const shipped = TABLES_SOURCE.match(/const chromeVariableMap[\s\S]*?as Readonly<Record<keyof T, string>>;\n/)[0];
  const reformatted = TABLES_SOURCE.replace(
    shipped,
    '// identity of the shipped helper, reflowed\nconst chromeVariableMap = <T extends object>(prefix: string, fields: readonly (keyof T)[]): Readonly<Record<keyof T, string>> => Object.fromEntries(fields.map((field) => [field, `${prefix}${String(field).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`])) as Readonly<Record<keyof T, string>>;\n',
  );
  assert.notEqual(reformatted, TABLES_SOURCE);
  assert.deepEqual(dataOnlyViolations('tables.ts', reformatted), []);
  const mutants = {
    'template-space': ['`${prefix}${String(field)', '`${prefix} ${String(field)'],
    'nested-template-space': ['`-${letter.toLowerCase()}`', '`- ${letter.toLowerCase()}`'],
    'regex-class-space': ['/[A-Z]/g', '/[A-Z ]/g'],
  };
  for (const [label, [from, to]] of Object.entries(mutants)) {
    assert.ok(shipped.includes(from), label);
    const helper = shipped.replace(from, to);
    assert.notEqual(helper, shipped, label);
    assert.match(dataOnlyViolations('tables.ts', `${header}${helper}`).join(' '), /chromeVariableMap/, label);
    const core = plant({ [`${CHROME_EMITTER_DIR}/tables/index.ts`]: TABLES_SOURCE.replace(shipped, helper) });
    assert.throws(() => chromeEmitterSources(core), /data member tables\/index\.ts is not data only/, label);
  }
});
