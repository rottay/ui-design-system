#!/usr/bin/env node

/**
 * APPLICATION CUSTOMIZATION CONTRACT GATE — `--ds-*` writes in application CSS.
 *
 * WHAT THIS ENFORCES (independent audit 2026-07-26, Codex finding C3)
 * ------------------------------------------------------------------
 * C3 recorded that the app/DS boundary was under-specified: 190 `--ds-*`
 * assignments in app CSS were reported as SCOPED and treated as legitimate by
 * construction, because they were not authored on a bare `:root`. "Not bare
 * `:root`" proves none of the three things that matter:
 *
 *   1. `--ds-*` is DS-owned; an app may assign only properties the DS leaves
 *      open as public hooks.
 *   2. App-owned composition and feature styling uses `--rt-*`.
 *   3. Component tuning happens under an explicit application/feature scope and
 *      only against public hooks.
 *   4. Authoring the DS root — or any EQUIVALENT of it, not merely bare
 *      `:root` — from an application is forbidden.
 *
 * This gate answers all four. It supersedes the sibling boundary gate's
 * classification for the hook question specifically; that gate answers a
 * different question (where app CSS may write at all) and its SCOPED verdict is
 * not evidence that a property is legally assignable.
 *
 * THE THREE CLASSIFICATIONS
 * -------------------------
 *   PUBLIC_HOOK_SCOPED  the property is a public hook (the DS reads it and owns
 *                       no value for it) and the write is under a non-root
 *                       scope. This is the supported customization path.
 *   ROOT_EQUIVALENT     the write lands on the document root, a root-state
 *                       attribute, or a universal subject — the app is
 *                       authoring DS root state. Forbidden by law; existing
 *                       instances are grandfathered and decrease-only.
 *   UNKNOWN_HOOK        the write is properly scoped but the property is not a
 *                       public hook: it is a DS foundation token, a variable
 *                       the white-label chrome compiler owns at `:root`, or a
 *                       name the DS has never heard of. Each carries a `reason`
 *                       so the remedy is unambiguous. Grandfathered,
 *                       decrease-only.
 *
 * `--rt-*` declarations are the app's own namespace and are always legal; the
 * report counts them so the healthy channel stays visible next to the debt.
 *
 * WORDING LAW. A green run prints "no growth (N grandfathered)". It never
 * prints "legitimate": every grandfathered row is an open violation of the
 * contract that is merely fenced from growing. Calling baselined debt
 * legitimate is the precise failure C3 documented, and this gate must not
 * repeat it in its own output.
 *
 * The allowlist is DERIVED, never hand-listed — see scripts/lib/ds-hook-manifest.mjs.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  deriveHookManifest,
  isRootEquivalentSelector,
  PROMOTED_HOOK_VALUE_CONSTRAINT,
  resolveNestedSelectors,
  serializeHookManifest,
} from './lib/ds-hook-manifest.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(SCRIPT_PATH);
export const CORE_ROOT = resolve(SCRIPTS_DIR, '..');
export const DEFAULT_BASELINE_PATH = resolve(SCRIPTS_DIR, 'app-ds-hook-contract-gate.baseline.json');
export const DEFAULT_APP_ROOT = resolve(CORE_ROOT, '../../../app-bithire');

/**
 * The PUBLISHED contract. It lives at the package root, next to
 * `supplier-contract.json`, for one decisive reason: only files listed in
 * package.json `files` reach an installed consumer, and that list ships `dist/**`
 * and root artifacts — never `src/**`. A contract an app cannot resolve after
 * `pnpm add @rottay/design-system` is not exported, whatever the repo layout
 * says, and C3 point 5 requires apps to consume it without touching this repo.
 */
export const DEFAULT_MANIFEST_PATH = resolve(CORE_ROOT, 'hooks-manifest.json');
export const MANIFEST_EXPORT_SUBPATH = './hooks-manifest';

export const CLASSIFICATIONS = Object.freeze({
  publicHook: 'PUBLIC_HOOK_SCOPED',
  rootEquivalent: 'ROOT_EQUIVALENT',
  unknownHook: 'UNKNOWN_HOOK',
  hookValueLiteral: 'HOOK_VALUE_LITERAL',
});

/** Violation classes are the fenced ones; the hook class is the supported path. */
const FENCED = Object.freeze([
  CLASSIFICATIONS.rootEquivalent,
  CLASSIFICATIONS.unknownHook,
  CLASSIFICATIONS.hookValueLiteral,
]);

const EXCLUDED_APP_PATH = /(?:^|[\\/])(?:node_modules|\.next|dist|build|coverage|__snapshots__)(?:[\\/]|$)/;

function collectStylesheets(root) {
  const found = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(directory, entry.name);
      if (EXCLUDED_APP_PATH.test(`${sep}${relative(root, full)}${sep}`)) continue;
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.name.endsWith('.css')) found.push(full);
    }
  };
  walk(root);
  return found.sort();
}

/**
 * The corpus root. A missing corpus is a hard failure, never a pass: this gate
 * is registered blocking, and a gate that goes green because it found nothing
 * to look at is the failure mode ci-gates.manifest.mjs exists to forbid.
 */
export function resolveCorpusRoot(appRoot) {
  const root = resolve(appRoot);
  let stats;
  try {
    stats = statSync(root);
  } catch {
    throw new Error(
      `app corpus MISSING at ${root}\n` +
        '  pass --app-root <path> or set APP_DS_HOOK_APP_ROOT.\n' +
        '  a blocking gate must not treat an absent corpus as a pass.',
    );
  }
  if (!stats.isDirectory()) throw new Error(`app corpus is not a directory: ${root}`);
  const src = join(root, 'src');
  try {
    if (statSync(src).isDirectory()) return src;
  } catch {
    // A fixture may point directly at a stylesheet directory.
  }
  return root;
}

/**
 * Classify every `--ds-*` declaration in one stylesheet.
 *
 * Selector scope is computed by resolving CSS nesting down the rule tree, so a
 * nested `html { &[data-tenant='bithire'] { … } }` is judged on the selector it
 * actually produces rather than on the `&`-fragment in isolation.
 */
export function classifyStylesheet({ css, manifest, postcss }) {
  const findings = [];
  let appNamespaceDeclarations = 0;

  const root = postcss.parse(css);
  const visit = (container, parentSelectors) => {
    for (const node of container.nodes ?? []) {
      if (node.type === 'decl') {
        if (node.prop?.startsWith('--rt-')) {
          appNamespaceDeclarations += 1;
          continue;
        }
        if (!node.prop?.startsWith('--ds-')) continue;

        // An unscoped declaration (no enclosing rule) is a stylesheet-level
        // write; treat it as root-equivalent rather than as a hook write.
        const rootEquivalent =
          parentSelectors.length === 0 ||
          parentSelectors.some((selector) => isRootEquivalentSelector(selector));

        if (rootEquivalent) {
          findings.push({
            property: node.prop,
            kind: CLASSIFICATIONS.rootEquivalent,
            reason: 'root-scope',
            selector: parentSelectors[0] ?? '<stylesheet root>',
            line: node.source?.start?.line ?? 0,
          });
          continue;
        }
        if (manifest.hookSet.has(node.prop)) {
          // A hook is an invitation to re-express the tenant's own tokens for one
          // surface, not a place to pin brand paint. A raw colour literal here
          // survives every theme switch the tenant makes, so the scope stops being
          // white-labelable — the customization path defeating the customization.
          const literalValue = PROMOTED_HOOK_VALUE_CONSTRAINT.forbiddenValue.test(node.value ?? '');
          findings.push({
            property: node.prop,
            kind: literalValue ? CLASSIFICATIONS.hookValueLiteral : CLASSIFICATIONS.publicHook,
            reason: literalValue ? 'hook-value-literal' : 'public-hook',
            selector: parentSelectors[0],
            line: node.source?.start?.line ?? 0,
          });
          continue;
        }
        const reason = manifest.tenantChannel.has(node.prop)
          ? 'tenant-channel'
          : manifest.foundationTokens.has(node.prop)
            ? 'foundation-token'
            : 'undeclared';
        findings.push({
          property: node.prop,
          kind: CLASSIFICATIONS.unknownHook,
          reason,
          selector: parentSelectors[0],
          line: node.source?.start?.line ?? 0,
        });
        continue;
      }
      if (node.type === 'rule') {
        visit(node, resolveNestedSelectors(parentSelectors, node.selector));
        continue;
      }
      if (node.type === 'atrule') visit(node, parentSelectors);
    }
  };
  visit(root, []);
  return { findings, appNamespaceDeclarations };
}

/** Observed fenced counts, keyed file -> property -> kind -> count. */
function tallyFenced(fileFindings) {
  const tally = {};
  for (const [file, findings] of Object.entries(fileFindings)) {
    for (const finding of findings) {
      if (!FENCED.includes(finding.kind)) continue;
      tally[file] ??= {};
      tally[file][finding.property] ??= {};
      tally[file][finding.property][finding.kind] =
        (tally[file][finding.property][finding.kind] ?? 0) + 1;
    }
  }
  return tally;
}

export function emptyBaseline() {
  return { schemaVersion: 1, grandfathered: {} };
}

export function readBaseline(baselinePath) {
  try {
    const parsed = JSON.parse(readFileSync(baselinePath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || typeof parsed.grandfathered !== 'object') {
      throw new Error('baseline is missing a `grandfathered` map');
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return emptyBaseline();
    throw new Error(`unreadable baseline ${baselinePath}: ${error.message}`);
  }
}

/**
 * Decrease-only comparison, per exact property + file + kind. New files, new
 * properties, a higher count, or the same count arriving under a worse kind are
 * all growth. A count below baseline is progress and is reported, never failed.
 */
export function compareToBaseline(observed, baseline) {
  const grandfathered = baseline.grandfathered ?? {};
  const growth = [];
  let grandfatheredTotal = 0;
  let observedTotal = 0;

  for (const [file, properties] of Object.entries(observed)) {
    for (const [property, kinds] of Object.entries(properties)) {
      for (const [kind, count] of Object.entries(kinds)) {
        observedTotal += count;
        const allowed = grandfathered[file]?.[property]?.[kind] ?? 0;
        if (count > allowed) growth.push({ file, property, kind, count, allowed });
      }
    }
  }
  for (const properties of Object.values(grandfathered)) {
    for (const kinds of Object.values(properties)) {
      for (const count of Object.values(kinds)) grandfatheredTotal += count;
    }
  }
  return { growth, grandfatheredTotal, observedTotal };
}

export function runGate({ appRoot, manifest, baseline, postcss }) {
  const corpusRoot = resolveCorpusRoot(appRoot);
  const files = collectStylesheets(corpusRoot);

  const fileFindings = {};
  const byKind = {
    [CLASSIFICATIONS.publicHook]: 0,
    [CLASSIFICATIONS.rootEquivalent]: 0,
    [CLASSIFICATIONS.unknownHook]: 0,
    [CLASSIFICATIONS.hookValueLiteral]: 0,
  };
  const byReason = {};
  const hookUsage = {};
  let appNamespaceDeclarations = 0;
  let declarations = 0;

  for (const file of files) {
    const css = readFileSync(file, 'utf8');
    let result;
    try {
      result = classifyStylesheet({ css, manifest, postcss });
    } catch (error) {
      throw new Error(`unparseable app stylesheet ${relative(corpusRoot, file)}: ${error.message}`);
    }
    appNamespaceDeclarations += result.appNamespaceDeclarations;
    if (result.findings.length === 0) continue;
    const key = relative(corpusRoot, file).split(sep).join('/');
    fileFindings[key] = result.findings;
    for (const finding of result.findings) {
      declarations += 1;
      byKind[finding.kind] += 1;
      byReason[finding.reason] = (byReason[finding.reason] ?? 0) + 1;
      hookUsage[finding.property] ??= { kind: finding.kind, reason: finding.reason, count: 0 };
      hookUsage[finding.property].count += 1;
    }
  }

  const observed = tallyFenced(fileFindings);
  const comparison = compareToBaseline(observed, baseline);

  return {
    corpusRoot,
    stylesheets: files.length,
    declarations,
    appNamespaceDeclarations,
    byKind,
    byReason,
    hookUsage,
    fileFindings,
    observed,
    ...comparison,
    ok: comparison.growth.length === 0,
  };
}

export function formatReport(result, { verbose = false } = {}) {
  const lines = [];
  lines.push('app-ds-hook-contract: application customization contract (`--ds-*` writes in app CSS)');
  lines.push(`  corpus            ${result.corpusRoot}`);
  lines.push(`  stylesheets       ${result.stylesheets}`);
  lines.push(`  --ds-* writes     ${result.declarations}`);
  lines.push(`  --rt-* writes     ${result.appNamespaceDeclarations} (app-owned namespace, always legal)`);
  lines.push('  classification');
  lines.push(`    PUBLIC_HOOK_SCOPED  ${result.byKind[CLASSIFICATIONS.publicHook]}  supported customization path`);
  lines.push(`    ROOT_EQUIVALENT     ${result.byKind[CLASSIFICATIONS.rootEquivalent]}  app authoring DS root state`);
  lines.push(`    UNKNOWN_HOOK        ${result.byKind[CLASSIFICATIONS.unknownHook]}  scoped, but the property is not a public hook`);
  lines.push(`    HOOK_VALUE_LITERAL  ${result.byKind[CLASSIFICATIONS.hookValueLiteral]}  public hook assigned a raw colour literal`);
  const reasons = Object.entries(result.byReason)
    .filter(([reason]) => reason !== 'public-hook' && reason !== 'root-scope')
    .sort((a, b) => b[1] - a[1]);
  if (reasons.length > 0) {
    lines.push('      by reason');
    for (const [reason, count] of reasons) {
      const explanation =
        reason === 'tenant-channel'
          ? 'white-label compiler owns this at :root; a scoped app write overrides the tenant'
          : reason === 'foundation-token'
            ? 'DS root-declares this; assigning it repaints every reader below the scope'
            : reason === 'hook-value-literal'
              ? 'a declared slot pinned to brand paint the tenant can no longer re-theme'
              : 'the DS neither reads nor declares it — namespace squatting, belongs in --rt-*';
      lines.push(`        ${reason.padEnd(17)} ${String(count).padStart(4)}  ${explanation}`);
    }
  }

  if (verbose) {
    const rows = Object.entries(result.hookUsage)
      .filter(([, usage]) => usage.kind !== CLASSIFICATIONS.publicHook)
      .sort((a, b) => b[1].count - a[1].count);
    if (rows.length > 0) {
      lines.push('  fenced properties');
      for (const [property, usage] of rows) {
        lines.push(`    ${String(usage.count).padStart(3)}x ${property}  [${usage.kind}/${usage.reason}]`);
      }
    }
  }

  if (result.ok) {
    // Wording law: grandfathered debt is fenced, not legitimate.
    lines.push(
      `  RESULT: no growth (${result.grandfatheredTotal} grandfathered, ${result.observedTotal} observed)`,
    );
  } else {
    lines.push(`  RESULT: FAIL — ${result.growth.length} growth finding(s)`);
    for (const item of result.growth.slice(0, 40)) {
      lines.push(
        `    ${item.file}: ${item.property} [${item.kind}] ${item.count} > ${item.allowed} allowed`,
      );
    }
    if (result.growth.length > 40) lines.push(`    … ${result.growth.length - 40} more`);
    lines.push('');
    lines.push('  ROOT_EQUIVALENT  move the write off root/tenant/vertical scope, or publish the');
    lines.push('                   value through BrandTheme / the tenant Appearance document.');
    lines.push('  UNKNOWN_HOOK     tenant-channel and foundation-token properties are DS-owned: use');
    lines.push('                   the governed channel. Undeclared names are app-owned: use --rt-*.');
    lines.push('  HOOK_VALUE_LITERAL  assign the hook a var()/color-mix() chain over DS tokens, not a');
    lines.push('                   raw colour. If the colour is genuinely app-owned, put it in --rt-*.');
    lines.push('  Baselining new findings is not a remedy; the baseline is decrease-only.');
  }
  return lines.join('\n');
}

export function serializeBaseline(observed) {
  const files = Object.keys(observed).sort();
  const grandfathered = {};
  for (const file of files) {
    const properties = Object.keys(observed[file]).sort();
    grandfathered[file] = {};
    for (const property of properties) {
      const kinds = Object.keys(observed[file][property]).sort();
      grandfathered[file][property] = {};
      for (const kind of kinds) grandfathered[file][property][kind] = observed[file][property][kind];
    }
  }
  return `${JSON.stringify(
    {
      schemaVersion: 1,
      note:
        'Decrease-only. Every entry is an OPEN violation of the application customization ' +
        'contract (audit 2026-07-26, Codex C3), fenced from growing — not an approval. ' +
        'Keyed file -> property -> classification -> count. Regenerate only to record a ' +
        'DECREASE; adding a row to make a new finding pass is forbidden.',
      grandfathered,
    },
    null,
    2,
  )}\n`;
}

/**
 * Freshness: the committed artifact must equal a re-derivation, byte for byte,
 * and the package must actually export it.
 *
 * Both halves are load-bearing. A stale artifact is worse than none: apps read a
 * hook list the DS no longer honours, and the gate they cannot see says green. A
 * present-but-unexported artifact is the failure C3 point 5 names directly — the
 * contract exists only for people who can open this repository.
 */
export function checkManifestFreshness({ manifest, manifestPath, packageJson }) {
  const problems = [];
  const expected = serializeHookManifest(manifest);

  let committed = null;
  try {
    committed = readFileSync(manifestPath, 'utf8');
  } catch {
    problems.push({
      code: 'MANIFEST_MISSING',
      detail:
        `no published contract at ${manifestPath}\n` +
        '    run `pnpm hooks:generate` and commit the result.',
    });
  }
  if (committed !== null && committed !== expected) {
    problems.push({
      code: 'MANIFEST_STALE',
      detail:
        `${manifestPath} differs from a re-derivation of the DS sources.\n` +
        '    the DS hook surface changed without republishing the contract.\n' +
        '    run `pnpm hooks:generate` and commit the result.',
    });
  }

  const exportsMap = packageJson?.exports ?? {};
  if (!Object.prototype.hasOwnProperty.call(exportsMap, MANIFEST_EXPORT_SUBPATH)) {
    problems.push({
      code: 'EXPORT_MISSING',
      detail:
        `package.json exports has no "${MANIFEST_EXPORT_SUBPATH}" entry.\n` +
        '    an app that cannot resolve the contract cannot consume it.',
    });
  }
  const files = packageJson?.files ?? [];
  const manifestFile = manifestPath.split(sep).pop();
  if (!files.includes(manifestFile)) {
    problems.push({
      code: 'EXPORT_UNSHIPPED',
      detail:
        `package.json files does not ship ${manifestFile}.\n` +
        '    the export would resolve in this repo and 404 for an installed consumer.',
    });
  }

  return { ok: problems.length === 0, problems, expected };
}

export function parseArgs(argv) {
  const args = {
    mode: 'check',
    appRoot: process.env.APP_DS_HOOK_APP_ROOT ?? DEFAULT_APP_ROOT,
    baselinePath: DEFAULT_BASELINE_PATH,
    manifestPath: null,
    verbose: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const takeValue = () => {
      const value = argv[index + 1];
      if (!value) throw new Error(`${token} requires a value`);
      index += 1;
      return value;
    };
    if (token === '--check') args.mode = 'check';
    else if (token === '--write') args.mode = 'write';
    else if (token === '--json') args.mode = 'json';
    else if (token === '--manifest-check') args.mode = 'manifest-check';
    else if (token === '--manifest-write') args.mode = 'manifest-write';
    else if (token === '--verbose') args.verbose = true;
    else if (token === '--app-root') args.appRoot = takeValue();
    else if (token.startsWith('--app-root=')) args.appRoot = token.slice('--app-root='.length);
    else if (token === '--baseline') args.baselinePath = resolve(takeValue());
    else if (token === '--emit-manifest') args.manifestPath = resolve(takeValue());
    else throw new Error(`unknown argument ${token}`);
  }
  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const postcssModule = await import('postcss');
  const postcss = postcssModule.default ?? postcssModule;
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });

  if (args.manifestPath) {
    writeFileSync(args.manifestPath, serializeHookManifest(manifest), 'utf8');
    process.stderr.write(`app-ds-hook-contract: wrote public hook manifest to ${args.manifestPath}\n`);
  }

  if (args.mode === 'manifest-write' || args.mode === 'manifest-check') {
    const target = args.manifestPath ?? DEFAULT_MANIFEST_PATH;
    const packageJson = JSON.parse(readFileSync(resolve(CORE_ROOT, 'package.json'), 'utf8'));
    const freshness = checkManifestFreshness({ manifest, manifestPath: target, packageJson });
    if (args.mode === 'manifest-write') {
      writeFileSync(target, freshness.expected, 'utf8');
      process.stderr.write(
        `app-ds-hook-contract: published ${manifest.hooks.length} public hooks ` +
          `(${manifest.yields.promoted} declared slots) to ${target}\n`,
      );
      const exportProblems = freshness.problems.filter((problem) =>
        problem.code.startsWith('EXPORT_'),
      );
      if (exportProblems.length > 0) {
        process.stderr.write(
          'app-ds-hook-contract: FAIL — the artifact is written but not exported\n' +
            exportProblems.map((problem) => `  ${problem.code}: ${problem.detail}`).join('\n') +
            '\n',
        );
        return 1;
      }
      return 0;
    }
    if (freshness.ok) {
      process.stderr.write(
        `app-ds-hook-contract: published contract is current (${manifest.hooks.length} public hooks, ` +
          `${manifest.yields.promoted} declared slots, exported as "${MANIFEST_EXPORT_SUBPATH}")\n`,
      );
      return 0;
    }
    process.stderr.write(
      'app-ds-hook-contract: FAIL — published contract is not current\n' +
        freshness.problems.map((problem) => `  ${problem.code}: ${problem.detail}`).join('\n') +
        '\n',
    );
    return 1;
  }

  const baseline = args.mode === 'write' ? emptyBaseline() : readBaseline(args.baselinePath);
  const result = runGate({ appRoot: args.appRoot, manifest, baseline, postcss });

  if (args.mode === 'write') {
    writeFileSync(args.baselinePath, serializeBaseline(result.observed), 'utf8');
    process.stderr.write(
      `app-ds-hook-contract: seeded ${result.observedTotal} grandfathered finding(s) to ${args.baselinePath}\n`,
    );
    return 0;
  }
  if (args.mode === 'json') {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: result.ok,
          manifest: manifest.yields,
          byKind: result.byKind,
          byReason: result.byReason,
          grandfatheredTotal: result.grandfatheredTotal,
          observedTotal: result.observedTotal,
          growth: result.growth,
        },
        null,
        2,
      )}\n`,
    );
    return result.ok ? 0 : 1;
  }

  process.stderr.write(`${formatReport(result, { verbose: args.verbose })}\n`);
  return result.ok ? 0 : 1;
}

const invokedAsScript = process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH;
if (invokedAsScript) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`app-ds-hook-contract: FAIL\n${error.stack ?? error.message}\n`);
      process.exitCode = 1;
    },
  );
}
