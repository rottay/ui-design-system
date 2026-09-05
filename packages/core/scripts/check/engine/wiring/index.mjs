#!/usr/bin/env node
/**
 * engine-wiring-gate — the callers, not the contracts.
 *
 * The engine seam can be perfectly designed and reach nothing. This gate
 * measures the wiring itself: that every productive compile RESOLVES its
 * adapter instead of naming one, that no fallback symbol or fallback shape
 * survives anywhere in productive source, that no component forwards one
 * engine's directory under another engine's key, and that exactly one owner
 * states which engine renders when nothing declares one.
 *
 * Source-only. It never reads `dist`, so a stale build cannot turn it green.
 *
 * Usage:
 *   node scripts/check/engine/wiring/index.mjs            # report + exit code
 *   node scripts/check/engine/wiring/index.mjs --json     # machine-readable
 *   node scripts/check/engine/wiring/index.mjs --root <p> # fixture self-test
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));

/** Roots swept, relative to the package root. */
export const SWEPT_ROOTS = Object.freeze([
  'src',
  'scripts',
  join('..', 'showroom', 'src'),
]);

const SOURCE_EXTENSIONS = /\.(ts|tsx|mjs|js)$/;
const NON_PRODUCTIVE = /(^|\/)(tests|__snapshots__|node_modules|dist)(\/|$)/;
const NON_PRODUCTIVE_FILE = /\.(test|spec)\.[tj]sx?$|\.test\.mjs$|\.stories\./;

/**
 * The one owner allowed to index the adapter registry: the file that declares
 * it. Re-exporting the name is not indexing it, so no barrel needs an
 * exemption, and an exemption keyed at a path git has never held would be a
 * hiding place rather than a rule.
 */
export const REGISTRY_OWNERS = Object.freeze([
  'src/infrastructure/compilers/runtime/theme/presentation/adapters/facade/registry/index.ts',
]);

/** Owners that define `compileTheme` or re-export it rather than calling it. */
export const COMPILE_DOOR_OWNERS = Object.freeze([
  'src/infrastructure/compilers/runtime/theme/runtime/lowering/index.ts',
  'src/infrastructure/compilers/runtime/theme/index.ts',
  'src/entrypoints/server/index.ts',
]);

/** The one owner allowed to state which engine renders when nothing declares one. */
export const PRIMARY_ENGINE_OWNER =
  'src/foundation/contracts/kernel/engine-identity/index.ts';

/** Shapes that reintroduce a silent substitution. Each is a literal, not a hint. */
export const FALLBACK_SHAPES = Object.freeze([
  '|| loaders.rustic',
  '|| loaders.classic',
  '|| loaders.modern',
  '|| CLASSIC_TOKENS',
  '|| MODERN_TOKENS',
  '|| RUSTIC_TOKENS',
  '?? THEME_ENGINE_ADAPTERS',
  '|| defaultContextValue',
  '?? defaultContextValue',
]);

/**
 * The only owners allowed to NAME the engine token baseline: the contract that
 * declares its shape, the two contracts that type the adapter field, and the
 * three adapters that author one row each. A seventh namer is a second engine
 * table forming, whatever it calls itself.
 */
export const TOKEN_BASELINE_OWNERS = Object.freeze([
  'src/foundation/contracts/kernel/tokens/engine-tokens/index.ts',
  'src/foundation/contracts/composition/tenants/themes/engine-adapter/index.ts',
  'src/infrastructure/compilers/runtime/theme/presentation/adapters/foundation/definition/index.ts',
  'src/infrastructure/compilers/runtime/theme/presentation/adapters/presentation/classic/index.ts',
  'src/infrastructure/compilers/runtime/theme/presentation/adapters/presentation/modern/index.ts',
  'src/infrastructure/compilers/runtime/theme/presentation/adapters/presentation/rustic/index.ts',
]);

/** Symbols whose very existence is a second answer to a settled question. */
export const RETIRED_SYMBOLS = Object.freeze([
  'FALLBACK_ENGINE',
  'getDefaultEngine',
  'fallbackEngine',
  'warnOnFallback',
  'ENGINE_TOKENS',
  'getEngineTokens',
]);

const strip = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (['node_modules', 'dist', '.next', 'tests', '__snapshots__'].includes(entry)) continue;
      walk(path, out);
      continue;
    }
    if (SOURCE_EXTENSIONS.test(entry) && !NON_PRODUCTIVE_FILE.test(entry)) out.push(path);
  }
  return out;
}

/**
 * This gate's own source, excluded because it must SPELL every forbidden shape
 * to look for it. Exactly one path, named rather than pattern-matched, so the
 * exclusion cannot widen into a hiding place.
 */
export const SELF = 'scripts/check/engine/wiring/index.mjs';

export function collectProductiveSources(root) {
  const files = [];
  for (const swept of SWEPT_ROOTS) files.push(...walk(resolve(root, swept)));
  return files.filter((file) => {
    const rel = relative(root, file).split(sep).join('/');
    return !NON_PRODUCTIVE.test(rel) && rel !== SELF;
  });
}

export function auditEngineWiring(root) {
  const findings = [];
  const files = collectProductiveSources(root);
  const owners = new Set(REGISTRY_OWNERS);
  const doorOwners = new Set(COMPILE_DOOR_OWNERS);
  const baselineOwners = new Set(TOKEN_BASELINE_OWNERS);
  let primaryDeclarations = 0;

  for (const file of files) {
    const rel = relative(root, file).split(sep).join('/');
    const body = strip(readFileSync(file, 'utf8'));

    if (/THEME_ENGINE_ADAPTERS\s*[.[]/.test(body) && !owners.has(rel))
      findings.push({
        rule: 'adapter-literal',
        file: rel,
        detail: 'names an adapter by hand instead of resolveAdapter(engine)',
      });

    if (body.includes('compileTheme(') && !body.includes('resolveAdapter') && !doorOwners.has(rel))
      findings.push({
        rule: 'compile-door-resolves',
        file: rel,
        detail: 'calls compileTheme without resolving an adapter',
      });

    if (body.includes('EngineTokenOverrides') && !baselineOwners.has(rel))
      findings.push({
        rule: 'token-baseline-owner',
        file: rel,
        detail: 'names the engine token baseline outside its declared owners',
      });

    for (const symbol of RETIRED_SYMBOLS)
      if (new RegExp(`\\b${symbol}\\b`).test(body))
        findings.push({ rule: 'retired-symbol', file: rel, detail: symbol });

    for (const shape of FALLBACK_SHAPES)
      if (body.includes(shape))
        findings.push({ rule: 'fallback-shape', file: rel, detail: shape });

    for (const match of body.matchAll(
      /(classic|modern|rustic)\s*:\s*\(\)\s*=>\s*import\(\s*['"]\.\/engines\/(classic|modern|rustic)['"]/g
    ))
      if (match[1] !== match[2])
        findings.push({
          rule: 'forwarding-engine',
          file: rel,
          detail: `${match[1]} loads ./engines/${match[2]}`,
        });

    for (const match of body.matchAll(/createEngineComponent<[^>]*>\(\s*'[^']+',\s*\{([\s\S]*?)\n\s*\}/g)) {
      const record = match[1];
      const missing = ['classic', 'modern', 'rustic'].filter(
        (engine) => !new RegExp(`\\b${engine}\\s*:`).test(record)
      );
      if (missing.length > 0)
        findings.push({
          rule: 'loader-totality',
          file: rel,
          detail: `loader record omits ${missing.join(', ')}`,
        });
    }

    if (/export const PRIMARY_ENGINE\b/.test(body)) {
      primaryDeclarations += 1;
      if (rel !== PRIMARY_ENGINE_OWNER)
        findings.push({
          rule: 'second-primary',
          file: rel,
          detail: 'declares PRIMARY_ENGINE outside the identity contract',
        });
    }
  }

  if (primaryDeclarations !== 1)
    findings.push({
      rule: 'second-primary',
      file: PRIMARY_ENGINE_OWNER,
      detail: `expected exactly one PRIMARY_ENGINE declaration, found ${primaryDeclarations}`,
    });

  return { files: files.length, findings };
}

function main() {
  const flags = process.argv.slice(2);
  const rootFlag = flags.indexOf('--root');
  const root = rootFlag >= 0 ? resolve(flags[rootFlag + 1]) : findPackageRoot(scriptDir);
  const report = auditEngineWiring(root);

  if (flags.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    for (const finding of report.findings)
      process.stdout.write(`engine-wiring: ${finding.rule}: ${finding.file} — ${finding.detail}\n`);
    process.stdout.write(
      `engine-wiring: swept ${report.files} productive sources, ${report.findings.length} finding(s)\n`
    );
  }
  process.exit(report.findings.length === 0 ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
