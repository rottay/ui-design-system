#!/usr/bin/env node
/**
 * consumer-proof-gate — the milestone A exit gate, made mechanical.
 *
 * WHY THIS EXISTS. The consumer contract is three documents and one lint rule.
 * None of them notices when a guaranteed subpath stops resolving, when a
 * published entrypoint drops a name an application imports, or when
 * `mountTenantTheme` changes shape: the rule reads a table, and a table cannot
 * see a signature. The proof of "apps can build" is an APPLICATION that builds,
 * so this gate asserts that the fixture application under
 * `tests/integration/consumer` exists, is wired into the runner that executes
 * it, imports only the sanctioned surface, still typechecks against the real
 * design-system sources, still resolves through the PUBLISHED export map into
 * built files that carry every binding it imports, and still passes.
 *
 * WHY POST-BUILD. Four of the six legs read source, but `published` reads
 * `dist/`: an application does not resolve `@rottay/design-system/server` to a
 * `.ts` file, it resolves it through `exports` to a built module. A gate that
 * only proved the source half would go green on a package that cannot be
 * consumed, which is the exact failure this one exists to catch.
 *
 * WHY THE DOCUMENT, NOT THE MIRROR. The disposition table is read from
 * `docs/consumer-contract/index.md` §1.2, which WO-CON-01 made the single
 * source. The TypeScript mirror the lint rule imports is proven equal to it by
 * that rule's own suite, so reading the mirror here would add a third copy of
 * one table and nothing else.
 *
 * Usage:
 *   node scripts/check/consumer-proof/index.mjs [--check] [--skip-suite]
 *   node scripts/check/consumer-proof/index.mjs --drill=<class>
 *
 * Drill classes: forbidden-import | unwired-alias | missing-fixture |
 * mount-signature. Each plants ONE violation in a temporary copy and requires
 * the matching leg to report it; a drill that finds nothing fails, because a
 * gate that cannot be seen failing is not evidence.
 *
 * Exit 0 = clean. Exit 1 = at least one finding (or a drill that stayed green).
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);

export const FIXTURE_DIR = 'tests/integration/consumer';
export const FIXTURE_SUITE = `${FIXTURE_DIR}/index.test.ts`;
export const FIXTURE_APP = `${FIXTURE_DIR}/app`;
export const CONTRACT_DOCUMENT = 'docs/consumer-contract/index.md';
export const CONTRACT_PACKAGE = '@rottay/design-system';

/**
 * The public specifiers the fixture is authored against, and the source each
 * one resolves to inside the package. Both resolvers must agree with this list:
 * the bundler alias that executes the fixture and the `paths` that typecheck
 * it. A fixture whose specifier silently resolved somewhere else would prove
 * nothing about the surface it names.
 */
export const PUBLIC_SPECIFIER_SOURCES = Object.freeze({
  '@rottay/design-system': 'src/index.ts',
  '@rottay/design-system/server': 'src/entrypoints/server/index.ts',
  '@rottay/design-system/icons': 'src/entrypoints/icons/index.ts',
});

/** The minimum an application has to be one: more than a single file. */
const MIN_APP_FILES = 4;
const MIN_PACKAGE_IMPORTS = 4;

// ── reading the fixture ────────────────────────────────────────────────────

function walk(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    const absolute = join(dir, entry);
    if (statSync(absolute).isDirectory()) walk(absolute, found);
    else if (/\.tsx?$/.test(entry)) found.push(absolute);
  }
  return found.sort();
}

/** Every authored file of the fixture application. */
export function appFiles(appRoot) {
  return existsSync(appRoot) ? walk(appRoot) : [];
}

/**
 * Import declarations, read as text.
 *
 * The gate deliberately does NOT load the TypeScript compiler for this: it runs
 * in the post-build chain beside gates that must stay cheap, and the fixture is
 * authored code this repository controls. The shape matched is the one the
 * fixture uses -- a static `import ... from '<specifier>'` -- and anything else
 * is reported as unreadable rather than skipped.
 */
export function readAppImports(appRoot, root = appRoot) {
  const imports = [];
  for (const file of appFiles(appRoot)) {
    const source = readFileSync(file, 'utf8');
    const pattern = /import\s+(type\s+)?([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const [, , clause, specifier] = match;
      const named = clause.match(/\{([\s\S]*)\}/);
      const names = named
        ? named[1]
            .split(',')
            .map((part) => part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
            .filter(Boolean)
        : [];
      imports.push({ file: relative(root, file), specifier, names });
    }
  }
  return imports;
}

/** `@rottay/design-system/x` -> `./x`; null for a specifier of another package. */
export function subpathOf(specifier) {
  if (specifier === CONTRACT_PACKAGE) return '.';
  if (!specifier.startsWith(`${CONTRACT_PACKAGE}/`)) return null;
  return `.${specifier.slice(CONTRACT_PACKAGE.length)}`;
}

/** The `guaranteed` rows of §1.2, read from the document that owns them. */
export function guaranteedSubpaths(markdown) {
  const start = markdown.indexOf('<!-- consumer-contract:published:start -->');
  const end = markdown.indexOf('<!-- consumer-contract:published:end -->');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('consumer-proof: the published table fences of the contract document are missing or inverted');
  }
  const rows = markdown
    .slice(start, end)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  const guaranteed = new Set();
  for (const row of rows) {
    const cells = row.split('|').map((cell) => cell.trim());
    const subpath = (cells[1] ?? '').replace(/^`|`$/g, '');
    if (cells[2] === 'guaranteed') guaranteed.add(subpath);
  }
  if (guaranteed.size === 0) {
    throw new Error('consumer-proof: the published table carries no guaranteed row');
  }
  return guaranteed;
}

// ── the legs ───────────────────────────────────────────────────────────────

export function auditPresence({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR } = {}) {
  const findings = [];
  const suite = join(packageRoot, fixtureDir, 'index.test.ts');
  const appRoot = join(packageRoot, fixtureDir, 'app');
  if (!existsSync(suite)) {
    findings.push({ leg: 'presence', detail: `the consumer fixture suite is absent: ${fixtureDir}/index.test.ts` });
  }
  const files = appFiles(appRoot);
  if (files.length < MIN_APP_FILES) {
    findings.push({
      leg: 'presence',
      detail: `the fixture application has ${files.length} authored files; an application proof needs at least ${MIN_APP_FILES}`,
    });
  }
  const imports = readAppImports(appRoot, packageRoot).filter((entry) => subpathOf(entry.specifier));
  if (imports.length < MIN_PACKAGE_IMPORTS) {
    findings.push({
      leg: 'presence',
      detail: `the fixture application addresses ${CONTRACT_PACKAGE} ${imports.length} times; at least ${MIN_PACKAGE_IMPORTS} are required`,
    });
  }
  return findings;
}

export function auditWiring({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR } = {}) {
  const findings = [];
  const vitestConfig = readFileSync(join(packageRoot, 'vitest.config.ts'), 'utf8');
  const testsProject = readFileSync(join(packageRoot, 'tsconfig.tests.json'), 'utf8');

  // The runner that executes the fixture must actually collect it.
  if (!vitestConfig.includes("'tests/integration/**/*.test.{ts,tsx}'")) {
    findings.push({
      leg: 'wiring',
      detail: 'vitest.config.ts no longer collects tests/integration/**; the fixture would pass by never running',
    });
  }
  if (!fixtureDir.startsWith('tests/integration/')) {
    findings.push({ leg: 'wiring', detail: `the fixture lives outside the integration project: ${fixtureDir}` });
  }

  for (const [specifier, source] of Object.entries(PUBLIC_SPECIFIER_SOURCES)) {
    if (!existsSync(join(packageRoot, source))) {
      findings.push({ leg: 'wiring', detail: `${specifier} resolves to a source that does not exist: ${source}` });
    }
    if (!new RegExp(`'${specifier}':\\s*resolve\\(__dirname, '\\./${source}'\\)`).test(vitestConfig)) {
      findings.push({
        leg: 'wiring',
        detail: `vitest.config.ts does not resolve ${specifier} to ${source}; the fixture would import an unresolved module or the wrong one`,
      });
    }
    if (!new RegExp(`"${specifier}":\\s*\\["\\./${source}"\\]`).test(testsProject)) {
      findings.push({
        leg: 'wiring',
        detail: `tsconfig.tests.json does not map ${specifier} to ${source}; the fixture would typecheck against nothing`,
      });
    }
  }
  return findings;
}

export function auditSurface({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR, documentMarkdown } = {}) {
  const markdown = documentMarkdown ?? readFileSync(join(packageRoot, CONTRACT_DOCUMENT), 'utf8');
  const guaranteed = guaranteedSubpaths(markdown);
  const findings = [];
  for (const entry of readAppImports(join(packageRoot, fixtureDir, 'app'), packageRoot)) {
    const subpath = subpathOf(entry.specifier);
    if (subpath === null) continue;
    if (!guaranteed.has(subpath)) {
      findings.push({
        leg: 'surface',
        detail: `${entry.file} imports ${entry.specifier}, which is not guaranteed by ${CONTRACT_DOCUMENT} §1.2`,
      });
    }
  }
  return findings;
}

/**
 * The published half: the export map, the built files, and the bindings.
 *
 * This is the only leg that needs `dist/`, and it is the reason the gate runs
 * after the build. It asks the question an application asks: does this
 * specifier resolve, and does what it resolves to carry the names I import.
 */
export async function auditPublished({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR } = {}) {
  const findings = [];
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  const imports = readAppImports(join(packageRoot, fixtureDir, 'app'), packageRoot);
  const bySubpath = new Map();
  for (const entry of imports) {
    const subpath = subpathOf(entry.specifier);
    if (subpath === null) continue;
    const names = bySubpath.get(subpath) ?? new Set();
    for (const name of entry.names) names.add(name);
    bySubpath.set(subpath, names);
  }

  for (const [subpath, names] of bySubpath) {
    const target = manifest.exports?.[subpath];
    if (!target) {
      findings.push({ leg: 'published', detail: `package.json does not export ${subpath}, which the fixture imports` });
      continue;
    }
    const files = [target.types, target.import, target.require].filter(Boolean);
    if (files.length === 0) {
      findings.push({ leg: 'published', detail: `the export entry for ${subpath} names no file` });
      continue;
    }
    for (const file of files) {
      if (!existsSync(join(packageRoot, file))) {
        findings.push({ leg: 'published', detail: `${subpath} maps to ${file}, which the build did not produce` });
      }
    }
    const entryFile = target.import;
    if (!entryFile || !existsSync(join(packageRoot, entryFile))) continue;
    let module;
    try {
      module = await import(pathToFileURL(join(packageRoot, entryFile)).href);
    } catch (error) {
      findings.push({ leg: 'published', detail: `${subpath} (${entryFile}) cannot be imported: ${error.message}` });
      continue;
    }
    for (const name of names) {
      // A type-only binding has no runtime shape. Capitalised names are
      // ambiguous between a component and a type, so they are proven by the
      // typecheck leg instead of being guessed at here.
      if (!(name in module) && !/^[A-Z]/.test(name)) {
        findings.push({ leg: 'published', detail: `${subpath} no longer exports ${name}, which the fixture imports` });
      }
    }
  }
  return findings;
}

/**
 * The signature half: the fixture application compiled against the real
 * design-system sources.
 *
 * `pathOverrides` exists for the drill, which points one specifier at a shim
 * carrying a changed `mountTenantTheme` and requires this leg to go red.
 */
export function auditSignature({
  packageRoot = PACKAGE_ROOT,
  fixtureDir = FIXTURE_DIR,
  appRoot,
  pathOverrides = {},
} = {}) {
  const source = appRoot ?? join(packageRoot, fixtureDir, 'app');
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-'));
  try {
    const appDir = join(workspace, 'app');
    cpSync(source, appDir, { recursive: true });
    const paths = {
      '@/*': [join(packageRoot, 'src/*')],
      '@ui/*': [join(packageRoot, 'src/components/*')],
      '@types/*': [join(packageRoot, 'src/foundation/contracts/*')],
    };
    for (const [specifier, relativeSource] of Object.entries(PUBLIC_SPECIFIER_SOURCES)) {
      paths[specifier] = [pathOverrides[specifier] ?? join(packageRoot, relativeSource)];
    }
    const tsconfig = join(workspace, 'tsconfig.json');
    writeFileSync(tsconfig, JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'ES2022'],
        strict: true,
        noEmit: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        esModuleInterop: true,
        skipLibCheck: true,
        jsx: 'react-jsx',
        typeRoots: [join(packageRoot, 'node_modules/@types')],
        paths,
      },
      include: [join(appDir, '**/*.ts'), join(appDir, '**/*.tsx')],
    }, null, 2));

    let diagnostics = '';
    try {
      execFileSync(
        process.execPath,
        [join(packageRoot, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', tsconfig],
        { cwd: workspace, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
    } catch (error) {
      diagnostics = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    }
    // Only diagnostics in the fixture APPLICATION are this gate's subject. The
    // design system's own sources compile here because the fixture consumes
    // them; their health is `pnpm typecheck`'s question. The marker is the
    // workspace directory name because tsc reports paths relative to its cwd,
    // and on macOS that relative path walks out through `/private/var`.
    const marker = `${workspace.split('/').pop()}/app/`;
    return diagnostics
      .split('\n')
      .filter((line) => line.includes(marker))
      .map((line) => ({ leg: 'signature', detail: line.trim() }));
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

/** The fixture itself, run by the runner that owns it. */
export function auditSuite({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR } = {}) {
  try {
    execFileSync(
      'npx',
      ['vitest', 'run', fixtureDir, '--project', 'integration', '--reporter=dot'],
      { cwd: packageRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return [];
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    const failures = output
      .split('\n')
      .filter((line) => /^\s*(FAIL|×)/.test(line))
      .slice(0, 10)
      .map((line) => line.trim());
    return [{
      leg: 'suite',
      detail: `the consumer fixture does not pass:\n    ${failures.join('\n    ') || output.trim().split('\n').slice(-5).join('\n    ')}`,
    }];
  }
}

export async function auditConsumerProof({ packageRoot = PACKAGE_ROOT, skipSuite = false } = {}) {
  const findings = [
    ...auditPresence({ packageRoot }),
    ...auditWiring({ packageRoot }),
    ...auditSurface({ packageRoot }),
    ...(await auditPublished({ packageRoot })),
    ...auditSignature({ packageRoot }),
  ];
  if (!skipSuite) findings.push(...auditSuite({ packageRoot }));
  return findings;
}

// ── drills ─────────────────────────────────────────────────────────────────

export const DRILL_CLASSES = Object.freeze([
  'forbidden-import',
  'unwired-alias',
  'missing-fixture',
  'mount-signature',
]);

function sandboxApp(packageRoot) {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
  const appRoot = join(workspace, 'app');
  cpSync(join(packageRoot, FIXTURE_DIR, 'app'), appRoot, { recursive: true });
  return { workspace, appRoot };
}

/**
 * Plants ONE violation and reports whether the matching leg caught it.
 * Nothing is written inside the repository: every plant lives in a temporary
 * copy, so a drill cannot leave residue behind a failed run.
 */
export function runDrill(drill, { packageRoot = PACKAGE_ROOT } = {}) {
  if (!DRILL_CLASSES.includes(drill)) {
    throw new Error(`consumer-proof: unknown drill class ${JSON.stringify(drill)}`);
  }

  if (drill === 'forbidden-import') {
    const { workspace, appRoot } = sandboxApp(packageRoot);
    try {
      const page = join(appRoot, 'page.tsx');
      writeFileSync(
        page,
        readFileSync(page, 'utf8').replace(
          `from '${CONTRACT_PACKAGE}'`,
          `from '${CONTRACT_PACKAGE}/primitives/button'`,
        ),
      );
      const markdown = readFileSync(join(packageRoot, CONTRACT_DOCUMENT), 'utf8');
      const guaranteed = guaranteedSubpaths(markdown);
      const findings = readAppImports(appRoot, workspace)
        .map((entry) => ({ entry, subpath: subpathOf(entry.specifier) }))
        .filter((row) => row.subpath !== null && !guaranteed.has(row.subpath))
        .map((row) => ({ leg: 'surface', detail: `${row.entry.file} imports ${row.entry.specifier}` }));
      return { drill, findings };
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  if (drill === 'unwired-alias') {
    const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
    try {
      // A full copy of the two resolver declarations, with one alias removed.
      cpSync(join(packageRoot, FIXTURE_DIR), join(workspace, FIXTURE_DIR), { recursive: true });
      mkdirSync(join(workspace, 'src/entrypoints/server'), { recursive: true });
      for (const source of Object.values(PUBLIC_SPECIFIER_SOURCES)) {
        mkdirSync(dirname(join(workspace, source)), { recursive: true });
        writeFileSync(join(workspace, source), '');
      }
      writeFileSync(
        join(workspace, 'vitest.config.ts'),
        readFileSync(join(packageRoot, 'vitest.config.ts'), 'utf8')
          .split('\n')
          .filter((line) => !line.includes("'@rottay/design-system/server':"))
          .join('\n'),
      );
      cpSync(join(packageRoot, 'tsconfig.tests.json'), join(workspace, 'tsconfig.tests.json'));
      return { drill, findings: auditWiring({ packageRoot: workspace }) };
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  if (drill === 'missing-fixture') {
    const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
    try {
      mkdirSync(join(workspace, FIXTURE_DIR, 'app'), { recursive: true });
      return { drill, findings: auditPresence({ packageRoot: workspace }) };
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  // mount-signature: the fixture is typechecked against a server entrypoint
  // whose `mountTenantTheme` takes one argument and returns nothing the
  // application can read. The real source is untouched; the shim re-exports it
  // and shadows exactly the one declaration under test.
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
  try {
    const shim = join(workspace, 'server-mutant.ts');
    writeFileSync(
      shim,
      [
        `export * from ${JSON.stringify(join(packageRoot, 'src/entrypoints/server/index'))};`,
        '/** The planted signature change: the option bag and the return shape are gone. */',
        'export declare function mountTenantTheme(intent: unknown): Promise<void>;',
        '',
      ].join('\n'),
    );
    return {
      drill,
      findings: auditSignature({
        packageRoot,
        pathOverrides: { '@rottay/design-system/server': shim },
      }),
    };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

// ── cli ────────────────────────────────────────────────────────────────────

function report(findings) {
  for (const finding of findings) console.error(`consumer-proof: [${finding.leg}] ${finding.detail}`);
}

async function main(argv) {
  const drillArgument = argv.find((argument) => argument.startsWith('--drill'));
  if (drillArgument) {
    const drill = drillArgument.includes('=') ? drillArgument.split('=')[1] : argv[argv.indexOf(drillArgument) + 1];
    const { findings } = runDrill(drill);
    if (findings.length === 0) {
      console.error(`consumer-proof: DRILL FAILED — the planted ${drill} violation was not reported.`);
      return 1;
    }
    console.log(`consumer-proof: drill ${drill} caught (${findings.length} finding(s)).`);
    return 0;
  }

  const skipSuite = argv.includes('--skip-suite');
  const findings = await auditConsumerProof({ skipSuite });
  if (findings.length > 0) {
    report(findings);
    console.error(`consumer-proof: FAIL — ${findings.length} finding(s).`);
    return 1;
  }
  // `--skip-suite` is a development convenience and says so in the verdict; the
  // manifest entry never passes it, because the five static legs prove the
  // fixture is admissible and only the sixth proves it passes.
  console.log(
    `consumer-proof: OK — the fixture application under ${FIXTURE_DIR} is present, wired, sanctioned, published and typed${
      skipSuite ? ' (suite NOT run: --skip-suite)' : ', and its suite passes'
    }.`,
  );
  return 0;
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
