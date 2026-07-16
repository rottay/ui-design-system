import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import test from 'node:test';

import {
  auditAppSupplierManifest,
  auditCoreDependencyGraph,
  auditPlatformExecutableClosure,
  auditRuntimeIdentities,
  assertPackedBuildPrerequisite,
  collectDesignSystemImports,
  collectRuntimeExportConditions,
  collectSourceEntrypoints,
  coreRoot,
  deriveSupplierContract,
  loadSupplierContract,
  localizeRuntimeFixtureManifest,
  parseLockIdentities,
  parseModuleSpecifiers,
  repositoryRoot,
  requiredSuppliersForDesignSystemImports,
  runtimeExportFixtures,
  supplierFamilyForSpecifier,
  traceSourceEntry,
  validateAppSupplierManifest,
  validateMotionRuntimeContract,
  validatePackedManifest,
  validatePlatformLocalBoundary,
  validateSupplierDeclarations,
} from './dependency-honesty.mjs';
import {
  inspectInstalledDesignSystem,
  resolveInstalledContractMode,
  scanAppSuppliers as scanPackagedAppSuppliers,
} from '../packages/core/consumer/ds-supplier-honesty.mjs';

function imports(entries) {
  return new Map(entries.map(([name, file = `src/${name}.tsx`]) => [name, [file]]));
}

test('module parsing ignores type-only imports but keeps static, dynamic, and require edges', () => {
  assert.deepEqual(
    parseModuleSpecifiers(`
      import type { Selection } from './types';
      import { scaleLinear } from 'd3';
      export { motion } from 'motion/react';
      const icons = import('lucide-react');
      const antd = require('antd');
      import { type IconProps } from 'type-only-inline-import';
      export { type MotionProps } from 'type-only-inline-export';
      import { type Scale, scaleBand } from 'mixed-inline-import';
      export { type Selection, select } from 'mixed-inline-export';
    `).sort(),
    ['antd', 'd3', 'lucide-react', 'mixed-inline-export', 'mixed-inline-import', 'motion/react'],
  );
});

test('module parsing accepts only the finite literal runtime-edge syntax contract', () => {
  assert.deepEqual(
    parseModuleSpecifiers(`
      const motion = require('motion/react');
      const icons = require('lucide-react');
      const antd = import('antd');
      import d3 = require('d3');
      void motion; void icons; void antd; void d3;
    `).sort(),
    ['antd', 'd3', 'lucide-react', 'motion/react'],
  );
  for (const source of [
    "const supplier = 'd3'; import(supplier);",
    "import('d' + '3');",
    "const supplier = 'd3'; require(supplier);",
    "const req = require; req('d3');",
    "function load(r) { return r('@rottay/design-system'); } load(require);",
    "const carrier = { r: require }; carrier.r('@rottay/design-system');",
    "const carrier = [require]; carrier[0]('@rottay/design-system');",
    "module.require(getSupplier());",
    "module.require('@rottay/design-system');",
    "import { createRequire as cr } from 'node:module'; cr(import.meta.url)('@rottay/design-system');",
    "new Function('supplier', 'return import(supplier)')('d3');",
    "const RuntimeFunction = globalThis['Function']; RuntimeFunction('return import(name)');",
    "eval(\"import('d3')\");",
    "Reflect.get(globalThis, 'require')('@rottay/design-system');",
    "Object.getOwnPropertyDescriptor(globalThis, 'require').value('@rottay/design-system');",
  ]) {
    assert.throws(
      () => parseModuleSpecifiers(source, 'hostile-runtime-edge.ts'),
      /unresolved runtime module edge.*loader transport is forbidden/,
    );
  }
});

test('runtime edge policy is fail-closed for loader transport and scope-aware for local homonyms', () => {
  assert.doesNotThrow(() => parseModuleSpecifiers(`
    function injected(require, Function, eval, createRequire, module, globalThis, Reflect) {
      require(computed);
      Function(source);
      eval(source);
      createRequire(source)(computed);
      module.require(computed);
      globalThis.Function(source);
      Reflect.apply(require, null, [computed]);
    }
    function require(value) { return value; }
    require(computed);
  `));
  assert.doesNotThrow(() => parseModuleSpecifiers(`
    const local = { invoke() {} };
    const globalThis = local;
    globalThis[name](source);
    { const globalThis = local; globalThis[otherName](source); }
    if (typeof window !== 'undefined') window.localStorage.getItem('key');
  `));
  assert.doesNotThrow(() => parseModuleSpecifiers(`
    const speechWindow = window as Window & { SpeechRecognition?: unknown };
    void speechWindow.SpeechRecognition;
    const scrollTarget = element ?? window;
    scrollTarget.addEventListener('scroll', handler);
    if (scrollTarget === window) window.scrollTo({ top: 0 });
    const getTarget = useCallback(() => target?.() ?? window, [target]);
    const currentTarget = getTarget();
    currentTarget.addEventListener('scroll', handler);
    useEffect(() => currentTarget.removeEventListener('scroll', handler), [getTarget]);
    function staticViewport(container: Window) { return container.innerHeight; }
    staticViewport(window);
    function scrollPosition(container: Window | HTMLElement) {
      return container instanceof Window ? container.scrollY : container.scrollTop;
    }
    scrollPosition(window);
    function optionalViewport(container = typeof window === 'undefined' ? undefined : window) {
      return container?.innerHeight;
    }
    const row = { score: 3 };
    const key = 'score';
    Reflect.get(row, key);
    Reflect['deleteProperty'](row, 'score');
    Reflect.ownKeys(row);
    new MouseEvent('click', { bubbles: true, view: window });
  `));

  for (const source of [
    "const req = require; req('d3');",
    "const req = module.require; req('d3');",
    "const G = globalThis; G.require('d3');",
    "const R = Reflect; R.get(globalThis, 'require')('d3');",
    "const get = Reflect.get; get(record, key);",
    "Reflect[getMethod](record, key);",
    "Reflect.get.call(Reflect, record, key);",
    "Reflect.apply(callback, null, []);",
    "Reflect.construct(Constructor, []);",
    "Reflect.get(record, 'require');",
    "Reflect.get(require('node:module'), 'createRequire');",
    "const eventInit = { view: window }; new MouseEvent('click', eventInit);",
    "const MouseEvent = LocalEvent; new MouseEvent('click', { view: window });",
    "globalThis[name](source);",
    "const getGlobal = () => globalThis; getGlobal()[name](source);",
    "function opaque(container) { return container[name]; } opaque(globalThis);",
    "function opaqueDefault(container = globalThis) { return container[name]; } opaqueDefault();",
    "import { createRequire as make } from 'node:module'; make(import.meta.url)('d3');",
  ]) {
    assert.throws(() => parseModuleSpecifiers(source), /unresolved runtime module edge/);
  }
});

test('runtime edge policy closes the exact recursive-global and builtin-loader bypasses', () => {
  const hostile = [
    "window.window.require('d3');",
    "const G = window.window; G[name]('d3');",
    "require('node:module')['create' + 'Require'](import.meta.url)('d3');",
    "Object.getOwnPropertyDescriptor(require('node:module'), 'createRequire').value(import.meta.url)('d3');",
    "const mod = await import('node:module'); mod.createRequire(import.meta.url)('d3');",
    `const F = (() => {}).constructor; F("return import('d3')")();`,
    "const fs = process.getBuiltinModule('node:fs'); fs.rmSync('../ui-design-system', { recursive: true });",
  ];
  for (const source of hostile) {
    assert.throws(
      () => parseModuleSpecifiers(source, 'exact-structural-bypass.ts'),
      /unresolved runtime module edge.*loader transport is forbidden/,
      source,
    );
  }

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    import type { Module } from 'node:module';
    const window = { window: { require: () => 'local' } };
    window.window.require('d3');
    const G = window.window;
    G[name]('d3');
    function require(name: string) {
      return { createRequire: () => () => name };
    }
    require('node:module')['create' + 'Require']('local')('d3');
    const process = { getBuiltinModule: (name: string) => ({ name }) };
    process.getBuiltinModule('node:fs');
    class OrdinaryConstructor {
      constructor(readonly value: unknown) {}
    }
    const ConstructorAlias = OrdinaryConstructor;
    new ConstructorAlias({ source: 'ordinary data' });
  `));

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    window.window.localStorage.getItem('key');
    const browser = window['window'];
    browser.document.querySelector('main');
  `));
});

test('runtime edge policy rejects constructor properties and process capability transport', () => {
  const hostile = [
    `(() => {}).constructor.call(null, "return import('d3')")();`,
    `(() => {}).constructor.apply(null, ["return import('d3')"])();`,
    `(() => {}).constructor.bind(null, "return import('d3')")()();`,
    `const source = "return import('d3')"; (() => {}).constructor(source)();`,
    `const sourceArgs = ["return import('d3')"]; (() => {}).constructor(...sourceArgs)();`,
    "const P = process; P.getBuiltinModule('node:fs').rmSync('../ui-design-system', { recursive: true });",
    "globalThis.process.getBuiltinModule('node:fs').rmSync('../ui-design-system', { recursive: true });",
    "window.process.getBuiltinModule('node:fs').rmSync('../ui-design-system', { recursive: true });",
    "process.mainModule.require('d3');",
    "globalThis.process.mainModule.require('d3');",
    "window.process.mainModule['requ' + 'ire']('d3');",
    "const P = globalThis.process; P.mainModule.require('d3');",
    "const P = process; P.cwd();",
    "globalThis.process.env.NODE_ENV;",
    "process.binding('fs');",
    "process._linkedBinding('fs');",
    "process.dlopen(module, './native.node');",
    "const { constructor: C } = (() => {}); C(source);",
    "Object.getOwnPropertyDescriptor(() => {}, 'constructor').value(source);",
    "Reflect.get(() => {}, 'constructor')(source);",
    `const key = 'constructor'; const F = (() => {})[key]; F("return import('d3')")();`,
    `const key = 'constructor'; Object.getOwnPropertyDescriptor(() => {}, key).value("return import('d3')")();`,
    `const key = 'constructor'; Reflect.get(() => {}, key)("return import('d3')")();`,
    `const key = 'constructor'; const { [key]: F } = (() => {}); F("return import('d3')")();`,
    `let key = 'constructor'; const F = (() => {})[key]; F("return import('d3')")();`,
    `var key = 'constructor'; const F = (() => {})[key]; F("return import('d3')")();`,
    `let key = 'label'; key = 'constructor'; const F = (() => {})[key]; F("return import('d3')")();`,
    `function pick(key: string) { return (() => {})[key]; } pick('constructor')("return import('d3')")();`,
    `const keys = { danger: 'constructor' }; const F = (() => {})[keys.danger]; F("return import('d3')")();`,
    `const { key } = { key: 'constructor' }; const F = (() => {})[key]; F("return import('d3')")();`,
    `let key = 'constructor'; Object.getOwnPropertyDescriptor(() => {}, key).value("return import('d3')")();`,
    `let key = 'constructor'; Reflect.get(() => {}, key)("return import('d3')")();`,
    `let key = 'constructor'; const { [key]: F } = (() => {}); F("return import('d3')")();`,
    `const source = "return import('d3')"; let key = 'constructor'; const callable: any = () => {}; callable[key](source)();`,
    `const source = "return import('d3')"; let key = 'constructor'; let callable: any; callable = () => {}; const F = callable[key]; F(source)();`,
    `function pick(callable: any, key: string) { return callable[key]; } pick(() => {}, 'constructor')("return import('d3')")();`,
    `function pick(callable, key) { return callable[key]; } pick(() => {}, 'constructor')("return import('d3')")();`,
    `function pick(callable: Function, key: string) { return callable[key]; } pick(() => {}, 'constructor')("return import('d3')")();`,
    `function pick<T>(callable: T, key: string) { return callable[key]; } pick(() => {}, 'constructor')("return import('d3')")();`,
    `const callable: any = () => {}; let key = 'constructor'; Object.getOwnPropertyDescriptor(callable, key).value("return import('d3')")();`,
    `const callable: any = () => {}; let key = 'constructor'; Reflect.get(callable, key)("return import('d3')")();`,
    `const callable: any = () => {}; let key = 'constructor'; const { [key]: F } = callable; F("return import('d3')")();`,
    `const unknownValue: unknown = { label: 'ordinary data' }; const disguised = unknownValue as Record<string, string>; let key = 'constructor'; disguised[key];`,
    `const disguised = (() => {}) as unknown as Record<string, unknown>; let key = 'constructor'; const F = disguised[key]; F("return import('d3')")();`,
    `export {}; type Record<K, V> = (...args: unknown[]) => unknown; function pick(disguised: Record<string, unknown>, key: string) { return disguised[key]; }`,
    `function noDominance(value: any, key: string) { if (typeof value === 'object' && value !== null) { void value; } return Reflect.get(value, key); }`,
    `function noAbruptGuard(value: any, key: string) { if (typeof value !== 'object' || value === null) { void value; } return Reflect.get(value, key); }`,
    `function differentShadow(value: any, key: string) { { const shadow: any = {}; if (typeof shadow !== 'object') return; } return Reflect.get(value, key); }`,
    `function reassignedAfterGuard(value: any, key: string) { if (typeof value !== 'object' || value === null) return; value = () => {}; return Reflect.get(value, key); }`,
    `function deferredGuard(value: any, key: string) { if (typeof value === 'object' && value !== null) { return () => Reflect.get(value, key); } }`,
    `function staleLoopGuard(value: any, key: string) { if (typeof value === 'object' && value !== null) { for (let index = 0; index < 2; value = () => {}) Reflect.get(value, key); } }`,
    `function staleForOfGuard(value: any, key: string) { if (typeof value === 'object' && value !== null) { for (value of [() => {}]) Reflect.get(value, key); } }`,
    `function staleForInGuard(value: any, key: string) { if (typeof value === 'object' && value !== null) { for (value in { label: true }) Reflect.get(value, key); } }`,
    `function destructuredAfterGuard(value: any, key: string) { if (typeof value !== 'object' || value === null) return; [value] = [() => {}]; return Reflect.get(value, key); }`,
  ];
  for (const source of hostile) {
    assert.throws(
      () => parseModuleSpecifiers(source, 'adjacent-structural-bypass.ts'),
      /unresolved runtime module edge.*loader transport is forbidden/,
      source,
    );
  }

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    class LocalConstructor {
      constructor(readonly label: string) {}
    }
    const LocalAlias = LocalConstructor;
    new LocalAlias('ordinary label');

    const process = {
      getBuiltinModule: (name: string) => ({ name }),
      mainModule: { require: (name: string) => name },
    };
    const P = process;
    P.getBuiltinModule('node:fs');
    P.mainModule.require('d3');
    const globalThis = { process };
    globalThis.process.getBuiltinModule('node:fs');
    const window = { process };
    window.process.mainModule.require('d3');
  `));

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    process.cwd();
    process.uptime();
    process.on('SIGTERM', handler);
    process.stdout.write('ok');
    process.env.NODE_ENV;
    process.exitCode = 1;
    void process.pid;
  `));

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    const record = { label: 'ordinary data' };
    let mutableKey = 'label';
    record[mutableKey];
    function readByParameter(record: Record<string, string>, key: string) {
      return record[key];
    }
    const key = 'label';
    function readWithShadow(record: Record<string, string>, key: string) {
      return record[key];
    }
    const left = right;
    const right = left;
    record[left];
    readByParameter(record, mutableKey);
    readWithShadow(record, key);
    Object.getOwnPropertyDescriptor(record, mutableKey);
    Reflect.get(record, mutableKey);
    const { [mutableKey]: dynamicValue } = record;
    const callable = () => 'ordinary result';
    void callable[0];
    void dynamicValue;
  `));

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    const typedRecord: Record<string, string> = { label: 'ordinary data' };
    let typedKey = 'label';
    typedRecord[typedKey];
    Object.getOwnPropertyDescriptor(typedRecord, typedKey);
    Reflect.get(typedRecord, typedKey);
    const { [typedKey]: typedValue } = typedRecord;
    const opaqueCallable: any = () => 'ordinary result';
    void opaqueCallable[0];
    void opaqueCallable['label'];
    const objectRecord = ({ label: 'ordinary data' }) as Record<string, string>;
    objectRecord[typedKey];
    function readConstrained<T extends Record<string, string>>(record: T, key: string) {
      return record[key];
    }
    function guardedRecord(record: any, key: string) {
      if (typeof record !== 'object' || record === null) return undefined;
      return Reflect.get(record, key);
    }
    function branchedRecord(record: any, key: string) {
      if (typeof record === 'object' && record !== null) return record[key];
      return undefined;
    }
    function createRecord(): Record<string, string> {
      return { label: 'ordinary data' };
    }
    function guardedTraversal(current: any, key: string) {
      if (current && typeof current === 'object') current = Reflect.get(current, key);
      return current;
    }
    function guardedPropertyMutation(record: any, key: string) {
      if (typeof record !== 'object' || record === null) return undefined;
      record.label = 'changed';
      return Reflect.get(record, key);
    }
    function guardedNonFunction(value: any, key: string) {
      if (value === null || value === undefined || typeof value === 'function') return undefined;
      return value[key];
    }
    function guardedConditional(record: any, key: string) {
      return typeof record === 'object' && record !== null ? Reflect.get(record, key) : undefined;
    }
    const returnedRecord = createRecord();
    returnedRecord[typedKey];
    readConstrained(typedRecord, typedKey);
    guardedRecord(typedRecord, typedKey);
    branchedRecord(typedRecord, typedKey);
    guardedTraversal(typedRecord, typedKey);
    guardedPropertyMutation(typedRecord, typedKey);
    guardedNonFunction(typedRecord, typedKey);
    guardedConditional(typedRecord, typedKey);
    void typedValue;
  `));

  assert.doesNotThrow(() => parseModuleSpecifiers(`
    const Object = { getOwnPropertyDescriptor: (value: unknown, key: string) => ({ value, key }) };
    const Reflect = { get: (value: unknown, key: string) => ({ value, key }) };
    const callable: any = () => 'ordinary result';
    let mutableKey = 'label';
    Object.getOwnPropertyDescriptor(callable, mutableKey);
    Reflect.get(callable, mutableKey);
  `));
});

test('packaged app scanner fails closed when suppliers or the DS hide behind runtime code', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-app-runtime-edge-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    const requireFromCore = createRequire(resolve(coreRoot, 'package.json'));
    for (const source of [
      "const supplier = 'd3'; import(supplier);",
      "const ds = '@rottay/design-system'; import(ds);",
      "const req = module['require']; req(supplier);",
      "const RuntimeFunction = globalThis.Function; RuntimeFunction(source);",
      "const indirectEval = eval; indirectEval(source);",
    ]) {
      writeFileSync(resolve(fixtureRoot, 'src/fixture.ts'), source);
      assert.throws(
        () => scanPackagedAppSuppliers({
          appRoot: fixtureRoot,
          contract: loadSupplierContract(),
          typescript: requireFromCore('typescript'),
        }),
        /unresolved runtime module edge.*src\/fixture\.ts/,
      );
    }
    writeFileSync(
      resolve(fixtureRoot, 'src/fixture.ts'),
      "import { type WorkspaceShellProps } from '@rottay/design-system';\n" +
      "import { type Selection, scaleLinear } from 'd3';\n" +
      "const ds = require('@rottay/design-system');\n" +
      "import Icons = require('@rottay/design-system/icons');\n" +
      "function injected(require: (value: string) => unknown) { return require('@rottay/design-system/commercial'); }\n" +
      "const localGlobal = {}; const globalThis = localGlobal; globalThis[name](source);\n" +
      "console.log(ds, Icons, injected, scaleLinear, globalThis);\n",
    );
    const scanned = scanPackagedAppSuppliers({
      appRoot: fixtureRoot,
      contract: loadSupplierContract(),
      typescript: requireFromCore('typescript'),
    });
    assert.ok(scanned.directSuppliers.has('d3'));
    assert.ok(scanned.dsSymbols.get('.')?.has('*'));
    assert.ok(scanned.dsSymbols.get('./icons')?.has('*'));
    assert.equal(scanned.dsSymbols.has('./commercial'), false);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('packaged app scanner accepts computed data access and inventories finite runtime suppliers', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-packaged-app-manifest-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    writeFileSync(resolve(fixtureRoot, 'src/fixture.ts'), `
      import { Button } from 'antd';
      import Motion = require('motion/react');
      function read(record: any, key: string, values: any[], index: number) {
        return [record[key], values[index]];
      }
      const d3 = import('d3-scale');
      const icons = require('lucide-react');
      console.log(Button, Motion, read, d3, icons);
    `);
    const requireFromCore = createRequire(resolve(coreRoot, 'package.json'));
    const scanned = scanPackagedAppSuppliers({
      appRoot: fixtureRoot,
      contract: loadSupplierContract(),
      typescript: requireFromCore('typescript'),
    });

    assert.deepEqual(
      [...scanned.directSuppliers.keys()].sort(),
      ['antd', 'd3-scale', 'lucide-react', 'motion'],
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('packaged app scanner rejects static and definitely-callable constructor transport in manifest mode', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-packaged-static-constructor-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    const requireFromCore = createRequire(resolve(coreRoot, 'package.json'));
    for (const source of [
      `(() => {}).constructor("return import('d3')")();`,
      `(() => {})['constructor']("return import('d3')")();`,
      `const key = 'constructor'; (() => {})[key]("return import('d3')")();`,
      `Object.getOwnPropertyDescriptor(() => {}, 'constructor').value("return import('d3')")();`,
      `Reflect.get(() => {}, 'constructor')("return import('d3')")();`,
      `Reflect.getOwnPropertyDescriptor(() => {}, 'constructor').value("return import('d3')")();`,
      `declare const key: string; (() => {})[key]("return import('d3')")();`,
      `declare const key: string; declare const fn: (source: string) => unknown; fn[key]("return import('d3')")();`,
      `declare const key: string; Object.getOwnPropertyDescriptor(() => {}, key).value("return import('d3')")();`,
      `declare const key: string; Reflect.get(() => {}, key)("return import('d3')")();`,
    ]) {
      writeFileSync(resolve(fixtureRoot, 'src/fixture.ts'), source);
      assert.throws(
        () => scanPackagedAppSuppliers({
          appRoot: fixtureRoot,
          contract: loadSupplierContract(),
          typescript: requireFromCore('typescript'),
        }),
        /unresolved runtime module edge \(constructor property capability\).*src\/fixture\.ts/,
        source,
      );
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('supplier families include Three adapters and the Ant icon package', () => {
  assert.equal(supplierFamilyForSpecifier('d3-scale'), 'd3');
  assert.equal(supplierFamilyForSpecifier('motion/react'), 'motion');
  assert.equal(supplierFamilyForSpecifier('framer-motion'), 'framer-motion');
  assert.equal(supplierFamilyForSpecifier('@phosphor-icons/react/ssr'), '@phosphor-icons/react');
  assert.equal(supplierFamilyForSpecifier('@react-three/fiber'), 'three');
  assert.equal(supplierFamilyForSpecifier('@ant-design/icons/es/icons/UserOutlined'), 'antd');
  assert.equal(supplierFamilyForSpecifier('react'), null);
});

test('a root-reachable optional peer is rejected', () => {
  const errors = validateSupplierDeclarations({
    manifest: {
      peerDependencies: { d3: '^7.9.0' },
      peerDependenciesMeta: { d3: { optional: true } },
    },
    allImports: imports([['d3']]),
    rootImports: imports([['d3']]),
  });
  assert.ok(errors.some((error) => error.includes('marks it optional')));
});

test('a hard peer reached from root passes declaration honesty', () => {
  assert.deepEqual(validateSupplierDeclarations({
    manifest: { peerDependencies: { d3: '^7.9.0' } },
    allImports: imports([['d3']]),
    rootImports: imports([['d3']]),
  }), []);
});

test('a supplier imported only by a focused subpath must still be declared', () => {
  const errors = validateSupplierDeclarations({
    manifest: {},
    allImports: imports([['three', 'src/spatial/scene.tsx']]),
    rootImports: new Map(),
  });
  assert.deepEqual(errors, [
    'an exported entry reaches three from src/spatial/scene.tsx but the package does not declare it as a peer or dependency',
  ]);
});

test('an optional peer is honest when it is production-used but not root-reachable', () => {
  assert.deepEqual(validateSupplierDeclarations({
    manifest: {
      peerDependencies: { three: '^0.180.0' },
      peerDependenciesMeta: { three: { optional: true } },
    },
    allImports: imports([['three', 'src/spatial/scene.tsx']]),
    rootImports: new Map(),
  }), []);
});

test('a peer with zero production importers is rejected', () => {
  const errors = validateSupplierDeclarations({
    manifest: { peerDependencies: { geist: '^1.7.0' } },
    allImports: new Map(),
    rootImports: new Map(),
  });
  assert.deepEqual(errors, ['peer geist has zero production importers']);
});

test('an app importer fixture fails when its supplier is undeclared', () => {
  const errors = validateAppSupplierManifest({
    manifest: { name: 'fixture', dependencies: {} },
    importedPackages: imports([['motion', 'src/card.tsx']]),
  });
  assert.deepEqual(errors, [
    'fixture imports motion in src/card.tsx but it is undeclared',
  ]);
});

test('app manifest scanning accepts computed data access and still collects literal runtime suppliers', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-app-manifest-fixture-'));
  const source = `
    import { Button } from 'antd';
    import Motion = require('motion/react');
    function read(record: any, key: string, values: any, index: number) {
      return [record[key], values[index]];
    }
    const d3 = import('d3-scale');
    const icons = require('lucide-react');
    console.log(Button, Motion, read, d3, icons);
  `;
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    mkdirSync(resolve(fixtureRoot, 'scripts'), { recursive: true });
    writeFileSync(
      resolve(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'fixture-app', dependencies: {} }),
    );
    writeFileSync(resolve(fixtureRoot, 'src/fixture.ts'), source);
    writeFileSync(
      resolve(fixtureRoot, 'scripts/ds-supplier-contract.snapshot.json'),
      JSON.stringify(loadSupplierContract()),
    );
    writeFileSync(
      resolve(fixtureRoot, 'scripts/ds-supplier-honesty.mjs'),
      readFileSync(resolve(coreRoot, 'consumer/ds-supplier-honesty.mjs'), 'utf8'),
    );

    assert.throws(() => parseModuleSpecifiers(source), /constructor property capability/);
    const audit = auditAppSupplierManifest(fixtureRoot);
    const importErrors = audit.errors.filter((error) => error.includes(' imports '));
    assert.deepEqual(audit.errors, importErrors);
    assert.equal(importErrors.length, 4);
    assert.ok(importErrors.some((error) => (
      /fixture-app imports antd .* but it is undeclared/.test(error)
    )));
    assert.ok(importErrors.some((error) => (
      /fixture-app imports d3-scale .* but it is undeclared/.test(error)
    )));
    assert.ok(importErrors.some((error) => (
      /fixture-app imports motion .* but it is undeclared/.test(error)
    )));
    assert.ok(importErrors.some((error) => (
      /fixture-app imports lucide-react .* but it is undeclared/.test(error)
    )));
    assert.deepEqual(audit.suppliers, {
      antd: 1,
      'd3-scale': 1,
      motion: 1,
      'lucide-react': 1,
    });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('source app audit rejects static and definitely-callable constructor transport in manifest mode', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-source-static-constructor-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    writeFileSync(
      resolve(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'fixture-app', dependencies: {} }),
    );
    for (const source of [
      `(() => {}).constructor("return import('d3')")();`,
      `(() => {})['constructor']("return import('d3')")();`,
      `const key = 'constructor'; (() => {})[key]("return import('d3')")();`,
      `Object.getOwnPropertyDescriptor(() => {}, 'constructor').value("return import('d3')")();`,
      `Reflect.get(() => {}, 'constructor')("return import('d3')")();`,
      `Reflect.getOwnPropertyDescriptor(() => {}, 'constructor').value("return import('d3')")();`,
      `declare const key: string; (() => {})[key]("return import('d3')")();`,
      `declare const key: string; declare const fn: (source: string) => unknown; fn[key]("return import('d3')")();`,
      `declare const key: string; Object.getOwnPropertyDescriptor(() => {}, key).value("return import('d3')")();`,
      `declare const key: string; Reflect.get(() => {}, key)("return import('d3')")();`,
    ]) {
      writeFileSync(resolve(fixtureRoot, 'src/fixture.ts'), source);
      assert.throws(
        () => auditAppSupplierManifest(fixtureRoot),
        /unresolved runtime module edge \(constructor property capability\).*src\/fixture\.ts/,
        source,
      );
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('a runtime app supplier in devDependencies only is rejected', () => {
  const errors = validateAppSupplierManifest({
    manifest: { name: 'fixture', dependencies: {}, devDependencies: { 'lucide-react': '^0.563.0' } },
    importedPackages: imports([['lucide-react', 'src/icon.tsx']]),
  });
  assert.deepEqual(errors, [
    'fixture imports lucide-react in src/icon.tsx but it is devDependencies only',
  ]);
});

test('an app-owned runtime supplier declaration passes', () => {
  assert.deepEqual(validateAppSupplierManifest({
    manifest: { name: 'fixture', dependencies: { antd: '^5.29.0' } },
    importedPackages: imports([['antd', 'src/classic.tsx']]),
  }), []);
});

test('producer-side app inference fails closed on unknown DS entrypoints and symbols', () => {
  const contract = loadSupplierContract();
  assert.throws(
    () => requiredSuppliersForDesignSystemImports(
      new Map([['./not-real', new Map([['Mystery', ['src/fixture.tsx']]])]]),
      contract,
    ),
    /unknown design-system entrypoint \.\/not-real/,
  );
  assert.throws(
    () => requiredSuppliersForDesignSystemImports(
      new Map([['.', new Map([['NotAnExport', ['src/fixture.tsx']]])]]),
      contract,
    ),
    /unknown design-system runtime symbol \.#NotAnExport/,
  );
});

test('producer-side DS inference uses literal runtime forms and ignores type-only clauses', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-require-fixture-'));
  try {
    const fixture = resolve(fixtureRoot, 'fixture.ts');
    writeFileSync(
      fixture,
      "import { type BoxProps } from '@rottay/design-system';\n" +
      "export { type ServerContext } from '@rottay/design-system/server';\n" +
      "const ds = require('@rottay/design-system');\n" +
      "import Icons = require('@rottay/design-system/icons');\n" +
      "const shadowed = (require: (value: string) => unknown) => require('@rottay/design-system/commercial');\n" +
      "console.log(ds, Icons, shadowed);\n",
    );
    const imports = collectDesignSystemImports([fixture]);
    assert.ok(imports.get('.')?.has('*'));
    assert.ok(imports.get('./icons')?.has('*'));
    assert.equal(imports.has('./server'), false);
    assert.equal(imports.has('./commercial'), false);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('supplier contract derivation attributes named and wildcard external re-exports', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-reexport-fixture-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    symlinkSync(resolve(coreRoot, 'node_modules'), resolve(fixtureRoot, 'node_modules'), 'dir');
    writeFileSync(resolve(fixtureRoot, 'package.json'), JSON.stringify({
      name: 'supplier-reexport-fixture',
      exports: { '.': { import: './dist/index.js' } },
    }));
    writeFileSync(resolve(fixtureRoot, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        skipLibCheck: true,
      },
      include: ['src'],
    }));
    writeFileSync(
      resolve(fixtureRoot, 'src/index.ts'),
      "export { motion } from 'motion/react';\n" +
      "export * from 'd3';\n" +
      "export { cycleMotion } from './cycle-a';\n" +
      "import { animate as importedAnimate } from 'motion/react';\n" +
      "import * as motionNamespace from 'motion/react';\n" +
      "export { importedAnimate as animateAlias, motionNamespace };\n",
    );
    writeFileSync(
      resolve(fixtureRoot, 'src/cycle-a.ts'),
      "import { motionFromCycle } from './cycle-b';\n" +
      "export const cycleMotion = motionFromCycle;\n" +
      "export const cycleA = true;\n",
    );
    writeFileSync(
      resolve(fixtureRoot, 'src/cycle-b.ts'),
      "import { cycleA } from './cycle-a';\n" +
      "import { motion } from 'motion/react';\n" +
      "export const motionFromCycle = cycleA ? motion : motion;\n",
    );
    const derived = deriveSupplierContract(fixtureRoot);
    assert.deepEqual(derived.entrypoints['.'].symbols.motion, ['motion']);
    assert.deepEqual(derived.entrypoints['.'].symbols.scaleLinear, ['d3']);
    assert.deepEqual(derived.entrypoints['.'].symbols.animateAlias, ['motion']);
    assert.deepEqual(derived.entrypoints['.'].symbols.motionNamespace, ['motion']);
    assert.deepEqual(derived.entrypoints['.'].symbols.cycleMotion, ['motion']);
    assert.ok(!derived.entrypoints['.'].supplierFreeExports.includes('motion'));
    assert.ok(!derived.entrypoints['.'].supplierFreeExports.includes('scaleLinear'));
    assert.ok(!derived.entrypoints['.'].supplierFreeExports.includes('animateAlias'));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('supplier contract deletion drills fail for AreaChart, CountUp, and the icons wildcard', () => {
  const contract = loadSupplierContract();
  assert.deepEqual(contract.entrypoints['./icons'].symbols.Icon, ['@phosphor-icons/react']);
  assert.deepEqual(contract.entrypoints['./icons'].wildcard, ['@phosphor-icons/react', 'lucide-react']);
  for (const symbol of ['AreaChart', 'CountUp']) {
    const mutated = structuredClone(contract);
    delete mutated.entrypoints['.'].symbols[symbol];
    assert.throws(
      () => requiredSuppliersForDesignSystemImports(new Map(), mutated),
      new RegExp(`leaves \\.#${symbol} unclassified`),
    );
  }
  const missingWildcard = structuredClone(contract);
  delete missingWildcard.entrypoints['./icons'].wildcard;
  assert.throws(
    () => requiredSuppliersForDesignSystemImports(new Map(), missingWildcard),
    /icons must retain its governed functional and compatibility suppliers/,
  );
});

test('runtime contract excludes type-only barrel collisions and includes the CLI subpath', () => {
  const contract = loadSupplierContract();
  assert.equal(contract.entrypoints['.'].exports.includes('BreadcrumbItem'), false);
  assert.equal(contract.entrypoints['.'].exports.includes('SelectOption'), false);
  assert.deepEqual(contract.entrypoints['./supplier-honesty-cli'].exports, [
    'inferRenderedSuppliers',
    'inspectInstalledDesignSystem',
    'resolveInstalledContractMode',
    'runSupplierHonesty',
    'scanAppSuppliers',
  ]);
  assert.equal(contract.nonRuntimeEntrypoints.includes('./supplier-honesty-cli'), false);
});

test('runtime closure follows unfortunately named files reached by an exported entry', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-runtime-closure-'));
  try {
    for (const name of ['EXAMPLES.tsx', 'hidden.test.ts', 'Widget.stories.tsx']) {
      const stem = name.replace(/\.(?:tsx|ts)$/, '');
      writeFileSync(resolve(fixtureRoot, 'index.ts'), `export { X } from './${stem}';\n`);
      writeFileSync(resolve(fixtureRoot, name), "import { scaleLinear } from 'd3'; export const X = scaleLinear();\n");
      const graph = traceSourceEntry(resolve(fixtureRoot, 'index.ts'), fixtureRoot);
      assert.ok(graph.externalImports.has('d3'), name);
      rmSync(resolve(fixtureRoot, name));
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('runtime export inventory includes the public CLI import and every CJS condition', () => {
  const manifest = JSON.parse(readFileSync(resolve(coreRoot, 'package.json'), 'utf8'));
  const conditions = collectRuntimeExportConditions(manifest);
  assert.ok(conditions.some((entry) => (
    entry.subpath === './supplier-honesty-cli' && entry.mode === 'import' && entry.target.endsWith('.mjs')
  )));
  const fixtures = runtimeExportFixtures(manifest);
  assert.equal(fixtures.import.length, 11);
  assert.equal(fixtures.require.length, 10);
  assert.ok(fixtures.import.some((entry) => entry.specifier.endsWith('/supplier-honesty-cli')));
  assert.ok(fixtures.import.some((entry) => entry.specifier.endsWith('/charts')));
  assert.ok(fixtures.require.some((entry) => entry.specifier.endsWith('/charts')));
  assert.ok(fixtures.import.some((entry) => entry.specifier.endsWith('/charts/renderers')));
  assert.ok(fixtures.require.some((entry) => entry.specifier.endsWith('/charts/renderers')));
  assert.ok(fixtures.import.some((entry) => entry.specifier.endsWith('/motion')));
  assert.ok(fixtures.require.some((entry) => entry.specifier.endsWith('/motion')));
  assert.ok(fixtures.import.some((entry) => entry.specifier.endsWith('/effects')));
  assert.ok(fixtures.require.some((entry) => entry.specifier.endsWith('/effects')));
});

test('offline runtime fixtures localize required packages and omit unavailable optional packages', () => {
  const fixtureRoot = resolve(tmpdir(), 'rottay-ds-local-runtime-fixtures');
  const localized = localizeRuntimeFixtureManifest({
    name: 'runtime-parent',
    version: '1.2.3',
    dependencies: { required: '^2.0.0' },
    optionalDependencies: { installedOptional: '^3.0.0', unavailableOptional: '^4.0.0' },
    peerDependencies: { react: '^19.0.0' },
    scripts: { prepare: 'must-not-run' },
  }, {
    required: resolve(fixtureRoot, 'required'),
    installedOptional: resolve(fixtureRoot, 'installed-optional'),
  });

  assert.equal(localized.dependencies.required, new URL('required', `file://${fixtureRoot}/`).href);
  assert.equal(
    localized.optionalDependencies.installedOptional,
    new URL('installed-optional', `file://${fixtureRoot}/`).href,
  );
  assert.equal(Object.hasOwn(localized.optionalDependencies, 'unavailableOptional'), false);
  assert.deepEqual(localized.peerDependencies, { react: '^19.0.0' });
  assert.equal(Object.hasOwn(localized, 'scripts'), false);
  assert.throws(
    () => localizeRuntimeFixtureManifest({
      name: 'broken-parent',
      version: '1.0.0',
      dependencies: { missing: '^1.0.0' },
    }, {}),
    /broken-parent@1\.0\.0 requires unavailable runtime dependency missing/,
  );
});

test('contractless fallback is exact per legacy app and new or incomplete releases fail closed', () => {
  assert.equal(
    resolveInstalledContractMode('/workspace/app-platform', {
      version: '2.17.0', hasContract: false, hasCli: false,
    }),
    'generated-snapshot-legacy-2.17.0',
  );
  assert.throws(
    () => resolveInstalledContractMode('/workspace/app-platform', {
      version: '2.19.1', hasContract: false, hasCli: false,
    }),
    /contractless fallback is allowed only/,
  );
  assert.throws(
    () => resolveInstalledContractMode('/workspace/app-platform', {
      version: '2.19.1', hasContract: true, hasCli: false,
    }),
    /is incomplete/,
  );
});

test('canonical app CLI rejects a design-system package linked outside the app', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-ds-linked-app-'));
  const appRoot = resolve(fixtureRoot, 'app-platform');
  const producerRoot = resolve(fixtureRoot, 'ui-design-system/packages/core');
  try {
    mkdirSync(resolve(appRoot, 'node_modules/@rottay'), { recursive: true });
    mkdirSync(resolve(producerRoot, 'dist'), { recursive: true });
    writeFileSync(resolve(appRoot, 'package.json'), JSON.stringify({ name: 'app-platform' }));
    writeFileSync(resolve(producerRoot, 'package.json'), JSON.stringify({
      name: '@rottay/design-system', version: '2.19.1', main: './dist/index.cjs',
    }));
    writeFileSync(resolve(producerRoot, 'dist/index.cjs'), 'module.exports = {};\n');
    symlinkSync(producerRoot, resolve(appRoot, 'node_modules/@rottay/design-system'), 'dir');
    assert.throws(
      () => inspectInstalledDesignSystem(appRoot),
      /resolves outside the app workspace.*cannot certify an app/,
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('lock identity parser detects duplicate runtime identities', () => {
  const identities = parseLockIdentities(`
lockfileVersion: '9.0'
packages:
  react@18.3.1: {}
  react@19.2.5: {}
  react-dom@19.2.5: {}
  dayjs@1.11.20: {}
snapshots:
`);
  assert.deepEqual(identities.react, ['18.3.1', '19.2.5']);
});

test('Motion runtime contract rejects direct Framer in every section and requires its exact transitive range', () => {
  const valid = {
    coreManifest: {
      peerDependencies: { motion: '12.42.2' },
      devDependencies: { motion: '12.42.2' },
    },
    showroomManifest: { dependencies: { motion: '12.42.2' } },
    installedMotion: {
      version: '12.42.2',
      dependencies: { 'framer-motion': '^12.42.2' },
    },
  };
  assert.deepEqual(validateMotionRuntimeContract(valid), []);

  const errors = validateMotionRuntimeContract({
    coreManifest: {
      peerDependencies: { motion: '12.42.2' },
      devDependencies: { motion: '12.42.2' },
      dependencies: { 'framer-motion': '^12.42.2' },
    },
    showroomManifest: {
      dependencies: { motion: '12.42.2' },
      optionalDependencies: { 'framer-motion': '^12.42.2' },
    },
    installedMotion: {
      version: '12.42.2',
      dependencies: { 'framer-motion': '^12.42.20' },
    },
  });
  assert(errors.some((error) => /packages\/core.*dependencies/.test(error)), errors.join('\n'));
  assert(errors.some((error) => /packages\/showroom.*optionalDependencies/.test(error)), errors.join('\n'));
  assert(errors.some((error) => /transitively at \^12\.42\.2/.test(error)), errors.join('\n'));
});

test('packed manifest rejects workspace and filesystem dependency leaks', () => {
  const errors = validatePackedManifest({
    exports: {},
    dependencies: { a: 'workspace:*', b: 'link:../b', c: 'file:../c.tgz' },
  }, repositoryRoot);
  assert.equal(errors.length, 3);
});

test('Platform boundary rejects producer mutation and consumer-triggered builds', () => {
  const errors = validatePlatformLocalBoundary({
    packageManifest: {
      scripts: { dev: 'node scripts/ensure-local-ds-assets.mjs && next dev' },
    },
    verifierSource: "import { symlinkSync } from 'node:fs'; symlinkSync('app', 'producer/node_modules/react');",
    toggleSource: 'pnpm --dir ../ui-design-system build',
    nextConfigSource: 'const dsIsSymlink = true;',
  });
  assert.ok(errors.some((error) => error.includes('retired ensure-local-ds-assets.mjs')));
  assert.ok(errors.some((error) => error.includes('builds or installs the DS producer')), errors.join('\n'));
  assert.ok(errors.some((error) => error.includes('node_modules symlink')));

  const nextMutation = validatePlatformLocalBoundary({
    packageManifest: { scripts: { dev: 'node scripts/verify-local-ds.mjs && next dev', build: 'node scripts/verify-local-ds.mjs && next build' } },
    verifierSource: "import { existsSync } from 'node:fs';",
    toggleSource: 'SCRIPT_DIR="${BASH_SOURCE[0]}"\nAPP_ROOT="$SCRIPT_DIR"\nENV_FILE="$APP_ROOT/.env.local"\nDS_LOCAL_PATH="$APP_ROOT/../ui-design-system/packages/core"',
    nextConfigSource: "import fs from 'node:fs'; fs.rmSync(localDsRoot, { recursive: true });",
  });
  assert.ok(nextMutation.some((error) => (
    error.includes('next.config.ts:') && error.includes('violates executable policy')
  )), nextMutation.join('\n'));

  const importedHelper = validatePlatformLocalBoundary({
    packageManifest: { scripts: { dev: 'node scripts/verify-local-ds.mjs && next dev', build: 'node scripts/verify-local-ds.mjs && next build' } },
    verifierSource: "import('./read-only-helper.mjs');",
    toggleSource: '',
    nextConfigSource: '',
  });
  assert.equal(importedHelper.some((error) => error.includes('unaudited local executable')), false);

  const insertedScript = validatePlatformLocalBoundary({
    packageManifest: {
      scripts: {
        dev: 'node scripts/verify-local-ds.mjs && node scripts/producer-mutator.mjs && next dev',
        build: 'node scripts/verify-local-ds.mjs && next build',
      },
    },
    verifierSource: '',
    toggleSource: '',
    nextConfigSource: '',
  });
  assert.ok(insertedScript.some((error) => error.includes('dev may only run the verifier followed by next dev')));

  const anchoredToggle = [
    'SCRIPT_DIR="${BASH_SOURCE[0]}"',
    'APP_ROOT="$SCRIPT_DIR"',
    'ENV_FILE="$APP_ROOT/.env.local"',
    'DS_LOCAL_PATH="$APP_ROOT/../ui-design-system/packages/core"',
    'DS_ROOT="$APP_ROOT/../ui-design-system/packages/core"',
  ].join('\n');
  const boundaryFixture = (toggleSource) => validatePlatformLocalBoundary({
    packageManifest: {
      scripts: {
        dev: 'node scripts/verify-local-ds.mjs && next dev',
        build: 'node scripts/verify-local-ds.mjs && next build',
      },
    },
    verifierSource: "import { existsSync } from 'node:fs'; existsSync('./package.json');",
    toggleSource: `${anchoredToggle}\n${toggleSource}\n`,
    nextConfigSource: 'export default {};',
  });
  for (const source of [
    'command rm -rf "$DS_ROOT/dist"',
    'if rm -rf "$DS_ROOT/dist"; then true; fi',
    '( rm -rf "$DS_ROOT/dist" )',
    '/bin/rm -rf "$DS_ROOT/dist"',
    'env rm -rf "$DS_ROOT/dist"',
    'find "$DS_ROOT/dist" -delete',
    'result=$(rm -rf "$DS_ROOT/dist")',
    'echo marker > "$DS_ROOT/dist/marker"',
  ]) {
    const shellMutation = boundaryFixture(source);
    assert.ok(shellMutation.some((error) => error.includes('mutates the DS producer')), source);
  }
  for (const source of [
    'command pnpm --dir "$DS_ROOT" build',
    'env npm --prefix "$DS_ROOT" run prepare',
    'if yarn --cwd "$DS_ROOT" install; then true; fi',
  ]) {
    const shellBuild = boundaryFixture(source);
    assert.ok(shellBuild.some((error) => error.includes('builds or installs the DS producer')), source);
  }
  for (const source of [
    'xargs rm -rf "$DS_ROOT/dist"',
    'rsync -a "$DS_ROOT/dist/" "$APP_ROOT/vendor/"',
    'python -c "mutate()" "$DS_ROOT/dist"',
  ]) {
    const unsupportedShell = boundaryFixture(source);
    assert.ok(unsupportedShell.some((error) => error.includes('uses unsupported command')), source);
  }

  const safeShell = boundaryFixture([
    '# command rm -rf "$DS_ROOT/dist"',
    'printf "%s\\n" "rm -rf $DS_ROOT/dist"',
    'printf "%s\\n" "pnpm --dir $DS_ROOT build"',
    'echo "DS artifacts: $DS_ROOT/dist"',
    'test -f "$DS_ROOT/dist/index.js"',
    '[ -d "$DS_ROOT/dist" ]',
    'find "$DS_ROOT/dist" -print',
  ].join('\n'));
  assert.equal(safeShell.some((error) => error.includes('mutates the DS producer')), false, safeShell.join('\n'));
  assert.equal(safeShell.some((error) => error.includes('builds or installs the DS producer')), false, safeShell.join('\n'));
});

test('Platform executable closure enforces finite read-only capabilities across lifecycle routes', () => {
  const platformRoot = mkdtempSync(resolve(tmpdir(), 'rottay-platform-boundary-'));
  const scriptsRoot = resolve(platformRoot, 'scripts');
  const packageManifest = {
    scripts: {
      dev: 'node scripts/verify-local-ds.mjs && next dev',
      build: 'node scripts/verify-local-ds.mjs && ./scripts/axiom-deploy-annotation.sh app-platform && next build',
      postinstall: 'pnpm run check:local',
      'check:local': 'node scripts/postinstall-check.mjs',
    },
  };
  const producerFingerprint = () => [
    resolve(coreRoot, 'package.json'),
    resolve(coreRoot, 'dist/index.js'),
  ].map((file) => readFileSync(file)).join('\u0000');
  try {
    mkdirSync(scriptsRoot, { recursive: true });
    writeFileSync(
      resolve(platformRoot, 'next.config.ts'),
      "import { readFileSync } from 'node:fs';\nreadFileSync('./package.json');\nexport default {};\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'verify-local-ds.mjs'),
      "import { existsSync, readFileSync } from 'node:fs';\n" +
      "existsSync('./package.json');\nreadFileSync('./package.json');\nimport './read-only-a.mjs';\n",
    );
    writeFileSync(resolve(scriptsRoot, 'read-only-a.mjs'), "import './read-only-b.mjs';\n");
    writeFileSync(
      resolve(scriptsRoot, 'read-only-b.mjs'),
      "import './read-only-a.mjs';\nimport { readFileSync } from 'node:fs';\nreadFileSync('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'postinstall-check.mjs'),
      "import './read-only-a.mjs';\nimport './read-only-local-containers.mjs';\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'read-only-local-containers.mjs'),
      "const local = { rm() { return 'local'; } };\n" +
      "const { rm: localRemove } = local;\nlocalRemove();\n" +
      "const [localArrayOperation] = [() => 'local'];\nlocalArrayOperation();\n" +
      "function objectHelper({ rm }) { rm(); }\nobjectHelper(local);\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'ds-toggle.sh'),
      '#!/usr/bin/env bash\n' +
      'source "$SCRIPT_DIR/read-only.sh"\n' +
      'source "$SCRIPT_DIR/read-only-continuation.sh"\n',
    );
    writeFileSync(resolve(scriptsRoot, 'read-only.sh'), 'source "$SCRIPT_DIR/read-only-cycle.sh"\n');
    writeFileSync(resolve(scriptsRoot, 'read-only-cycle.sh'), 'source "$SCRIPT_DIR/read-only.sh"\n');
    writeFileSync(
      resolve(scriptsRoot, 'read-only-continuation.sh'),
      ['rm -rf \\', '  "$APP_ROOT/.cache/local-ds"', ''].join('\n'),
    );
    writeFileSync(resolve(scriptsRoot, 'axiom-deploy-annotation.sh'), '#!/usr/bin/env bash\nprintf "%s\\n" "$1"\n');
    writeFileSync(
      resolve(scriptsRoot, 'unreachable-forbidden.mjs'),
      "import { execSync } from 'node:child_process';\nexecSync('rm -rf ../ui-design-system');\n",
    );

    const producerBefore = producerFingerprint();
    assert.deepEqual(auditPlatformExecutableClosure(platformRoot, packageManifest), []);
    assert.equal(producerFingerprint(), producerBefore);

    writeFileSync(
      resolve(scriptsRoot, 'postinstall-check.mjs'),
      "import './loader-transport.mjs';\n" +
      "import './fs-default.mjs';\n" +
      "import './fs-namespace.mjs';\n" +
      "import './fs-promises.mjs';\n" +
      "import './fs-alias.mjs';\n" +
      "import './fs-capability-pass.mjs';\n" +
      "import './fs-mutation.mjs';\n" +
      "import './child-process.mjs';\n" +
      "import './read-only-local-containers.mjs';\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'loader-transport.mjs'),
      "function load(loader) { return loader('node:fs'); }\nload(require);\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-default.mjs'),
      "import fs from 'node:fs';\nfs.readFileSync('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-namespace.mjs'),
      "import * as fs from 'node:fs';\nfs.readFileSync('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-promises.mjs'),
      "import { readFile } from 'node:fs/promises';\nawait readFile('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-alias.mjs'),
      "import { readFileSync as read } from 'node:fs';\nread('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-capability-pass.mjs'),
      "import { readFileSync } from 'node:fs';\nconst read = readFileSync;\nread('./package.json');\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'fs-mutation.mjs'),
      "import { rmSync } from 'node:fs';\nrmSync('../ui-design-system', { recursive: true });\n",
    );
    writeFileSync(
      resolve(scriptsRoot, 'child-process.mjs'),
      "import { execSync } from 'node:child_process';\nexecSync('rm -rf ../ui-design-system');\n",
    );
    writeFileSync(resolve(scriptsRoot, 'read-only.sh'), 'bash "$SCRIPT_DIR/nested.sh"\n');
    writeFileSync(
      resolve(scriptsRoot, 'nested.sh'),
      [
        'DS_ROOT="$APP_ROOT/../ui-design-system/packages/core"',
        'rm -rf \\',
        '  "$DS_ROOT/dist"',
        'pnpm --dir \\',
        '  "$DS_ROOT" build',
        '',
      ].join('\n'),
    );
    writeFileSync(
      resolve(scriptsRoot, 'axiom-deploy-annotation.sh'),
      '#!/usr/bin/env bash\nDS_ROOT="$APP_ROOT/../ui-design-system/packages/core"\ntouch "$DS_ROOT/axiom-marker"\n',
    );

    const errors = auditPlatformExecutableClosure(platformRoot, packageManifest);
    assert.ok(errors.some((error) => (
      error.includes('loader-transport.mjs') && error.includes('loader transport is forbidden')
    )), errors.join('\n'));
    for (const file of [
      'fs-default.mjs',
      'fs-namespace.mjs',
      'fs-promises.mjs',
      'fs-alias.mjs',
      'fs-capability-pass.mjs',
      'fs-mutation.mjs',
      'child-process.mjs',
    ]) {
      assert.ok(errors.some((error) => (
        error.includes(`scripts/${file}`) && error.includes('violates executable policy')
      )), errors.join('\n'));
    }
    assert.ok(errors.some((error) => (
      error.includes('scripts/nested.sh') && error.includes('mutates the DS producer')
    )), errors.join('\n'));
    assert.ok(errors.some((error) => (
      error.includes('scripts/nested.sh') && error.includes('builds or installs the DS producer')
    )), errors.join('\n'));
    assert.ok(errors.some((error) => (
      error.includes('scripts/axiom-deploy-annotation.sh') && error.includes('mutates the DS producer')
    )), errors.join('\n'));
    assert.equal(errors.some((error) => error.includes('read-only-local-containers.mjs')), false);
    assert.equal(errors.some((error) => error.includes('read-only-continuation.sh')), false);
    assert.equal(errors.some((error) => error.includes('unreachable-forbidden.mjs')), false);
    assert.equal(producerFingerprint(), producerBefore);
  } finally {
    rmSync(platformRoot, { recursive: true, force: true });
  }
});
test('packed-artifact prerequisite rejects missing and stale build outputs', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-packed-prerequisite-'));
  try {
    mkdirSync(resolve(fixtureRoot, 'src'), { recursive: true });
    mkdirSync(resolve(fixtureRoot, 'dist'), { recursive: true });
    writeFileSync(resolve(fixtureRoot, 'package.json'), JSON.stringify({
      name: '@rottay/pack-prerequisite-fixture',
      exports: { '.': { import: './dist/index.js' } },
    }));
    writeFileSync(resolve(fixtureRoot, 'src/index.ts'), 'export const ready = true;\n');
    writeFileSync(resolve(fixtureRoot, 'dist/index.js'), 'export const ready = true;\n');

    assert.deepEqual(assertPackedBuildPrerequisite(fixtureRoot), {
      builtTargets: 1,
      requiredTargets: 1,
    });

    const future = new Date(Date.now() + 5_000);
    utimesSync(resolve(fixtureRoot, 'src/index.ts'), future, future);
    assert.throws(
      () => assertPackedBuildPrerequisite(fixtureRoot),
      /refuses stale producer output.*run the DS build/,
    );

    rmSync(resolve(fixtureRoot, 'dist/index.js'));
    assert.throws(
      () => assertPackedBuildPrerequisite(fixtureRoot),
      /requires a completed producer build.*missing \.\/dist\/index\.js/,
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('live core graph has no false optional or zero-importer peer', () => {
  const manifest = JSON.parse(readFileSync(resolve(coreRoot, 'package.json'), 'utf8'));
  assert.equal(basename(collectSourceEntrypoints(manifest).get('./icons')), 'icon-entry.ts');
  assert.equal(basename(collectSourceEntrypoints(manifest).get('./charts')), 'chart-entry.ts');
  assert.equal(
    basename(collectSourceEntrypoints(manifest).get('./charts/renderers')),
    'chart-renderers-entry.ts',
  );
  assert.equal(basename(collectSourceEntrypoints(manifest).get('./motion')), 'motion-entry.ts');
  assert.equal(basename(collectSourceEntrypoints(manifest).get('./effects')), 'effects-entry.ts');
  const graph = auditCoreDependencyGraph();
  assert.deepEqual(graph.errors, []);
  assert.deepEqual(graph.report['@phosphor-icons/react'], {
    productionImporters: 1,
    rootReachableImporters: 0,
  });
});

test('live lock and installed workspace expose one runtime identity with Motion direct and Framer transitive', () => {
  const result = auditRuntimeIdentities();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.identities, {
    react: ['19.2.5'],
    'react-dom': ['19.2.5'],
    dayjs: ['1.11.20'],
    motion: ['12.42.2'],
    'framer-motion': ['12.42.2'],
  });
});

test('live lock fixture comes from the checked-in lockfile', () => {
  const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8');
  assert.match(lock, /^lockfileVersion:/m);
});
