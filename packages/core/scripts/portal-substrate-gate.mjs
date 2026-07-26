#!/usr/bin/env node
/**
 * portal-substrate-gate — one portal substrate, one resolution rule.
 *
 * `src/ui/primitives/runtime/overlay/portal` is the ONLY module allowed to
 * call `createPortal` directly. It is the single place that implements the
 * canonical container precedence
 *
 *   (1) explicit valid container -> (2) active top-layer host -> (3) `#rottay-portal-root`
 *
 * plus the SSR guard and the layout-phase mount. Every private
 * `createPortal(panel, document.body)` re-opens the same three defects the
 * substrate exists to close: the overlay is occluded by any `showModal()`
 * dialog (the browser top layer sits outside the z-index model, so no z-index
 * can rescue it), it drops the tenant/theme/direction lineage of its anchor,
 * and it ignores whatever container a consumer asked for.
 *
 * This gate enumerates every `createPortal` call in the production sources
 * (tests/stories/dist excluded by the project tsconfig) and fails on any site
 * outside the substrate module that is not carried by an explicit,
 * justified allowlist entry.
 *
 * The allowlist (`portal-substrate-gate.allowlist.json`) is an EXACT ledger,
 * not a mute button: each entry pins a file to its authorized site count with
 * a written reason. A new bypass in an allowlisted file fails just as loudly
 * as one in a fresh file, and an entry whose sites were migrated away fails
 * too -- so the ledger can only shrink, and it can never quietly become a
 * blanket exemption for a whole file.
 *
 * Usage:
 *   node scripts/portal-substrate-gate.mjs           # print the census
 *   node scripts/portal-substrate-gate.mjs --check   # exit 1 on any violation
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '..');
const TSCONFIG_PATH = join(CORE_ROOT, 'tsconfig.json');
const ALLOWLIST_PATH = join(HERE, 'portal-substrate-gate.allowlist.json');

/** The one module authorized to call `createPortal` directly. */
export const SUBSTRATE_MODULE = 'src/ui/primitives/runtime/overlay/portal/index.tsx';

/** The call this gate governs. */
const PORTAL_CALLEE = 'createPortal';

function toPosix(value) {
  return value.split(sep).join('/');
}

/** Parses tsconfig.json the same way `tsc` does, honoring its own `exclude` (tests/stories/dist). */
function loadProjectFiles() {
  const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    CORE_ROOT,
    { noEmit: true, incremental: false, tsBuildInfoFile: undefined },
    TSCONFIG_PATH,
  );
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  }
  return parsed.fileNames;
}

/**
 * Collects every `createPortal(...)` call site in one source text.
 *
 * Matches both the bare `createPortal(...)` import shape and the namespaced
 * `ReactDOM.createPortal(...)` shape. Parsed through the TypeScript AST
 * rather than a regex so that the string `'createPortal'` in a comment, a
 * doc block, or a test's prose cannot register as a call -- the migrated
 * owners keep explaining the substrate in their comments, and a text scan
 * would score every one of those explanations as a fresh violation.
 */
export function findPortalSites(sourceText, fileName = 'input.tsx') {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const sites = [];

  const calleeName = (expression) => {
    if (ts.isIdentifier(expression)) return expression.text;
    if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
      return expression.name.text;
    }
    return undefined;
  };

  const visit = (node) => {
    if (ts.isCallExpression(node) && calleeName(node.expression) === PORTAL_CALLEE) {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      sites.push({ line: position.line + 1, text: node.expression.getText(sourceFile) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return sites;
}

/** Reads the allowlist ledger. Absent file = empty ledger (every bypass fails). */
export function loadAllowlist(path = ALLOWLIST_PATH) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return { entries: [] };
  }
  const parsed = JSON.parse(raw);
  return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
}

/**
 * Scores a census (`[{ file, sites: [...] }]`) against the allowlist ledger.
 *
 * Three failure shapes, each with its own remedy so the message tells the
 * next engineer what to do rather than only what broke:
 *   - `unauthorized`  a file that calls createPortal and is not the substrate
 *                     and is not in the ledger -- migrate it to `<Portal>`.
 *   - `over-budget`   an allowlisted file that grew a NEW site -- the entry
 *                     authorizes N sites, not the file.
 *   - `stale`         a ledger entry whose sites are gone (migrated, or the
 *                     file was deleted) -- lower/remove the entry.
 */
export function evaluatePortalCensus(census, allowlist) {
  const allowed = new Map(allowlist.entries.map((entry) => [entry.file, entry]));
  const seen = new Set();
  const violations = [];

  for (const { file, sites } of census) {
    if (file === SUBSTRATE_MODULE) continue;
    const entry = allowed.get(file);
    if (!entry) {
      violations.push({
        kind: 'unauthorized',
        file,
        lines: sites.map((site) => site.line),
        message: `direct createPortal outside the substrate at line(s) ${sites.map((s) => s.line).join(', ')} -- render through <Portal> (src/ui/primitives/runtime/overlay/portal) instead`,
      });
      continue;
    }
    seen.add(file);
    if (sites.length > entry.sites) {
      violations.push({
        kind: 'over-budget',
        file,
        lines: sites.map((site) => site.line),
        message: `allowlist authorizes ${entry.sites} createPortal site(s), found ${sites.length} (line(s) ${sites.map((s) => s.line).join(', ')}) -- the entry allows a count, not the file`,
      });
    } else if (sites.length < entry.sites) {
      violations.push({
        kind: 'stale',
        file,
        lines: sites.map((site) => site.line),
        message: `allowlist claims ${entry.sites} createPortal site(s), only ${sites.length} remain -- lower "sites" to ${sites.length} (or remove the entry)`,
      });
    }
  }

  for (const entry of allowlist.entries) {
    if (seen.has(entry.file)) continue;
    if (census.some(({ file }) => file === entry.file)) continue;
    violations.push({
      kind: 'stale',
      file: entry.file,
      lines: [],
      message: `allowlist entry has no createPortal sites left (file migrated or deleted) -- remove the entry`,
    });
  }

  violations.sort((left, right) => left.file.localeCompare(right.file) || left.kind.localeCompare(right.kind));
  return violations;
}

/** Runs the gate over the real production tree. */
export function runPortalSubstrateGate({ allowlistPath = ALLOWLIST_PATH } = {}) {
  const census = [];
  for (const fileName of loadProjectFiles()) {
    if (fileName.includes(`${sep}node_modules${sep}`)) continue;
    let sourceText;
    try {
      sourceText = readFileSync(fileName, 'utf8');
    } catch {
      continue;
    }
    if (!sourceText.includes(PORTAL_CALLEE)) continue;
    const sites = findPortalSites(sourceText, fileName);
    if (sites.length === 0) continue;
    census.push({ file: toPosix(relative(CORE_ROOT, fileName)), sites });
  }
  census.sort((left, right) => left.file.localeCompare(right.file));

  const allowlist = loadAllowlist(allowlistPath);
  const violations = evaluatePortalCensus(census, allowlist);
  const substrateSites = census.find(({ file }) => file === SUBSTRATE_MODULE)?.sites.length ?? 0;

  return {
    census,
    allowlist,
    violations,
    substrateSites,
    bypassFiles: census.filter(({ file }) => file !== SUBSTRATE_MODULE).length,
    pass: violations.length === 0 && substrateSites > 0,
  };
}

async function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'report';
  const result = runPortalSubstrateGate();

  console.log('[portal-substrate-gate]');
  console.log(`  substrate module     : ${SUBSTRATE_MODULE} (${result.substrateSites} authorized site(s))`);
  console.log(`  files with portals   : ${result.census.length}`);
  console.log(`  allowlisted bypasses : ${result.allowlist.entries.length}`);
  console.log(`  violations           : ${result.violations.length}`);

  if (mode === 'report') {
    for (const entry of result.census) {
      const tag = entry.file === SUBSTRATE_MODULE ? 'SUBSTRATE ' : 'allowlisted';
      console.log(`    [${tag}] ${entry.file} -> line(s) ${entry.sites.map((s) => s.line).join(', ')}`);
    }
  }

  if (result.substrateSites === 0) {
    console.error(`[portal-substrate-gate] FAIL: ${SUBSTRATE_MODULE} no longer calls createPortal -- the substrate moved; update this gate.`);
    if (mode === 'check') process.exit(1);
    return;
  }

  if (result.violations.length > 0) {
    console.error('[portal-substrate-gate] FAIL: portal substrate bypassed:');
    for (const violation of result.violations) {
      console.error(`  - [${violation.kind}] ${violation.file}: ${violation.message}`);
    }
    if (mode === 'check') process.exit(1);
  } else {
    console.log('[portal-substrate-gate] OK — every createPortal call is the substrate or a ledgered exception.');
  }
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[portal-substrate-gate] ${error.message}`);
    process.exit(1);
  });
}
