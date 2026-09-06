#!/usr/bin/env node
/**
 * engine-wiring-gate — the callers, not the contracts.
 *
 * The engine seam can be perfectly designed and reach nothing. This gate
 * measures the wiring itself: that every productive compile RESOLVES its
 * adapter instead of naming one, that no fallback symbol or fallback shape
 * survives anywhere in productive source, that no component forwards one
 * engine's directory under another engine's key, that the extension engine
 * never degrades into a shipped one, that exactly one owner states which engine
 * renders when nothing declares one, that exactly one owner ENUMERATES the
 * roster at all, and that no component pays for an engine seam it does not use.
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

/**
 * The one owner allowed to ENUMERATE the roster.
 *
 * Not the same law as `PRIMARY_ENGINE_OWNER`, which is about the default. This
 * one is about the LIST: a second `'classic' | 'modern' | 'rustic'` union, a
 * second `['classic','modern','rustic']` array or a second chain of `===`
 * comparisons is a second roster, and it drifts. Sixteen primitive contracts
 * typed `engine` as a three-name union while the base contract admitted four,
 * so `<Splitter engine="custom">` was a type error against a value the runtime
 * accepted. Derive from `ENGINE_NAMES`, `IMPLEMENTED_ENGINE_NAMES` or
 * `ADMITTED_ENGINE_NAMES`; never restate.
 */
export const ROSTER_OWNER = PRIMARY_ENGINE_OWNER;

/** Roster names, spelled here because a gate must spell what it looks for. */
const ENGINE_NAME_PATTERN = '(?:classic|modern|rustic|custom)';
const QUOTED_ENGINE = `['"\`]${ENGINE_NAME_PATTERN}['"\`]`;

/**
 * The three shapes that constitute a SECOND ROSTER. A loader record keyed by
 * engine name is deliberately NOT one of them: `loader-totality` already
 * requires it to be total over the roster, so it cannot drift.
 */
export const ROSTER_SHAPES = Object.freeze([
  ['roster-union', new RegExp(`${QUOTED_ENGINE}(?:\\s*\\|\\s*${QUOTED_ENGINE})+`, 'g')],
  [
    'roster-array',
    new RegExp(`\\[\\s*${QUOTED_ENGINE}(?:\\s*,\\s*${QUOTED_ENGINE})+\\s*,?\\s*\\]`, 'g'),
  ],
  [
    'roster-comparison',
    new RegExp(
      `(?:===|!==)\\s*${QUOTED_ENGINE}[\\s\\S]{0,200}?(?:===|!==)\\s*${QUOTED_ENGINE}`,
      'g'
    ),
  ],
]);

/**
 * The extension engine resolves a registered pack or refuses by name. A branch
 * on `custom` that returns instead of throwing is a silent degradation: three
 * primitives answered it with `return classicEngine`, which mounted Ant Design
 * inside a white-label product that had chosen not to ship it.
 */
const CUSTOM_BRANCH = /===\s*(?:['"`]custom['"`]|EXTENSION_ENGINE)\s*\)\s*\{([\s\S]{0,600}?)\n\s*\}/g;
const CUSTOM_BRANCH_RESOLVERS = ['throw', 'getCustomComponent', 'createCustomWrapper'];

/** Shapes that reintroduce a silent substitution. Each is a literal, not a hint. */
export const FALLBACK_SHAPES = Object.freeze([
  '|| loaders.rustic',
  '|| loaders.classic',
  '|| loaders.modern',
  '|| CLASSIC_TOKENS',
  '|| MODERN_TOKENS',
  '|| RUSTIC_TOKENS',
  '?? THEME_ENGINE_ADAPTERS',
  // C4: the roster engine fallback. Four preview and tooling sites answered
  // `getFirstPartyVertical(slug)?.engine ?? PRIMARY_ENGINE` for a question the
  // DB door threw on. One law now, and it refuses.
  '?? PRIMARY_ENGINE',
  '|| PRIMARY_ENGINE',
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

/**
 * The only owners allowed to READ `PRIMARY_ENGINE` in code.
 *
 * The constant answers exactly one question -- which engine renders when a
 * RUNTIME has no declaration at all -- and that question belongs to the engine
 * resolver. It is not the answer to "which engine does this vertical render
 * with": the roster row answers that, and a vertical with no row is refused
 * rather than substituted. Naming it in a comment is not a read; the sweep
 * strips comments before it looks.
 */
export const PRIMARY_ENGINE_READERS = Object.freeze([
  'src/foundation/contracts/kernel/engine-identity/index.ts',
  'src/infrastructure/runtime/engines/runtime/resolution/index.ts',
  // NON-PRODUCTIVE SUPPORT, and it says so in its own ownership record: the
  // cascade probes measure the compiler over mutated roster leaves and probe
  // fixtures, which are tenants of no vertical. Refusing them the way the
  // productive door does would leave the compiler unmeasured.
  'scripts/libraries/theme-lowering/index.mjs',
  // The scripts layer's single roster reader. A pre-build `.mjs` cannot import
  // the TypeScript contract, so this one PARSES it, by name, and fails closed;
  // naming the symbol it parses is the read, and it is the whole point.
  'scripts/libraries/engine/roster/index.mjs',
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

/** The engines a component may ship an implementation for. Spelled once here. */
const IMPLEMENTED_ENGINES = ['classic', 'modern', 'rustic'];

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

/**
 * CEREMONIAL ENGINE SEAMS — three structurally identical implementations.
 *
 * F-79: `stats-header`, `mobile-header`, `bottom-tab-bar`, `action-dock` and
 * `feature-workspace-frame` each ship three engine implementations that differ
 * only in the engine name inside their own identifier. The component is
 * engine-agnostic; the seam renders the same tree three ways, and the "135 x 3
 * engines" coverage number counts it three times.
 *
 * The census below is DECREASE-ONLY and blocking, not a warning: an owner that
 * is not listed is a finding, and a listed owner that no longer has an
 * identical trio is a STALE finding, so the list can only shrink. Retiring
 * these five is a family-cut, not an engine-policy edit: four of them carry a
 * frozen `engines/classic` and `engines/rustic` file, and WO-CAN-06 is
 * explicitly forbidden from deleting Classic or Rustic code.
 */
export const CEREMONIAL_ENGINE_CENSUS = Object.freeze({
  'src/components/structures/dashboard/stats-header':
    'three one-line re-exports of ../../runtime/rendering — owner: WO-RET-02 (family cut)',
  'src/components/structures/headers/mobile-header':
    'three one-line re-exports of ../../runtime/rendering — owner: WO-RET-02 (family cut)',
  'src/components/structures/shell/bottom-tab-bar':
    'three one-line re-exports of ../../runtime/rendering — owner: WO-RET-02 (family cut)',
  'src/components/structures/workspace/action-dock':
    'three one-line re-exports of ../../runtime/rendering — owner: WO-RET-02 (family cut)',
  'src/components/patterns/shell/feature-workspace-frame':
    'three wrappers around the shared engines/foundation engine — owner: WO-RET-02 (family cut)',
});

/**
 * Normalise an engine implementation so "identical" means identical BEHAVIOUR.
 * Comments, whitespace and the engine's own name are removed, because a file
 * that differs only in the word `classic` vs `modern` renders the same tree.
 */
export function normalizeEngineImplementation(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/classic|modern|rustic/gi, '<engine>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Owners whose `engines/` directory holds three structurally identical files. */
export function collectCeremonialEngineOwners(root) {
  const componentsRoot = resolve(root, 'src', 'components');
  const owners = [];
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry);
      let stat;
      try {
        stat = statSync(path);
      } catch {
        continue;
      }
      if (!stat.isDirectory()) continue;
      if (entry === 'engines') {
        const byShape = new Map();
        for (const engineDir of readdirSync(path)) {
          const file = ['index.tsx', 'index.ts']
            .map((name) => join(path, engineDir, name))
            .find((candidate) => {
              try {
                return statSync(candidate).isFile();
              } catch {
                return false;
              }
            });
          if (!file) continue;
          const shape = normalizeEngineImplementation(readFileSync(file, 'utf8'));
          byShape.set(shape, [...(byShape.get(shape) ?? []), engineDir]);
        }
        for (const engines of byShape.values())
          if (engines.length >= 3)
            owners.push({
              owner: relative(root, dir).split(sep).join('/'),
              engines: engines.sort(),
            });
        continue;
      }
      visit(path);
    }
  };
  visit(componentsRoot);
  return owners.sort((a, b) => a.owner.localeCompare(b.owner));
}

export function collectProductiveSources(root) {
  const files = [];
  for (const swept of SWEPT_ROOTS) files.push(...walk(resolve(root, swept)));
  return files.filter((file) => {
    const rel = relative(root, file).split(sep).join('/');
    return !NON_PRODUCTIVE.test(rel) && rel !== SELF;
  });
}

export function auditEngineWiring(root, options = {}) {
  const findings = [];
  const files = collectProductiveSources(root);
  const owners = new Set(REGISTRY_OWNERS);
  const doorOwners = new Set(COMPILE_DOOR_OWNERS);
  const baselineOwners = new Set(TOKEN_BASELINE_OWNERS);
  const primaryReaders = new Set(PRIMARY_ENGINE_READERS);
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

    if (/\bPRIMARY_ENGINE\b/.test(body) && !primaryReaders.has(rel))
      findings.push({
        rule: 'primary-engine-read',
        file: rel,
        detail: 'reads PRIMARY_ENGINE outside the engine resolver',
      });

    for (const match of body.matchAll(
      /(classic|modern|rustic)\s*:\s*\(\)\s*=>\s*import\(\s*['"][^'"]*?engines\/(classic|modern|rustic)['"]/g
    ))
      if (match[1] !== match[2])
        findings.push({
          rule: 'forwarding-engine',
          file: rel,
          detail: `${match[1]} loads engines/${match[2]}`,
        });

    // A re-export is the same forwarding, written so the loader record looks
    // total: `engines/rustic/index.tsx` containing `export { default } from
    // '../classic'` paints Classic under the Rustic key and was invisible here.
    // The engine a file BELONGS to comes from its own path, so a deep relative
    // specifier cannot dodge it either.
    const owner = /(?:^|\/)engines\/(classic|modern|rustic)\//.exec(rel)?.[1];
    if (owner)
      for (const match of body.matchAll(
        /export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g
      )) {
        const target = /(?:^|\/)(?:\.\.\/)*(classic|modern|rustic)(?:\/|$)/.exec(match[1])?.[1];
        if (target && target !== owner)
          findings.push({
            rule: 'forwarding-engine',
            file: rel,
            detail: `${owner} re-exports ${match[1]}`,
          });
      }

    for (const match of body.matchAll(CUSTOM_BRANCH)) {
      const branch = match[1];
      if (!CUSTOM_BRANCH_RESOLVERS.some((token) => branch.includes(token)))
        findings.push({
          rule: 'custom-degradation',
          file: rel,
          detail: 'the custom branch returns a shipped engine instead of resolving a pack or refusing',
        });
    }

    if (rel !== ROSTER_OWNER)
      for (const [rule, pattern] of ROSTER_SHAPES)
        for (const match of body.matchAll(pattern))
          findings.push({
            rule,
            file: rel,
            detail: match[0].replace(/\s+/g, ' ').slice(0, 80),
          });

    for (const match of body.matchAll(/createEngineComponent<[^>]*>\(\s*'[^']+',\s*\{([\s\S]*?)\n\s*\}/g)) {
      const record = match[1];
      const missing = IMPLEMENTED_ENGINES.filter(
        (engine) => !new RegExp(`\\b${engine}\\s*:`).test(record)
      );
      if (missing.length > 0)
        findings.push({
          rule: 'loader-totality',
          file: rel,
          detail: `loader record omits ${missing.join(', ')}`,
        });
    }

    // The synchronous factory answers the same three questions and therefore
    // owes the same totality. Typography used to hold a bare `engineMap` that
    // could not resolve `custom` at all, and it sat outside every totality law.
    for (const match of body.matchAll(
      /createSyncEngineComponent<[^>]*>\(\s*'([^']+)',\s*([A-Za-z_$][\w$]*)/g
    )) {
      const record = new RegExp(`${match[2]}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\s*\\}`).exec(body)?.[1];
      const missing = IMPLEMENTED_ENGINES.filter(
        (engine) => !record || !new RegExp(`\\b${engine}\\s*:`).test(record)
      );
      if (missing.length > 0)
        findings.push({
          rule: 'sync-loader-totality',
          file: rel,
          detail: `${match[1]} implementation record omits ${missing.join(', ')}`,
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

  const ceremonialCensus = options.ceremonialCensus ?? CEREMONIAL_ENGINE_CENSUS;
  const censused = new Set(Object.keys(ceremonialCensus));
  for (const { owner, engines } of collectCeremonialEngineOwners(root)) {
    censused.delete(owner);
    if (!(owner in ceremonialCensus))
      findings.push({
        rule: 'ceremonial-engine',
        file: owner,
        detail: `${engines.join(', ')} are structurally identical; the component is engine-agnostic and needs no engines/ seam`,
      });
  }
  for (const owner of censused)
    findings.push({
      rule: 'ceremonial-engine',
      file: owner,
      detail: 'STALE census entry: no identical engine trio here any more; tighten it out',
    });

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
