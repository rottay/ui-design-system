#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const UI_ROOT = findRepoRoot(HERE);

const SOURCE_EXTENSIONS = new Set(['.cjs', '.css', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx']);
const RETIRED = ['plat', 'form'].join('');
const OWN_FILES = new Set([
  'packages/core/scripts/check/verticals/retired-identity/index.mjs',
  'packages/core/scripts/check/verticals/retired-identity/index.test.mjs',
]);
const IDENTITY_VALUE = `${RETIRED}(?:[-.:/][a-z0-9-]+)?`;

/**
 * Historical measurements retain the vocabulary of the tree they measured so
 * decrease-only comparisons remain reproducible. This is deliberately much
 * narrower than the retired broad baseline exclusion: operational
 * manifests, registries, package exports and quality contracts are scanned.
 */
const HISTORICAL_SNAPSHOT = /(?:^|\/)(?:[^/]+\.baseline\.json|[^/]+-adjudication\.json)$/u;

// Named dated artifacts whose "platform" mentions are historical measurements,
// not live identity (exemption by EXACT NAME — a neighbour still fails; C2).
const NAMED_DATED_ARTIFACTS = new Set([
  // Historical measurements are not live product identity.
  'packages/core/scripts/check/tokens/customization/visual-worklist/index.json',
]);

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
      `(?:brand-themes|demos|verticals)[/\\\\]${RETIRED}\\b`,
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

export function isExcludedRetiredIdentityPath(path) {
  const rel = normalized(relative(UI_ROOT, path));
  const base = basename(path);

  if (OWN_FILES.has(rel)) return true;
  if (NAMED_DATED_ARTIFACTS.has(rel)) return true;
  if (extname(base) === '.md') return true;
  if (HISTORICAL_SNAPSHOT.test(rel)) return true;
  if (isTestSource(rel)) return true;
  if (/(?:^|\/)dist(?:\/|$)/.test(rel)) return true;
  return false;
}

export function findRetiredIdentity(text, path = 'fixture.ts') {
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

export function collectRetiredIdentityFindings({
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
  exclude = isExcludedRetiredIdentityPath,
} = {}) {
  const files = roots.flatMap((root) => collectFiles(root, exclude));
  const findings = [];
  for (const path of new Set(files)) {
    const rel = normalized(relative(uiRoot, path));
    const pathMatch = new RegExp(`(?:^|/)(?:${RETIRED}|${RETIRED}\\.css)(?:/|$)`).exec(rel);
    if (pathMatch) findings.push({ path: rel, rule: 'source-path', line: 1, column: 1, match: pathMatch[0] });
    findings.push(...findRetiredIdentity(readFileSync(path, 'utf8'), rel));
  }
  return findings.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.rule.localeCompare(b.rule));
}

export function runRetiredIdentityGate() {
  const findings = collectRetiredIdentityFindings();
  return { ok: findings.length === 0, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runRetiredIdentityGate();
  if (!result.ok) {
    for (const finding of result.findings) {
      console.error(`${finding.path}:${finding.line}:${finding.column} [${finding.rule}] ${finding.match}`);
    }
    console.error(`retired-identity: FAIL (${result.findings.length} authored residues)`);
    process.exitCode = 1;
  } else {
    console.log(
      'retired-identity: PASS (active authored source corpus; historical snapshots excluded)',
    );
  }
}
