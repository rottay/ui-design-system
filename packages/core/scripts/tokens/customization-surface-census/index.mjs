/**
 * customization-surface-census (D0) — the ONE derived truth about the
 * `--ds-*` customization surface. It is NOT a second authority: every
 * name-set it can inherit comes from the existing authorities —
 *
 *   - hooks-manifest.json            (foundation/component/tenant-channel
 *                                     writers; public hooks; unadjudicated
 *                                     reads — schemaVersion 4 name lists)
 *   - TENANT_CAPABILITY_REGISTRY     (controls, tiers, status, evidence)
 *   - TENANT_THEME_OVERRIDE_TOKENS   (raw tenant allowlist)
 *   - expressive-profiles            (edge width classification, frontier
 *                                     status-seed family)
 *   - prototype-ledger.json          (governed prototokens)
 *
 * — and the only thing computed here is what no authority owns yet:
 * name-level CONSUMPTION (who reads each name, split productive vs test vs
 * generated corpus) via PostCSS declarations and the TypeScript AST — never
 * a naive grep over raw text (comments and prose never count; string
 * literals in production code do, because a literal `var(--ds-x)` IS a
 * runtime read).
 *
 * FORMAL CORPUS DEFINITIONS
 *   authored CSS   src/**\/*.css minus facade/artifacts (generated), minus
 *                  tests/stories paths.
 *   production TS  src/**\/*.{ts,tsx} minus tests/stories/fixtures.
 *   test corpus    the excluded test/story files (counted separately).
 *   artifacts      src/foundation/tokens/css/facade/artifacts/*\/index.css.
 *   writer         a name in the manifest writer sets (foundationTokens,
 *                  componentTokens, tenantChannel) — the manifest already
 *                  resolved compiler emissions and interpolated families.
 *   consumer       a `var(--ds-x` occurrence in an authored CSS declaration
 *                  value, or a `--ds-x` occurrence inside a production TS
 *                  string literal that also contains `var(` or is a bare
 *                  channel name passed to a runtime API.
 *   dead writer    writer with ZERO productive consumers that is neither
 *                  frontier-reserved nor a generated-only artifact name.
 *
 * The report (customization-surface-report.json) is DERIVED and never
 * hand-edited: `--write` regenerates it; `--check` fails on staleness,
 * unclassified rows, dead-writer growth or missing capability evidence.
 * `--drill=<case>` self-injects a synthetic violation and must exit
 * non-zero — proving each gate bites.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const require = createRequire(import.meta.url);
const postcss = require('postcss');
const ts = require('typescript');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const REPORT_PATH = join(HERE, 'customization-surface-report.json');
const DEAD_BASELINE_PATH = join(ROOT, 'scripts/tokens/customization-surface-census/customization-surface-census.dead-writers.baseline.json');
const MANIFEST_PATH = join(ROOT, 'hooks-manifest.json');
const REGISTRY_PATH = join(ROOT, 'src/foundation/contracts/composition/tenants/capabilities/index.ts');
const ALLOWLIST_PATH = join(ROOT, 'src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts');
const EXPRESSIVE_PATH = join(ROOT, 'src/foundation/tokens/ts/presentation/expressive-profiles/index.ts');
const LEDGER_PATH = join(ROOT, 'src/foundation/tokens/prototype-ledger.json');
const ARTIFACTS_DIR = join(ROOT, 'src/foundation/tokens/css/facade/artifacts');

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === name || a.startsWith(`${name}=`));
const flagValue = (name) => {
  const hit = flag(name);
  if (!hit) return undefined;
  const eq = hit.indexOf('=');
  return eq === -1 ? 'all' : hit.slice(eq + 1);
};

const NAME_RE = /--ds-[a-z0-9-]+/g;

function isTestPath(path) {
  return /\/tests?\/|\.test\.|\.stories\.|\/fixtures\//.test(path);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function collectCorpus() {
  const all = walk(join(ROOT, 'src'));
  const rel = (p) => relative(ROOT, p);
  const css = [];
  const tsFiles = [];
  const testFiles = [];
  const artifactFiles = [];
  for (const file of all) {
    const r = rel(file);
    if (r.startsWith('src/foundation/tokens/css/facade/artifacts/')) {
      if (r.endsWith('.css')) artifactFiles.push(file);
      continue;
    }
    if (isTestPath(r)) {
      if (/\.(css|ts|tsx)$/.test(r)) testFiles.push(file);
      continue;
    }
    if (r.endsWith('.css')) css.push(file);
    else if (/\.(ts|tsx)$/.test(r)) tsFiles.push(file);
  }
  return { css, tsFiles, testFiles, artifactFiles };
}

/** CSS consumption + declaration via PostCSS — comments never count. */
function scanCss(files) {
  const consumed = new Map(); // name -> count
  const declared = new Set();
  const modernConsumed = new Set();
  for (const file of files) {
    const isModern = file.includes('/runtime/engines/modern/');
    let root;
    try {
      root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
    } catch {
      continue;
    }
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--ds-')) declared.add(decl.prop);
      const value = String(decl.value);
      let match;
      const varRe = /var\(\s*(--ds-[a-z0-9-]+)/g;
      while ((match = varRe.exec(value)) !== null) {
        consumed.set(match[1], (consumed.get(match[1]) ?? 0) + 1);
        if (isModern) modernConsumed.add(match[1]);
      }
    });
  }
  return { consumed, declared, modernConsumed };
}

/**
 * Contextual TS literal classification (C2c blocker fix): a `--ds-*` string
 * literal is NOT automatically a read. Classification by AST CONTEXT:
 *
 *   READ      the literal payload contains `var(--ds-` (a style value that
 *             the browser will resolve), OR the literal is an argument of a
 *             known read call (`getPropertyValue`, `getPropertyPriority`).
 *   WRITE     the literal is the first argument of `setProperty`/
 *             `removeProperty`, OR it is an object-literal KEY inside a
 *             compiler/token emission module (emission maps).
 *   METADATA  any other bare literal — registries, allowlists, evidence,
 *             docs strings. Metadata NEVER keeps a writer alive and never
 *             counts as consumption.
 *
 * Exported for the classifier drills (node --test).
 */
/**
 * Productive token helpers, DECLARATIVELY registered (Blocker 2): a helper
 * listed here is treated like getPropertyValue/setProperty when a token
 * literal is its first argument. Adding one is a reviewed contract change,
 * never an inference.
 */
export const REGISTERED_TOKEN_HELPERS = Object.freeze({
  read: Object.freeze([
    // Production duration/size resolvers whose arg0 is the token name and
    // whose body reads getComputedStyle().getPropertyValue(). Registered
    // after the H-wave found 4 false-dead JS-consumed tokens.
    'resolveDurationToken',
    'readRootCssVariable',
  ]),
  write: Object.freeze([]),
});

export function classifyTsLiterals(fileText, fileName) {
  const reads = new Map();
  const writes = new Map();
  const metadata = new Map();
  const bump = (map, name) => map.set(name, (map.get(name) ?? 0) + 1);
  const isEmissionModule =
    fileName.includes('/infrastructure/compilers/') ||
    fileName.includes('/foundation/tokens/ts/');
  const source = ts.createSourceFile(
    fileName,
    fileText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const READ_CALLEES = new Set([
    'getPropertyValue',
    'getPropertyPriority',
    ...REGISTERED_TOKEN_HELPERS.read,
  ]);
  const WRITE_CALLEES = new Set([
    'setProperty',
    'removeProperty',
    ...REGISTERED_TOKEN_HELPERS.write,
  ]);
  const calleeName = (call) => {
    const expr = call.expression;
    if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
    if (ts.isIdentifier(expr)) return expr.text;
    return '';
  };
  const visit = (node) => {
    const isLiteral =
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node);
    if (isLiteral && node.text.includes('--ds-')) {
      const names = node.text.match(NAME_RE) ?? [];
      const parent = node.parent;
      const inCallArg0 =
        parent && ts.isCallExpression(parent) && parent.arguments[0] === node;
      // Element-access token addressing: `style['--ds-x'] = v` is a WRITE
      // (the literal is the accessed name and the access is an assignment
      // target); the same access outside an assignment LHS is a READ.
      const inElementAccess =
        parent && ts.isElementAccessExpression(parent) &&
        parent.argumentExpression === node;
      if (inElementAccess) {
        const access = parent;
        const grand = access.parent;
        const isAssignmentTarget =
          grand && ts.isBinaryExpression(grand) &&
          grand.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          grand.left === access;
        for (const name of names) bump(isAssignmentTarget ? writes : reads, name);
      } else if (/var\(\s*--ds-/.test(node.text)) {
        for (const name of names) bump(reads, name);
      } else if (inCallArg0 && READ_CALLEES.has(calleeName(parent))) {
        for (const name of names) bump(reads, name);
      } else if (inCallArg0 && WRITE_CALLEES.has(calleeName(parent))) {
        for (const name of names) bump(writes, name);
      } else if (
        parent &&
        ts.isPropertyAssignment(parent) &&
        parent.name === node &&
        isEmissionModule
      ) {
        for (const name of names) bump(writes, name);
      } else {
        for (const name of names) bump(metadata, name);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { reads, writes, metadata };
}

function scanTs(files) {
  const reads = new Map();
  const writes = new Map();
  const metadata = new Map();
  const merge = (into, from) => {
    for (const [name, count] of from) into.set(name, (into.get(name) ?? 0) + count);
  };
  for (const file of files) {
    const result = classifyTsLiterals(readFileSync(file, 'utf8'), file);
    merge(reads, result.reads);
    merge(writes, result.writes);
    merge(metadata, result.metadata);
  }
  return { reads, writes, metadata };
}

function scanNamesInText(files) {
  const names = new Set();
  for (const file of files) {
    for (const name of readFileSync(file, 'utf8').match(NAME_RE) ?? []) {
      names.add(name);
    }
  }
  return names;
}

/**
 * Las familias de emision INTERPOLADA y la capacidad que las reserva.
 *
 * Una familia interpolada no tiene nombre literal en fuente (el compilador la
 * arma por plantilla), asi que el censo no puede descubrirla caminando: se
 * declara. Lo que NO se declara es si esta escudada -- eso lo decide el
 * `status` de su capacidad en el registro, que es la unica autoridad.
 */
export const FRONTIER_FAMILIES = Object.freeze([
  Object.freeze({
    capability: 'palette.status-seeds',
    prefixPattern: '--ds-tint-{success|warning|error|info}-{step}',
    prefixes: Object.freeze(['--ds-tint-success-', '--ds-tint-warning-', '--ds-tint-error-', '--ds-tint-info-']),
    source: 'interpolated compiler emission — palette.status-seeds (frontier capability)',
    /* La fase que la abre se DECLARA, no se deriva: "C3" es el id de fase del
     * roadmap y no sale del id de la capacidad. Derivar la cadena habria perdido
     * ese puntero, que es lo unico que ata esta familia a su lote. */
    opensWith: 'palette.status-seeds activation (C3)',
  }),
]);

/**
 * Una familia esta escudada SII su capacidad existe en el registro y su
 * `status` es `frontier`. Falla cerrado en los dos sentidos que importan: una
 * familia que nombra una capacidad INEXISTENTE no escuda nada (no se escuda
 * contra un fantasma), y una capacidad ACTIVA deja de escudar en el acto.
 */
export function buildFrontierShield(families, registryRows) {
  const statusOf = new Map((registryRows ?? []).map((row) => [row.id, row.status]));
  const shielded = (families ?? []).filter((family) => statusOf.get(family.capability) === 'frontier');
  const prefixes = shielded.flatMap((family) => family.prefixes ?? []);
  return {
    shielded,
    prefixes,
    covers: (name) => prefixes.some((prefix) => name.startsWith(prefix)),
    /* Lo que se PUBLICA en el reporte sale de aqui, no de una constante aparte:
     * la prosa y el escudo no pueden discrepar si son el mismo objeto. */
    families: shielded.map((family) => ({
      capability: family.capability,
      prefixPattern: family.prefixPattern,
      source: family.source,
      opensWith: family.opensWith,
    })),
  };
}

/** Capability registry via the TS AST (no build dependency). */
export function parseRegistry() {
  const source = ts.createSourceFile(
    REGISTRY_PATH,
    readFileSync(REGISTRY_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const rows = [];
  const objectToRow = (obj) => {
    const row = {};
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = prop.name.getText(source).replace(/['"]/g, '');
      const init = prop.initializer;
      if (ts.isStringLiteral(init)) row[key] = init.text;
      else if (ts.isNumericLiteral(init)) row[key] = Number(init.text);
      else if (ts.isObjectLiteralExpression(init)) row[key] = objectToRow(init);
      else if (ts.isArrayLiteralExpression(init)) {
        row[key] = init.elements
          .filter((el) => ts.isStringLiteral(el))
          .map((el) => el.text);
      }
    }
    return row;
  };
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(source) === 'TENANT_CAPABILITY_REGISTRY'
    ) {
      let expr = node.initializer;
      while (
        expr &&
        (ts.isCallExpression(expr) || ts.isAsExpression(expr) ||
         ts.isSatisfiesExpression?.(expr))
      ) {
        expr = ts.isCallExpression(expr) ? expr.arguments[0] : expr.expression;
      }
      if (expr && ts.isArrayLiteralExpression(expr)) {
        for (const el of expr.elements) {
          if (ts.isObjectLiteralExpression(el)) rows.push(objectToRow(el));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return rows;
}

/**
 * The Expert/raw allowlist. The source array COMPOSES generated families via
 * spreads (surface roles x states, typography roles x facets, color ramp
 * roles x steps), so a literal scan undercounts it 71 vs the real 294 — the
 * exact stale-number Codex caught. The runtime list from the built bundle is
 * the truth (dist freshness is enforced by the build step of every tanda and
 * the bundle is part of the census input digest); the literal scan remains
 * only as a fallback for a distless checkout, and the report records which
 * source answered.
 */
export function parseAllowlist() {
  try {
    const bundle = require(join(ROOT, 'dist/index.js'));
    const list = bundle.TENANT_THEME_OVERRIDE_TOKENS;
    if (Array.isArray(list) && list.length > 0) {
      return { names: [...list], source: 'dist-runtime' };
    }
  } catch {
    /* distless checkout */
  }
  const content = readFileSync(ALLOWLIST_PATH, 'utf8');
  const start = content.indexOf('TENANT_THEME_OVERRIDE_TOKENS');
  const slice = content.slice(start, content.indexOf('] as const', start));
  return {
    names: [...new Set(slice.match(NAME_RE) ?? [])],
    source: 'source-literals-fallback',
  };
}

/** Expert allowlist domain classification (Blocker 4: NOT color-only). */
export function classifyAllowlistDomains(names) {
  const domains = {};
  const domainOf = (name) => {
    if (/^--ds-(color|chart)-/.test(name)) return 'color';
    if (/^--ds-surface-/.test(name)) return 'semantic-surface';
    if (/^--ds-material-/.test(name)) return 'semantic-material';
    if (/^--ds-type-/.test(name)) return 'semantic-typography';
    return 'other';
  };
  for (const name of names) {
    const domain = domainOf(name);
    domains[domain] = (domains[domain] ?? 0) + 1;
  }
  return domains;
}

function parseExpressiveLists() {
  const content = readFileSync(EXPRESSIVE_PATH, 'utf8');
  const grab = (marker) => {
    const start = content.indexOf(marker);
    if (start === -1) return [];
    const slice = content.slice(start, content.indexOf(']', start));
    return [...new Set(slice.match(NAME_RE) ?? [])];
  };
  return {
    expressiveEdge: grab('EXPRESSIVE_EDGE_WIDTH_CHANNELS'),
    structural: grab('STRUCTURAL_WIDTH_CHANNELS'),
  };
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function computeInputsDigest(corpus) {
  const parts = [];
  const add = (path) => {
    parts.push(`${relative(ROOT, path)}:${sha256(readFileSync(path, 'utf8'))}`);
  };
  for (const group of [corpus.css, corpus.tsFiles, corpus.artifactFiles]) {
    for (const file of group) add(file);
  }
  for (const authority of [
    MANIFEST_PATH, REGISTRY_PATH, ALLOWLIST_PATH, EXPRESSIVE_PATH, LEDGER_PATH,
    join(ROOT, 'src/foundation/tokens/residual-adjudication.json'),
    join(ROOT, 'src/foundation/tokens/premium-dead-adjudication.json'),
  ]) {
    if (existsSync(authority)) add(authority);
  }
  parts.sort();
  return sha256(parts.join('\n'));
}

function buildReport({ drill } = {}) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  // Adjudication registries are AUTHORITIES: a name a versioned, evidence-
  // backed adjudication marks as live/executed can never be a dead writer
  // (the Toast pair reads through a ternary→variable flow no call-site AST
  // match can see; the adjudication carries the human-verified evidence).
  const adjudicatedAlive = new Set();
  for (const registryPath of ['src/foundation/tokens/residual-adjudication.json', 'src/foundation/tokens/premium-dead-adjudication.json']) {
    const full = join(ROOT, registryPath);
    if (!existsSync(full)) continue;
    try {
      const registry = JSON.parse(readFileSync(full, 'utf8'));
      const walk = (node) => {
        if (Array.isArray(node)) { for (const item of node) walk(item); return; }
        if (typeof node !== 'object' || node === null) return;
        const decision = node.decision ?? node.verdict;
        const name = node.name ?? node.token;
        if (typeof name === 'string' && typeof decision === 'string' &&
            /^(KEEP_LIVE|EXECUTED)/.test(decision)) {
          adjudicatedAlive.add(name);
        }
        for (const value of Object.values(node)) walk(value);
      };
      walk(registry);
    } catch { /* malformed registry: census stays independent */ }
  }

  const ledger = existsSync(LEDGER_PATH)
    ? JSON.parse(readFileSync(LEDGER_PATH, 'utf8'))
    : [];
  const registry = parseRegistry();
  const allowlistResolved = parseAllowlist();
  const allowlist = allowlistResolved.names;
  const expressive = parseExpressiveLists();
  const corpus = collectCorpus();

  const foundation = new Set(manifest.foundationTokens ?? []);
  const component = new Set(manifest.componentTokens ?? []);
  const tenantChannel = new Set(manifest.tenantChannel ?? []);
  const publicHooks = new Set(manifest.publicHooks ?? []);
  const unadjudicated = new Set(manifest.unadjudicatedReads ?? []);

  const cssScan = scanCss(corpus.css);
  const tsScan = scanTs(corpus.tsFiles);
  const tsConsumed = tsScan.reads;
  const testNames = scanNamesInText(corpus.testFiles);
  const artifactNames = scanNamesInText(corpus.artifactFiles);

  if (drill === 'dead-growth') {
    // Synthetic never-read writer: must be reported as NEW dead growth.
    foundation.add('--ds-drill-synthetic-dead-writer');
  }

  /* EL ESCUDO SE DERIVA DEL REGISTRO, NO DE UNA LISTA DE PREFIJOS.
   *
   * Antes `FRONTIER_PREFIXES` estaba escrito a mano y `frontierFamilies` era
   * prosa al lado: dos declaraciones de lo mismo, sin nada que las atara. El
   * dia que la capacidad se abra, la lista de prefijos seguiria escudando
   * canales de una capacidad ACTIVA -- el censo diria "reservado para una
   * frontera" de algo que ya no es frontera, y esos writers quedarian invisibles
   * en vez de contarse. El escudo dura exactamente lo que dura la frontera. */
  const frontierShield = buildFrontierShield(FRONTIER_FAMILIES, parseRegistry());
  const isFrontierName = frontierShield.covers;

  const universe = new Set([
    ...foundation, ...component, ...tenantChannel, ...publicHooks,
    ...unadjudicated, ...cssScan.declared, ...cssScan.consumed.keys(),
    ...tsConsumed.keys(), ...tsScan.writes.keys(), ...allowlist,
    ...artifactNames,
  ]);

  const rows = {};
  const deadWriters = [];
  let unclassified = 0;

  for (const name of [...universe].sort()) {
    const isWriter =
      foundation.has(name) || component.has(name) ||
      tenantChannel.has(name) || cssScan.declared.has(name) ||
      (tsScan.writes.get(name) ?? 0) > 0 ||
      artifactNames.has(name);
    const cssReads = cssScan.consumed.get(name) ?? 0;
    const tsReads = tsConsumed.get(name) ?? 0;
    const productiveReads = cssReads + tsReads;

    let category = null;
    if (isFrontierName(name)) category = 'frontier-reserved';
    else if (allowlist.includes(name)) category = 'tenant-raw-override';
    else if (publicHooks.has(name)) category = 'public-app-hook';
    // Writer evidence BEATS the manifest's unadjudicated-read class: a name
    // that something demonstrably writes cannot be an "unwritten hook"
    // (Blocker 2 precedence fix — the contradiction generated-unread vs
    // unwritten-hook is now unrepresentable).
    else if (unadjudicated.has(name) && !isWriter) category = 'unadjudicated-read';
    else if (tenantChannel.has(name)) category = 'compiler-derived-channel';
    else if (foundation.has(name)) category = 'canonical-authority';
    else if (component.has(name)) category = 'component-channel';
    else if (cssScan.declared.has(name)) category = 'authored-css-local';
    else if (artifactNames.has(name)) category = 'generated-artifact-only';
    else if (testNames.has(name) && productiveReads === 0) category = 'test-only';
    else if ((tsScan.writes.get(name) ?? 0) > 0) category = 'ts-emission-site';
    else if (productiveReads > 0) category = 'consumed-external-origin';

    let tier;
    switch (category) {
      case 'tenant-raw-override': tier = 'tenant-expert'; break;
      case 'compiler-derived-channel': tier = 'tenant-bounded'; break;
      case 'public-app-hook': tier = 'application-public'; break;
      case 'unadjudicated-read': tier = 'application-unadjudicated'; break;
      case 'frontier-reserved': tier = 'frontier'; break;
      case 'generated-artifact-only': tier = 'generated'; break;
      case 'test-only': tier = 'test-corpus'; break;
      default: tier = 'internal';
    }

    const LEGACY_ALIAS_FAMILIES = [
      { prefix: '--ds-text-', replacement: '--ds-type-*', batch: 'D1a' },
      { prefix: '--ds-border-color-', replacement: '--ds-color-border*', batch: 'D1b' },
      { prefix: '--ds-density-spacing-', replacement: '--ds-spacing-*', batch: 'D1c' },
    ];
    const alias = LEGACY_ALIAS_FAMILIES.find((f) => name.startsWith(f.prefix));

    let status;
    if (category === 'frontier-reserved') status = 'frontier';
    else if (category === 'unadjudicated-read') status = 'unwritten-hook';
    else if (category === 'public-app-hook') status = 'app-slot';
    else if (category === 'test-only') status = 'test-only';
    else if (category === 'generated-artifact-only') status = 'generated';
    else if (isWriter && productiveReads === 0) {
      // Artifact-only emissions (per-tenant compiler output the manifest's
      // writer sets do not cover) drain through the EMITTER (a different
      // batch), never through the D1 dead-writer baseline.
      if (adjudicatedAlive.has(name)) {
        status = 'adjudicated-live';
      } else if (
        artifactNames.has(name) &&
        !foundation.has(name) && !component.has(name) &&
        !tenantChannel.has(name) && !cssScan.declared.has(name)
      ) {
        status = 'generated-unread';
      } else if (alias) {
        // Adjudicated legacy alias: replacement + retirement batch exist by
        // construction; drains through D1, never through the generic pool.
        status = 'legacy-alias';
      } else {
        status = 'dead-writer';
        deadWriters.push(name);
      }
    } else status = 'active';

    if (!category || !tier || !status) unclassified += 1;

    rows[name] = {
      category, tier, status,
      ...(alias ? { alias: { replacement: alias.replacement, batch: alias.batch } } : {}),
      writer: isWriter,
      reads: { css: cssReads, ts: tsReads, tests: testNames.has(name), modern: cssScan.modernConsumed.has(name), artifact: artifactNames.has(name) },
      tsWriteSites: tsScan.writes.get(name) ?? 0,
      tsMetadataMentions: tsScan.metadata.get(name) ?? 0,
    };
  }

  if (drill === 'unclassified') unclassified += 1;

  // Capability controls + evidence (the visible-controls layer, distinct
  // from internal variable counts by construction).
  const capabilityEvidence = [];
  for (const row of registry) {
    if (row.status !== 'active') continue;
    const evidence = row.evidence;
    let verdict = 'missing-evidence';
    if (evidence?.consumer && evidence?.symbol) {
      const consumerPath = join(ROOT, evidence.consumer);
      if (drill === 'evidence' || !existsSync(consumerPath)) verdict = 'consumer-file-missing';
      else if (!readFileSync(consumerPath, 'utf8').includes(evidence.symbol)) verdict = 'symbol-missing';
      else if (isTestPath(evidence.consumer)) verdict = 'evidence-is-a-test';
      else verdict = 'verified';
    }
    capabilityEvidence.push({ id: row.id, tier: row.tier, verdict });
  }

  const controls = {
    tenantBasic: registry.filter((r) => r.tier === 'standard' && r.status === 'active').map((r) => r.id),
    tenantPro: registry.filter((r) => r.tier === 'pro' && r.status === 'active').map((r) => r.id),
    internal: registry.filter((r) => r.tier === 'internal').map((r) => r.id),
    frontier: registry.filter((r) => r.status === 'frontier').map((r) => r.id),
    tenantRawAllowlist: allowlist.length,
    tenantRawAllowlistSource: allowlistResolved.source,
    tenantRawDomains: classifyAllowlistDomains(allowlist),
    rawOverlapWithWriters: allowlist.filter((n) => foundation.has(n) || tenantChannel.has(n)).length,
  };

  deadWriters.sort();
  const report = {
    schemaVersion: 1,
    generatedBy: 'scripts/tokens/customization-surface-census/index.mjs --write',
    meta: {
      scopeLaw:
        'DS-SCOPED PROJECTION (core+showroom). deadWriters is a projection for gates and catalogs, NEVER the instrument behind a deletion: on the same population an app-aware inverted index found 53 census-dead channels with LIVE app readers (F5 reconciliation, 2026-08-02 — the --ds-text-eyebrow failure at scale). Death verdicts require the app-inclusive index plus the raw-mention gate.',
      inputsDigest: computeInputsDigest(corpus),
      manifestSchemaVersion: manifest.schemaVersion,
      corpus: {
        authoredCssFiles: corpus.css.length,
        productionTsFiles: corpus.tsFiles.length,
        testFiles: corpus.testFiles.length,
        artifactFiles: corpus.artifactFiles.length,
      },
    },
    counts: {
      universe: universe.size,
      writers: [...universe].filter((n) => rows[n].writer).length,
      foundationTokens: foundation.size,
      componentTokens: component.size,
      tenantChannels: tenantChannel.size,
      publicHooks: publicHooks.size,
      unadjudicatedReads: unadjudicated.size,
      deadWriters: deadWriters.length,
      frontierReserved: [...universe].filter((n) => rows[n].status === 'frontier').length,
      modernConsumedUnique: cssScan.modernConsumed.size,
      tsReadNames: tsConsumed.size,
      tsWriteNames: tsScan.writes.size,
      tsMetadataNames: tsScan.metadata.size,
      unclassified,
      prototypeLedgerRows: Array.isArray(ledger) ? ledger.length : (ledger.entries?.length ?? 0),
    },
    // Interpolated emission families are WRITERS the manifest tracks only
    // as counts (template emissions have no concrete literal name). The
    // known frontier family is documented here so it can never be mistaken
    // for dead stock nor silently dropped from the surface.
    frontierFamilies: frontierShield.families,
    deadByClass: {
      foundation: deadWriters.filter((n) => foundation.has(n)).length,
      component: deadWriters.filter((n) => component.has(n)).length,
      tenantChannel: deadWriters.filter((n) => tenantChannel.has(n)).length,
      authoredCssLocal: deadWriters.filter((n) => !foundation.has(n) && !component.has(n) && !tenantChannel.has(n)).length,
    },
    controls,
    capabilityEvidence,
    deadWriters,
    rows,
  };
  return report;
}

function loadBaselineDead() {
  if (!existsSync(DEAD_BASELINE_PATH)) return null;
  try { return JSON.parse(readFileSync(DEAD_BASELINE_PATH, 'utf8')); } catch { return null; }
}

/**
 * EL INVENTARIO DE DEAD-WRITERS ES DECRECE-SOLO, Y DESDE AQUI CON PUERTA.
 *
 * Hasta hoy el `--check=dead` fallaba SOLO hacia arriba, y `--write-baseline`
 * reescribia la lista entera sin razon, sin bandera y sin dejar rastro de que
 * habia pasado. Las dos mitades faltaban:
 *
 *   (a) Un nombre que SALE de la lista es una victoria -- el writer consiguio
 *       consumidor o dejo de emitirse -- pero salir en SILENCIO deja el ancla
 *       declarando deuda que ya no existe, y la proxima lectura del numero
 *       miente hacia arriba. Bajar tambien falla, con la instruccion.
 *   (b) Un nombre que ENTRA amplia el conjunto gobernado, igual que un subpath
 *       nuevo en el ancla de techos: se pide por nombre con `--widen`.
 *
 * POR QUE AHORA Y NO CON P0. La apertura de la frontera `palette.status-seeds`
 * va a mover este numero (los canales de tinta de estado pierden su escudo), y
 * sin esta puerta esa subida entraria por la via de la bajada, etiquetada como
 * si fuera una limpieza. Es exactamente el defecto que costo dos rondas en
 * DRILL-77: primero un subpath nuevo, despues un ancla corrupta. Se construye
 * ANTES de que haga falta, para que P0 tenga donde escribir su razon.
 */
export const DEAD_BASELINE_SCHEMA_VERSION = 1;

export function evaluateDeadBaseline(live, baseline) {
  if (!baseline || !Array.isArray(baseline.names)) {
    return ['dead: el baseline no existe o no tiene `names`'];
  }
  if (baseline.schemaVersion !== DEAD_BASELINE_SCHEMA_VERSION) {
    return [`dead: el baseline declara schemaVersion ${JSON.stringify(baseline.schemaVersion ?? null)} `
      + `y este censo lee la version ${DEAD_BASELINE_SCHEMA_VERSION}: no se compara un archivo cuyo formato no se entiende`];
  }
  const anchored = new Set(baseline.names);
  const failures = [];
  const grown = live.filter((name) => !anchored.has(name));
  if (grown.length > 0) {
    failures.push(`dead: ${grown.length} NEW dead writer(s): ${grown.slice(0, 8).join(', ')}${grown.length > 8 ? ', …' : ''}`
      + ' — se les da consumidor o se dejan de emitir, no se amplia el ancla. Si la ampliacion esta autorizada,'
      + ' pedila por nombre: --write-baseline --widen --reason "..."');
  }
  const liveSet = new Set(live);
  const gone = baseline.names.filter((name) => !liveSet.has(name));
  if (gone.length > 0) {
    failures.push(`dead: ${gone.length} nombre(s) dejaron de ser dead-writer: ${gone.slice(0, 8).join(', ')}${gone.length > 8 ? ', …' : ''}`
      + ' — es una victoria, y se registra: baja el ancla en el MISMO commit con --write-baseline --reason "..."');
  }
  return failures;
}

/**
 * La puerta de escritura. Subir exige `--widen`; bajar exige razon igual. No
 * vuelve imposible editar el JSON a mano -- lo que consigue es que la via
 * NORMAL deje la razon escrita y que el `--check` enrojezca ante cualquier
 * desvio, de modo que una ampliacion sin razon sea revisable en el diff.
 */
export function buildDeadBaselineDoc({ live, previous, reason, widen = false }) {
  if (!reason || !String(reason).trim()) {
    throw new Error('--write-baseline exige --reason "por que se mueve el ancla"');
  }
  /* NO SE RE-ANCLA SOBRE UN ARCHIVO QUE NO SE ENTIENDE. Defecto de Fable, y
   * medido en las seis formas: con el ancla previa ilegible la puerta escribia
   * igual, y de dos maneras distintas, las dos falsas.
   *
   *   - `previous === null` (archivo AUSENTE o JSON invalido -- `loadBaselineDead`
   *     devuelve null para los dos): `added` se calculaba con un guard `previous ?`
   *     que lo dejaba vacio, asi que no pedia `--widen` y escribia la poblacion
   *     ENTERA etiquetada `decrece-solo: -0`. Un bootstrap silencioso disfrazado
   *     de limpieza.
   *   - `schemaVersion` ajena o `names` ausente: lanzaba, pero diciendo "me niego
   *     a AMPLIAR" -- que describe mal lo que pasa -- y **con `--widen` escribia
   *     igual**, lavando el ancla ilegible con una etiqueta plausible.
   *
   * Es el vector que cerro el microfix de Codex en DRILL-77, aplicado aca: la
   * legibilidad del ancla se comprueba ANTES que cualquier logica de subida o
   * bajada, porque `raised`/`added` se calculan CONTRA ella. Un bootstrap
   * legitimo tiene que ser un acto explicito y separado -- nunca la ruta del
   * decrece-solo, que es la que menos mira nadie. */
  if (!previous || !Array.isArray(previous.names)) {
    throw new Error('no se re-ancla sobre un archivo que no se entiende: el ancla previa no existe, '
      + 'no es JSON valido o no declara `names`. Restaurala, o crea el ancla como un acto deliberado y declarado; '
      + 'la puerta de movimiento no fabrica inventarios.');
  }
  if (previous.schemaVersion !== DEAD_BASELINE_SCHEMA_VERSION) {
    throw new Error(`no se re-ancla sobre un archivo que no se entiende: el ancla previa declara schemaVersion `
      + `${JSON.stringify(previous.schemaVersion ?? null)} y esta puerta escribe la version ${DEAD_BASELINE_SCHEMA_VERSION}.`);
  }
  const anchored = new Set(previous.names);
  const added = live.filter((name) => !anchored.has(name));
  if (added.length > 0 && !widen) {
    throw new Error(`me niego a AMPLIAR el inventario de dead-writers en ${added.length} nombre(s): `
      + `${added.slice(0, 8).join(', ')}${added.length > 8 ? ', …' : ''}`
      + '. Un writer sin consumidor se cablea o se retira. Si la ampliacion esta autorizada,'
      + ' pedila por nombre: --widen --reason "..."');
  }
  const liveSet = new Set(live);
  const removed = previous.names.filter((name) => !liveSet.has(name));
  return {
    schemaVersion: DEAD_BASELINE_SCHEMA_VERSION,
    note: previous.note
      ?? 'Decrease-only dead-writer inventory (name-keyed). A NEW name here fails the gate; deletions are the goal.',
    lastMove: reason,
    lastMoveKind: added.length > 0
      ? `ampliacion autorizada por nombre (--widen): +${added.length} nombre(s), -${removed.length}`
      : `decrece-solo: -${removed.length} nombre(s)`,
    names: live,
  };
}

function main() {
  const drill = flagValue('--drill');
  const check = flagValue('--check');
  const write = Boolean(flag('--write'));
  const writeBaseline = Boolean(flag('--write-baseline'));

  const report = buildReport({ drill });
  const failures = [];

  if (write) {
    writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`customization-surface: wrote ${relative(ROOT, REPORT_PATH)} (universe=${report.counts.universe}, dead=${report.counts.deadWriters}, unclassified=${report.counts.unclassified})`);
  }
  if (writeBaseline) {
    const reasonIndex = args.indexOf('--reason');
    try {
      const doc = buildDeadBaselineDoc({
        live: report.deadWriters,
        previous: loadBaselineDead(),
        reason: reasonIndex >= 0 ? args[reasonIndex + 1] : flagValue('--reason'),
        widen: Boolean(flag('--widen')),
      });
      writeFileSync(DEAD_BASELINE_PATH, `${JSON.stringify(doc, null, 2)}\n`);
      console.log(`customization-surface: wrote dead-writer baseline (${doc.names.length} names, ${doc.lastMoveKind})`);
    } catch (error) {
      console.error(`customization-surface: ${error.message}`);
      process.exit(1);
    }
  }

  const wantAll = check === 'all';
  if (check) {
    if (wantAll || check === 'freshness') {
      if (!existsSync(REPORT_PATH)) failures.push('freshness: report missing — run --write');
      else {
        const stored = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
        if (drill === 'freshness' || stored.meta.inputsDigest !== report.meta.inputsDigest) {
          failures.push('freshness: customization-surface-report.json is STALE relative to its inputs — regenerate with --write');
        }
      }
    }
    if (wantAll || check === 'classification') {
      if (report.counts.unclassified > 0) {
        failures.push(`classification: ${report.counts.unclassified} row(s) without full category/tier/status`);
      }
    }
    if (wantAll || check === 'capabilities') {
      for (const entry of report.capabilityEvidence) {
        if (entry.verdict !== 'verified') {
          failures.push(`capabilities: ${entry.id} — ${entry.verdict}`);
        }
      }
    }
    if (wantAll || check === 'dead') {
      failures.push(...evaluateDeadBaseline(report.deadWriters, loadBaselineDead()));
    }
  }

  if (!write && !writeBaseline && !check) {
    console.log(JSON.stringify(report.counts, null, 2));
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`customization-surface FAIL — ${failure}`);
    process.exit(1);
  }
  if (check) {
    console.log(`customization-surface --check=${check} OK (universe=${report.counts.universe}, dead=${report.counts.deadWriters}, hooks=${report.counts.publicHooks}/${report.counts.unadjudicatedReads}, capabilities=${report.capabilityEvidence.length} verified)`);
  }
}

// Importable module (the classifier drills import classifyTsLiterals);
// execute only when invoked directly.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
