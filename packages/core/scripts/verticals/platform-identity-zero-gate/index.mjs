#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const UI_ROOT = findRepoRoot(HERE);

const SOURCE_EXTENSIONS = new Set(['.cjs', '.css', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx']);
const RETIRED = ['plat', 'form'].join('');
const OWN_FILES = new Set([
  'packages/core/scripts/verticals/platform-identity-zero-gate/index.mjs',
  'packages/core/scripts/verticals/platform-identity-zero-gate/index.test.mjs',
]);
const IDENTITY_VALUE = `${RETIRED}(?:[-.:/][a-z0-9-]+)?`;

/**
 * This gate's own capability name, and the ONE string `source-route` does not
 * read as a vertical id.
 *
 * The retired identity is the segment `${RETIRED}` standing alone: a directory
 * under `verticals/`, `demos/` or `brand-themes/` that IS the vertical. This
 * capability lives at `scripts/verticals/${RETIRED}-identity-zero-gate/`, so its own
 * path — quoted by the CI manifest and by OWN_FILES below — contains that
 * prefix while naming a gate, not a vertical. A gate that exists to prove the
 * identity is gone has to be able to say its own name.
 *
 * The exemption is this exact suffix and nothing else: `verticals/${RETIRED}`,
 * `verticals/${RETIRED}-dark`, `verticals/${RETIRED}/overview` and every other
 * neighbour still fail. It exempts a NAME, it does not license a file — that is
 * why it lives in the pattern and not in OWN_FILES, whose entries would blind
 * the scanner to a real residue elsewhere in the same file.
 */
const OWN_CAPABILITY_SUFFIX = '-identity-zero-gate';

/**
 * Historical measurements retain the vocabulary of the tree they measured so
 * decrease-only comparisons remain reproducible. This is deliberately much
 * narrower than the retired `/baseline|manifest/i` exclusion: operational
 * manifests, registries, package exports and quality contracts are scanned.
 */
const HISTORICAL_SNAPSHOT = /(?:^|\/)(?:[^/]+\.baseline\.json|[^/]+-adjudication\.json)$/u;

const CONTENT_RULES = Object.freeze([
  ['style-export', new RegExp(`(?:\\./)?styles[/\\\\]${RETIRED}(?:\\.css)?\\b`, 'gi')],
  ['bundle-path', new RegExp(`\\bdist[/\\\\]${RETIRED}\\.css\\b|\\b${RETIRED}\\.css\\b`, 'gi')],
  [
    'root-selector',
    new RegExp(
      `data-(?:tenant|vertical|theme)\\s*=\\s*(?:['"]${IDENTITY_VALUE}['"]|${IDENTITY_VALUE}(?=\\s*\\]))`,
      'gi',
    ),
  ],
  [
    'identity-field',
    new RegExp(
      `(?:['"]?(?:appId|slug|tenantSlug|themeId|vertical|verticalKey)['"]?)` +
        `\\s*[:=]\\s*['"]${IDENTITY_VALUE}['"]`,
      'gi',
    ),
  ],
  ['profile-id', new RegExp(`\\b${RETIRED}\\.[a-z][a-z0-9-]*\\b`, 'gi')],
  ['theme-symbol', new RegExp(`\\b${RETIRED}BrandTheme\\b`, 'gi')],
  [
    'source-route',
    new RegExp(
      `(?:brand-themes|demos|verticals)[/\\\\]${RETIRED}(?!${OWN_CAPABILITY_SUFFIX}\\b)\\b`,
      'gi',
    ),
  ],
  ['registry-key', new RegExp(`^\\s*['"]?${RETIRED}['"]?\\s*:`, 'gmi')],
  [
    'semantic-display-name',
    new RegExp(
      `\\bRottay\\s+Platform\\b|` +
        `\\bPlatform(?=-only\\s+Rottay)|` +
        `\\bPlatform(?=\\s+(?:or\\s+(?:BitHire|Evnto|Rottay)|vertical|theme|BrandTheme|brand|artifact|bundle|profile|identity|tenant|fallback|workspace|admin|ops|owner|health|user|runtime))|` +
        `\\bPlatform(?=\\s*,\\s*(?:BitHire|Evnto|Rottay)\\b)`,
      'gi',
    ),
  ],
]);

function normalized(path) {
  return path.replaceAll('\\\\', '/');
}

function isTestSource(path) {
  const rel = normalized(path);
  return /(?:^|\/)(?:tests?|__tests__)(?:\/|$)|\.(?:test|spec|stories)\./.test(rel);
}

export function isExcludedPlatformZeroPath(path) {
  const rel = normalized(relative(UI_ROOT, path));
  const base = basename(path);

  if (OWN_FILES.has(rel)) return true;
  if (extname(base) === '.md') return true;
  if (HISTORICAL_SNAPSHOT.test(rel)) return true;
  if (isTestSource(rel)) return true;
  if (/(?:^|\/)(?:dist|styles|test-artifacts)(?:\/|$)/.test(rel)) return true;
  if (/(?:^|\/)(?:classic|rustic)(?:\/|$)/.test(rel)) return true;
  if (/(?:^|\/)foundation\/tokens\/css\/generated(?:\/|$)/.test(rel)) return true;
  if (/facade\/artifacts\/[^/]+\/index\.css$/.test(rel)) return true;
  return false;
}

export function findSemanticPlatformIdentity(text, path = 'fixture.ts') {
  const findings = [];
  for (const [rule, pattern] of CONTENT_RULES) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const before = text.slice(0, match.index);
      const line = before.split('\n').length;
      const column = (match.index ?? 0) - before.lastIndexOf('\n');
      findings.push({ path, rule, line, column, match: match[0] });
    }
  }
  return findings;
}

function collectFiles(root, excluded) {
  if (!existsSync(root)) return [];
  if (statSync(root).isFile()) {
    return SOURCE_EXTENSIONS.has(extname(root)) && !excluded(root) ? [root] : [];
  }
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) {
      if (!excluded(`${path}/sentinel.ts`)) out.push(...collectFiles(path, excluded));
      continue;
    }
    if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name)) && !excluded(path)) {
      out.push(path);
    }
  }
  return out;
}

export function collectPlatformIdentityFindings({
  uiRoot = UI_ROOT,
  roots = [
    resolve(UI_ROOT, 'package.json'),
    resolve(CORE_ROOT, 'package.json'),
    resolve(CORE_ROOT, 'scripts'),
    resolve(CORE_ROOT, 'src'),
    resolve(UI_ROOT, 'packages/showroom/src'),
    resolve(UI_ROOT, 'packages/showroom/scripts'),
    resolve(UI_ROOT, 'packages/showroom/e2e'),
  ],
  exclude = isExcludedPlatformZeroPath,
} = {}) {
  const files = roots.flatMap((root) => collectFiles(root, exclude));
  const findings = [];
  for (const path of new Set(files)) {
    const rel = normalized(relative(uiRoot, path));
    const pathMatch = new RegExp(`(?:^|/)(?:${RETIRED}|${RETIRED}\\.css)(?:/|$)`).exec(rel);
    if (pathMatch) findings.push({ path: rel, rule: 'source-path', line: 1, column: 1, match: pathMatch[0] });
    findings.push(...findSemanticPlatformIdentity(readFileSync(path, 'utf8'), rel));
  }
  return findings.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.rule.localeCompare(b.rule));
}

export function runPlatformIdentityZeroGate() {
  const findings = collectPlatformIdentityFindings();
  return { ok: findings.length === 0, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPlatformIdentityZeroGate();
  if (!result.ok) {
    for (const finding of result.findings) {
      console.error(`${finding.path}:${finding.line}:${finding.column} [${finding.rule}] ${finding.match}`);
    }
    console.error(`platform-identity-zero: FAIL (${result.findings.length} semantic authored residues)`);
    process.exitCode = 1;
  } else {
    console.log(
      'platform-identity-zero: PASS (active authored source corpus; Markdown, tests/stories, historical baselines/adjudications, generated artifacts/bundles, Classic and Rustic excluded)',
    );
  }
}
