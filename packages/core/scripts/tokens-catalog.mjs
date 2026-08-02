/**
 * tokens-catalog (D0 Fase 2/4/5/8 + FASE G) — deterministic PROJECTION of the
 * token authorities into the official living documentation at
 * docs-engineering/engineering/design-system/tokens/. The docs are never a
 * second authority: every table here is regenerated from
 *
 *   - customization-surface-report.json  (derived census; name-level truth)
 *   - TENANT_CAPABILITY_REGISTRY         (controls, tiers, evidence — TS AST)
 *   - hooks-manifest.json                (93 public hooks + declaredSlots
 *                                         metadata; 2706 fenced reads; the
 *                                         foundation/component/tenant WRITER
 *                                         SETS used for static-vs-DB)
 *   - expressive-profiles (TS AST)       (profiles, envelopes, floors,
 *                                         emphasis families)
 *   - prototype-ledger.json              (governed prototokens)
 *   - authored theme CSS (PostCSS)       (var() fallback chains → the
 *                                         upstream/downstream derivation
 *                                         graph, with cycle detection)
 *   - authored CSS corpus (PostCSS)      (declaration SITE per name, consumer
 *                                         files per name, corpus-wide
 *                                         derivation edges)
 *   - styles/bithire.css via no-loss     (the RESOLVED default value per name;
 *                                         the shipped bundle is the only place
 *                                         a var() chain terminates in a value)
 *
 * FASE G splits the projection in two corpora that must never mix:
 *
 *   catalog/     OPERATIONAL — statuses active / app-slot / adjudicated-live.
 *                One page per family prefix, one ROW PER NAME, exhaustive.
 *   governance/  DEBT — dead-writer, legacy-alias, frontier, unwritten-hook,
 *                generated, generated-unread, test-only. Same per-name depth;
 *                labelled debt-until-retired, never presented as a menu.
 *
 * `--write` regenerates every GENERATED file and prunes orphan family pages;
 * `--check` fails on: stale docs, derivation cycles, a public hook without
 * owner metadata, an active capability whose derived channels are unknown to
 * the census, duplicate capability ids across tiers, coexisting
 * legacy/canonical authority pairs beyond the adjudicated list, a missing
 * generated view, a name missing from (or duplicated across) the family pages,
 * a governance-status name inside the operational tree, an incomplete family
 * index, or an orphan family page. Guides (authoring-guide.md,
 * app-customization.md) are the ONLY hand-written files in the folder and are
 * never touched here.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

import { parseRegistry, parseAllowlist } from './customization-surface-census.mjs';

const require = createRequire(import.meta.url);
const postcss = require('postcss');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_TOKENS_DIR = resolve(ROOT, '../../../docs-engineering/engineering/design-system/tokens');
const REPORT_PATH = join(ROOT, 'customization-surface-report.json');
const MANIFEST_PATH = join(ROOT, 'hooks-manifest.json');
const LEDGER_PATH = join(ROOT, 'src/foundation/tokens/prototype-ledger.json');
const EXPRESSIVE_PATH = join(ROOT, 'src/foundation/tokens/ts/presentation/expressive-profiles/index.ts');
const THEME_DIR = join(ROOT, 'src/foundation/tokens/css/foundation/themes');
const NO_LOSS_MODULE = join(ROOT, 'src/tooling/quality/no-loss/index.ts');
const RESOLUTION_BUNDLE = 'styles/bithire.css';

/** Generated views that live at the folder root (the two guides are not ours). */
const GENERATED_ROOT = [
  'README.md',
  'catalog.md',
  'exposure-tiers.md',
  'impact-map.md',
  'profiles-and-dials.md',
  'lifecycle-and-deprecations.md',
];
const HAND_WRITTEN = ['authoring-guide.md', 'app-customization.md'];

const CATALOG_FAMILIES_PREFIX = 'catalog/families';
const GOVERNANCE_FAMILIES_PREFIX = 'governance/families';

/**
 * The census status vocabulary, partitioned. A status in neither set is a
 * census contract change and MUST stop the generator: silently dropping a new
 * status would produce a catalog that omits names while still claiming 100%
 * coverage — exactly the failure this file exists to make impossible.
 */
const OPERATIONAL_STATUSES = new Set(['active', 'app-slot', 'adjudicated-live']);
const GOVERNANCE_STATUSES = new Set([
  'dead-writer',
  'legacy-alias',
  'frontier',
  'unwritten-hook',
  'generated',
  'generated-unread',
  'test-only',
]);

/**
 * Adjudicated coexisting families (D3 backlog): canonical vs legacy pairs
 * that are ALLOWED to coexist only because their retirement batch is open.
 * Anything else matching the two-authorities heuristic fails the check.
 */
const ADJUDICATED_DUAL_AUTHORITIES = [
  { legacyPrefix: '--ds-text-', canonicalPrefix: '--ds-type-', batch: 'D1a (DERIVE then retire emitter)' },
  { legacyPrefix: '--ds-border-color-', canonicalPrefix: '--ds-color-border', batch: 'D1b (RETIRE second border family)' },
  { legacyPrefix: '--ds-density-spacing-', canonicalPrefix: '--ds-spacing-', batch: 'D1c (RETIRE dead second system)' },
];

const args = process.argv.slice(2);
const has = (f) => args.some((a) => a === f || a.startsWith(`${f}=`));
const val = (f) => {
  const hit = args.find((a) => a.startsWith(`${f}=`));
  return hit ? hit.slice(f.length + 1) : undefined;
};

function loadInputs() {
  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
  const registry = parseRegistry();
  const allowlistResolved = parseAllowlist();
  return { report, manifest, ledger, registry, allowlist: allowlistResolved.names, allowlistSource: allowlistResolved.source };
}

/** var() fallback chains inside the theme layer → derivation edges b→a. */
function derivationEdges() {
  const edges = new Map(); // from -> Set(to)
  for (const file of readdirSync(THEME_DIR).sort()) {
    if (!file.endsWith('.css')) continue;
    const root = postcss.parse(readFileSync(join(THEME_DIR, file), 'utf8'));
    root.walkDecls((decl) => {
      if (!decl.prop.startsWith('--ds-')) return;
      const refs = decl.value.match(/var\(\s*(--ds-[a-z0-9-]+)/g) ?? [];
      for (const ref of refs) {
        const from = ref.replace(/var\(\s*/, '');
        if (from === decl.prop) continue;
        if (!edges.has(from)) edges.set(from, new Set());
        edges.get(from).add(decl.prop);
      }
    });
  }
  return edges;
}

function findCycle(edges) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  const stack = [];
  const visit = (node) => {
    color.set(node, GRAY);
    stack.push(node);
    for (const next of edges.get(node) ?? []) {
      const c = color.get(next) ?? WHITE;
      if (c === GRAY) return [...stack.slice(stack.indexOf(next)), next];
      if (c === WHITE) {
        const found = visit(next);
        if (found) return found;
      }
    }
    color.set(node, BLACK);
    stack.pop();
    return null;
  };
  for (const node of [...edges.keys()].sort()) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      const found = visit(node);
      if (found) return found;
    }
  }
  return null;
}

/** Two-segment family, the analytic grain the aggregates have always used. */
function familyOf(name) {
  const parts = name.replace(/^--ds-/, '').split('-');
  return `--ds-${parts.slice(0, Math.min(2, parts.length)).join('-')}`;
}

/** One-segment prefix: the PAGE grain, so a family page stays a few hundred rows. */
function familyPrefixOf(name) {
  return `--ds-${name.replace(/^--ds-/, '').split('-')[0]}`;
}

function familyFileName(prefix) {
  const stem = prefix.replace(/^--ds-/, '');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(stem)) {
    throw new Error(`tokens-catalog: family prefix '${prefix}' does not produce a safe file name`);
  }
  return `${stem}.md`;
}

function transitiveDownstream(seeds, edges, cap = 400) {
  const seen = new Set();
  const queue = [...seeds];
  while (queue.length > 0 && seen.size < cap) {
    const current = queue.shift();
    for (const next of edges.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

/** Unbounded reachability, used only for the three-valued impact column. */
function reachable(seeds, edges) {
  const seen = new Set();
  const queue = [...seeds];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of edges.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

function parseExpressive() {
  const content = readFileSync(EXPRESSIVE_PATH, 'utf8');
  const profiles = [...content.matchAll(/id: '(rottay\/[a-z-]+@\d+)'/g)].map((m) => m[1]);
  const grabObj = (marker) => {
    const start = content.indexOf(marker);
    if (start === -1) return '';
    return content.slice(start, content.indexOf('});', start));
  };
  const floors = grabObj('EXPRESSIVE_A11Y_FLOORS');
  return {
    profiles,
    touchFloor: /touchTargetMinPx:\s*(\d+)/.exec(floors)?.[1],
    edgeCap: /edgeWidthMaxPx:\s*(\d+)/.exec(floors)?.[1],
    typeScaleMin: /typeScaleMin:\s*([\d.]+)/.exec(floors)?.[1],
  };
}

// ---------------------------------------------------------------------------
// Authored CSS corpus scan — declaration sites, consumer files, corpus edges
// ---------------------------------------------------------------------------

function isTestPath(path) {
  return /\/tests?\/|\.test\.|\.stories\.|\/fixtures\//.test(path);
}

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walkFiles(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

/**
 * The consumer LAYER of an authored CSS file. Thirteen stable labels beat 461
 * paths: a per-name consumer column has to fit in a table cell and still say
 * something true about who depends on the name.
 */
function cssLayerOf(rel) {
  const path = rel.replace(/^src\//, '');
  if (path.startsWith('foundation/tokens/css/')) {
    const tail = path.slice('foundation/tokens/css/'.length);
    if (tail.startsWith('runtime/engines/')) {
      const engine = tail.split('/')[2];
      return engine && engine.endsWith('.css') ? 'engine:shared' : `engine:${engine}`;
    }
    if (tail.startsWith('runtime/bridges')) return 'bridges';
    if (tail.startsWith('runtime')) return 'runtime';
    if (tail.startsWith('presentation/components')) return 'components';
    if (tail.startsWith('foundation/typography')) return 'typography';
    if (tail.startsWith('foundation/')) return `base:${tail.split('/')[1]}`;
    if (tail.startsWith('facade/')) return 'entrypoints';
    return 'tokens';
  }
  if (path.startsWith('ui/patterns/commercial')) return 'commercial';
  return path.split('/')[0];
}

function scanAuthoredCss() {
  const files = walkFiles(join(ROOT, 'src'))
    .map((file) => relative(ROOT, file))
    .filter(
      (rel) =>
        rel.endsWith('.css') &&
        !rel.startsWith('src/foundation/tokens/css/facade/artifacts/') &&
        !isTestPath(rel)
    )
    .sort();

  const declaredIn = new Map(); // name -> rel[]  (first entry = first declaration site)
  const consumerFiles = new Map(); // name -> Set(rel)
  const corpusEdges = new Map(); // from -> Set(to)

  for (const rel of files) {
    let root;
    try {
      root = postcss.parse(readFileSync(join(ROOT, rel), 'utf8'), { from: rel });
    } catch {
      continue;
    }
    root.walkDecls((decl) => {
      const refs = String(decl.value).match(/var\(\s*(--ds-[a-z0-9-]+)/g) ?? [];
      if (decl.prop.startsWith('--ds-')) {
        if (!declaredIn.has(decl.prop)) declaredIn.set(decl.prop, []);
        declaredIn.get(decl.prop).push(rel);
        for (const ref of refs) {
          const from = ref.replace(/var\(\s*/, '');
          if (from === decl.prop) continue;
          if (!corpusEdges.has(from)) corpusEdges.set(from, new Set());
          corpusEdges.get(from).add(decl.prop);
        }
      }
      for (const ref of refs) {
        const name = ref.replace(/var\(\s*/, '');
        if (!consumerFiles.has(name)) consumerFiles.set(name, new Set());
        consumerFiles.get(name).add(rel);
      }
    });
  }
  return { files, declaredIn, consumerFiles, corpusEdges };
}

// ---------------------------------------------------------------------------
// Resolved default values, from the SHIPPED bundle through the no-loss resolver
// ---------------------------------------------------------------------------

/**
 * The child program. It imports the REAL no-loss resolver rather than
 * reimplementing bundle precedence and var() expansion here: a second copy of
 * that logic would drift from the authority the moment either side changed.
 * The module is TypeScript, so it needs type stripping; the parent tries an
 * in-process import first and only spawns when this runtime cannot load .ts.
 */
const RESOLVER_CHILD = `
import { readFileSync } from 'node:fs';
const noLoss = await import(process.env.TC_NO_LOSS);
const bundle = noLoss.loadBundle(process.env.TC_BUNDLE, process.env.TC_ROOT);
const report = JSON.parse(readFileSync(process.env.TC_REPORT, 'utf8'));
const out = {};
for (const name of Object.keys(report.rows).sort()) {
  const resolved = noLoss.resolveChannel(bundle, name);
  if (resolved === null) continue;
  out[name] = { value: resolved, sites: noLoss.collectDeclarationSites(bundle, name).length };
}
process.stdout.write(JSON.stringify({ declared: bundle.declarations.size, values: out }));
`;

async function resolveBundleValues() {
  const env = {
    ...process.env,
    TC_NO_LOSS: pathToFileURL(NO_LOSS_MODULE).href,
    TC_BUNDLE: RESOLUTION_BUNDLE,
    TC_ROOT: ROOT,
    TC_REPORT: REPORT_PATH,
  };

  // 1. In-process: works on runtimes that load TypeScript natively.
  try {
    const noLoss = await import(pathToFileURL(NO_LOSS_MODULE).href);
    const bundle = noLoss.loadBundle(RESOLUTION_BUNDLE, ROOT);
    const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
    const values = new Map();
    for (const name of Object.keys(report.rows).sort()) {
      const resolved = noLoss.resolveChannel(bundle, name);
      if (resolved !== null) values.set(name, resolved);
    }
    return { values, declared: bundle.declarations.size, loader: 'in-process' };
  } catch {
    /* runtime cannot import .ts — fall through to the stripping child */
  }

  // 2. Child with explicit type stripping.
  const child = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--input-type=module', '--eval', RESOLVER_CHILD],
    { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  if (child.status !== 0 || !child.stdout) {
    throw new Error(
      `tokens-catalog: could not resolve token values from ${RESOLUTION_BUNDLE}. ` +
        'The catalog\'s value/type columns come from the no-loss resolver (TypeScript), so this ' +
        'runtime must be able to load .ts (node >= 22.6 supports --experimental-strip-types). ' +
        `Child stderr: ${(child.stderr ?? '').trim().split('\n').slice(-3).join(' | ')}`
    );
  }
  const parsed = JSON.parse(child.stdout);
  const values = new Map();
  for (const [name, entry] of Object.entries(parsed.values)) values.set(name, entry.value);
  return { values, declared: parsed.declared, loader: 'strip-types-child' };
}

/**
 * The value TYPE, inferred from the resolved shape. Order matters: a shadow
 * contains lengths and a color, a gradient contains colors, and a var() chain
 * that terminates in `#3A6FB0` is a color no matter how it was authored.
 * `keyword` is reported rather than folded into `composite` because a bare
 * `none` and a `blur(6px) saturate(1.2)` are not the same kind of value.
 */
function inferType(resolved) {
  if (resolved === undefined || resolved === null) return 'unknown';
  const value = resolved.trim();
  if (value === '' || value.includes('<unresolved>')) return 'unknown';
  const lower = value.toLowerCase();

  if (/gradient\(/.test(lower)) return 'composite';
  if (/(^|,)\s*(["'][^"']+["']|[a-z-]+)\s*,.*\b(sans-serif|serif|monospace|system-ui|cursive|fantasy|ui-sans-serif|ui-serif|ui-monospace)\b/.test(lower)) {
    return 'font';
  }
  if (/^(inset\s+)?-?[\d.]+(px|rem|em)\s+-?[\d.]+(px|rem|em)/.test(lower)) return 'shadow';
  if (/^(cubic-bezier|steps)\(/.test(lower)) return 'easing';
  if (/^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(lower)) return 'easing';
  if (/^-?[\d.]+m?s$/.test(lower)) return 'duration';
  if (/^#[0-9a-f]{3,8}$/.test(lower)) return 'color';
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\(/.test(lower)) return 'color';
  if (/^(currentcolor|transparent)$/.test(lower)) return 'color';
  if (/^-?[\d.]+(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|pt|fr|dvh|dvw|svh|lvh)$/.test(lower)) return 'length';
  if (/^(calc|clamp|min|max)\(/.test(lower)) {
    return /(px|rem|em|%|vh|vw|ch|dvh|dvw)\b/.test(lower) ? 'length' : 'number';
  }
  if (/^-?[\d.]+$/.test(lower)) return 'number';
  if (/^[a-z-]+$/.test(lower)) return 'keyword';
  return 'composite';
}

/**
 * Who WRITES the name. The census keeps one category per name (its precedence
 * is documented in the census), so this mapping is single-valued by
 * construction; a component channel resolves to the stem of the file that
 * declares it, which is the only owner a reader can actually go and open.
 */
function writerOwnerOf(name, row, context) {
  const { declaredIn, declaredSlots } = context;
  const stem = () => {
    const sites = declaredIn.get(name);
    if (!sites || sites.length === 0) return null;
    return sites[0].split('/').pop().replace(/\.css$/, '');
  };
  switch (row.category) {
    case 'canonical-authority':
      return 'design-system';
    case 'component-channel':
    case 'authored-css-local':
      return stem() ?? 'design-system';
    case 'compiler-derived-channel':
    case 'tenant-raw-override':
      return 'compiler';
    case 'generated-artifact-only':
      return 'emitter';
    case 'ts-emission-site':
      return 'ts-emitter';
    case 'public-app-hook':
      return declaredSlots[name]?.owner ? 'app (declared slot)' : 'app';
    case 'unadjudicated-read':
      return '— (unwritten)';
    case 'consumed-external-origin':
      return 'external';
    case 'test-only':
      return 'tests';
    case 'frontier-reserved':
      return 'reserved';
    default:
      return stem() ?? 'unclassified';
  }
}

/**
 * Static (code-owned) vs DB (tenant-compiled) vs parity (both paths write it,
 * which is where the convergence acid test earns its keep). Membership comes
 * from the manifest WRITER SETS, not from the single-valued census category.
 */
function staticDbOf(name, row, context) {
  const { foundationSet, tenantChannelSet, componentSet } = context;
  const isStatic =
    foundationSet.has(name) || componentSet.has(name) || row.category === 'generated-artifact-only';
  const isDb = tenantChannelSet.has(name);
  if (isStatic && isDb) return 'parity';
  if (isDb) return 'DB';
  if (isStatic) return 'static';
  return '—';
}

function impactOf(name, context) {
  if (context.exactChannels.has(name)) return 'EXACT';
  if (context.inferredChannels.has(name)) return 'INFERRED';
  return 'UNKNOWN';
}

function consumersOf(name, context) {
  const files = context.consumerFiles.get(name);
  if (!files || files.size === 0) return '—';
  const byLayer = new Map();
  for (const file of files) {
    const layer = cssLayerOf(file);
    byLayer.set(layer, (byLayer.get(layer) ?? 0) + 1);
  }
  const ordered = [...byLayer.entries()].sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
  const shown = ordered.slice(0, 3).map(([layer, count]) => `${layer}(${count})`);
  const rest = ordered.length - shown.length;
  return rest > 0 ? `${shown.join(', ')} +${rest}` : shown.join(', ');
}

function sourceOf(name, row, context) {
  const sites = context.declaredIn.get(name);
  if (sites && sites.length > 0) {
    const short = sites[0]
      .replace(/^src\/foundation\/tokens\/css\//, '')
      .replace(/^src\//, '');
    return sites.length > 1 ? `${short} (+${sites.length - 1})` : short;
  }
  if (row.category === 'compiler-derived-channel' || row.category === 'tenant-raw-override') return 'compiler';
  if (row.category === 'generated-artifact-only') return 'artifact';
  if (row.category === 'ts-emission-site') return 'ts';
  return 'report-only';
}

const escapeCell = (text) => String(text).replace(/\|/g, '\\|');
const truncate = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

const GEN_HEADER = (source) => `<!-- GENERATED by \`pnpm tokens:catalog:write\` from ${source}.
     Never edit by hand — the check gate fails on drift. -->\n\n`;

const COLUMN_BASIS = `## Column basis (read before quoting a cell)

| Column | Derived from | Honest limits |
| --- | --- | --- |
| name · class · tier · status · reads | \`customization-surface-report.json\` | The census is the name-level authority; nothing here re-derives it. |
| type | INFERRED from the value's shape | A value the bundle does not declare has no shape to read, so its type is \`unknown\` — not "untyped". |
| default (bithire) | \`styles/${RESOLUTION_BUNDLE.split('/').pop()}\` resolved through \`src/tooling/quality/no-loss\` | DEFAULT state only (dark mode, density and every \`@media\` context are excluded on purpose), BitHire only, truncated to 40 characters. Another vertical can resolve differently — the density trap is real. |
| writer owner | census class → owner, component/local names resolved to their declaring file stem | A name with several declaration sites shows the FIRST; the count follows in the source column. |
| consumers | authored CSS \`var()\` reads, bucketed into 13 layers | CSS ONLY. TS reads are the separate \`reads\` count and are not bucketed. A name with no authored consumer shows \`—\`, which for an operational name is worth a look. |
| static/DB | manifest writer SETS (foundation ∪ component ∪ artifact = static, tenantChannel = DB, both = parity) | Not the census category, which is single-valued and would hide parity. |
| impact | EXACT = the name is a registry \`derivedChannels\` entry · INFERRED = reachable from one through authored \`var()\` edges · UNKNOWN = no edge data | \`derivedChannels\` are representative SEEDS, so UNKNOWN means "no evidence here", never "no impact". |
| source | first authored declaration site | \`compiler\` / \`artifact\` / \`ts\` / \`report-only\` mean the name has no authored CSS site at all. |
`;

const ROW_HEADER =
  '| Name | Family | Class | Type | Default (bithire) | Writer owner | Reads css/ts | Consumers (css) | Tier | Static/DB | Status | Impact | Source |\n' +
  '| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |';

function renderRow(name, row, context) {
  const resolved = context.values.get(name);
  const cells = [
    `\`${name}\``,
    `\`${familyOf(name)}\``,
    row.category ?? '—',
    inferType(resolved),
    resolved === undefined ? '—' : `\`${escapeCell(truncate(resolved, 40))}\``,
    escapeCell(writerOwnerOf(name, row, context)),
    `${row.reads?.css ?? 0}/${row.reads?.ts ?? 0}`,
    escapeCell(consumersOf(name, context)),
    row.tier ?? '—',
    staticDbOf(name, row, context),
    row.status ?? '—',
    impactOf(name, context),
    `\`${escapeCell(sourceOf(name, row, context))}\``,
  ];
  return `| ${cells.join(' | ')} |`;
}

/** Rows written into a family page, recoverable by the coverage check. */
function extractNames(content) {
  const names = [];
  for (const line of content.split('\n')) {
    const match = /^\| `(--ds-[a-z0-9-]+)` \|/.exec(line);
    if (match) names.push(match[1]);
  }
  return names;
}

function partitionCorpus(rows, drill) {
  const operational = [];
  const governance = [];
  for (const name of Object.keys(rows).sort()) {
    const status = rows[name].status;
    if (OPERATIONAL_STATUSES.has(status)) operational.push(name);
    else if (GOVERNANCE_STATUSES.has(status)) governance.push(name);
    else {
      throw new Error(
        `tokens-catalog: census status '${status}' (${name}) belongs to neither the operational nor ` +
          'the governance corpus. Partition it explicitly before regenerating — an unpartitioned ' +
          'status would be silently omitted from a catalog that claims full coverage.'
      );
    }
  }
  if (drill === 'mix-status') {
    const dead = governance.find((name) => rows[name].status === 'dead-writer');
    if (dead) operational.push(dead);
  }
  return { operational: operational.sort(), governance: governance.sort() };
}

function groupByPrefix(names) {
  const groups = new Map();
  for (const name of names) {
    const prefix = familyPrefixOf(name);
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix).push(name);
  }
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function buildFamilyPages({ names, rows, context, dirPrefix, corpusLabel, intro, drill }) {
  const groups = groupByPrefix(names);
  const pages = new Map();
  const omitted = drill === 'omit-family' && corpusLabel === 'operational' ? [...groups.keys()].pop() : null;

  for (const [prefix, members] of groups) {
    const file = `${dirPrefix}/${familyFileName(prefix)}`;
    const emitted = prefix === omitted ? [] : members;
    const families = new Map();
    for (const name of members) {
      const family = familyOf(name);
      families.set(family, (families.get(family) ?? 0) + 1);
    }
    const statuses = new Map();
    const types = new Map();
    for (const name of members) {
      statuses.set(rows[name].status, (statuses.get(rows[name].status) ?? 0) + 1);
      const type = inferType(context.values.get(name));
      types.set(type, (types.get(type) ?? 0) + 1);
    }
    const tally = (map) =>
      [...map.entries()]
        .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
        .map(([key, count]) => `${key} ${count}`)
        .join(' · ');

    pages.set(
      file,
      `${GEN_HEADER('the census report + hooks manifest + authored CSS + the resolved bithire bundle')}# \`${prefix}-*\` — ${corpusLabel} names (${members.length})

${intro}

- Sub-families (2-segment grain): ${tally(families)}
- Statuses: ${tally(statuses)}
- Value types: ${tally(types)}

${ROW_HEADER}
${emitted.map((name) => renderRow(name, rows[name], context)).join('\n')}

[← ${corpusLabel} index](../README.md) · [tokens hub](../../README.md)
`
    );
  }
  return { pages, groups };
}

function buildViews(inputs, edges, context, { drill } = {}) {
  const { report, manifest, ledger, registry, allowlist } = inputs;
  const counts = report.counts;
  const rows = report.rows;
  const expressive = parseExpressive();
  const views = {};

  const { operational, governance } = partitionCorpus(rows, drill);

  // ---- per-name family pages (both corpora, exhaustive) ----
  const operationalPages = buildFamilyPages({
    names: operational,
    rows,
    context,
    dirPrefix: CATALOG_FAMILIES_PREFIX,
    corpusLabel: 'operational',
    intro:
      'Every name below is LIVE: something writes it and something reads it, or it is a declared\napplication slot. Changing one of these changes shipped pixels.',
    drill,
  });
  const governancePages = buildFamilyPages({
    names: governance,
    rows,
    context,
    dirPrefix: GOVERNANCE_FAMILIES_PREFIX,
    corpusLabel: 'governance',
    intro:
      'DEBT UNTIL RETIRED. Nothing here is a menu: these names are dead writers, legacy aliases,\nfenced unadjudicated reads, generated-only emissions, test-only stock or reserved frontier\nnames. They are documented so they can be drained, not so they can be used.',
    drill,
  });
  for (const [file, content] of operationalPages.pages) views[file] = content;
  for (const [file, content] of governancePages.pages) views[file] = content;

  // The catalog's whole claim is exhaustiveness, so it is asserted at the
  // point of generation and not only at check time: a page set that does not
  // hold every corpus name must never reach disk. Drills deliberately break
  // this to prove the check goes red, so they bypass the throw.
  if (!drill) {
    const emitted = [...operationalPages.pages.values(), ...governancePages.pages.values()]
      .reduce((total, content) => total + extractNames(content).length, 0);
    const corpusSize = operational.length + governance.length;
    if (emitted !== corpusSize) {
      throw new Error(
        `tokens-catalog: the family pages hold ${emitted} rows but the corpus has ${corpusSize} names. ` +
          'Refusing to write a catalog that claims per-token coverage it does not have.'
      );
    }
  }

  const opRowCount = operational.length;
  const govRowCount = governance.length;

  // ---- README (index of BOTH trees + authority model) ----
  views['README.md'] = `${GEN_HEADER('the census report + capability registry + hooks manifest')}# Design System Tokens — Official Living Documentation

This folder is the single entry point for the Rottay DS token and
customization surface. THE AUTHORITY IS CODE — contracts, registries,
compilers, manifests, recipes and ledgers; everything tabular here is a
deterministic projection (\`pnpm tokens:catalog:write\`, checked by
\`pnpm tokens:catalog:check\`). The only hand-written files are the two
guides.

## The two trees

The corpus is split by STATUS, and the split is enforced: a governance-status
name inside the operational tree fails the check.

| Tree | Names | Statuses | What it is | Views on this side |
| --- | ---: | --- | --- | --- |
| [catalog/](./catalog/README.md) — operational | ${opRowCount} | active, app-slot, adjudicated-live | The live surface. One page per family prefix, one row per name, every column derived. | [catalog.md](./catalog.md), [exposure-tiers.md](./exposure-tiers.md), [impact-map.md](./impact-map.md), [profiles-and-dials.md](./profiles-and-dials.md) — the capability CONTROLS are operational by definition. |
| [governance/](./governance/README.md) — debt | ${govRowCount} | dead-writer, legacy-alias, unwritten-hook, generated, generated-unread, test-only, frontier | **Debt until retired.** Same per-name depth, documented to be drained — never a menu, never an API. | [governance/lifecycle-and-deprecations.md](./governance/lifecycle-and-deprecations.md) — retirement batches, drainage programs, adjudicated dual authorities. |

## Authority model

| Question | Authority | Projection here |
| --- | --- | --- |
| Which tokens exist, who writes/reads each, dead stock | \`customization-surface-report.json\` (derived census, PostCSS + TS AST) | [catalog.md](./catalog.md), [catalog/](./catalog/README.md), [governance/](./governance/README.md) |
| Which CONTROLS each actor gets (Standard/Pro/Expert/…) | \`TENANT_CAPABILITY_REGISTRY\` + raw allowlist + BrandTheme contracts | [exposure-tiers.md](./exposure-tiers.md) |
| What changes when a control moves | registry \`derivedChannels\` + theme var() chains | [impact-map.md](./impact-map.md) |
| Profiles, axes, dials, family emphasis | \`expressive-profiles\` module | [profiles-and-dials.md](./profiles-and-dials.md) |
| App hooks vs fenced reads | \`hooks-manifest.json\` (v${manifest.schemaVersion}) | [exposure-tiers.md](./exposure-tiers.md), [app-customization.md](./app-customization.md) |
| Prototokens, retirement batches | \`prototype-ledger.json\` + its gate | [governance/lifecycle-and-deprecations.md](./governance/lifecycle-and-deprecations.md) |
| The resolved DEFAULT value of a name | \`styles/bithire.css\` through \`src/tooling/quality/no-loss\` | the \`Default (bithire)\` column of every family page |

## Current numbers (generated, with denominators)

- Universe of \`--ds-*\` names in the productive corpus: **${counts.universe}** (authored CSS ${report.meta.corpus.authoredCssFiles} files + production TS ${report.meta.corpus.productionTsFiles} files; tests/stories excluded and counted separately; generated artifacts measured apart).
- Operational **${opRowCount}** · governance **${govRowCount}** — every name lands in exactly one tree and exactly one family page.
- Writers **${counts.writers}** (foundation ${counts.foundationTokens} · component ${counts.componentTokens} · tenant channels ${counts.tenantChannels}, sets overlap).
- TS classification (AST-contextual): reads ${counts.tsReadNames} names · write-sites ${counts.tsWriteNames} · metadata-only ${counts.tsMetadataNames} (metadata NEVER counts as consumption).
- Dead writers **${counts.deadWriters}** (decrease-only gate; drainage program D1).
- Application: **${counts.publicHooks} public hooks** vs **${counts.unadjudicatedReads} fenced unadjudicated reads** (drainage program D2 — not a menu).
- Unclassified rows: **${counts.unclassified}** (gate-enforced zero).
- Values resolved from the shipped BitHire bundle: **${context.values.size}** of ${counts.universe}; the remainder is not declared in that bundle and its type reads \`unknown\`.

## Guides (hand-written)

- [authoring-guide.md](./authoring-guide.md) — the mandatory search-first workflow and prototoken adjudication path.
- [app-customization.md](./app-customization.md) — what product developers may customize without touching DS source.
`;

  // ---- catalog.md (operational overview + full family linkage) ----
  const opAgg = new Map();
  for (const name of operational) {
    const prefix = familyPrefixOf(name);
    if (!opAgg.has(prefix)) opAgg.set(prefix, { total: 0, writers: 0, hooks: 0, exact: 0, categories: new Set() });
    const agg = opAgg.get(prefix);
    agg.total += 1;
    if (rows[name].writer) agg.writers += 1;
    if (rows[name].category === 'public-app-hook') agg.hooks += 1;
    if (context.exactChannels.has(name)) agg.exact += 1;
    agg.categories.add(rows[name].category);
  }
  const typeDist = new Map();
  const impactDist = new Map();
  for (const name of operational) {
    const type = inferType(context.values.get(name));
    typeDist.set(type, (typeDist.get(type) ?? 0) + 1);
    const impact = impactOf(name, context);
    impactDist.set(impact, (impactDist.get(impact) ?? 0) + 1);
  }
  const distRow = (map) =>
    [...map.entries()]
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .map(([key, count]) => `${key} **${count}**`)
      .join(' · ');

  views['catalog.md'] = `${GEN_HEADER('customization-surface-report.json + hooks manifest + authored CSS + the resolved bithire bundle')}# Token Catalog — Operational Overview

The catalog is EXHAUSTIVE per name. This page is the overview; the rows live
in [catalog/families/](./catalog/README.md), one page per family prefix, one
row per name, ${opRowCount} operational names across
${opAgg.size} pages with zero omissions. Debt names are NOT here — they live in
[governance/](./governance/README.md) and are labelled debt until retired.

- Value types across the operational corpus: ${distRow(typeDist)}
- Impact evidence: ${distRow(impactDist)} (EXACT = registry-declared channel, INFERRED = reachable through authored \`var()\` edges, UNKNOWN = no edge data — absence of evidence, not evidence of absence)

${COLUMN_BASIS}
## Operational families (${opAgg.size}, all linked)

| Family prefix | Names | Writers | App-hook names | EXACT-impact names | Classes present |
| --- | ---: | ---: | ---: | ---: | --- |
${[...opAgg.entries()]
  .sort((a, b) => (b[1].total - a[1].total) || a[0].localeCompare(b[0]))
  .map(
    ([prefix, agg]) =>
      `| [\`${prefix}-*\`](./${CATALOG_FAMILIES_PREFIX}/${familyFileName(prefix)}) | ${agg.total} | ${agg.writers} | ${agg.hooks} | ${agg.exact} | ${[...agg.categories].filter(Boolean).sort().join(', ')} |`
  )
  .join('\n')}

Name-level truth also exists machine-readable in
\`packages/core/customization-surface-report.json\`; these pages add the
resolved value, the inferred type, the declaring file, the consumer layers and
the impact evidence, which the report does not carry.
`;

  // ---- catalog/README.md (the operational INDEX: every file, every count) ----
  const indexPage = (groups, dirPrefix, title, note) => {
    const entries = [...groups.entries()];
    const total = entries.reduce((sum, [, members]) => sum + members.length, 0);
    return `${GEN_HEADER('customization-surface-report.json')}# ${title}

${note}

Coverage assertion (recomputed on every \`--check\`): **${entries.length}** family
pages hold **${total}** rows, and ${total} is exactly the size of this corpus.
A name missing from its page, a name on two pages, or a page absent from this
index fails the gate.

| Family page | Prefix | Names |
| --- | --- | ---: |
${entries
  .map(([prefix, members]) => `| [\`${familyFileName(prefix)}\`](./families/${familyFileName(prefix)}) | \`${prefix}-*\` | ${members.length} |`)
  .join('\n')}

[← tokens hub](../README.md)
`;
  };

  views['catalog/README.md'] = indexPage(
    operationalPages.groups,
    CATALOG_FAMILIES_PREFIX,
    'Operational Catalog — Index',
    'Every LIVE name, one row per name. Statuses in this tree: active, app-slot,\nadjudicated-live. These names ship; treat every column as load-bearing.'
  );
  views['governance/README.md'] = indexPage(
    governancePages.groups,
    GOVERNANCE_FAMILIES_PREFIX,
    'Governance — Index (debt until retired)',
    'DEBT, not a menu. Dead writers, legacy aliases, fenced unadjudicated reads,\ngenerated-only emissions, test-only stock and reserved frontier names. Each is\ndocumented so it can be drained; none of them is an API, and adopting one is a\nregression. Drainage programs: D1 (dead writers), D2 (unadjudicated reads),\nD3 (one authority per concept).'
  );

  // ---- exposure-tiers.md ----
  const byTier = (tier, status = 'active') => registry.filter((r) => r.tier === tier && r.status === status);
  const capRow = (r) => `| \`${r.id}\` | ${r.title} | ${r.valueType} | \`${r.documentPath}\` | ${r.derivedChannels.slice(0, 3).map((c) => `\`${c}\``).join(', ')}${r.derivedChannels.length > 3 ? ', …' : ''} | ${r.evidence ? `\`${r.evidence.consumer.split('/').pop()}\`` : '—'} |`;
  views['exposure-tiers.md'] = `${GEN_HEADER('TENANT_CAPABILITY_REGISTRY + allowlist + hooks-manifest')}# Exposure Tiers — Who May Change What

Two ORTHOGONAL dimensions govern every name: its technical layer (census
\`category\`) and its exposure tier (this view). An internal token being
consumed by a Standard capability is normal — do not confuse internal token
count with visible control count.

## Tenant STANDARD — ${byTier('standard').length} high-impact decisions

| Capability | Title | Type | Document path | Representative channels | Evidence |
| --- | --- | --- | --- | --- | --- |
${byTier('standard').map(capRow).join('\n')}

## Tenant PRO — ${byTier('pro').length} controls (profiles, families, intensity)

| Capability | Title | Type | Document path | Representative channels | Evidence |
| --- | --- | --- | --- | --- | --- |
${byTier('pro').map(capRow).join('\n')}

## Tenant EXPERT/RAW — allowlist of ${allowlist.length} names (NOT color-only)

Bounded \`tokenOverrides\`: only these exact names (the source array COMPOSES
generated families via spreads — the literal count 71 was a stale
undercount), validated values, never arbitrary \`--ds-*\`. Domains:
${Object.entries(report.controls.tenantRawDomains ?? {}).map(([d, c]) => `${d} ${c}`).join(' · ')}.
Overlap with internal writers: ${report.controls.rawOverlapWithWriters}/${allowlist.length}.

<details><summary>Full allowlist (${allowlist.length})</summary>

${allowlist.map((n) => `\`${n}\``).join(' · ')}

</details>

## Vertical / BrandTheme — code-owned depth

Typed contracts (\`BrandTheme\`) compiled by the brand compiler; deep
identity (hundreds of channels) through derivations, never a parallel CSS.
Static-first verticals (BitHire, Evnto) select composition + expressive
selection here; the SAME lowerer serves the DB path (convergence is
acid-tested).

## Application PUBLIC — ${manifest.counts.hooks} hooks (vs ${manifest.counts.unadjudicatedReads} fenced reads)

Every public hook carries owner/type/fallback metadata in
\`hooks-manifest.json → declaredSlots\`; apps assign them ONLY under an
explicit app/feature scope (root writes are gate-blocked). The
${manifest.counts.unadjudicatedReads} unadjudicated reads are decrease-only
debt (program D2), not an API.

## Internal — everything else

Foundation primitives, component channels, compiler plumbing. No tenant or
app contract; reachable only through the capabilities above.

## Frontier — ${registry.filter((r) => r.status === 'frontier').length} reserved

${registry.filter((r) => r.status === 'frontier').map((r) => `- \`${r.id}\` — opens per its registry row (\`${r.documentPath}\`)`).join('\n')}
`;

  // ---- impact-map.md (three-valued, nothing hidden) ----
  const impactRows = registry.filter((r) => r.status === 'active').map((r) => {
    const downstream = transitiveDownstream(r.derivedChannels, edges);
    const layoutImpact = /density|typography\.scale|shape\.radius|responsive/.test(r.id);
    const exact = r.derivedChannels.filter((c) => rows[c]);
    const unknownSeeds = r.derivedChannels.filter((c) => !rows[c]);
    const inferred = [...reachable(exact, context.corpusEdges)].filter((n) => !r.derivedChannels.includes(n));
    return {
      id: r.id,
      tier: r.tier,
      direct: r.derivedChannels.length,
      exact,
      unknownSeeds,
      inferred,
      transitive: downstream.size,
      layoutImpact,
      compat: r.compat,
    };
  });
  const noEdgeControls = impactRows.filter((r) => r.inferred.length === 0);
  views['impact-map.md'] = `${GEN_HEADER('registry derivedChannels + theme var() chains (PostCSS) + the authored-CSS derivation graph')}# Impact Map — One Decision Moves Many Channels

Derivation edges come from real \`var()\` fallback chains. Two graphs, stated
apart because they answer different questions:

- **theme layer** (${edges.size} upstream names) — the adjudicated cycle-check
  graph. \`tokens:catalog:check\` fails on a cycle here.
- **authored corpus** (${context.corpusEdges.size} upstream names) — every
  authored CSS file, used ONLY for the three-valued impact column. It is a
  reachability graph across scopes, so it is deliberately not the cycle
  authority.

## The three-valued legend

| Value | Means | Does NOT mean |
| --- | --- | --- |
| **EXACT** | The name is a \`derivedChannels\` entry of this control AND the census knows it. Registry-verified. | That these are all the channels — \`derivedChannels\` are representative seeds. |
| **INFERRED** | The name is reachable from an EXACT channel through authored \`var()\` edges. | That the browser will repaint it in every scope; scope/cascade are not modelled. |
| **UNKNOWN** | No edge data reaches the name from any control. | That the name is unaffected. It means the graph has nothing to say. |

\`derivedChannels\` are representative seeds, so transitive counts are LOWER
BOUNDS, not totals.

| Control | Tier | Seeds | EXACT (census-known) | UNKNOWN seeds | INFERRED (corpus reach) | Transitive (theme, ≥) | Layout/measure impact | Rollback |
| --- | --- | ---: | ---: | ---: | ---: | ---: | :---: | --- |
${impactRows
  .map(
    (r) =>
      `| \`${r.id}\` | ${r.tier} | ${r.direct} | ${r.exact.length} | ${r.unknownSeeds.length} | ${r.inferred.length} | ${r.transitive} | ${r.layoutImpact ? 'YES — adaptive runtime re-measures (epoch)' : 'paint-only'} | ${r.compat.split(';')[0]} |`
  )
  .join('\n')}

## EXACT channels per control (registry-declared, census-verified)

${impactRows
  .map(
    (r) =>
      `- \`${r.id}\` → ${r.exact.length > 0 ? r.exact.map((c) => `\`${c}\``).join(', ') : '**none census-verified**'}${r.unknownSeeds.length > 0 ? ` · UNKNOWN seeds (declared but unknown to the census): ${r.unknownSeeds.map((c) => `\`${c}\``).join(', ')}` : ''}`
  )
  .join('\n')}

## Controls with no INFERRED reach (${noEdgeControls.length})

${
  noEdgeControls.length > 0
    ? noEdgeControls
        .map((r) => `- \`${r.id}\` — its ${r.exact.length} EXACT channel(s) start no authored \`var()\` edge. Impact beyond the seeds is UNKNOWN, not zero.`)
        .join('\n')
    : '- none: every active control reaches at least one downstream name.'
}

Layout-impacting controls fold into the adaptive runtime's invalidation
epoch (direction, locale, density posture, type scale, font epochs,
artifact revision) — a change re-measures instead of reusing stale spans.

Safety limits on every path: per-profile envelopes, universal a11y floors
(touch ≥ ${expressive.touchFloor ?? '44'}px coarse, edge width ≤ ${expressive.edgeCap ?? '4'}px, type scale ≥ ${expressive.typeScaleMin ?? '0.9'}), APCA autocorrect on dispatched colors, reduced-motion kill switch.
`;

  // ---- profiles-and-dials.md ----
  views['profiles-and-dials.md'] = `${GEN_HEADER('expressive-profiles module (TS AST)')}# Profiles, Dials and Family Emphasis

## Experience profiles (${expressive.profiles.length})

${expressive.profiles.map((p) => `- \`${p}\``).join('\n')}

One Standard field (\`appearance.experienceProfile\`) moves the full
9-axis composition (type, geometry, edge, material, elevation, motif,
density, motion, icon posture) through ONE shared expansion — both static
BrandTheme and tenant DB paths traverse the same lowerer, and the acid
suite proves the SAME public component diverges between two real artifacts.

## Pro per-axis overrides

\`visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif,icon}\`
— closed enums layered over the composition; precedence: explicit DB >
authored > profile > canon. Every numeric dial clamps into the selected
profile's envelope AND the universal floors.

## Family emphasis (app tier)

\`resolveFamilyEmphasis(family, intensity)\` — 4 families (card, toolbar,
metric-card, panel) × 4 quantized steps, emitting var()-chain values only;
apps ask for família+intensity, never for dozens of raw channels.

## Universal floors (non-negotiable)

- Touch targets ≥ ${expressive.touchFloor ?? '44'}px under coarse pointers (census-derived per-skin enforcement).
- Expressive edge widths ≤ ${expressive.edgeCap ?? '4'}px (clamped at expansion AND compile — classification-first invariant).
- Type scale ≥ ${expressive.typeScaleMin ?? '0.9'}; radius and motion bounded per profile envelope.
`;

  // ---- lifecycle: pointer at the root, content under governance/ ----
  views['lifecycle-and-deprecations.md'] = `${GEN_HEADER('the governance tree (this file is a pointer)')}# Lifecycle — moved

Lifecycle, deprecation and retirement material is DEBT, so it lives in the
governance tree with the names it governs:

**→ [governance/lifecycle-and-deprecations.md](./governance/lifecycle-and-deprecations.md)**

Per-name debt rows: **[governance/README.md](./governance/README.md)**.
The live surface is **[catalog.md](./catalog.md)**.
`;

  const deadByFamily = new Map();
  for (const name of report.deadWriters) {
    const family = familyOf(name);
    deadByFamily.set(family, (deadByFamily.get(family) ?? 0) + 1);
  }
  const topDead = [...deadByFamily.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 25);
  const ledgerEntries = Array.isArray(ledger) ? ledger.length : (ledger.entries?.length ?? 0);
  const statusCount = (status) => Object.values(rows).filter((r) => r.status === status).length;
  views['governance/lifecycle-and-deprecations.md'] = `${GEN_HEADER('census report + prototype-ledger + adjudicated dual-authority list')}# Lifecycle — Active, Dead, Prototype, Alias, Frontier

| Status | Count | Tree | Governed by |
| --- | ---: | --- | --- |
| active | ${statusCount('active')} | operational | census + consumers |
| app-slot (public) | ${statusCount('app-slot')} | operational | declaredSlots metadata |
| adjudicated-live | ${statusCount('adjudicated-live')} | operational | residual/premium adjudication registries |
| dead-writer | ${counts.deadWriters} | governance | decrease-only baseline (D1 drainage) |
| legacy-alias | ${statusCount('legacy-alias')} | governance | adjudicated dual-authority list (below) |
| unwritten-hook (fenced) | ${statusCount('unwritten-hook')} | governance | hooks-manifest ratchet (D2 drainage) |
| generated | ${statusCount('generated')} | governance | artifact emitters |
| generated-unread | ${statusCount('generated-unread')} | governance | emitter batch, never the D1 baseline |
| test-only | ${statusCount('test-only')} | governance | test corpus |
| frontier | ${statusCount('frontier')} names + ${registry.filter((r) => r.status === 'frontier').length} capabilities | governance | registry opening conditions |
| prototype | ${ledgerEntries} ledger entries | (ledger) | prototype-ledger gate |

Per-name rows for every governance status: **[README.md](./README.md)** →
\`families/\`. Per-name rows for the live surface: **[../catalog.md](../catalog.md)**.

## Dead writers by family (top ${topDead.length})

| Family | Dead names |
| --- | ---: |
${topDead.map(([f, c]) => `| \`${f}-*\` | ${c} |`).join('\n')}

## Adjudicated dual authorities (legacy → canonical, batch-owned)

| Legacy | Canonical | Retirement batch |
| --- | --- | --- |
${ADJUDICATED_DUAL_AUTHORITIES.map((d) => `| \`${d.legacyPrefix}*\` | \`${d.canonicalPrefix}*\` | ${d.batch} |`).join('\n')}

Any OTHER coexisting legacy/canonical pair fails \`tokens:catalog:check\` —
aliases require a replacement and a retirement batch to exist at all.

## Drainage program

D1 dead writers → ≈frontier-only · D2 unadjudicated reads → 0 unclassified ·
D3 one authority per concept (this table shrinks) · D4 Kimi visual wave
consumes the canon. Full program: official audit doc appendix C2c+D0.
`;

  return { views, operational, governance, operationalGroups: operationalPages.groups, governanceGroups: governancePages.groups };
}

function runChecks(inputs, edges, built, context, { drill } = {}) {
  const failures = [];
  const { report, manifest, registry } = inputs;
  const { views, operational, governance, operationalGroups, governanceGroups } = built;

  // 1. derivation cycles (theme layer — the adjudicated scope)
  let cycleEdges = edges;
  if (drill === 'cycle') {
    cycleEdges = new Map(edges);
    cycleEdges.set('--ds-drill-a', new Set(['--ds-drill-b']));
    cycleEdges.set('--ds-drill-b', new Set(['--ds-drill-a']));
  }
  const cycle = findCycle(cycleEdges);
  if (cycle) failures.push(`derivation cycle: ${cycle.join(' → ')}`);

  // 2. public hook metadata (owner required)
  const slots = manifest.declaredSlots ?? {};
  for (const hook of manifest.publicHooks ?? []) {
    const slot = drill === 'hook-owner' && hook === manifest.publicHooks[0] ? {} : slots[hook];
    if (!slot || !slot.owner || !slot.valueType) {
      failures.push(`public hook without owner/type metadata: ${hook}`);
    }
  }

  // 3. active capability channels must be known to the census
  for (const row of registry.filter((r) => r.status === 'active')) {
    for (const channel of row.derivedChannels) {
      const known = report.rows[channel] || channel.includes('{');
      if (drill === 'unknown-channel' && row.id === registry[0].id) {
        failures.push(`capability ${row.id}: derived channel --ds-drill-ghost unknown to the census`);
        break;
      }
      if (!known) failures.push(`capability ${row.id}: derived channel ${channel} unknown to the census`);
    }
  }

  // 4. no capability id in two tiers
  const seen = new Map();
  for (const row of registry) {
    if (seen.has(row.id) && seen.get(row.id) !== row.tier) {
      failures.push(`capability ${row.id} exposed in two tiers: ${seen.get(row.id)} + ${row.tier}`);
    }
    seen.set(row.id, row.tier);
  }

  // 5. two-authorities heuristic beyond the adjudicated list
  const writers = new Set(Object.entries(report.rows).filter(([, r]) => r.writer).map(([n]) => n));
  const adjudicated = new Set(ADJUDICATED_DUAL_AUTHORITIES.map((d) => d.legacyPrefix));
  const LEGACY_MARKERS = ['--ds-text-', '--ds-border-color-', '--ds-density-spacing-'];
  for (const marker of LEGACY_MARKERS) {
    const present = [...writers].some((w) => w.startsWith(marker));
    if (present && !adjudicated.has(marker)) {
      failures.push(`unadjudicated dual authority family: ${marker}*`);
    }
  }
  if (drill === 'dual-authority') {
    failures.push('unadjudicated dual authority family: --ds-drill-legacy-* (drill)');
  }

  // 6. reconciliation projection must match the report it derives from
  const RECON_PATH = join(ROOT, 'customization-reconciliation.json');
  if (existsSync(RECON_PATH)) {
    const recon = JSON.parse(readFileSync(RECON_PATH, 'utf8'));
    const reportDigest = createHash('sha256')
      .update(readFileSync(REPORT_PATH))
      .digest('hex');
    if (drill === 'recon-digest' || recon.basedOnReportDigest !== reportDigest) {
      failures.push(
        'reconciliation digest mismatch: customization-reconciliation.json was not derived from the CURRENT census report — regenerate both'
      );
    }
    if (recon.normative?.deadWriters !== report.counts.deadWriters) {
      failures.push(
        `reconciliation cites deadWriters=${recon.normative?.deadWriters} but the report says ${report.counts.deadWriters} — one normative figure only`
      );
    }
  } else {
    failures.push('missing customization-reconciliation.json (versioned projection)');
  }

  // 7. coverage-100 — recomputed from the PAGES, then diffed against the corpus
  const seenOn = new Map(); // name -> file[]
  for (const [file, content] of Object.entries(views)) {
    if (!file.startsWith(`${CATALOG_FAMILIES_PREFIX}/`) && !file.startsWith(`${GOVERNANCE_FAMILIES_PREFIX}/`)) continue;
    for (const name of extractNames(content)) {
      if (!seenOn.has(name)) seenOn.set(name, []);
      seenOn.get(name).push(file);
    }
  }
  const corpus = [...operational, ...governance];
  const missing = corpus.filter((name) => !seenOn.has(name));
  const duplicated = [...seenOn.entries()].filter(([, files]) => files.length > 1);
  const extra = [...seenOn.keys()].filter((name) => !report.rows[name]);
  if (missing.length > 0) {
    failures.push(
      `coverage-100: ${missing.length} corpus name(s) appear on no family page (e.g. ${missing.slice(0, 3).join(', ')}) — every name gets a row`
    );
  }
  if (duplicated.length > 0) {
    failures.push(
      `coverage-100: ${duplicated.length} name(s) appear on more than one family page (e.g. ${duplicated[0][0]} on ${duplicated[0][1].join(' + ')})`
    );
  }
  if (extra.length > 0) {
    failures.push(`coverage-100: ${extra.length} page row(s) name a token the census does not carry (e.g. ${extra[0]})`);
  }

  // 8. no-mixing — a governance status may never appear in the operational tree
  const mixed = [];
  for (const [file, content] of Object.entries(views)) {
    if (!file.startsWith(`${CATALOG_FAMILIES_PREFIX}/`)) continue;
    for (const name of extractNames(content)) {
      const status = report.rows[name]?.status;
      if (status && GOVERNANCE_STATUSES.has(status)) mixed.push(`${name} (${status}) in ${file}`);
    }
  }
  if (mixed.length > 0) {
    failures.push(
      `no-mixing: ${mixed.length} governance-status name(s) inside the operational catalog — ${mixed.slice(0, 3).join('; ')}`
    );
  }

  // 9. family-index-complete — index ↔ pages, both directions
  const indexCheck = (indexFile, groups, dirPrefix, label) => {
    const content = views[indexFile] ?? '';
    const listed = new Set([...content.matchAll(/\]\(\.\/families\/([a-z0-9-]+\.md)\)/g)].map((m) => m[1]));
    for (const prefix of groups.keys()) {
      const file = familyFileName(prefix);
      if (!listed.has(file)) failures.push(`family-index-complete: ${label} index omits ${file}`);
      if (!views[`${dirPrefix}/${file}`]) failures.push(`family-index-complete: ${label} page missing for ${file}`);
    }
    for (const file of listed) {
      if (!views[`${dirPrefix}/${file}`]) failures.push(`family-index-complete: ${label} index links a page that is not generated: ${file}`);
    }
  };
  indexCheck('catalog/README.md', operationalGroups, CATALOG_FAMILIES_PREFIX, 'operational');
  indexCheck('governance/README.md', governanceGroups, GOVERNANCE_FAMILIES_PREFIX, 'governance');

  // 10. docs staleness (every generated view, nested included)
  for (const [file, content] of Object.entries(views)) {
    const target = join(DOCS_TOKENS_DIR, file);
    const disk = existsSync(target) ? readFileSync(target, 'utf8') : null;
    const fresh = drill === 'stale' && file === 'README.md' ? false : disk === content;
    if (!fresh) failures.push(`stale/missing generated view: tokens/${file} — run pnpm tokens:catalog:write`);
  }
  for (const guide of HAND_WRITTEN) {
    if (!existsSync(join(DOCS_TOKENS_DIR, guide))) {
      failures.push(`missing hand-written guide: tokens/${guide}`);
    }
  }

  // 11. every root-level generated view must still be produced (a view that
  //     silently stops being generated leaves a stale file nobody regenerates)
  for (const file of GENERATED_ROOT) {
    if (!views[file]) failures.push(`generated root view no longer produced: tokens/${file}`);
  }

  // 12. orphan family pages — a retired family must not linger on disk
  for (const dirPrefix of [CATALOG_FAMILIES_PREFIX, GOVERNANCE_FAMILIES_PREFIX]) {
    const dir = join(DOCS_TOKENS_DIR, dirPrefix);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir).sort()) {
      if (!entry.endsWith('.md')) continue;
      if (!views[`${dirPrefix}/${entry}`]) {
        failures.push(`orphan generated family page: tokens/${dirPrefix}/${entry} — run pnpm tokens:catalog:write`);
      }
    }
  }
  return failures;
}

/** Everything the row renderer needs, computed once. */
async function buildContext(inputs, edges) {
  const { report, manifest, registry } = inputs;
  const css = scanAuthoredCss();
  const resolution = await resolveBundleValues();

  const exactChannels = new Set();
  for (const row of registry) {
    for (const channel of row.derivedChannels ?? []) {
      if (report.rows[channel]) exactChannels.add(channel);
    }
  }
  const inferredChannels = reachable([...exactChannels], css.corpusEdges);
  for (const name of exactChannels) inferredChannels.delete(name);

  return {
    values: resolution.values,
    valueLoader: resolution.loader,
    bundleDeclared: resolution.declared,
    declaredIn: css.declaredIn,
    consumerFiles: css.consumerFiles,
    corpusEdges: css.corpusEdges,
    cssFiles: css.files,
    exactChannels,
    inferredChannels,
    declaredSlots: manifest.declaredSlots ?? {},
    foundationSet: new Set(manifest.foundationTokens ?? []),
    componentSet: new Set(manifest.componentTokens ?? []),
    tenantChannelSet: new Set(manifest.tenantChannel ?? []),
    themeEdges: edges,
  };
}

async function main() {
  const inputs = loadInputs();
  const edges = derivationEdges();
  const context = await buildContext(inputs, edges);
  const drill = val('--drill');
  if (drill && has('--write')) {
    // Drills exist to BREAK the artifact so the check can be seen going red.
    // Writing one to disk would publish a catalog engineered to be wrong.
    throw new Error('tokens-catalog: --drill is a check-only mode and can never be combined with --write');
  }
  const built = buildViews(inputs, edges, context, { drill });
  const { views } = built;

  if (has('--write')) {
    mkdirSync(DOCS_TOKENS_DIR, { recursive: true });
    for (const [file, content] of Object.entries(views)) {
      const target = join(DOCS_TOKENS_DIR, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
    let pruned = 0;
    for (const dirPrefix of [CATALOG_FAMILIES_PREFIX, GOVERNANCE_FAMILIES_PREFIX]) {
      const dir = join(DOCS_TOKENS_DIR, dirPrefix);
      if (!existsSync(dir)) continue;
      for (const entry of readdirSync(dir).sort()) {
        if (!entry.endsWith('.md')) continue;
        if (!views[`${dirPrefix}/${entry}`]) {
          unlinkSync(join(dir, entry));
          pruned += 1;
        }
      }
    }
    const familyPages = Object.keys(views).filter((f) => f.includes('/families/')).length;
    console.log(
      `tokens-catalog: wrote ${Object.keys(views).length} generated views ` +
        `(${familyPages} family pages: ${built.operationalGroups.size} operational + ${built.governanceGroups.size} governance` +
        `, ${built.operational.length} + ${built.governance.length} rows) to ${DOCS_TOKENS_DIR}` +
        (pruned > 0 ? `; pruned ${pruned} orphan page(s)` : '') +
        ` — values resolved via ${context.valueLoader} (${context.values.size} names)`
    );
  }
  if (has('--check') || drill) {
    const failures = runChecks(inputs, edges, built, context, { drill });
    if (failures.length > 0) {
      for (const failure of failures) console.error(`tokens-catalog FAIL — ${failure}`);
      process.exit(1);
    }
    console.log(
      `tokens-catalog --check OK (${Object.keys(views).length} views fresh, ` +
        `${built.operational.length} operational + ${built.governance.length} governance rows covered exactly once, ` +
        `${edges.size} theme derivation sources, no cycles)`
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
