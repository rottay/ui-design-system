import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const OWNERS = new Set(['contracts', 'runtime', 'primitives', 'patterns', 'structures', 'surfaces']);
const UI_OWNERS = new Set(['primitives', 'patterns', 'structures', 'surfaces']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function relative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function manifestSource(root, filePath) {
  return relative(root, filePath).replace(/\.tsx$/, '.ts');
}

function resolveSourceModule(root, importer, specifier) {
  let base;
  if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier);
  else if (specifier.startsWith('@/')) base = path.resolve(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('@ui/')) base = path.resolve(root, 'src/ui', specifier.slice(4));
  else if (specifier.startsWith('@types/')) base = path.resolve(root, 'src/foundation/contracts', specifier.slice(7));
  else return null;

  const candidates = [
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isTypeOnlyImport(node) {
  if (!node.importClause) return false;
  if (node.importClause.isTypeOnly) return true;
  const bindings = node.importClause.namedBindings;
  return Boolean(bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0
    && bindings.elements.every((element) => element.isTypeOnly));
}

function isTypeOnlyExport(node) {
  if (node.isTypeOnly) return true;
  return Boolean(node.exportClause && ts.isNamedExports(node.exportClause)
    && node.exportClause.elements.length > 0
    && node.exportClause.elements.every((element) => element.isTypeOnly));
}

function parseModule(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function valueEdges(root, filePath, sourceFile) {
  const edges = [];
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      if (!isTypeOnlyImport(statement)) {
        const target = resolveSourceModule(root, filePath, statement.moduleSpecifier.text);
        if (target) edges.push(target);
      }
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier
      && ts.isStringLiteral(statement.moduleSpecifier) && !isTypeOnlyExport(statement)) {
      const target = resolveSourceModule(root, filePath, statement.moduleSpecifier.text);
      if (target) edges.push(target);
    }
  }
  return edges;
}

function collectGraph(root, entryFile) {
  const visited = new Set();
  const pending = [entryFile];
  let sourceBytes = 0;
  while (pending.length > 0) {
    const filePath = pending.pop();
    if (!filePath || visited.has(filePath)) continue;
    visited.add(filePath);
    sourceBytes += fs.statSync(filePath).size;
    for (const target of valueEdges(root, filePath, parseModule(filePath))) pending.push(target);
  }
  return { files: [...visited], sourceBytes };
}

function entryExports(root, entryFile) {
  const exports = [];
  for (const statement of parseModule(entryFile).statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      throw new Error(`${relative(root, entryFile)} must use named exports; export-star/default boundaries are forbidden`);
    }
    if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
      throw new Error(`${relative(root, entryFile)} must re-export directly from an owned source module`);
    }
    const target = resolveSourceModule(root, entryFile, statement.moduleSpecifier.text);
    if (!target) throw new Error(`${relative(root, entryFile)} has an unresolved or external export source`);
    for (const element of statement.exportClause.elements) {
      exports.push({
        name: element.name.text,
        kind: statement.isTypeOnly || element.isTypeOnly ? 'type' : 'value',
        source: manifestSource(root, target),
      });
    }
  }
  return exports;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

function packageExportFor(output) {
  return {
    types: `./dist/${output}.d.ts`,
    import: `./dist/${output}.js`,
    require: `./dist/${output}.cjs`,
  };
}

function bannedBarrels(root) {
  return new Set([
    path.resolve(root, 'src/index.ts'),
    path.resolve(root, 'src/ui/index.ts'),
    ...[...UI_OWNERS].map((owner) => path.resolve(root, `src/ui/${owner}/index.ts`)),
  ]);
}

export function runPublicEntrypointGate({ root = DEFAULT_ROOT, silent = false } = {}) {
  const manifestPath = path.join(root, 'public-entrypoints.manifest.json');
  const packagePath = path.join(root, 'package.json');
  const vitePath = path.join(root, 'vite.config.ts');
  const manifest = readJson(manifestPath);
  const packageJson = readJson(packagePath);
  const viteSource = fs.readFileSync(vitePath, 'utf8');
  const failures = [];
  const reports = [];
  const claimedSymbols = new Map();
  const banned = bannedBarrels(root);
  let runtimeSymbols = 0;
  let typeSymbols = 0;

  if (manifest.schemaVersion !== 2) failures.push('manifest schemaVersion must be 2');
  if (manifest.package !== packageJson.name) failures.push('manifest package must match package.json name');
  if (!viteSource.includes('preserveModules: true') || !viteSource.includes("preserveModulesRoot: 'src'")) {
    failures.push('vite.config.ts must preserve modules from src');
  }

  for (const [subpath, entry] of Object.entries(manifest.entries ?? {})) {
    try {
      if (!OWNERS.has(entry.owner)) throw new Error(`${subpath} has invalid owner ${entry.owner}`);
      if (!['contracts', 'runtime'].includes(entry.boundary)) throw new Error(`${subpath} has invalid boundary`);
      assertEqual(subpath, `./${entry.owner}/${entry.family}`, `${subpath} owner/family path`);
      assertEqual(
        entry.source,
        `src/entrypoints/public/${entry.owner}/${entry.family}/index.ts`,
        `${subpath} wrapper source`,
      );
      assertEqual(
        entry.output,
        entry.source.slice(4).replace(/\.ts$/, ''),
        `${subpath} preserveModules output`,
      );
      if ((entry.owner === 'contracts') !== (entry.boundary === 'contracts')) {
        throw new Error(`${subpath} contracts ownership and boundary must agree`);
      }
      const entryFile = path.resolve(root, entry.source);
      if (!fs.existsSync(entryFile)) throw new Error(`${subpath} source is missing: ${entry.source}`);
      const entryText = fs.readFileSync(entryFile, 'utf8');
      const hasClientDirective = /^\s*['"]use client['"];/.test(entryText);
      if (entry.client === true && !hasClientDirective) throw new Error(`${subpath} client boundary must begin with 'use client'`);
      if (entry.client !== true && hasClientDirective) throw new Error(`${subpath} non-client boundary must remain directive-free`);

      const actualExports = entryExports(root, entryFile);
      const expectedExports = [...entry.symbols]
        .map(({ name, kind }) => ({ name, kind }))
        .sort((a, b) => a.name.localeCompare(b.name));
      const actualSurface = actualExports
        .map(({ name, kind }) => ({ name, kind }))
        .sort((a, b) => a.name.localeCompare(b.name));
      assertEqual(JSON.stringify(actualSurface), JSON.stringify(expectedExports), `${subpath} manifest exports`);
      if (entry.boundary === 'contracts' && actualExports.some((item) => item.kind !== 'type')) {
        throw new Error(`${subpath} contracts may export types only`);
      }
      for (const exported of actualExports) {
        if (UI_OWNERS.has(entry.owner) && !exported.source.startsWith(`src/ui/${entry.owner}/`)) {
          throw new Error(`${subpath} symbol ${exported.name} is outside owner ${entry.owner}`);
        }
        if (entry.owner === 'runtime' && exported.source.startsWith('src/ui/')) {
          throw new Error(`${subpath} runtime symbol ${exported.name} belongs to a UI owner`);
        }
      }
      for (const symbol of entry.symbols) {
        if (symbol.kind === 'type') typeSymbols += 1;
        else runtimeSymbols += 1;
        const prior = claimedSymbols.get(symbol.name);
        if (prior) throw new Error(`${symbol.name} is claimed by both ${prior} and ${subpath}`);
        claimedSymbols.set(symbol.name, subpath);
      }

      assertEqual(
        JSON.stringify(packageJson.exports?.[subpath]),
        JSON.stringify(packageExportFor(entry.output)),
        `${subpath} package export`,
      );
      assertEqual(
        packageJson.releaseSync?.sourceEntrypoints?.[subpath],
        entry.source.replace(/^src\//, ''),
        `${subpath} releaseSync source`,
      );
      if (!viteSource.includes("readFileSync(resolve(__dirname, 'public-entrypoints.manifest.json')")
        || !viteSource.includes('...publicEntries')) {
        throw new Error('vite.config.ts does not derive public entries from the governed manifest');
      }

      const directSources = new Set(actualExports.map((item) => item.source)).size;
      const graph = collectGraph(root, entryFile);
      const barrel = graph.files.find((filePath) => banned.has(filePath));
      if (barrel) throw new Error(`${subpath} reaches forbidden root/tier barrel ${relative(root, barrel)}`);
      if (directSources > entry.budget.maxDirectSources) {
        throw new Error(`${subpath} direct fan-out ${directSources} exceeds ${entry.budget.maxDirectSources}`);
      }
      if (graph.files.length > entry.budget.maxReachableModules) {
        throw new Error(`${subpath} reachable fan-out ${graph.files.length} exceeds ${entry.budget.maxReachableModules}`);
      }
      if (graph.sourceBytes > entry.budget.maxSourceBytes) {
        throw new Error(`${subpath} source bytes ${graph.sourceBytes} exceeds ${entry.budget.maxSourceBytes}`);
      }
      reports.push({ subpath, directSources, reachableModules: graph.files.length, sourceBytes: graph.sourceBytes });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  const governedSubpaths = new Set(Object.keys(manifest.entries ?? {}));
  for (const subpath of Object.keys(packageJson.exports ?? {})) {
    if ([...OWNERS].some((owner) => subpath.startsWith(`./${owner}/`)) && !governedSubpaths.has(subpath)) {
      failures.push(`${subpath} is public but absent from public-entrypoints.manifest.json`);
    }
  }
  if (JSON.stringify(packageJson.exports?.['./public-entrypoints-manifest'])
    !== JSON.stringify({ default: './public-entrypoints.manifest.json' })) {
    failures.push('./public-entrypoints-manifest export is missing or incorrect');
  }
  if (!(packageJson.files ?? []).includes('public-entrypoints.manifest.json')) {
    failures.push('public-entrypoints.manifest.json is absent from package files');
  }
  const coverage = { runtimeSymbols, typeSymbols, totalSymbols: runtimeSymbols + typeSymbols };
  if (JSON.stringify(manifest.coverage) !== JSON.stringify(coverage)) {
    failures.push(`manifest coverage is stale: expected ${JSON.stringify(coverage)}`);
  }

  if (failures.length > 0) throw new Error(`Public entrypoint gate failed:\n- ${failures.join('\n- ')}`);
  if (!silent) {
    for (const report of reports) {
      console.log(`PASS ${report.subpath} direct=${report.directSources} reachable=${report.reachableModules} bytes=${report.sourceBytes}`);
    }
  }
  return reports;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPublicEntrypointGate();
}
