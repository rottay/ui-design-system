/**
 * Drills for the chrome emitter authority.
 *
 * Every drill plants a whole emitter folder in a tmpdir core root; the real
 * tree is only read. A planted tree that passes must be refused the moment one
 * file is orphaned, unimported, undeclared or stops being data.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  CHROME_EMITTER_DIR,
  CHROME_EMITTER_FILES,
  chromeEmitterClosure,
  chromeEmitterInventory,
  chromeEmitterRoleViolations,
  chromeEmitterSectionImporters,
  chromeEmitterSources,
  chromeEmitterWriterImporters,
  dataOnlyViolations,
  writerViolations,
} from '../index.mjs';

import { CORE_ROOT, DRILL_WRITER, PLANTED_MEMBERS, ROOT_SOURCE, TABLES_SOURCE, W, WRITERS_SOURCE, WRITER_HEAD, emitterDir, plant, writerOf } from './support/index.mjs';

const SHIPPED_SECTIONS = ['sections/buttons/index.ts', 'sections/containers/index.ts', 'sections/fields/index.ts', 'sections/frame/index.ts'];

test('the shipped emitter is exactly its declared members, root first, in sorted order, each section declared by path', () => {
  assert.deepEqual(
    CHROME_EMITTER_FILES.map((entry) => `${entry.role}:${entry.path}`),
    ['root:index.ts', ...SHIPPED_SECTIONS.map((path) => `section:${path}`), 'data:tables/index.ts', 'writer:writers/index.ts'],
  );
  assert.deepEqual(CHROME_EMITTER_FILES.map((entry) => entry.path), PLANTED_MEMBERS, 'declared order is the sorted closure');
  assert.deepEqual(
    chromeEmitterSectionImporters(CORE_ROOT),
    Object.fromEntries(SHIPPED_SECTIONS.map((path) => [path, [`${CHROME_EMITTER_DIR}/index.ts`]])),
  );
  assert.deepEqual(
    chromeEmitterSources(CORE_ROOT),
    CHROME_EMITTER_FILES.map((entry) => join(CORE_ROOT, CHROME_EMITTER_DIR, entry.path)),
  );
  assert.deepEqual(chromeEmitterClosure(CORE_ROOT), ['index.ts', ...SHIPPED_SECTIONS, 'tables/index.ts', 'writers/index.ts']);
  assert.deepEqual(chromeEmitterInventory(emitterDir(CORE_ROOT)), ['index.ts', ...SHIPPED_SECTIONS, 'tables/index.ts', 'writers/index.ts']);
  const tables = join(CORE_ROOT, CHROME_EMITTER_DIR, 'tables/index.ts');
  assert.deepEqual(dataOnlyViolations(tables, readFileSync(tables, 'utf8')), []);
});

test('a planted emitter holding the shipped list is admitted', () => {
  const core = plant();
  assert.deepEqual(
    chromeEmitterSources(core),
    CHROME_EMITTER_FILES.map((entry) => join(emitterDir(core), entry.path)),
  );
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
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { UNDECLARED } from "./undeclared";\n`,
    [`${CHROME_EMITTER_DIR}/undeclared/index.ts`]: 'export const UNDECLARED = { a: "--ds-undeclared" } as const;\n',
  });
  assert.throws(() => chromeEmitterSources(core), /undeclared undeclared\/index\.ts is imported by the root/);
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
  assert.deepEqual(chromeEmitterClosure(core), PLANTED_MEMBERS);
  assert.equal(chromeEmitterSources(core).length, PLANTED_MEMBERS.length);
});

test('re-exports and dynamic imports are value edges', () => {
  const reexport = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export { DRILL_CHROME_VARIABLES } from "./tables";\n' });
  assert.deepEqual(chromeEmitterClosure(reexport), ['index.ts', 'tables/index.ts']);
  const dynamic = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: 'export const load = () => import("./tables");\n' });
  assert.deepEqual(chromeEmitterClosure(dynamic), ['index.ts', 'tables/index.ts']);
});

test('tests/, fixtures/ and stories/ are not inventory, and a member that value-imports into one is refused', () => {
  const hidden = 'function setHiddenVars(vars: Record<string, string>): void {\n  vars["--ds-hidden"] = "1";\n}\n\nexport { setHiddenVars };\n';
  for (const dir of ['tests', 'test', '__tests__', 'fixtures', '__fixtures__', 'stories', 'sections/fixtures']) {
    const unimported = plant({ [`${CHROME_EMITTER_DIR}/${dir}/hidden/index.ts`]: hidden });
    assert.deepEqual(chromeEmitterInventory(emitterDir(unimported)), PLANTED_MEMBERS, dir);
    assert.equal(chromeEmitterSources(unimported).length, PLANTED_MEMBERS.length, dir);
    const imported = plant({
      [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { setHiddenVars } from "./${dir}/hidden";\n`,
      [`${CHROME_EMITTER_DIR}/${dir}/hidden/index.ts`]: hidden,
    });
    const refusal = new RegExp(`index\\.ts imports "\\./${dir}/hidden", which is under a non-productive directory`);
    assert.throws(() => chromeEmitterClosure(imported), refusal, dir);
    assert.throws(() => chromeEmitterSources(imported), refusal, dir);
    const typeOnly = plant({
      [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import type { setHiddenVars } from "./${dir}/hidden";\n`,
      [`${CHROME_EMITTER_DIR}/${dir}/hidden/index.ts`]: hidden,
    });
    assert.equal(chromeEmitterSources(typeOnly).length, PLANTED_MEMBERS.length, `${dir}: a type-only import runs nothing`);
  }
  const missing = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { gone } from "./fixtures/gone";\n` });
  assert.throws(() => chromeEmitterSources(missing), /under a non-productive directory/);
  const viaWriter = plant({
    [`${CHROME_EMITTER_DIR}/writers/index.ts`]: `import { helper } from "./fixtures/helper";\n${WRITERS_SOURCE}`,
    [`${CHROME_EMITTER_DIR}/writers/fixtures/helper/index.ts`]: 'export const helper = 1;\n',
  });
  assert.throws(() => chromeEmitterSources(viaWriter), /writers\/index\.ts imports "\.\/fixtures\/helper", which is under a non-productive directory/);
  for (const name of ['hidden.test.ts', 'hidden.stories.ts', 'hidden.spec.ts']) {
    const byName = plant({
      [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { setHiddenVars } from "./${name.replace(/\.ts$/, '')}";\n`,
      [`${CHROME_EMITTER_DIR}/${name}`]: hidden,
    });
    assert.throws(() => chromeEmitterSources(byName), new RegExp(`undeclared ${name.replace(/\./g, '\\.')} is imported by the root`), name);
  }
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
  assert.equal(chromeEmitterSources(core).length, PLANTED_MEMBERS.length);
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
    CHROME_EMITTER_FILES.map((entry) => join(emitterDir(valid), entry.path)),
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

/* ── the writer role ─────────────────────────────────────────────────────── */

test('the shipped writer member is admitted by the writer grammar', () => {
  const file = join(CORE_ROOT, CHROME_EMITTER_DIR, 'writers/index.ts');
  assert.deepEqual(writerViolations(file, readFileSync(file, 'utf8')), []);
});

test('the role list is closed: exactly one root, data and writer, and zero or more sections', () => {
  assert.deepEqual(chromeEmitterRoleViolations(CHROME_EMITTER_FILES), []);
  const section = (name) => ({ path: `sections/${name}/index.ts`, role: 'section' });
  const withoutRole = (role) => CHROME_EMITTER_FILES.filter((entry) => entry.role !== role);
  assert.deepEqual(chromeEmitterRoleViolations([...CHROME_EMITTER_FILES, section('drill')]), []);
  assert.deepEqual(chromeEmitterRoleViolations([...CHROME_EMITTER_FILES, section('drill'), section('drill2'), section('drill3')]), []);
  const cases = {
    'two writers': [[...CHROME_EMITTER_FILES, { path: 'writers2/index.ts', role: 'writer' }], /role writer has 2 members, not 1/],
    'two roots beside a section': [[...CHROME_EMITTER_FILES, section('drill'), { path: 'root2/index.ts', role: 'root' }], /role root has 2 members, not 1/],
    'two data members beside a section': [[...CHROME_EMITTER_FILES, section('drill'), { path: 'tables2/index.ts', role: 'data' }], /role data has 2 members, not 1/],
    'two writers beside a section': [[...CHROME_EMITTER_FILES, section('drill'), { path: 'writers2/index.ts', role: 'writer' }], /role writer has 2 members, not 1/],
    'role typo': [[...withoutRole('writer'), { path: 'writers/index.ts', role: 'writter' }], /unknown role "writter"/],
    'section typo': [[...CHROME_EMITTER_FILES, { path: 'sections/drill/index.ts', role: 'sections' }], /unknown role "sections"/],
    'no data member': [withoutRole('data'), /role data has 0 members, not 1/],
    'sections cannot stand in for a singleton': [[...withoutRole('writer'), section('drill')], /role writer has 0 members, not 1/],
    'a section declared twice': [[...CHROME_EMITTER_FILES, section('drill'), section('drill')], /sections\/drill\/index\.ts is declared twice/],
    'one path under two roles': [[...CHROME_EMITTER_FILES, { path: 'writers/index.ts', role: 'section' }], /writers\/index\.ts is declared twice/],
  };
  for (const [label, [files, refusal]] of Object.entries(cases)) assert.match(chromeEmitterRoleViolations(files).join('; '), refusal, label);
});

test('a second writer member is undeclared and refused', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}import { setOtherVars } from "./writers2";\n`,
    [`${CHROME_EMITTER_DIR}/writers2/index.ts`]: writerOf('function setOtherVars(vars: Record<string, string>): void {\n  vars["--ds-other"] = "1";\n}\n', 'setOtherVars'),
  });
  assert.throws(() => chromeEmitterSources(core), /undeclared writers2\/index\.ts is imported by the root/);
});

test('every shape outside the writer grammar is refused', () => {
  const mutants = {
    'writer imports the root': `import { chromeToVariables } from "..";\n${writerOf(DRILL_WRITER)}`,
    'writer imports radius-dial': `import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";\n${writerOf(DRILL_WRITER)}`,
    'const table in a writer': writerOf(`const LOCAL_VARIABLES = { a: "--ds-local" } as const;\n${DRILL_WRITER}`),
    'second helper in a writer': writerOf(`const chromeVariableMap = (fields: unknown) => fields;\n${DRILL_WRITER}`),
    'function named chromeVariableMap': writerOf(`function chromeVariableMap(fields: unknown) { return fields; }\n${DRILL_WRITER}`, 'setDrillVars, chromeVariableMap'),
    'private non-exported writer': writerOf(`${DRILL_WRITER}function setHiddenVars(vars: Record<string, string>): void {\n  vars["--ds-hidden"] = "1";\n}\n`),
    'export list names a missing writer': writerOf(DRILL_WRITER, 'setDrillVars, setGhostVars'),
    'aliased export': writerOf(DRILL_WRITER, 'setDrillVars as setAliasVars'),
    'inline export function': `${WRITER_HEAD}\nexport ${DRILL_WRITER}`,
    'default export': `${WRITER_HEAD}\n${DRILL_WRITER}\nexport default setDrillVars;\n`,
    're-export': `${writerOf(DRILL_WRITER)}export type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";\n`,
    'export list not trailing': `${WRITER_HEAD}\nexport { setDrillVars };\n${DRILL_WRITER}`,
    'expression statement': writerOf(`${DRILL_WRITER}console.log("--ds-x");\n`),
    'class': writerOf(`${DRILL_WRITER}class Writer {}\n`),
    'enum': writerOf(`${DRILL_WRITER}enum Mode { A }\n`),
    'async writer': writerOf('async function setDrillVars(vars: Record<string, string>): Promise<void> {\n  vars["--ds-x"] = "1";\n}\n'),
    'writer calls writer': writerOf(`${DRILL_WRITER}function setMoreVars(vars: Record<string, string>, chrome: BrandChrome): void {\n  setDrillVars(vars, chrome);\n}\n`, 'setDrillVars, setMoreVars'),
    'template key without substitution': writerOf('function setDrillVars(vars: Record<string, string>): void {\n  vars[`--ds-drill-bg`] = "1";\n}\n'),
  };
  for (const [label, text] of Object.entries(mutants)) {
    const core = plant({ [W]: text });
    assert.throws(() => chromeEmitterSources(core), /writer member writers\/index\.ts is not a writer/, label);
  }
});

test('a writer value-imports nothing, not even the data member (sibling-owner-dependency); a type-only import is not an edge', () => {
  const dataImport = 'import { DRILL_CHROME_VARIABLES } from "../tables";\n';
  for (const specifier of ['"../tables"', `"@/${CHROME_EMITTER_DIR.slice('src/'.length)}/tables"`]) {
    const text = `${dataImport.replace('"../tables"', specifier)}${WRITERS_SOURCE}`;
    assert.match(writerViolations('writers.ts', text).join(' '), /value import of .* \(sibling-owner-dependency\)/, specifier);
    const core = plant({ [W]: text });
    assert.throws(() => chromeEmitterSources(core), /writer member writers\/index\.ts is not a writer: :1 value import of .* \(sibling-owner-dependency\)/, specifier);
  }
  const typeOnly = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE.replace('import { DRILL_CHROME_VARIABLES } from "./tables";\n', ''),
    [W]: 'import type { DRILL_CHROME_VARIABLES } from "../tables";\n\nfunction setDrillVars(vars: Record<string, string>): void {\n  vars["--ds-drill"] = "1";\n}\n\nexport { setDrillVars };\n',
  });
  assert.deepEqual(chromeEmitterClosure(typeOnly), PLANTED_MEMBERS.filter((member) => member !== 'tables/index.ts'));
  assert.throws(() => chromeEmitterSources(typeOnly), /declared tables\/index\.ts is not imported by the root/);
});

test('the root must import exactly the exported writers and may not shadow one', () => {
  const dead = plant({
    [W]: writerOf(`${DRILL_WRITER}function setSpareVars(vars: Record<string, string>): void {\n  vars["--ds-spare"] = "1";\n}\n`, 'setDrillVars, setSpareVars'),
  });
  assert.throws(() => chromeEmitterSources(dead), /the root imports \[setDrillVars\] from the writer, not its writers \[setDrillVars, setSpareVars\]/);
  const shadow = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_SOURCE}function setDrillVars(vars: Record<string, string>): void {\n  vars["--ds-shadow"] = "1";\n}\n`,
  });
  assert.throws(() => chromeEmitterSources(shadow), /the root shadows writer setDrillVars/);
  const namespace = plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE.replace('import { setDrillVars } from "./writers";', 'import * as writers from "./writers";\nconst setDrillVars = writers.setDrillVars;') });
  assert.throws(() => chromeEmitterSources(namespace), /the root imports \[<non-named import>\] from the writer/);
});

test('a writer planted in the data member, or a data member importing writers, is refused', () => {
  const shippedWriters = readFileSync(join(CORE_ROOT, CHROME_EMITTER_DIR, 'writers/index.ts'), 'utf8');
  const shippedWriter = shippedWriters.match(/function setSurfaceChromeVars\([\s\S]*?\n}\n/)[0];
  assert.match(dataOnlyViolations('tables.ts', `${TABLES_SOURCE}${shippedWriter}`).join(' '), /FunctionDeclaration/);
  const writerInData = plant({ [`${CHROME_EMITTER_DIR}/tables/index.ts`]: `${TABLES_SOURCE}${shippedWriter}` });
  assert.throws(() => chromeEmitterSources(writerInData), /data member tables\/index\.ts is not data only/);
  const dataImportsWriters = plant({ [`${CHROME_EMITTER_DIR}/tables/index.ts`]: `import { setDrillVars } from "../writers";\n${TABLES_SOURCE}` });
  assert.throws(() => chromeEmitterSources(dataImportsWriters), /data member tables\/index\.ts is not data only: :1 value import/);
});

/* ── a bare identifier is data only as an earlier const of the same member ── */

test('an identifier is data only when it names an earlier admitted const of the same member', () => {
  const header = 'import type { BrandDrillChrome, BRAND_TYPE_ONLY } from "@/foundation/contracts/composition/tenants/themes";\n';
  const helper = TABLES_SOURCE.match(/const chromeVariableMap[\s\S]*?as Readonly<Record<keyof T, string>>;\n/)[0];
  assert.deepEqual(
    dataOnlyViolations('tables.ts', `${header}${helper}const PREFIX = "--ds-drill-";\nconst FIELDS = ["bg"] as const;\nconst A = { bg: "--ds-a" } as const;\nconst LIST = [["a", A]] as const;\nconst MAPPED = chromeVariableMap<BrandDrillChrome>(PREFIX, FIELDS);\n`),
    [],
  );
  const refused = {
    globalThis: 'const A = [globalThis] as const;\n',
    undefined: 'const A = { a: undefined };\n',
    NaN: 'const A = [NaN];\n',
    'forward reference': 'const A = [B];\nconst B = { b: "--ds-b" };\n',
    'self reference': 'const A = [A];\n',
    'helper alias': 'const A = chromeVariableMap;\n',
    'helper inside data': 'const A = [chromeVariableMap];\n',
    'type-only name': 'const A = [BRAND_TYPE_ONLY];\n',
    'name from another member': 'const A = [setDrillVars];\n',
    'refused const reused': 'const B = Object.keys({});\nconst A = [B];\n',
    'forward identifier inside helper args': 'const A = chromeVariableMap<BrandDrillChrome>(LATER, ["bg"] as const);\nconst LATER = "--ds-later-";\n',
    spread: 'const B = { b: "--ds-b" };\nconst A = { ...B };\n',
    shorthand: 'const B = "--ds-b";\nconst A = { B };\n',
    'array spread': 'const B = ["--ds-b"];\nconst A = [...B];\n',
  };
  for (const [label, body] of Object.entries(refused)) {
    assert.match(dataOnlyViolations('tables.ts', `${header}${helper}${body}`).join(' '), /is not data/, label);
    const core = plant({ [`${CHROME_EMITTER_DIR}/tables/index.ts`]: `${TABLES_SOURCE}${body}` });
    assert.throws(() => chromeEmitterSources(core), /data member tables\/index\.ts is not data only/, label);
  }
});

/* ── template keys in a writer: the two live shapes, nothing else ────────── */

const LIVE_TEMPLATE_WRITERS = () => {
  const writers = readFileSync(join(CORE_ROOT, CHROME_EMITTER_DIR, 'writers/index.ts'), 'utf8');
  return ['setButtonVariantVars', 'setLegacyButtonHoverBgAlias', 'setControlSizeVars', 'setSegmentedSizeVars', 'setPremiumCardVars'].map(
    (name) => writers.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n}\\n`))[0],
  );
};

test('a writer may key a channel by a template whose holes are its parameters or a key-prefix const (the live shapes)', () => {
  const live = LIVE_TEMPLATE_WRITERS();
  const names = live.map((body) => /^function (\w+)/.exec(body)[1]);
  const text = `${WRITER_HEAD}\n${live.join('\n')}\nexport { ${names.join(', ')} };\n`;
  assert.deepEqual(writerViolations('writers.ts', text), []);
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE.replace(
      'import { setDrillVars } from "./writers";',
      'import { setDrillVars, setPrefixVars } from "./writers";',
    ).replace('  setDrillVars(vars, chrome);\n', '  setDrillVars(vars, chrome);\n  setPrefixVars(vars, "primary", "1");\n'),
    [W]: writerOf(
      `${DRILL_WRITER}function setPrefixVars(vars: Record<string, string>, variant: string, value: string): void {\n  const prefix = \`--ds-drill-\${variant}\`;\n  vars[\`\${prefix}-bg\`] = value;\n  vars[\`--ds-drill-\${variant}-color\`] = value;\n}\n`,
      'setDrillVars, setPrefixVars',
    ),
  });
  assert.equal(chromeEmitterSources(core).length, PLANTED_MEMBERS.length);
});

test('every other template shape in a writer is refused', () => {
  const fn = (body, params = 'vars: Record<string, string>, prefix: string, value: string') =>
    writerOf(`function setDrillVars(${params}): void {\n${body}\n}\n`);
  const mutants = {
    'whole-key template const': fn('  const key = `--ds-${prefix}-bg`;\n  vars[key] = value;'),
    'identifier key bound to a template': fn('  const name = `--ds-${prefix}`;\n  vars[name] = value;\n  vars[`${name}-bg`] = value;'),
    'template passed as an argument': fn('  console.log(`--ds-${prefix}`);'),
    'template returned': fn('  return `--ds-${prefix}` as never;'),
    'let-bound template': fn('  let prefixName = `--ds-${prefix}`;\n  vars[`${prefixName}-bg`] = value;'),
    'var-bound template': fn('  var prefixName = `--ds-${prefix}`;\n  vars[`${prefixName}-bg`] = value;'),
    'template in a nested function': fn('  [1].forEach(() => {\n    vars[`--ds-${prefix}-bg`] = value;\n  });'),
    'template object key': fn('  Object.assign(vars, { [`--ds-${prefix}-bg`]: value });'),
    'template key read, not assigned': fn('  const current = vars[`--ds-${prefix}-bg`];\n  void current;'),
    'compound assignment': fn('  vars[`--ds-${prefix}-bg`] += value;'),
    'key on an object other than vars': fn('  const out: Record<string, string> = {};\n  out[`--ds-${prefix}-bg`] = value;'),
    'member-access hole': fn('  vars[`--ds-${value.length}-bg`] = value;'),
    'call hole': fn('  vars[`--ds-${String(prefix)}-bg`] = value;'),
    'hole that is not a parameter': fn('  vars[`--ds-${globalThis}-bg`] = value;'),
    'shadowed parameter hole': fn('  {\n    const prefix = "x";\n    void prefix;\n  }\n  vars[`--ds-${prefix}-bg`] = value;'),
    'key-prefix const also used elsewhere': fn('  const head = `--ds-${prefix}`;\n  vars[`${head}-bg`] = value;\n  console.log(head);'),
    'nested template in a hole': fn('  vars[`--ds-${`${prefix}`}-bg`] = value;'),
  };
  for (const [label, text] of Object.entries(mutants)) {
    assert.notDeepEqual(writerViolations('writers.ts', text), [], label);
    const core = plant({ [W]: text });
    assert.throws(() => chromeEmitterSources(core), /writer member writers\/index\.ts is not a writer/, label);
  }
});

test('a writer names no other writer: calls, call/apply, aliases, values and a second export specifier are refused', () => {
  const second = 'function setOtherVars(vars: Record<string, string>): void {\n  vars["--ds-other"] = "1";\n}\n';
  const mutants = {
    '.call': `${second}function setMoreVars(vars: Record<string, string>): void {\n  setOtherVars.call(null, vars);\n}\n`,
    '.apply': `${second}function setMoreVars(vars: Record<string, string>): void {\n  setOtherVars.apply(null, [vars]);\n}\n`,
    'passed as a value': `${second}function setMoreVars(vars: Record<string, string>): void {\n  [vars].forEach(setOtherVars);\n}\n`,
    'typeof reference': `${second}function setMoreVars(vars: Record<string, string>): void {\n  vars["--ds-kind"] = typeof setOtherVars;\n}\n`,
  };
  for (const [label, body] of Object.entries(mutants)) {
    const text = writerOf(`${DRILL_WRITER}${body}`, 'setDrillVars, setOtherVars, setMoreVars');
    assert.match(writerViolations('writers.ts', text).join(' '), /reference to writer setOtherVars|writer calls writer/, label);
  }
  assert.match(
    writerViolations('writers.ts', writerOf(DRILL_WRITER, 'setDrillVars, setDrillVars')).join(' '),
    /second export specifier for setDrillVars/,
  );
});

/* ── privacy: the root is the writer member's only importer ──────────────── */

test('the shipped writer member has exactly one importer: the root', () => {
  assert.deepEqual(chromeEmitterWriterImporters(CORE_ROOT), [`${CHROME_EMITTER_DIR}/index.ts`]);
});

test('any literal anywhere in src/ or tests/ that resolves to the writer member is an importer', () => {
  const rootOnly = plant();
  assert.deepEqual(chromeEmitterWriterImporters(rootOnly), [`${CHROME_EMITTER_DIR}/index.ts`]);
  const alias = `@/${CHROME_EMITTER_DIR.slice('src/'.length)}/writers`;
  const vectors = {
    'an @/ alias importer in src': ['src/components/other/index.ts', `import { setDrillVars } from "${alias}";\nexport const leak = setDrillVars;\n`, 'src/components/other/index.ts'],
    'a dynamic import': ['src/components/lazy/index.ts', `export const load = () => import("${alias}");\n`, 'src/components/lazy/index.ts'],
    'a require': ['src/components/cjs/index.js', `module.exports = require("${alias}");\n`, 'src/components/cjs/index.js'],
    'a test importer under tests/': ['tests/support/drill/index.ts', `export const target = "../../../${CHROME_EMITTER_DIR}/writers";\n`, 'tests/support/drill/index.ts'],
    'vi.mock in the emitter tests': [`${CHROME_EMITTER_DIR}/tests/drill.test.ts`, 'vi.mock("../writers", () => ({}));\n', `${CHROME_EMITTER_DIR}/tests/drill.test.ts`],
    'a specifier with no "writers" in it, inside the writer folder': [`${CHROME_EMITTER_DIR}/writers/tests/drill.test.ts`, 'import * as self from "..";\nvoid self;\n', `${CHROME_EMITTER_DIR}/writers/tests/drill.test.ts`],
    'a second import declaration in the root': [`${CHROME_EMITTER_DIR}/index.ts`, `${ROOT_SOURCE}import "./writers";\n`, `${CHROME_EMITTER_DIR}/index.ts`],
  };
  for (const [label, [path, text, importer]] of Object.entries(vectors)) {
    const core = plant({ [path]: text });
    const importers = chromeEmitterWriterImporters(core);
    assert.notDeepEqual(importers, [`${CHROME_EMITTER_DIR}/index.ts`], label);
    assert.ok(importers.includes(importer), `${label}: ${JSON.stringify(importers)}`);
  }
  const unresolvable = plant({ 'src/components/notes/index.ts': `export const note = "kernel/foundation/css/chrome-variables/writers/index.ts";\n` });
  assert.deepEqual(chromeEmitterWriterImporters(unresolvable), [`${CHROME_EMITTER_DIR}/index.ts`], 'a path string that does not resolve is not an importer');
  const declaration = plant({ 'src/types/index.d.ts': `declare module "${alias}";\n` });
  assert.deepEqual(chromeEmitterWriterImporters(declaration), [`${CHROME_EMITTER_DIR}/index.ts`], '.d.ts is excluded');
});

test('the root must import its writers without aliases', () => {
  const core = plant({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE.replace(
      'import { setDrillVars } from "./writers";',
      'import { setDrillVars as setAliasVars } from "./writers";\nconst setDrillVars = setAliasVars;',
    ),
  });
  assert.throws(() => chromeEmitterSources(core), /the root imports \[<aliased setDrillVars as setAliasVars>\] from the writer, not its writers \[setDrillVars\]/);
});
