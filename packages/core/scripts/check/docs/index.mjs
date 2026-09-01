#!/usr/bin/env node
/**
 * public-doc-set-gate — the published documentation set is honest on disk.
 *
 * WHY THIS EXISTS. The public documentation had no mechanical guard at all.
 * Nothing proved a link resolved, that a cited path still existed, that a
 * required document was present, or that a diagram parsed. Every one of those
 * failures is silent: a reader clicks a dead link, and the repository reports
 * success. The set was assembled while the source tree underneath it was being
 * relocated, which is exactly the condition under which prose rots fastest.
 *
 * WHY LINKS ARE CASE-EXACT. `fs.existsSync` answers yes for `docs/Api.md` when
 * the file is `docs/api.md`, because macOS and Windows compare filenames
 * case-insensitively. A link that resolves on the author's laptop and 404s on
 * the reader's host is the defect this repository has already paid for once: a
 * documentation path differing only in case silently overwrote a tracked file.
 * So every segment is matched against a real directory entry, byte for byte.
 *
 * WHY LEGACY PATHS ARE REJECTED. Source roots moved. A document naming
 * `src/ui`, `src/tooling`, a retired script root, or the relocated
 * `docs/ARCHITECTURE.md` is describing a tree that no longer exists, and a
 * reader cannot tell the difference between stale prose and a real path.
 *
 * WHY THE SPANISH HEURISTIC IS CONSERVATIVE. The set is English-only, but a
 * language detector that fires on a single ambiguous token would be turned off
 * within a week. This one requires several distinct markers AND a density
 * floor before it accuses a file, so a passing run means something.
 *
 * WHY FRESHNESS DELEGATES. This gate never regenerates anything. It invokes the
 * owning generator's own `--check` mode and reports what that owner says. A
 * generated document whose owner has no `--check` is reported as UNVERIFIABLE
 * rather than quietly counted as fresh — an unchecked artifact must look
 * different from a checked one.
 *
 * Usage: node scripts/check/docs/index.mjs [--check]
 * Exit 0 = clean. Exit 1 = at least one finding.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Package root: the nearest ancestor holding `package.json` with our name. */
function findPackageRoot(from) {
  let dir = from;
  for (let i = 0; i < 12; i += 1) {
    const manifest = join(dir, 'package.json');
    if (existsSync(manifest)) {
      try {
        if (JSON.parse(readFileSync(manifest, 'utf8')).name === '@rottay/design-system') return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('could not locate the @rottay/design-system package root');
}

/** Repository root: the directory holding the workspace manifest. */
function findRepoRoot(from) {
  let dir = from;
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('could not locate the workspace root');
}

/**
 * Documents that must exist for the published set to be complete. Relative to
 * the repository root.
 */
export const REQUIRED_DOCUMENTS = Object.freeze([
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CHANGELOG.md',
  'LICENSE',
  'docs/architecture/index.md',
  'docs/customization.md',
  'docs/ownership.md',
  'docs/releasing.md',
]);

/**
 * Trees whose content is historical, sealed or programme-internal. Nothing
 * inside them is scanned, and nothing inside them can fail this gate.
 */
export const EXCLUDED_SEGMENTS = Object.freeze([
  'docs/history',
  'docs/evidence',
  'test-artifacts',
  'roadmap',
  'node_modules',
  'dist',
  '.git',
  'modern-rescue',
  'governance/manifest',
  'receipts',
]);

/** Path fragments that describe a tree which no longer exists. */
export const LEGACY_REFERENCES = Object.freeze([
  'docs/ARCHITECTURE.md',
  'src/ui',
  'src/tooling',
  'scripts/foundation',
  'scripts/infrastructure',
  'scripts/entrypoints',
  'scripts/tooling',
]);

/**
 * Spanish markers chosen for low English collision. Tokens that also read as
 * English (`no`, `a`, `en`, `son`, `van`, `me`) are deliberately absent.
 */
const SPANISH_MARKERS = Object.freeze([
  'que', 'para', 'los', 'las', 'del', 'por', 'una', 'este', 'esta', 'cuando',
  'desde', 'segun', 'tambien', 'cada', 'sobre', 'pero', 'hasta', 'entre',
  'donde', 'porque', 'aunque', 'siempre', 'nunca', 'todos', 'toda', 'ser',
  'hace', 'tiene', 'puede', 'debe', 'está', 'más', 'sólo', 'según', 'también',
]);

/** At least this many DISTINCT markers before a file can be accused. */
const SPANISH_MIN_DISTINCT = 5;
/** And at least this share of prose tokens must be markers. */
const SPANISH_MIN_DENSITY = 0.008;

/** Diagram declarations this validator recognises. Unknown types fail closed. */
const MERMAID_TYPES = Object.freeze([
  'flowchart', 'graph', 'sequenceDiagram', 'stateDiagram-v2', 'stateDiagram',
  'classDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph',
  'mindmap', 'timeline', 'quadrantChart',
]);

const DIRECTIONAL_TYPES = Object.freeze(['flowchart', 'graph']);
const DIRECTIONS = Object.freeze(['TD', 'TB', 'LR', 'RL', 'BT']);

/** True when a repository-relative path lies inside an excluded tree. */
export function isExcluded(relativePath) {
  const normalized = relativePath.split(sep).join('/');
  return EXCLUDED_SEGMENTS.some(
    (segment) => normalized === segment || normalized.startsWith(`${segment}/`),
  );
}

/** Case-exact existence: every segment must match a real directory entry. */
export function caseExactExists(absolutePath, root) {
  const rel = relative(root, absolutePath);
  if (rel === '') return true;
  if (rel.startsWith('..')) return false;
  let current = root;
  for (const segment of rel.split(sep)) {
    let entries;
    try {
      entries = readdirSync(current);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    current = join(current, segment);
  }
  return true;
}

/** Markdown files in the public set: repository root and `docs/`, no history. */
export function collectPublicDocuments(root) {
  const found = [];
  const consider = (absolute) => {
    const rel = relative(root, absolute).split(sep).join('/');
    if (isExcluded(rel)) return;
    if (!rel.endsWith('.md')) return;
    // AGENTS.md and CLAUDE.md are internal operating instructions, not part of
    // the published set; they are governed elsewhere.
    if (rel === 'AGENTS.md' || rel === 'CLAUDE.md') return;
    found.push(rel);
  };

  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    if (statSync(absolute).isFile()) consider(absolute);
  }

  const walk = (dir) => {
    const rel = relative(root, dir).split(sep).join('/');
    if (isExcluded(rel)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolute = join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else consider(absolute);
    }
  };
  const docsDir = join(root, 'docs');
  if (existsSync(docsDir)) walk(docsDir);

  return found.sort();
}

/** Prose with code fences, inline code, URLs and link targets removed. */
function proseOf(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, '] ')
    .replace(/https?:\/\/\S+/g, ' ');
}

/** Markdown links that point at a local file (not a URL, not an anchor). */
export function localLinksOf(source) {
  const links = [];
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    links.push(target.split('#')[0]);
  }
  return links.filter((target) => target.length > 0);
}

/**
 * Deterministic, conservative Spanish detection.
 *
 * Returns `{ spanish, distinct, density, markers }`. A file is accused only
 * when several distinct markers appear AND they are dense enough to be prose
 * rather than a quoted term.
 */
export function detectSpanish(source) {
  const prose = proseOf(source);
  const tokens = prose.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
  if (tokens.length === 0) return { spanish: false, distinct: 0, density: 0, markers: [] };

  const seen = new Map();
  for (const token of tokens) {
    if (SPANISH_MARKERS.includes(token)) seen.set(token, (seen.get(token) ?? 0) + 1);
  }
  const hits = [...seen.values()].reduce((sum, n) => sum + n, 0);
  const distinct = seen.size;
  const density = hits / tokens.length;

  // Inverted punctuation is unambiguous; it needs no density support.
  const invertedPunctuation = /[¿¡]/.test(prose);

  return {
    spanish: invertedPunctuation || (distinct >= SPANISH_MIN_DISTINCT && density >= SPANISH_MIN_DENSITY),
    distinct,
    density,
    markers: [...seen.keys()].sort(),
  };
}

/**
 * Minimal, offline, fail-closed Mermaid syntax validation.
 *
 * No renderer is available in this workspace, so this validates structure
 * only: the fence closes, a recognised diagram type is declared, a directional
 * diagram declares its direction, brackets and quotes balance, and the body is
 * not empty. Anything it cannot recognise is a failure, never a pass.
 */
export function validateMermaid(block) {
  const lines = block.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length === 0) return { valid: false, reason: 'empty mermaid block' };

  const header = lines[0];
  const type = MERMAID_TYPES.find(
    (candidate) => header === candidate || header.startsWith(`${candidate} `),
  );
  if (!type) return { valid: false, reason: `unrecognised diagram type: "${header}"` };

  if (DIRECTIONAL_TYPES.includes(type)) {
    const direction = header.slice(type.length).trim().split(/\s+/)[0];
    if (!DIRECTIONS.includes(direction)) {
      return { valid: false, reason: `${type} needs a direction (${DIRECTIONS.join('|')}), got "${direction || 'none'}"` };
    }
  }

  if (lines.length < 2) return { valid: false, reason: `${type} declares no body` };

  const counts = { '[': 0, ']': 0, '(': 0, ')': 0, '{': 0, '}': 0 };
  let quotes = 0;
  for (const character of block) {
    if (character in counts) counts[character] += 1;
    if (character === '"') quotes += 1;
  }
  if (counts['['] !== counts[']']) return { valid: false, reason: 'unbalanced square brackets' };
  if (counts['('] !== counts[')']) return { valid: false, reason: 'unbalanced parentheses' };
  if (counts['{'] !== counts['}']) return { valid: false, reason: 'unbalanced braces' };
  if (quotes % 2 !== 0) return { valid: false, reason: 'unbalanced double quotes' };

  return { valid: true, type };
}

/** Mermaid fences in a document, with the line each one opens on. */
export function mermaidBlocksOf(source) {
  const blocks = [];
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*```mermaid\s*$/.test(lines[index])) continue;
    let end = index + 1;
    while (end < lines.length && !/^\s*```\s*$/.test(lines[end])) end += 1;
    if (end >= lines.length) {
      blocks.push({ line: index + 1, body: null });
      continue;
    }
    blocks.push({ line: index + 1, body: lines.slice(index + 1, end).join('\n') });
    index = end;
  }
  return blocks;
}

/**
 * Generated documents and the owner command that proves their freshness.
 * A row without a `check` cannot be verified and is reported as such.
 */
export const GENERATED_DOCUMENTS = Object.freeze([
  {
    document: 'packages/core/docs/generated/customization-controls/index.md',
    check: ['node', 'scripts/generate/tokens/customization/controls/index.mjs', '--check'],
  },
  {
    document: 'packages/core/docs/generated/component-taxonomy/index.md',
    check: null, // scripts/generate/taxonomy/index.mjs exposes no --check mode
  },
]);

/** Runs the whole gate and returns findings plus the census that proves scope. */
export function auditPublicDocs({
  repoRoot,
  packageRoot,
  runGenerators = true,
  generatedDocuments = GENERATED_DOCUMENTS,
} = {}) {
  const findings = [];
  const documents = collectPublicDocuments(repoRoot);
  let linkCount = 0;
  let mermaidCount = 0;

  for (const required of REQUIRED_DOCUMENTS) {
    if (!caseExactExists(resolve(repoRoot, required), repoRoot)) {
      findings.push({ kind: 'missing-required', document: required, detail: 'required document is absent' });
    }
  }

  for (const document of documents) {
    const source = readFileSync(join(repoRoot, document), 'utf8');

    for (const target of localLinksOf(source)) {
      linkCount += 1;
      const absolute = resolve(dirname(join(repoRoot, document)), target);
      if (!caseExactExists(absolute, repoRoot)) {
        findings.push({ kind: 'broken-link', document, detail: target });
      }
    }

    for (const legacy of LEGACY_REFERENCES) {
      if (source.includes(legacy)) {
        findings.push({ kind: 'legacy-path', document, detail: legacy });
      }
    }

    const language = detectSpanish(source);
    if (language.spanish) {
      findings.push({
        kind: 'non-english',
        document,
        detail: `${language.distinct} distinct markers at ${(language.density * 100).toFixed(2)}% density: ${language.markers.slice(0, 8).join(', ')}`,
      });
    }

    for (const block of mermaidBlocksOf(source)) {
      mermaidCount += 1;
      if (block.body === null) {
        findings.push({ kind: 'mermaid', document, detail: `unterminated fence opening at line ${block.line}` });
        continue;
      }
      const verdict = validateMermaid(block.body);
      if (!verdict.valid) {
        findings.push({ kind: 'mermaid', document, detail: `line ${block.line}: ${verdict.reason}` });
      }
    }
  }

  const generated = [];
  for (const entry of generatedDocuments) {
    if (!entry.check) {
      generated.push({ document: entry.document, state: 'UNVERIFIABLE', detail: 'owner exposes no --check mode' });
      continue;
    }
    if (!runGenerators) {
      generated.push({ document: entry.document, state: 'SKIPPED', detail: 'generator invocation disabled' });
      continue;
    }
    const [command, ...args] = entry.check;
    try {
      execFileSync(command, args, { cwd: packageRoot, stdio: 'pipe' });
      generated.push({ document: entry.document, state: 'FRESH', detail: entry.check.join(' ') });
    } catch (error) {
      generated.push({ document: entry.document, state: 'STALE', detail: entry.check.join(' ') });
      findings.push({
        kind: 'stale-generated',
        document: entry.document,
        detail: `${entry.check.join(' ')} exited ${error.status ?? 'non-zero'}`,
      });
    }
  }

  return { findings, documents, linkCount, mermaidCount, generated };
}

function main() {
  const packageRoot = findPackageRoot(HERE);
  const repoRoot = findRepoRoot(HERE);
  const mode = process.argv.includes('--check') ? 'check' : 'report';

  const { findings, documents, linkCount, mermaidCount, generated } = auditPublicDocs({
    repoRoot,
    packageRoot,
  });

  // A census that finds nothing is itself a failure: a gate that scans an empty
  // set passes every assertion below without proving anything.
  if (documents.length === 0 || linkCount === 0) {
    console.error(
      `[public-doc-set-gate] vacuous run — ${documents.length} document(s), ${linkCount} link(s). ` +
        'The scanner reached nothing; fix the scope before trusting a pass.',
    );
    process.exit(1);
  }

  for (const row of generated) {
    console.log(`[public-doc-set-gate] generated ${row.state}: ${row.document} (${row.detail})`);
  }

  if (findings.length > 0) {
    console.error(`[public-doc-set-gate] FAILED — ${findings.length} finding(s):`);
    for (const finding of findings) {
      console.error(`  ${finding.kind}: ${finding.document} -> ${finding.detail}`);
    }
    if (mode === 'check') process.exit(1);
    return;
  }

  console.log(
    `[public-doc-set-gate] OK — ${documents.length} public document(s), ${linkCount} local link(s), ` +
      `${mermaidCount} mermaid block(s), ${REQUIRED_DOCUMENTS.length} required document(s) present.`,
  );
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    main();
  } catch (error) {
    console.error(`[public-doc-set-gate] ${error.message}`);
    process.exit(1);
  }
}
