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
 * built modules and DECLARATIONS that carry every binding it imports, still
 * compiles against the packed tarball with no source alias in sight, and still
 * passes.
 *
 * WHY POST-BUILD. Four of the seven legs read source, but `published` and
 * `packed` read `dist/`: an application does not resolve
 * `@rottay/design-system/server` to a `.ts` file, it resolves it through
 * `exports` to a built module and its declaration. A gate that only proved the
 * source half would go green on a package that cannot be consumed, which is the
 * exact failure this one exists to catch.
 *
 * WHY A PACKED CONSUMER. The source legs typecheck the fixture through `paths`
 * aliases that point at `src/`, which is a question no application asks. A
 * package whose published declarations had dropped `Button`, or whose emitted
 * `mountTenantTheme` took a `number`, kept this gate green while a real bundler
 * consumer went red (DEL-03). The `packed` leg installs the `npm pack` tarball
 * into a workspace with NO alias to this repository's sources and compiles the
 * same fixture against it; `published` proves bindings against the emitted
 * declarations instead of assuming a capitalised name is somebody else's
 * problem.
 *
 * WHY THE DOCUMENT, NOT THE MIRROR. The disposition table is read from
 * `docs/consumer-contract/index.md` §1.2, which WO-CON-01 made the single
 * source. The TypeScript mirror the lint rule imports is proven equal to it by
 * that rule's own suite, so reading the mirror here would add a third copy of
 * one table and nothing else.
 *
 * Usage:
 *   node scripts/check/consumer-proof/index.mjs [--check] [--skip-suite] [--skip-packed]
 *   node scripts/check/consumer-proof/index.mjs --drill=<class>
 *
 * Drill classes: forbidden-import | unwired-alias | missing-fixture |
 * mount-signature | missing-capitalized-export | emitted-declaration. Each
 * plants ONE violation in a temporary copy and requires the matching leg to
 * report it; a drill that finds nothing fails, because a gate that cannot be
 * seen failing is not evidence. The two package drills also run an UNMUTATED
 * twin of the same procedure and require it to be green, because a red that
 * would have been red anyway measures the drill's plumbing and not its plant.
 *
 * Exit 0 = clean. Exit 1 = at least one finding (or a drill that stayed green).
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
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
 * The exported names of a built declaration file, and whether each one carries
 * a runtime value.
 *
 * This loads the TypeScript checker rather than reading the text because the
 * published declarations are re-export chains: `dist/index.d.ts` names no
 * component at all, so a regular expression over it answers "Button is
 * missing" for a package that exports it and "Button is present" for one that
 * does not. `null` means the file declares no readable module surface, which is
 * itself a finding for the caller.
 */
export async function declaredExports(declarationFile) {
  const ts = (await import('typescript')).default;
  const program = ts.createProgram([declarationFile], {
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
  });
  const source = program.getSourceFile(declarationFile);
  if (!source) return null;
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) return null;
  const exported = new Map();
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    let resolved = symbol;
    if (resolved.flags & ts.SymbolFlags.Alias) {
      try {
        resolved = checker.getAliasedSymbol(resolved);
      } catch {
        resolved = symbol;
      }
    }
    exported.set(symbol.getName(), Boolean(resolved.flags & ts.SymbolFlags.Value));
  }
  return exported;
}

/**
 * The published half: the export map, the built files, the emitted
 * declarations, and the bindings.
 *
 * This is one of the two legs that need `dist/`, and it is the reason the gate
 * runs after the build. It asks the question an application asks: does this
 * specifier resolve, and does what it resolves to -- module AND declaration --
 * carry the names I import.
 *
 * `appRoot` exists so the exports of one package can be audited against the
 * fixture of another: the packed leg audits the tarball it installed, and the
 * DEL-03 reproduction audits a scratch package.
 */
export async function auditPublished({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR, appRoot } = {}) {
  const findings = [];
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  const imports = readAppImports(appRoot ?? join(packageRoot, fixtureDir, 'app'), packageRoot);
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
    const declarationFile = target.types;
    let declaration = null;
    if (!declarationFile) {
      findings.push({ leg: 'published', detail: `the export entry for ${subpath} names no declaration file` });
    } else if (existsSync(join(packageRoot, declarationFile))) {
      declaration = await declaredExports(join(packageRoot, declarationFile));
      if (declaration === null) {
        findings.push({
          leg: 'published',
          detail: `${subpath} maps to ${declarationFile}, which declares no readable module surface`,
        });
      }
    }

    const entryFile = target.import;
    let module = null;
    if (entryFile && existsSync(join(packageRoot, entryFile))) {
      try {
        module = await import(pathToFileURL(join(packageRoot, entryFile)).href);
      } catch (error) {
        findings.push({ leg: 'published', detail: `${subpath} (${entryFile}) cannot be imported: ${error.message}` });
      }
    }

    for (const name of names) {
      if (declaration && !declaration.has(name)) {
        findings.push({
          leg: 'published',
          detail: `${subpath} no longer declares ${name} in ${declarationFile}, which the fixture imports`,
        });
        continue;
      }
      // A type has no runtime shape; a name the declarations publish as a value
      // must also be a binding of the built module.
      if (module && declaration?.get(name) === true && !(name in module)) {
        findings.push({ leg: 'published', detail: `${subpath} no longer exports ${name}, which the fixture imports` });
      }
    }
  }
  return findings;
}

// ── the packed consumer ────────────────────────────────────────────────────

/**
 * Temporary roots this process owns. The packed tarball is reused across legs
 * and drills within one run, so its directory outlives the call that made it
 * and is removed when the process ends instead.
 */
const TEMPORARY_ROOTS = new Set();
const PACKED_TARBALLS = new Map();

function temporaryRoot(prefix) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  TEMPORARY_ROOTS.add(directory);
  return directory;
}

function discardTemporaryRoot(directory) {
  rmSync(directory, { recursive: true, force: true });
  TEMPORARY_ROOTS.delete(directory);
}

process.on('exit', () => {
  for (const directory of TEMPORARY_ROOTS) rmSync(directory, { recursive: true, force: true });
});

/**
 * The tarball a registry would receive, built once per process.
 *
 * `--ignore-scripts` keeps `prepack` out of this: the packing gates are their
 * own manifest entries, and running them from inside another gate would make
 * one failure report as two.
 */
export function packPackage(packageRoot = PACKAGE_ROOT) {
  const cached = PACKED_TARBALLS.get(packageRoot);
  if (cached && existsSync(cached)) return cached;
  const destination = temporaryRoot('consumer-proof-pack-');
  // `npm pack` narrates one line per packed file, and this package packs
  // thousands: the default buffer is not big enough to hold the report.
  const output = execFileSync(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', destination],
    { cwd: packageRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
  );
  const [entry] = JSON.parse(output);
  const tarball = join(destination, entry?.filename ?? '');
  if (!entry?.filename || !existsSync(tarball)) {
    throw new Error(`consumer-proof: npm pack produced no tarball in ${destination}`);
  }
  PACKED_TARBALLS.set(packageRoot, tarball);
  return tarball;
}

/**
 * The fixture application beside an INSTALLED copy of the packed package.
 *
 * The workspace carries no `paths` entry at all: the specifiers resolve the way
 * an application resolves them, through `node_modules` and the package's own
 * `exports` map. The repository's own dependencies are linked in so that
 * `react` and the type roots resolve, and `@rottay` is deliberately not among
 * them -- the only copy of this package in the workspace is the tarball.
 */
export function installPackedConsumer({ packageRoot = PACKAGE_ROOT, fixtureDir = FIXTURE_DIR, tarball } = {}) {
  const workspace = temporaryRoot('consumer-proof-packed-');
  const modules = join(workspace, 'node_modules');
  mkdirSync(join(modules, '@rottay'), { recursive: true });
  execFileSync('tar', ['-xzf', tarball ?? packPackage(packageRoot), '-C', workspace], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const packedRoot = join(modules, '@rottay', 'design-system');
  renameSync(join(workspace, 'package'), packedRoot);

  const dependencies = join(packageRoot, 'node_modules');
  for (const entry of readdirSync(dependencies)) {
    if (entry === '@rottay' || entry === 'node_modules') continue;
    symlinkSync(join(dependencies, entry), join(modules, entry));
  }

  cpSync(join(packageRoot, fixtureDir, 'app'), join(workspace, 'app'), { recursive: true });
  writeFileSync(join(workspace, 'tsconfig.json'), JSON.stringify({
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
    },
    include: ['app/**/*.ts', 'app/**/*.tsx'],
  }, null, 2));
  return { workspace, packedRoot };
}

function typecheckPackedApp(workspace, packageRoot) {
  let diagnostics = '';
  let failed = false;
  try {
    execFileSync(
      process.execPath,
      [join(packageRoot, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', join(workspace, 'tsconfig.json')],
      { cwd: workspace, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (error) {
    failed = true;
    diagnostics = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  // The marker is the workspace directory name because tsc reports paths
  // relative to its cwd, and on macOS that relative path walks out through
  // `/private/var`.
  const marker = `${workspace.split('/').pop()}/app/`;
  const findings = diagnostics
    .split('\n')
    .filter((line) => line.includes(marker))
    .map((line) => ({ leg: 'packed', detail: line.trim() }));
  // A compilation that failed somewhere else -- an unreadable config, no inputs
  // at all -- must not read as a green fixture.
  if (failed && findings.length === 0) {
    findings.push({
      leg: 'packed',
      detail: `the packed consumer did not compile, and the diagnostics are not the fixture's: ${
        diagnostics.trim().split('\n').slice(-5).join(' ')
      }`,
    });
  }
  return findings;
}

/**
 * The shipping half: the fixture compiled against the PACKED package, with no
 * TypeScript source alias anywhere in the workspace.
 *
 * Three questions in one leg, all of them an application's: does the tarball
 * even carry a declaration for each specifier the fixture names (the `files`
 * allowlist decides that, and it is hand-written); do the packed module and
 * declaration carry every binding the fixture imports; and does the fixture
 * still typecheck against the emitted `.d.ts` files rather than against `src/`.
 *
 * `mutate` is the drill's hook: it runs against the installed copy, so a plant
 * never touches this repository.
 */
export async function auditPacked({
  packageRoot = PACKAGE_ROOT,
  fixtureDir = FIXTURE_DIR,
  mutate,
} = {}) {
  const { workspace, packedRoot } = installPackedConsumer({ packageRoot, fixtureDir });
  try {
    const findings = [];
    const manifest = JSON.parse(readFileSync(join(packedRoot, 'package.json'), 'utf8'));
    for (const specifier of Object.keys(PUBLIC_SPECIFIER_SOURCES)) {
      const target = manifest.exports?.[subpathOf(specifier)];
      const declarationFile = target?.types;
      if (!declarationFile || !existsSync(join(packedRoot, declarationFile))) {
        findings.push({
          leg: 'packed',
          detail: `the tarball ships no declaration for ${specifier}${declarationFile ? ` (${declarationFile})` : ''}; the \`files\` allowlist does not deliver the surface the fixture imports`,
        });
      }
    }

    mutate?.({ packedRoot, workspace });

    for (const finding of await auditPublished({
      packageRoot: packedRoot,
      appRoot: join(packageRoot, fixtureDir, 'app'),
    })) {
      findings.push({ leg: 'packed', detail: `in the packed tarball, ${finding.detail}` });
    }
    findings.push(...typecheckPackedApp(workspace, packageRoot));
    return findings;
  } finally {
    discardTemporaryRoot(workspace);
  }
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

export async function auditConsumerProof({
  packageRoot = PACKAGE_ROOT,
  skipSuite = false,
  skipPacked = false,
} = {}) {
  const findings = [
    ...auditPresence({ packageRoot }),
    ...auditWiring({ packageRoot }),
    ...auditSurface({ packageRoot }),
    ...(await auditPublished({ packageRoot })),
    ...auditSignature({ packageRoot }),
  ];
  if (!skipPacked) findings.push(...(await auditPacked({ packageRoot })));
  if (!skipSuite) findings.push(...auditSuite({ packageRoot }));
  return findings;
}

// ── drills ─────────────────────────────────────────────────────────────────

export const DRILL_CLASSES = Object.freeze([
  'forbidden-import',
  'unwired-alias',
  'missing-fixture',
  'mount-signature',
  'missing-capitalized-export',
  'emitted-declaration',
]);

/** The drills that plant into the packed package and therefore carry a twin. */
export const TWINNED_DRILL_CLASSES = Object.freeze(['missing-capitalized-export', 'emitted-declaration']);

function sandboxApp(packageRoot) {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
  const appRoot = join(workspace, 'app');
  cpSync(join(packageRoot, FIXTURE_DIR, 'app'), appRoot, { recursive: true });
  return { workspace, appRoot };
}

/**
 * The names the fixture imports from the published root, and the capitalised
 * one the export drill removes.
 *
 * `Button` is preferred because it is the name DEL-03 proved invisible; any
 * other capitalised import keeps the drill plantable if the fixture changes.
 */
export function rootImportNames(packageRoot = PACKAGE_ROOT) {
  const names = new Set();
  for (const entry of readAppImports(join(packageRoot, FIXTURE_DIR, 'app'), packageRoot)) {
    if (subpathOf(entry.specifier) !== '.') continue;
    for (const name of entry.names) names.add(name);
  }
  return [...names].sort();
}

/**
 * Removes ONE capitalised name from the packed package's published root: the
 * entry point is replaced by a barrel that re-exports every other name the
 * fixture imports, and the export map is repointed at it. The original files
 * stay on disk so that nothing else in the tarball changes meaning.
 */
function plantMissingRootExport(packedRoot, names, dropped) {
  const manifestPath = join(packedRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const target = manifest.exports?.['.'];
  if (!target?.types || !target?.import) {
    throw new Error('consumer-proof: the packed package publishes no root declaration to plant into');
  }
  const kept = names.filter((name) => name !== dropped);
  const declarationEntry = `./${dirname(target.types)}/consumer-proof-mutant.d.ts`.replace('/./', '/');
  const moduleEntry = `./${dirname(target.import)}/consumer-proof-mutant.js`.replace('/./', '/');
  const originalDeclaration = `./${basename(target.types).replace(/\.d\.ts$/, '')}`;
  const originalModule = `./${basename(target.import)}`;
  writeFileSync(join(packedRoot, declarationEntry), `export { ${kept.join(', ')} } from '${originalDeclaration}';\n`);
  writeFileSync(join(packedRoot, moduleEntry), `export { ${kept.join(', ')} } from '${originalModule}';\n`);
  manifest.exports['.'] = { ...target, types: declarationEntry, import: moduleEntry };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Every emitted declaration of the packed tarball, deepest last. */
function packedDeclarations(directory, found = []) {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) packedDeclarations(absolute, found);
    else if (entry.endsWith('.d.ts')) found.push(absolute);
  }
  return found;
}

/**
 * Retypes the FIRST parameter of the emitted `mountTenantTheme` declaration,
 * which is the exact mutation DEL-03 ran against `mount/index.d.ts` and watched
 * this gate ignore.
 */
function plantEmittedDeclarationChange(packedRoot) {
  const pattern = /(export declare function mountTenantTheme\(intent: )([A-Za-z_$][\w$]*)/;
  for (const file of packedDeclarations(join(packedRoot, 'dist'))) {
    const source = readFileSync(file, 'utf8');
    if (!pattern.test(source)) continue;
    writeFileSync(file, source.replace(pattern, '$1number'));
    return file;
  }
  throw new Error('consumer-proof: the packed tarball declares no mountTenantTheme to plant into');
}

/**
 * Plants ONE violation and reports whether the matching leg caught it.
 * Nothing is written inside the repository: every plant lives in a temporary
 * copy, so a drill cannot leave residue behind a failed run.
 *
 * A drill that plants into the packed package also returns `twinFindings`: the
 * identical procedure with no plant. The plant is only evidence when its twin
 * is green, because an installation that was broken on its own would report the
 * same red for a reason that has nothing to do with the mutation.
 */
export async function runDrill(drill, { packageRoot = PACKAGE_ROOT } = {}) {
  if (!DRILL_CLASSES.includes(drill)) {
    throw new Error(`consumer-proof: unknown drill class ${JSON.stringify(drill)}`);
  }

  if (drill === 'missing-capitalized-export') {
    const names = rootImportNames(packageRoot);
    const dropped = names.includes('Button') ? 'Button' : names.find((name) => /^[A-Z]/.test(name));
    if (!dropped) throw new Error('consumer-proof: the fixture imports no capitalised name from the published root');
    return {
      drill,
      dropped,
      findings: await auditPacked({
        packageRoot,
        mutate: ({ packedRoot }) => plantMissingRootExport(packedRoot, names, dropped),
      }),
      twinFindings: await auditPacked({ packageRoot }),
    };
  }

  if (drill === 'emitted-declaration') {
    return {
      drill,
      findings: await auditPacked({
        packageRoot,
        mutate: ({ packedRoot }) => plantEmittedDeclarationChange(packedRoot),
      }),
      twinFindings: await auditPacked({ packageRoot }),
    };
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
      return { drill, findings, twinFindings: null };
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
      return { drill, findings: auditWiring({ packageRoot: workspace }), twinFindings: null };
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  if (drill === 'missing-fixture') {
    const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-drill-'));
    try {
      mkdirSync(join(workspace, FIXTURE_DIR, 'app'), { recursive: true });
      return { drill, findings: auditPresence({ packageRoot: workspace }), twinFindings: null };
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
      twinFindings: null,
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
    const { findings, twinFindings } = await runDrill(drill);
    if (findings.length === 0) {
      console.error(`consumer-proof: DRILL FAILED — the planted ${drill} violation was not reported.`);
      return 1;
    }
    if (twinFindings !== null && twinFindings.length > 0) {
      report(twinFindings);
      console.error(
        `consumer-proof: DRILL FAILED — the unmutated twin of ${drill} is red, so its ${findings.length} finding(s) prove nothing.`,
      );
      return 1;
    }
    console.log(
      `consumer-proof: drill ${drill} caught (${findings.length} finding(s))${
        twinFindings === null ? '' : ', and its unmutated twin is green'
      }.`,
    );
    return 0;
  }

  const skipSuite = argv.includes('--skip-suite');
  const skipPacked = argv.includes('--skip-packed');
  const findings = await auditConsumerProof({ skipSuite, skipPacked });
  if (findings.length > 0) {
    report(findings);
    console.error(`consumer-proof: FAIL — ${findings.length} finding(s).`);
    return 1;
  }
  // `--skip-suite` and `--skip-packed` are development conveniences and say so
  // in the verdict; the manifest entry never passes either, because the static
  // legs prove the fixture is admissible, the packed leg proves the shipped
  // package carries what it imports, and the suite proves it passes.
  console.log(
    `consumer-proof: OK — the fixture application under ${FIXTURE_DIR} is present, wired, sanctioned, published and typed${
      skipPacked ? ' (packed consumer NOT built: --skip-packed)' : ', builds against the packed package'
    }${skipSuite ? ' (suite NOT run: --skip-suite)' : ', and its suite passes'}.`,
  );
  return 0;
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
