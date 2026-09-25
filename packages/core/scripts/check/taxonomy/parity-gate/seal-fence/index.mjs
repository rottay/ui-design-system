/**
 * The seal fence — who may still read the quarantined customization manifest.
 *
 * WO-RET-03 sealed `docs/history/inventories/customization-manifest` on
 * 2026-09-19 and its README says no gate may read that tree as authority. The
 * cascade tables (root catalog, owner assignments, root cells) are live under
 * `governance/manifest/cascade` and the probe's control calibration at
 * `governance/manifest/calibration`. The family SET has a live
 * authority (the family inventory), so for that slice the rule is enforced:
 *
 *   F1  every script module that reads the seal is listed below, by path, with
 *       the reason it still reads it. A module reads the seal when it names it,
 *       or when it imports a seal-path constant, followed through imports to a
 *       fixpoint. A seal-path constant is decided by shape: an exported
 *       top-level constant whose whole initializer, comments removed, holds a
 *       whitespace-free string literal naming the seal, or refers in code to
 *       SEAL_ROOT_REL, a QUARANTINE_MANIFEST_* constant or another seal-path
 *       constant. Prose and comments never seed. A new reader fails until
 *       someone writes its reason down.
 *   F2  every listed module still reads the seal, by name or by import. A
 *       reader that stopped reading leaves the list in the same change.
 *   F3  no BLOCKING gate compares live family ids or counts against the seal:
 *       the entry module of a blocking CI gate may not read the seal's family
 *       slice (its `families/` cells, `canonicalFamilies`, `familyReviews`).
 *       Listed readers of the `fence` slice are exempt: they name the forbidden
 *       read in order to forbid it or to plant it in a sandbox.
 *   F4  no module resolves the cascade tables through the seal: they live at
 *       `governance/manifest/cascade`, and a seal path to them reads nothing.
 *       The `fence` slice is exempt for the same reason as in F3.
 *
 * The scan covers the package's script roots and the repository's own
 * `scripts/` beside the package. F3 is on the entry module a gate runs; a
 * module reached through an import is still bound by F1.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const SEAL_ROOT_REL = 'docs/history/inventories/customization-manifest';

/** Script roots a gate, generator or helper can live in. */
export const SCANNED_ROOTS = Object.freeze([
  'scripts/build',
  'scripts/check',
  'scripts/generate',
  'scripts/libraries',
  'scripts/maintain',
  'scripts/package',
]);

/** Script roots of the repository itself, resolved from the workspace root. */
export const REPO_SCANNED_ROOTS = Object.freeze(['scripts']);

/** A module names the seal by its path or through one of the constants that resolve it. */
export const SEAL_REFERENCE = /customization-manifest|QUARANTINE_MANIFEST_(?:REL|ROOT)|SEAL_ROOT_REL/;

/** Reads of the seal's family slice: the per-family cells and the family-set rollups. */
/** A path into the seal's former cascade slice: the literal path, or a seal constant joined with `cascade`. */
export const CASCADE_SLICE_READ = /customization-manifest\/cascade|['"`]customization-manifest['"`]\s*,\s*['"`]cascade\b|(?:QUARANTINE_MANIFEST_(?:REL|ROOT)|SEAL_ROOT_REL)\b[^\n]*['"`\/]cascade\b/;

export const FAMILY_SET_READ = /canonicalFamilies|familyReviews|customization-manifest\/families|(?:MANIFEST_DIR|QUARANTINE_MANIFEST_(?:REL|ROOT)|SEAL_ROOT_REL)[^\n]*['"`]families['"`]|SEAL_ROOT_REL\}\/families/;

/** The seal constants a seal-path initializer may refer to by name. */
export const SEAL_CONSTANT_REFERENCE = /\b(?:SEAL_ROOT_REL|QUARANTINE_MANIFEST_(?:REL|ROOT))\b/u;

const EXPORT_CONST_HEAD = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/y;
const REGEX_AFTER_KEYWORD = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'instanceof', 'yield', 'await']);
const REGEX_AFTER_PUNCTUATOR = new Set([...'(,=:[!&|?{};+-*%<>~^']);

/**
 * Every exported top-level constant with its whole initializer, which ends at
 * the first `;` at bracket depth zero outside strings, templates, regexes and
 * comments. `literals` holds the initializer's string and template text;
 * `code` holds everything else, comments removed and literals blanked.
 */
export function exportedConstants(text) {
  const found = [];
  let depth = 0;
  let capture = null;
  const templates = [];
  let previous = '';
  let i = 0;
  const emitCode = (chunk) => { if (capture) capture.code += chunk; };
  const emitLiteral = (literal) => { if (capture) capture.literals.push(literal); };
  const readTemplate = () => {
    let segment = '';
    while (i < text.length) {
      const ch = text[i];
      if (ch === '\\') { segment += text.slice(i, i + 2); i += 2; continue; }
      if (ch === '`') { emitLiteral(segment); emitCode('``'); i += 1; return 'closed'; }
      if (ch === '$' && text[i + 1] === '{') {
        emitLiteral(segment);
        emitCode('`${');
        templates.push(depth);
        depth += 1;
        i += 2;
        return 'expression';
      }
      segment += ch;
      i += 1;
    }
    emitLiteral(segment);
    return 'closed';
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      let j = i + 1;
      let literal = '';
      while (j < text.length && text[j] !== ch && text[j] !== '\n') {
        if (text[j] === '\\') { literal += text.slice(j, j + 2); j += 2; continue; }
        literal += text[j];
        j += 1;
      }
      emitLiteral(literal);
      emitCode(`${ch}${ch}`);
      i = j + 1;
      previous = 'literal';
      continue;
    }
    if (ch === '`') {
      i += 1;
      readTemplate();
      previous = 'literal';
      continue;
    }
    if (ch === '/' && (previous === '' || REGEX_AFTER_PUNCTUATOR.has(previous) || REGEX_AFTER_KEYWORD.has(previous))) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== '\n') {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === '[') inClass = true;
        else if (text[j] === ']') inClass = false;
        else if (text[j] === '/' && !inClass) break;
        j += 1;
      }
      j += 1;
      while (j < text.length && /[a-z]/u.test(text[j])) j += 1;
      emitCode('/r/');
      i = j;
      previous = 'literal';
      continue;
    }
    if (/[A-Za-z_$]/u.test(ch)) {
      if (depth === 0 && capture === null && (i === 0 || !/[\w$]/u.test(text[i - 1]))) {
        EXPORT_CONST_HEAD.lastIndex = i;
        const head = EXPORT_CONST_HEAD.exec(text);
        if (head) {
          capture = { name: head[1], literals: [], code: '' };
          i = EXPORT_CONST_HEAD.lastIndex;
          previous = '=';
          continue;
        }
      }
      let j = i;
      while (j < text.length && /[\w$]/u.test(text[j])) j += 1;
      const word = text.slice(i, j);
      emitCode(word);
      previous = word;
      i = j;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (ch === '}') {
      if (templates.length > 0 && templates.at(-1) === depth - 1) {
        templates.pop();
        depth -= 1;
        emitCode('}');
        i += 1;
        readTemplate();
        previous = 'literal';
        continue;
      }
      depth -= 1;
    }
    if (ch === ';' && depth === 0 && capture) {
      found.push(capture);
      capture = null;
      previous = ';';
      i += 1;
      continue;
    }
    emitCode(ch);
    if (!/\s/u.test(ch)) previous = ch;
    i += 1;
  }
  if (capture) found.push(capture);
  return found;
}

/**
 * A string literal that names the seal as a path: the seal's folder as a whole
 * path segment, and no whitespace, so prose and identifiers never qualify.
 */
const SEAL_PATH_SEGMENT = /(?:^|\/)customization-manifest(?:\/|$)/u;
export const isSealPathLiteral = (literal) => !/\s/u.test(literal) && SEAL_PATH_SEGMENT.test(literal);

/** Named imports and re-exports, namespace imports, and destructured dynamic imports of a relative module. */
const RELATIVE_IMPORT = /(?:import|export)\s*\{([^{}]*)\}\s*from\s*['"](\.{1,2}\/[^'"]+)['"]|import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*['"](\.{1,2}\/[^'"]+)['"]|\{([^{}]*)\}\s*=\s*await\s+import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/gu;

const reader = (path, slice, reason) => Object.freeze({ path, slice, reason });

/**
 * Every module allowed to name the seal today. `slice` says which part of the
 * tree it reads; `reason` says why no live source can replace it yet.
 */
export const SEAL_READERS = Object.freeze([
  reader('scripts/check/taxonomy/parity-gate/seal-fence/index.mjs', 'fence',
    'this fence has to name the tree and its family slice in order to forbid them'),
  reader('scripts/check/taxonomy/parity-gate/index.test.mjs', 'fence',
    'the fence drills plant a reader of the seal in a sandbox to prove the fence refuses it'),
  reader('scripts/check/taxonomy/parity-gate/index.mjs', 'retirement-record',
    'the retired manifest-parity leg records its last live divergence census against the seal; it reads nothing from it'),
  reader('scripts/check/orchestration/public/program-state/index.mjs', 'history-citation',
    'cites the seal as the source of the historical figures it renders under their own heading; derive() no longer reads it'),
  reader('scripts/check/orchestration/tests/drills/program-state/index.mjs', 'history-citation',
    'carries a copy of the sealed index into a throwaway repository and mutates it to prove program-state ignores it'),
  reader('scripts/check/modern-rescue/check/index.mjs', 'seal-self-validation',
    'the sealed programme checks its own preserved evidence for internal consistency, seal against seal, never against the live set'),
  reader('scripts/check/modern-rescue/check/index.test.mjs', 'seal-self-validation',
    'the drills of the sealed programme check, which copy the preserved evidence into a sandbox'),
  reader('scripts/check/architecture/conventions/scripts-tree/index.mjs', 'seal-layout-law',
    'rule M1 keeps the quarantine root holding only folder/index data owners; it reads the layout, never the data'),
  reader('scripts/check/architecture/conventions/scripts-tree/index.test.mjs', 'seal-layout-law',
    'the M1 drill plants a loose file at the quarantine root to prove the layout rule refuses it'),
  reader('scripts/check/automation/gates/manifest/index.mjs', 'gate-registry',
    'the CI gate registry names the retired manifest-freshness gate and the quarantine in its prose; it reads nothing from the tree'),
  reader('scripts/check/automation/gates/manifest/tests/index.test.mjs', 'gate-registry',
    'asserts the retired manifest-freshness gate stays retired; the name is an id, not a read'),
  reader('scripts/check/automation/runner/index.test.mjs', 'gate-registry',
    'uses the retired manifest-freshness gate id as a fixture for the runner, not a read of the tree'),
  reader('scripts/check/evidence/framework/receipts/index.test.mjs', 'evidence-contract',
    'cites the sealed schema as where validateReceipt was first named; the receipt contract itself is live'),
  reader('scripts/check/engine/skins/evidence/index.test.mjs', 'family-evidence',
    'reads the sealed family cells as skin evidence for a drill outside CI; it compares skins, not the family set'),
  reader('scripts/libraries/manifest/index.mjs', 'seal-constant',
    'owns QUARANTINE_MANIFEST_REL, the path constant for readers of the sealed history; the cascade tables resolve through CASCADE_MANIFEST_REL'),
  reader('scripts/libraries/manifest/rules/index.mjs', 'seal-self-validation',
    'the validation rules the sealed programme check applies to its preserved control cells, which it cites by their sealed path'),
  reader('scripts/generate/tokens/manifest/root-checklists/index.test.mjs', 'family-bindings',
    'recounts the sealed family cells on its own walk to prove the coverage document\'s bindings provenance block is measured; it reaches them through FAMILY_BINDINGS_REL'),
  reader('../../scripts/maintain/roadmap/status/index.mjs', 'history-citation',
    'republishes the sealed Modern Rescue family-acceptance rollup under the seal\'s own label (as of 2026-09-19, sealed by f66b1bd45); it drives no status verdict'),
  reader('../../scripts/maintain/roadmap/status/index.test.mjs', 'history-citation',
    'asserts the republished family-acceptance figures equal the sealed index and carry the sealed label, never a present-tense one'),
  reader('scripts/generate/tokens/manifest/root-checklists/index.mjs', 'family-bindings',
    'binds root checklists to the per-family cells of the seal and labels the document with that provenance; the live map is Packet B, owned by the family-inventory lane (evidence/framework/inventory-correspondence)'),
  reader('scripts/check/theme/single-listing/index.mjs', 'forbidder',
    'forbids gates from reading the sealed control documents, so it has to name that path'),
  reader('scripts/check/theme/single-listing/index.test.mjs', 'forbidder',
    'the single-listing drills plant reads of the sealed controls slice in a sandbox to prove the gate refuses them'),
  reader('scripts/check/tokens/cascade/probe/foundation/paths/index.mjs', 'probe-family-narrowing',
    'owns QUARANTINE_MANIFEST_ROOT for the harness, which reads only sealed family cells to narrow negative controls'),
  reader('scripts/check/tokens/cascade/probe/foundation/negative-controls/index.mjs', 'probe-family-narrowing',
    'narrows a control\'s negative controls with a sealed family cell handed to it; calibration, not family identity'),
  reader('scripts/check/tokens/cascade/probe/foundation/negative-controls/tests/index.test.mjs', 'probe-family-narrowing',
    'the negative-controls drills read the sealed layout family cells the narrowing is measured on'),
  reader('scripts/check/tokens/cascade/probe/public/cli/index.mjs', 'probe-family-narrowing',
    'the harness CLI accepts a sealed family cell as optional --family-manifest narrowing'),
]);

function* walk(root) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      yield* walk(full);
    } else if (entry.name.endsWith('.mjs')) {
      yield full;
    }
  }
}

const escapeName = (name) => name.replaceAll('$', '\\$');

/**
 * Every module that reads the seal, by name or through an imported seal-path
 * constant, to a fixpoint. Keys are absolute paths.
 */
export function resolveSealReaders(modules) {
  const readers = new Map();
  const symbols = new Map();
  for (const [pathname, text] of modules) {
    if (SEAL_REFERENCE.test(text)) readers.set(pathname, { via: 'name', through: [] });
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const [pathname, text] of modules) {
      const local = new Set();
      const through = [];
      for (const match of text.matchAll(RELATIVE_IMPORT)) {
        const specifier = match[2] ?? match[4] ?? match[6];
        const target = resolve(dirname(pathname), specifier);
        const exported = symbols.get(target);
        if (!exported || exported.size === 0) continue;
        if (match[3]) {
          for (const name of exported) {
            if (new RegExp(`\\b${escapeName(match[3])}\\.${escapeName(name)}\\b`, 'u').test(text)) {
              local.add(name);
              through.push({ name, from: target });
            }
          }
          continue;
        }
        for (const part of (match[1] ?? match[5]).split(',')) {
          const [imported, alias] = part.trim().split(/\s+as\s+|\s*:\s*/u).map((token) => token?.trim());
          if (!imported || !exported.has(imported)) continue;
          local.add(alias || imported);
          through.push({ name: imported, from: target });
        }
      }
      if (local.size > 0 && !readers.has(pathname)) {
        readers.set(pathname, { via: 'import', through });
        changed = true;
      }
      if (!readers.has(pathname)) continue;
      const own = symbols.get(pathname) ?? new Set();
      const before = own.size;
      let grew = true;
      while (grew) {
        grew = false;
        const known = [...local, ...own];
        const mentions = known.length > 0 ? new RegExp(`\\b(?:${known.map(escapeName).join('|')})\\b`, 'u') : null;
        for (const constant of exportedConstants(text)) {
          if (own.has(constant.name)) continue;
          if (constant.literals.some(isSealPathLiteral)
            || SEAL_CONSTANT_REFERENCE.test(constant.code)
            || (mentions && mentions.test(constant.code))) {
            own.add(constant.name);
            grew = true;
          }
        }
      }
      symbols.set(pathname, own);
      if (own.size !== before) changed = true;
    }
  }
  return readers;
}

/**
 * F1-F4 over a core package root and the repository root beside it. `gates` is
 * the CI gate list (`CI_GATES`); the drills inject their own.
 */
export function collectSealFenceFindings({
  coreRoot,
  repoRoot = join(coreRoot, '..', '..'),
  gates = [],
  readers = SEAL_READERS,
} = {}) {
  const findings = [];
  const listed = new Map(readers.map((entry) => [entry.path, entry]));
  const modules = new Map();
  for (const scanned of SCANNED_ROOTS) {
    for (const pathname of walk(join(coreRoot, scanned))) modules.set(pathname, readFileSync(pathname, 'utf8'));
  }
  if (!existsSync(join(repoRoot, 'pnpm-workspace.yaml'))) {
    findings.push(`the repository root (${repoRoot}) holds no pnpm-workspace.yaml, so its scripts/ cannot be scanned for readers of the seal`);
  } else {
    for (const scanned of REPO_SCANNED_ROOTS) {
      for (const pathname of walk(join(repoRoot, scanned))) modules.set(pathname, readFileSync(pathname, 'utf8'));
    }
  }
  const key = (pathname) => relative(coreRoot, pathname).replaceAll('\\', '/');
  const naming = new Map();
  for (const [pathname, found] of resolveSealReaders(modules)) {
    naming.set(key(pathname), { text: modules.get(pathname), ...found });
  }

  for (const [path, found] of naming) {
    if (listed.has(path)) continue;
    const how = found.via === 'import'
      ? ` through ${found.through.map((edge) => `${edge.name} from ${key(edge.from)}`).join(', ')}`
      : '';
    findings.push(`${path} reads the sealed customization manifest (${SEAL_ROOT_REL})${how} and is not a listed reader; add it to SEAL_READERS with its reason, or read the live source`);
  }
  for (const entry of readers) {
    if (!naming.has(entry.path)) {
      findings.push(`${entry.path} is listed as a reader of the seal but no longer names it; remove it from SEAL_READERS`);
    }
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 40) {
      findings.push(`${entry.path} is listed without a written reason`);
    }
  }

  for (const gate of gates) {
    if (!gate?.blocking) continue;
    for (const arg of gate.run ?? []) {
      if (!/\.mjs$/.test(arg)) continue;
      const text = naming.get(arg)?.text;
      if (listed.get(arg)?.slice === 'fence') continue;
      if (text && FAMILY_SET_READ.test(text)) {
        findings.push(`blocking gate ${gate.id} (${arg}) reads the family slice of the sealed customization manifest; the live family inventory is the family set`);
      }
    }
  }
  for (const [path, { text }] of naming) {
    if (listed.get(path)?.slice === 'fence') continue;
    if (CASCADE_SLICE_READ.test(text)) {
      findings.push(`${path} resolves the cascade tables through the sealed customization manifest; they live at governance/manifest/cascade (CASCADE_MANIFEST_REL)`);
    }
  }
  return findings;
}
