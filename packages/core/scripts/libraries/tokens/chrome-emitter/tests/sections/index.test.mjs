/**
 * Drills for the section role of the chrome emitter authority.
 *
 * Every drill declares a section the shipped list does not hold over a planted
 * tree, and judges it through the law's explicit-list form.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  CHROME_EMITTER_DIR,
  CHROME_EMITTER_FILES,
  chromeEmitterSectionImporters,
  chromeEmitterSources,
  sectionViolations,
  validateChromeEmitterMembers,
} from '../../index.mjs';
import { CORE_ROOT, DRILL_WRITER, ROOT_SOURCE, W, WRITERS_SOURCE, emitterDir, plant, writerOf } from '../support/index.mjs';

const S = `${CHROME_EMITTER_DIR}/sections/drill/index.ts`;
const SECTION_ENTRY = Object.freeze({ path: 'sections/drill/index.ts', role: 'section' });
const WITH_SECTION = Object.freeze([...CHROME_EMITTER_FILES, SECTION_ENTRY]);
const SECTION_HEAD = 'import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";\n';
const sectionOf = (body, exportList = 'setDrillFrameVars') => `${SECTION_HEAD}\n${body}\nexport { ${exportList} };\n`;
const sectionFn = (body, params = 'vars: Record<string, string>, chrome: BrandChrome') =>
  sectionOf(`function setDrillFrameVars(${params}): void {\n${body}\n}\n`);
const DRILL_SECTION = `function setDrillFrameVars(vars: Record<string, string>, chrome: BrandChrome): void {
  if (chrome.layout) {
    const l = chrome.layout;
    if (l.gap) vars["--ds-drill-frame-gap"] = l.gap;
    if (l.columns != null) vars["--ds-drill-frame-columns"] = String(l.columns);
    for (const size of ["sm", "md"] as const) if (size === l.size) vars["--ds-drill-frame-size"] = size;
  }
}
`;
const SECTION_SOURCE = sectionOf(DRILL_SECTION);
const ROOT_WITH_SECTION = ROOT_SOURCE.replace(
  'import { setDrillVars } from "./writers";',
  'import { setDrillFrameVars } from "./sections/drill";\nimport { setDrillVars } from "./writers";',
).replace('  setDrillVars(vars, chrome);\n', '  setDrillFrameVars(vars, chrome);\n  setDrillVars(vars, chrome);\n');
const plantSection = (overrides = {}) =>
  plant({ [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_WITH_SECTION, [S]: SECTION_SOURCE, ...overrides });

test('a planted section member, declared and imported by the root, is admitted', () => {
  assert.notEqual(ROOT_WITH_SECTION, ROOT_SOURCE);
  assert.deepEqual(sectionViolations('section.ts', SECTION_SOURCE, { writers: ['setDrillVars'] }), []);
  const core = plantSection();
  assert.deepEqual(
    validateChromeEmitterMembers(core, WITH_SECTION),
    WITH_SECTION.map((entry) => join(emitterDir(core), entry.path)),
  );
  assert.deepEqual(chromeEmitterSectionImporters(core, WITH_SECTION)['sections/drill/index.ts'], [`${CHROME_EMITTER_DIR}/index.ts`]);
});

test('N section members are admitted together, each by its own declaration', () => {
  const second = sectionOf('function setDrillFieldVars(vars: Record<string, string>, chrome: BrandChrome): void {\n  if (chrome) vars["--ds-drill-field-bg"] = "1";\n}\n', 'setDrillFieldVars');
  const core = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_WITH_SECTION.replace(
      'import { setDrillFrameVars } from "./sections/drill";',
      'import { setDrillFieldVars } from "./sections/drill2";\nimport { setDrillFrameVars } from "./sections/drill";',
    ).replace('  setDrillFrameVars(vars, chrome);\n', '  setDrillFrameVars(vars, chrome);\n  setDrillFieldVars(vars, chrome);\n'),
    [`${CHROME_EMITTER_DIR}/sections/drill2/index.ts`]: second,
  });
  const both = [...WITH_SECTION, { path: 'sections/drill2/index.ts', role: 'section' }];
  assert.equal(validateChromeEmitterMembers(core, both).length, both.length);
  assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /undeclared sections\/drill2\/index\.ts is imported by the root/);
});

test('the shipped list does not hold the drill section: the same planted tree is refused through the one door', () => {
  const core = plantSection();
  assert.throws(() => chromeEmitterSources(core), /undeclared sections\/drill\/index\.ts is imported by the root/);
  const orphan = plant({ [S]: SECTION_SOURCE });
  assert.throws(() => chromeEmitterSources(orphan), /orphan sections\/drill\/index\.ts is not imported by the root/);
  assert.throws(() => validateChromeEmitterMembers(orphan, WITH_SECTION), /orphan sections\/drill\/index\.ts is not imported by the root; declared sections\/drill\/index\.ts is not imported by the root/);
  const absent = plant();
  assert.throws(() => validateChromeEmitterMembers(absent, WITH_SECTION), /declared sections\/drill\/index\.ts is not imported by the root/);
});

test('no reader takes the member list as an argument: the drill door is used by the library and its drills only', () => {
  const users = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(full);
      } else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name) && readFileSync(full, 'utf8').includes('validateChromeEmitterMembers')) {
        users.push(full.slice(CORE_ROOT.length + 1).split('\\').join('/'));
      }
    }
  };
  for (const root of ['scripts', 'src', 'tests']) walk(join(CORE_ROOT, root));
  assert.deepEqual(users.sort(), [
    'scripts/libraries/tokens/chrome-emitter/index.mjs',
    'scripts/libraries/tokens/chrome-emitter/tests/sections/index.test.mjs',
  ]);
  assert.equal(chromeEmitterSources.length, 1);
});

test('a section that references a writer is refused: by name, by call, by parameter, by import', () => {
  const mutants = {
    'calls a writer': sectionFn('  setDrillVars(vars, chrome);'),
    'writer handed in as a parameter': sectionFn('  if (chrome) vars["--ds-drill-frame-gap"] = "1";', 'vars: Record<string, string>, chrome: BrandChrome, setDrillVars: unknown'),
    'writer named as a value': sectionFn('  if (chrome) vars["--ds-drill-frame-gap"] = typeof setDrillVars;'),
    'writer value-imported': `import { setDrillVars } from "../../writers";\n${sectionFn('  setDrillVars(vars, chrome);')}`,
    'writer imported under an alias': `import { setDrillVars as write } from "../../writers";\n${sectionFn('  write(vars, chrome);')}`,
  };
  for (const [label, text] of Object.entries(mutants)) {
    assert.notDeepEqual(sectionViolations('section.ts', text, { writers: ['setDrillVars'] }), [], label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
  assert.match(
    sectionViolations('section.ts', mutants['calls a writer'], { writers: ['setDrillVars'] }).join(' '),
    /section names writer setDrillVars/,
  );
  assert.match(sectionViolations('section.ts', mutants['writer value-imported']).join(' '), /value import of "\.\.\/\.\.\/writers" \(sibling-owner-dependency\)/);
});

test('a callable handed to a section is refused whatever it is called: a section calls nothing but String', () => {
  const mutants = {
    'callback parameter': sectionFn('  write(vars, chrome);', 'vars: Record<string, string>, chrome: BrandChrome, write: (vars: Record<string, string>, chrome: BrandChrome) => void'),
    'put closure': sectionFn('  put("--ds-drill-frame-gap", "1");', 'vars: Record<string, string>, put: (key: string, value: string) => void'),
    'method call': sectionFn('  vars["--ds-drill-frame-gap"] = chrome.toString();'),
    'Object.assign': sectionFn('  Object.assign(vars, { gap: "1" });'),
    'new': sectionFn('  vars["--ds-drill-frame-gap"] = new String("1") as never;'),
    'String rebound': sectionFn('  String(vars);', 'vars: Record<string, string>, String: (vars: Record<string, string>) => void'),
    'String as a value': sectionFn('  vars["--ds-drill-frame-gap"] = [1].map(String).join();'),
  };
  for (const [label, text] of Object.entries(mutants)) {
    assert.notDeepEqual(sectionViolations('section.ts', text), [], label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
});

test('the one effect of a section is vars["--ds-…"] = value with a literal key', () => {
  const mutants = {
    'template key': [sectionFn('  for (const size of ["sm", "md"] as const) vars[`--ds-drill-${size}-gap`] = "1";'), /template in a section/],
    'template key without substitution': [sectionFn('  vars[`--ds-drill-gap`] = "1";'), /template in a section/],
    'template value': [sectionFn('  vars["--ds-drill-gap"] = `${chrome}`;'), /template in a section/],
    'identifier key': [sectionFn('  const key = "--ds-drill-gap";\n  vars[key] = "1";'), /is not the key of a vars|vars is used outside/],
    'concatenated key': [sectionFn('  vars["--ds-" + "drill-gap"] = "1";'), /vars is used outside/],
    'key that is not a channel name': [sectionFn('  vars["--ds-Drill_gap"] = "1";'), /is not a channel name/],
    'read of vars': [sectionFn('  if (vars["--ds-drill-gap"] !== undefined) vars["--ds-drill-legacy-gap"] = "1";'), /vars is used outside/],
    'copy between channels': [sectionFn('  vars["--ds-drill-legacy-gap"] = vars["--ds-drill-gap"];'), /vars is used outside/],
    'compound assignment': [sectionFn('  vars["--ds-drill-gap"] += "1";'), /assignment to anything but vars/],
    'delete': [sectionFn('  delete vars["--ds-drill-gap"];'), /mutation outside vars/],
    'alias of vars': [sectionFn('  const out = vars;\n  out["--ds-drill-gap"] = "1";'), /vars is used outside/],
    'vars handed off': [sectionFn('  const box = { vars };\n  void box;'), /vars is used outside/],
    'vars returned': [sectionFn('  return vars as never;'), /vars is used outside/],
    'vars shadowed': [sectionFn('  {\n    const vars: Record<string, string> = {};\n    vars["--ds-drill-gap"] = "1";\n  }'), /vars is used outside/],
    'write through arguments': [sectionFn('  arguments[0]["--ds-drill-gap"] = "1";'), /arguments in a section/],
    'write on another object': [sectionFn('  (chrome as never as Record<string, string>)["--ds-drill-gap"] = "1";'), /assignment to anything but vars/],
    'object literal channel key': [sectionFn('  const table = { "--ds-drill-gap": "1" };\n  void table;'), /is not the key of a vars/],
    'local reassignment': [sectionFn('  let gap = "1";\n  gap = "2";\n  vars["--ds-drill-gap"] = gap;'), /non-const binding in a section/],
    'nested arrow': [sectionFn('  const write = () => {\n    vars["--ds-drill-gap"] = "1";\n  };\n  void write;'), /nested function or class in a section/],
    'no vars parameter': [sectionFn('  void chrome;', 'chrome: BrandChrome'), /takes no vars parameter/],
    'rest vars parameter': [sectionFn('  void vars;', '...vars: Record<string, string>[]'), /takes no vars parameter/],
  };
  for (const [label, [text, refusal]] of Object.entries(mutants)) {
    assert.match(sectionViolations('section.ts', text).join(' '), refusal, label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
});

test('a key is a channel name written as it reads: every vars key, raw text equal to cooked text', () => {
  const mutants = {
    'unicode escape in a key': [sectionFn('  vars["--ds-drill-\\u0070robe"] = "1";'), /key "--ds-drill-probe" is not written as it reads/],
    'hex escape in a key': [sectionFn('  vars["--ds\\x2ddrill-probe"] = "1";'), /key "--ds-drill-probe" is not written as it reads/],
    'line continuation in a key': [sectionFn('  vars["--ds-drill-\\\nprobe"] = "1";'), /key "--ds-drill-probe" is not written as it reads/],
    'key without the --ds- prefix': [sectionFn('  vars["probe-c"] = "1";'), /"probe-c" is not a channel name/],
    'key with a leading space': [sectionFn('  vars[" --ds-drill-probe"] = "1";'), /" --ds-drill-probe" is not a channel name/],
    'key with an upper-case prefix': [sectionFn('  vars["--DS-drill-probe"] = "1";'), /"--DS-drill-probe" is not a channel name/],
    'empty key': [sectionFn('  vars[""] = "1";'), /"" is not a channel name/],
  };
  for (const [label, [text, refusal]] of Object.entries(mutants)) {
    assert.match(sectionViolations('section.ts', text).join(' '), refusal, label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
  for (const admitted of ['  vars["--ds-drill-probe"] = "1";', "  vars['--ds-drill-probe'] = \"1\";", '  vars[/* k */ "--ds-drill-probe"] = "1";']) {
    assert.deepEqual(sectionViolations('section.ts', sectionFn(admitted)), [], admitted);
  }
});

test('a for-of or for-in that assigns to anything but its own const is refused', () => {
  const two = 'vars: Record<string, string>, chrome: BrandChrome, out: Record<string, string>';
  const mutants = {
    'for-of onto a property of chrome': sectionFn('  for ((chrome as { layout?: unknown }).layout of [undefined]) void 0;'),
    'for-of onto a computed key of a second sink': sectionFn('  for (out["--" + "ds-drill-probe"] of ["1"]) void 0;', two),
    'for-in onto a key of a second sink': sectionFn('  for (out["x"] in chrome) void 0;', two),
    'for-of onto a vars key': sectionFn('  for (vars["--ds-drill-probe"] of ["1"]) void 0;'),
  };
  for (const [label, text] of Object.entries(mutants)) {
    assert.match(sectionViolations('section.ts', text).join(' '), /loop assigns to anything but its own const/, label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
  assert.deepEqual(sectionViolations('section.ts', sectionFn('  for (const size of ["sm", "md"] as const) if (size) vars["--ds-drill-probe"] = size;\n  for (const key in chrome) if (key) vars["--ds-drill-key"] = key;')), []);
});

test('a callback handed in under the name String is refused, and by the String rule alone', () => {
  const text = sectionFn('  vars["--ds-drill-probe"] = String(chrome);', 'vars: Record<string, string>, chrome: BrandChrome, String: (chrome: BrandChrome) => string');
  assert.deepEqual(sectionViolations('section.ts', text).map((violation) => violation.replace(/^:\d+ /, '')), ['String is rebound or used as a value']);
  const core = plantSection({ [S]: text });
  assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /is not a section: :3 String is rebound or used as a value/);
  const local = sectionFn('  const String = chrome as never as (chrome: BrandChrome) => string;\n  vars["--ds-drill-probe"] = String(chrome);');
  assert.deepEqual(sectionViolations('section.ts', local).map((violation) => violation.replace(/^:\d+ /, '')), ['String is rebound or used as a value']);
});

test('every statement shape outside the section grammar is refused', () => {
  const mutants = {
    'imports the root': `import { chromeToVariables } from "../..";\n${SECTION_SOURCE}`,
    'imports the data member': `import { DRILL_CHROME_VARIABLES } from "../../tables";\n${SECTION_SOURCE}`,
    'imports radius-dial': `import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";\n${SECTION_SOURCE}`,
    'const table': sectionOf(`const LOCAL = { a: "x" } as const;\n${DRILL_SECTION}`),
    'private helper': sectionOf(`${DRILL_SECTION}function setHiddenVars(vars: Record<string, string>): void {\n  vars["--ds-hidden"] = "1";\n}\n`),
    'export list names a missing section': sectionOf(DRILL_SECTION, 'setDrillFrameVars, setGhostVars'),
    'aliased export': sectionOf(DRILL_SECTION, 'setDrillFrameVars as setAliasVars'),
    'inline export': `${SECTION_HEAD}\nexport ${DRILL_SECTION}`,
    'default export': `${SECTION_HEAD}\n${DRILL_SECTION}\nexport default setDrillFrameVars;\n`,
    're-export': `${SECTION_SOURCE}export type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";\n`,
    'export list not trailing': `${SECTION_HEAD}\nexport { setDrillFrameVars };\n${DRILL_SECTION}`,
    'expression statement': sectionOf(`${DRILL_SECTION}console.log("x");\n`),
    'class': sectionOf(`${DRILL_SECTION}class Section {}\n`),
    'async section': sectionOf('async function setDrillFrameVars(vars: Record<string, string>): Promise<void> {\n  vars["--ds-x"] = "1";\n}\n'),
    'section calls section': sectionOf(`${DRILL_SECTION}function setMoreVars(vars: Record<string, string>, chrome: BrandChrome): void {\n  setDrillFrameVars(vars, chrome);\n}\n`, 'setDrillFrameVars, setMoreVars'),
    'second export specifier': sectionOf(DRILL_SECTION, 'setDrillFrameVars, setDrillFrameVars'),
  };
  for (const [label, text] of Object.entries(mutants)) {
    assert.notDeepEqual(sectionViolations('section.ts', text), [], label);
    const core = plantSection({ [S]: text });
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section/, label);
  }
});

test('a section names no section of another member', () => {
  const fields = `${CHROME_EMITTER_DIR}/sections/drill2/index.ts`;
  const both = [...WITH_SECTION, { path: 'sections/drill2/index.ts', role: 'section' }];
  const root = ROOT_WITH_SECTION.replace(
    'import { setDrillFrameVars } from "./sections/drill";',
    'import { setDrillFieldVars } from "./sections/drill2";\nimport { setDrillFrameVars } from "./sections/drill";',
  );
  const core = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: root,
    [fields]: sectionOf('function setDrillFieldVars(vars: Record<string, string>, chrome: BrandChrome, setDrillFrameVars: unknown): void {\n  if (chrome && setDrillFrameVars) vars["--ds-drill-field-bg"] = "1";\n}\n', 'setDrillFieldVars'),
  });
  assert.throws(() => validateChromeEmitterMembers(core, both), /section member sections\/drill2\/index\.ts is not a section: :3 section names section setDrillFrameVars/);
});

test('the root must import exactly the exported sections, unaliased, and may not shadow one', () => {
  const spare = plantSection({
    [S]: sectionOf(`${DRILL_SECTION}function setSpareVars(vars: Record<string, string>): void {\n  vars["--ds-spare"] = "1";\n}\n`, 'setDrillFrameVars, setSpareVars'),
  });
  assert.throws(() => validateChromeEmitterMembers(spare, WITH_SECTION), /the root imports \[setDrillFrameVars\] from section sections\/drill\/index\.ts, not its sections \[setDrillFrameVars, setSpareVars\]/);
  const aliased = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_WITH_SECTION.replace('import { setDrillFrameVars } from "./sections/drill";', 'import { setDrillFrameVars as frame } from "./sections/drill";\nconst setDrillFrameVars = frame;'),
  });
  assert.throws(() => validateChromeEmitterMembers(aliased, WITH_SECTION), /the root imports \[<aliased setDrillFrameVars as frame>\] from section/);
  const namespace = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_WITH_SECTION.replace('import { setDrillFrameVars } from "./sections/drill";', 'import * as frame from "./sections/drill";\nconst setDrillFrameVars = frame.setDrillFrameVars;'),
  });
  assert.throws(() => validateChromeEmitterMembers(namespace, WITH_SECTION), /the root imports \[<non-named import>\] from section/);
  const shadow = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_WITH_SECTION.replace('import { setDrillFrameVars } from "./sections/drill";', 'import "./sections/drill";')}function setDrillFrameVars(vars: Record<string, string>, chrome: unknown): void {\n  if (chrome) vars["--ds-shadow"] = "1";\n}\n`,
  });
  assert.throws(() => validateChromeEmitterMembers(shadow, WITH_SECTION), /the root shadows section setDrillFrameVars/);
  const clash = plantSection({
    [S]: sectionOf('function setDrillVars(vars: Record<string, string>): void {\n  vars["--ds-clash"] = "1";\n}\n', 'setDrillVars'),
  });
  assert.throws(() => validateChromeEmitterMembers(clash, WITH_SECTION), /section member sections\/drill\/index\.ts is not a section: .*section names writer setDrillVars/);
});

test('the root is a section member\'s only importer anywhere in src/ or tests/', () => {
  const alias = `@/${CHROME_EMITTER_DIR.slice('src/'.length)}/sections/drill`;
  const vectors = {
    'an @/ alias importer in src': ['src/components/other/index.ts', `import { setDrillFrameVars } from "${alias}";\nexport const leak = setDrillFrameVars;\n`],
    'a dynamic import': ['src/components/lazy/index.ts', `export const load = () => import("${alias}");\n`],
    'a test importer under tests/': ['tests/support/drill/index.ts', `export const target = "../../../${CHROME_EMITTER_DIR}/sections/drill";\n`],
    'vi.mock in the emitter tests': [`${CHROME_EMITTER_DIR}/tests/drill.test.ts`, 'vi.mock("../sections/drill", () => ({}));\n'],
    'the writer member, type-only': [W, `import type { setDrillFrameVars } from "../sections/drill";\n${WRITERS_SOURCE}`],
    'a specifier with no "frame" in it, inside the section folder': [`${CHROME_EMITTER_DIR}/sections/drill/tests/drill.test.ts`, 'import * as self from "..";\nvoid self;\n'],
  };
  for (const [label, [path, text]] of Object.entries(vectors)) {
    const core = plantSection({ [path]: text });
    assert.ok(chromeEmitterSectionImporters(core, WITH_SECTION)['sections/drill/index.ts'].includes(path), label);
    assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /section sections\/drill\/index\.ts is imported by \[.*\], not by the root alone/, label);
  }
  const twice = plantSection({ [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_WITH_SECTION}import "./sections/drill";\n` });
  assert.throws(() => validateChromeEmitterMembers(twice, WITH_SECTION), /is imported by \[.*index\.ts, .*index\.ts\], not by the root alone/);
});

test('the existing roles keep biting beside a section: a second member of root, data or writer is refused', () => {
  const core = plantSection({
    [`${CHROME_EMITTER_DIR}/index.ts`]: `${ROOT_WITH_SECTION}import { setOtherVars } from "./writers2";\n`,
    [`${CHROME_EMITTER_DIR}/writers2/index.ts`]: writerOf('function setOtherVars(vars: Record<string, string>): void {\n  vars["--ds-other"] = "1";\n}\n', 'setOtherVars'),
  });
  assert.throws(() => validateChromeEmitterMembers(core, WITH_SECTION), /undeclared writers2\/index\.ts is imported by the root/);
  for (const role of ['writer', 'data', 'root']) {
    assert.throws(
      () => validateChromeEmitterMembers(core, [...WITH_SECTION, { path: 'writers2/index.ts', role }]),
      new RegExp(`chrome-emitter: role ${role} has 2 members, not 1`),
      role,
    );
  }
  assert.equal(validateChromeEmitterMembers(core, [...WITH_SECTION, { path: 'writers2/index.ts', role: 'section' }]).length, WITH_SECTION.length + 1, 'a literal-only file is a lawful section, never a second writer');
});

test('a section moved into the writer member is still refused by the writer grammar, and a writer is no section', () => {
  const sectionInWriters = plant({
    [W]: writerOf(`${DRILL_WRITER}function setMoreVars(vars: Record<string, string>, chrome: BrandChrome): void {\n  setDrillVars(vars, chrome);\n}\n`, 'setDrillVars, setMoreVars'),
  });
  assert.throws(() => chromeEmitterSources(sectionInWriters), /writer member writers\/index\.ts is not a writer: .*writer calls writer setDrillVars/);
  const shipped = readFileSync(join(CORE_ROOT, CHROME_EMITTER_DIR, 'writers/index.ts'), 'utf8');
  assert.match(sectionViolations('writers.ts', shipped).join(' '), /template in a section/);
});
