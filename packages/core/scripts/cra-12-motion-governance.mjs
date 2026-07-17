#!/usr/bin/env node

/**
 * CRA12 motion-governance sentinel.
 *
 * This is deliberately source-only and cheap: it reads the four first-party
 * repositories, never resolves modules, and never starts a compiler/build.
 * Existing debt is an exact, expiring snapshot. A new finding, a changed debt
 * body, a stale snapshot row, a missing repository, or an expired row fails.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const designSystemRoot = resolve(HERE, '../../..');
export const defaultWorkspaceRoot = resolve(designSystemRoot, '..');
export const defaultRegistryPath = resolve(HERE, 'cra-12-motion-governance.registry.json');

export const DEFAULT_REPOSITORIES = Object.freeze([
  {
    name: 'ui-design-system',
    sourceRoots: ['packages/core/src', 'packages/showroom/src'],
    manifests: ['packages/core/package.json', 'packages/showroom/package.json'],
    prefix: 'ds-',
  },
  { name: 'app-bithire', sourceRoots: ['src'], manifests: ['package.json'], prefix: 'bh-' },
  { name: 'app-platform', sourceRoots: ['src'], manifests: ['package.json'], prefix: 'rt-' },
  { name: 'app-evnto', sourceRoots: ['src'], manifests: ['package.json'], prefix: 'evnto-' },
]);

const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRECTORIES = new Set(['.git', '.next', 'dist', 'node_modules', 'coverage']);
const MOTION_TIME_PROPERTY = /(?<![-\w])(?:['"])?(?:transition(?:-duration|-delay|Duration|Delay)?|animation(?:-duration|-delay|Duration|Delay)?)(?:['"])?\s*:\s*([^;}\n]+)/gi;
const TRANSITION_PROPERTY = /(?<![-\w])(?:['"])?(?:transition|transition-property|transitionProperty)(?:['"])?\s*:\s*([^;}\n]+)/gi;
const ANIMATION_PROPERTY = /(?<![-\w])(?:['"])?(?:animation|animation-name|animationName)(?:['"])?\s*:\s*([^;}\n]+)/gi;
const RAW_TIME = /(?:^|[^\w.-])(?:\d*\.\d+|\d+)(?:ms|s)\b/i;
const MOTION_PACKAGE_PATTERN = String.raw`(?:framer-motion|motion)(?:\/[^'"\s]+)?`;
const FRAMER_NUMERIC_TIME = /\b(duration|delay|staggerChildren|repeatDelay)\s*:\s*((?:\d*\.)?\d+)\b/g;
const HARD_FAIL_CHANNELS = new Set(['dependency-drift']);

function posix(path) {
  return path.split(sep).join('/');
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function lineAt(source, offset) {
  let line = 1;
  for (let i = 0; i < offset; i += 1) if (source.charCodeAt(i) === 10) line += 1;
  return line;
}

function normalizedEvidence(value) {
  return value.replace(/\s+/g, ' ').trim();
}

/** Mask comments without changing offsets. Template/string contents stay visible. */
export function maskComments(source, extension = '.ts') {
  const css = extension === '.css';
  const chars = [...source];
  let quote = null;
  let escaped = false;
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const next = chars[i + 1];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      // CSS block comments inside template strings are comments too.
      if (char === '/' && next === '*') {
        let j = i;
        while (j < chars.length - 1 && !(chars[j] === '*' && chars[j + 1] === '/')) {
          if (chars[j] !== '\n') chars[j] = ' ';
          j += 1;
        }
        if (j < chars.length) chars[j] = ' ';
        if (j + 1 < chars.length) chars[j + 1] = ' ';
        i = j + 1;
      }
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '/' && next === '*') {
      let j = i;
      while (j < chars.length - 1 && !(chars[j] === '*' && chars[j + 1] === '/')) {
        if (chars[j] !== '\n') chars[j] = ' ';
        j += 1;
      }
      if (j < chars.length) chars[j] = ' ';
      if (j + 1 < chars.length) chars[j + 1] = ' ';
      i = j + 1;
    } else if (!css && char === '/' && next === '/') {
      let j = i;
      while (j < chars.length && chars[j] !== '\n') {
        chars[j] = ' ';
        j += 1;
      }
      i = j - 1;
    }
  }
  return chars.join('');
}

function scopeFor(repo, path) {
  if (/(^|\/)(?:__tests__|tests?|fixtures)(\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)) return 'test';
  if (repo === 'ui-design-system' && path.startsWith('packages/showroom/')) return 'showroom';
  if (repo === 'ui-design-system') return 'ds-internal';
  if (path.includes('/showcase/')) return 'showroom';
  // Consumer repositories keep their own source taxonomy. These paths refer to
  // app-bithire/app-platform/app-evnto, not to the design-system `src/ui` tier.
  if (path.startsWith('src/components/landing/') || path.startsWith('src/components/marketing/')) return 'marketing';
  return 'product';
}

function walk(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) files.push(path);
    }
  }
  return files.sort();
}

function finding({ channel, kind, repo, path, scope, line, symbol, evidence }) {
  return {
    channel,
    kind,
    repo,
    path,
    scope,
    line,
    symbol,
    evidence: normalizedEvidence(evidence),
  };
}

function staticAnimationNames(value) {
  const withoutFunctions = value
    .replace(/(?:var|cubic-bezier|steps|linear|calc)\([^)]*\)/gi, ' ')
    .replace(/["'`]/g, ' ');
  const ignored = new Set([
    'alternate', 'alternate-reverse', 'backwards', 'both', 'ease', 'ease-in',
    'ease-in-out', 'ease-out', 'forwards', 'infinite', 'initial', 'inherit',
    'linear', 'none', 'normal', 'paused', 'revert', 'reverse', 'running',
    'step-end', 'step-start', 'unset', 'shouldReduceMotion', 'true', 'false',
  ]);
  return [...withoutFunctions.matchAll(/(?:\$\{[^}]+\}|[A-Za-z_][\w-]*)/g)]
    .map((match) => match[0])
    .filter((name) => !ignored.has(name) && !/^(?:ms|s)$/i.test(name));
}

function typeOnlyNamedClause(clause) {
  const trimmed = clause.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false;
  const members = trimmed.slice(1, -1).split(',').map((member) => member.trim()).filter(Boolean);
  return members.length > 0 && members.every((member) => /^type\b/.test(member));
}

/**
 * Collect literal Motion runtime edges without treating multiline or inline
 * type-only declarations as runtime imports. Static declarations are bounded
 * by their top-level `import`/`export` line; dynamic import and require remain
 * runtime edges. The package pattern deliberately accepts every subpath.
 */
export function collectRuntimeMotionImports(source) {
  const imports = [];
  const staticFrom = new RegExp(
    String.raw`(?:^|[;\n])[\t ]*(?:import|export)[\t \r\n]+((?:(?!\n[\t ]*(?:import|export)\b)[^;])*?)[\t \r\n]+from[\t \r\n]*(['"])(${MOTION_PACKAGE_PATTERN})\2`,
    'gm',
  );
  for (const match of source.matchAll(staticFrom)) {
    const clause = match[1].trim();
    if (/^type\b/.test(clause) || typeOnlyNamedClause(clause)) continue;
    const specifier = match[3];
    const specifierOffset = match[0].lastIndexOf(specifier);
    imports.push({
      specifier,
      index: match.index + Math.max(0, specifierOffset),
      evidence: `from ${match[2]}${specifier}${match[2]}`,
    });
  }

  const literalRuntimeEdges = [
    new RegExp(String.raw`(?:^|[;\n])[\t ]*import[\t \r\n]*(['"])(${MOTION_PACKAGE_PATTERN})\1`, 'gm'),
    new RegExp(String.raw`\bimport\s*\(\s*(['"])(${MOTION_PACKAGE_PATTERN})\1`, 'g'),
    new RegExp(String.raw`\brequire\s*\(\s*(['"])(${MOTION_PACKAGE_PATTERN})\1`, 'g'),
  ];
  for (const expression of literalRuntimeEdges) {
    for (const match of source.matchAll(expression)) {
      const specifier = match[2];
      const specifierOffset = match[0].lastIndexOf(specifier);
      imports.push({
        specifier,
        index: match.index + Math.max(0, specifierOffset),
        evidence: match[0].trim(),
      });
    }
  }

  return imports.sort((a, b) => a.index - b.index || a.specifier.localeCompare(b.specifier));
}

/** Source-level scanner; workspace-level prefix/duplicate checks happen later. */
export function scanSource({ source, extension = '.tsx', repo, path, scope = scopeFor(repo, path) }) {
  const masked = maskComments(source, extension);
  const definitions = [];
  const references = [];
  const findings = [];

  for (const match of masked.matchAll(/@(?:-webkit-)?keyframes\s+(\$\{[^}]+\}|[^\s{]+)/gi)) {
    definitions.push({
      name: match[1],
      line: lineAt(masked, match.index),
      evidence: match[0],
      repo,
      path,
      scope,
    });
  }

  for (const match of masked.matchAll(ANIMATION_PROPERTY)) {
    // TypeScript shape only (`animation: "pulse" | "wave";`), not a runtime
    // CSS declaration. Runtime style objects cannot use a union operator.
    if (extension !== '.css' && match[1].includes('|')) continue;
    for (const name of staticAnimationNames(match[1])) {
      references.push({
        name,
        line: lineAt(masked, match.index),
        evidence: match[0],
        repo,
        path,
        scope,
      });
    }
  }

  for (const match of masked.matchAll(TRANSITION_PROPERTY)) {
    if (/\ball\b/i.test(match[1])) {
      findings.push(finding({
        channel: 'transition-all', kind: 'transition-all', repo, path, scope,
        line: lineAt(masked, match.index), symbol: 'all', evidence: match[0],
      }));
    }
  }

  for (const match of masked.matchAll(MOTION_TIME_PROPERTY)) {
    if (RAW_TIME.test(match[1])) {
      findings.push(finding({
        channel: 'raw-motion-timing', kind: 'css-or-style-time', repo, path, scope,
        line: lineAt(masked, match.index), symbol: match[0].split(':', 1)[0].trim(), evidence: match[0],
      }));
    }
  }

  const runtimeMotionImports = collectRuntimeMotionImports(masked);
  for (const edge of runtimeMotionImports) {
    findings.push(finding({
      channel: 'direct-motion-import', kind: 'runtime-import', repo, path, scope,
      line: lineAt(masked, edge.index), symbol: edge.specifier, evidence: edge.evidence,
    }));
  }
  if (runtimeMotionImports.length) {
    for (const match of masked.matchAll(FRAMER_NUMERIC_TIME)) {
      findings.push(finding({
        channel: 'raw-motion-timing', kind: 'motion-object-time', repo, path, scope,
        line: lineAt(masked, match.index), symbol: match[1], evidence: match[0],
      }));
    }
  }

  return { definitions, references, findings };
}

function dependencyState(repoRoot, spec) {
  const direct = [];
  for (const manifestPath of spec.manifests) {
    const absolute = resolve(repoRoot, manifestPath);
    if (!existsSync(absolute)) {
      direct.push({ path: manifestPath, missing: true });
      continue;
    }
    const manifest = JSON.parse(readFileSync(absolute, 'utf8'));
    for (const section of ['dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies']) {
      for (const supplier of ['framer-motion', 'motion']) {
        if (manifest[section]?.[supplier]) {
          direct.push({ path: manifestPath, section, supplier, range: manifest[section][supplier] });
        }
      }
    }
  }
  const lockPath = resolve(repoRoot, 'pnpm-lock.yaml');
  const lock = existsSync(lockPath) ? readFileSync(lockPath, 'utf8') : '';
  const framerResolutions = [...new Set(
    [...lock.matchAll(/^  framer-motion@([^:\s(]+)(?:\([^\n]*)?:$/gm)].map((match) => match[1]),
  )].sort();
  const motionResolutions = [...new Set(
    [...lock.matchAll(/^  motion@([^:\s(]+)(?:\([^\n]*)?:$/gm)].map((match) => match[1]),
  )].sort();
  return { direct: direct.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), framerResolutions, motionResolutions };
}

function allowedDirectImport(record, registry) {
  return (registry.policy?.allowedDirectImportRoots ?? []).some((entry) => (
    entry.repo === record.repo && record.path.startsWith(entry.pathPrefix)
  ));
}

function allowedDynamicDefinition(record, registry, workspaceRoot) {
  return (registry.policy?.allowedDynamicKeyframes ?? []).some((entry) => {
    if (entry.repo !== record.repo || entry.path !== record.path || entry.symbol !== record.symbol) return false;
    const sourcePath = resolve(workspaceRoot, entry.repo, entry.path);
    if (!existsSync(sourcePath)) return false;
    return !entry.requiresSourcePattern || new RegExp(entry.requiresSourcePattern).test(readFileSync(sourcePath, 'utf8'));
  });
}

export function scanWorkspace({ workspaceRoot = defaultWorkspaceRoot, registry, repositories = DEFAULT_REPOSITORIES }) {
  const allDefinitions = [];
  const allReferences = [];
  let findings = [];

  for (const spec of repositories) {
    const repoRoot = resolve(workspaceRoot, spec.name);
    if (!existsSync(repoRoot)) throw new Error(`CRA12 missing repository: ${spec.name} (${repoRoot})`);
    for (const sourceRoot of spec.sourceRoots) {
      const absoluteRoot = resolve(repoRoot, sourceRoot);
      if (!existsSync(absoluteRoot)) throw new Error(`CRA12 missing source root: ${spec.name}/${sourceRoot}`);
      for (const absolute of walk(absoluteRoot)) {
        const path = posix(relative(repoRoot, absolute));
        const scanned = scanSource({
          source: readFileSync(absolute, 'utf8'), extension: extname(absolute), repo: spec.name, path,
        });
        allDefinitions.push(...scanned.definitions);
        allReferences.push(...scanned.references);
        findings.push(...scanned.findings);
      }
    }
    const state = dependencyState(repoRoot, spec);
    findings.push(finding({
      channel: 'dependency-state', kind: 'manifest-and-lock-state', repo: spec.name,
      path: 'package.json + pnpm-lock.yaml', scope: 'repository', line: 1,
      symbol: 'motion-suppliers', evidence: JSON.stringify(state),
    }));
    const directSuppliers = new Set(state.direct.map((entry) => entry.supplier).filter(Boolean));
    const canonicalMotion = registry.policy?.canonicalMotionVersion;
    const canonicalFramer = registry.policy?.canonicalFramerVersion;
    if (directSuppliers.has('motion') && directSuppliers.has('framer-motion')) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'mixed-direct-suppliers', repo: spec.name,
        path: 'package.json + pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: 'motion+framer-motion', evidence: JSON.stringify(state.direct),
      }));
    }
    if (directSuppliers.has('framer-motion')) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'legacy-direct-framer-manifest', repo: spec.name,
        path: 'package.json + pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: 'framer-motion', evidence: JSON.stringify(state.direct.filter((entry) => entry.supplier === 'framer-motion')),
      }));
    }
    if (canonicalMotion && state.direct.some((entry) => entry.supplier === 'motion' && entry.range !== canonicalMotion)) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'noncanonical-direct-motion-range', repo: spec.name,
        path: 'package.json + pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: canonicalMotion,
        evidence: JSON.stringify(state.direct.filter((entry) => entry.supplier === 'motion')),
      }));
    }
    if (directSuppliers.has('motion') && canonicalMotion && (
      state.motionResolutions.length !== 1 || state.motionResolutions[0] !== canonicalMotion
    )) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'noncanonical-motion-resolution', repo: spec.name,
        path: 'pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: state.motionResolutions.join(',') || 'missing', evidence: JSON.stringify(state.motionResolutions),
      }));
    }
    if (state.motionResolutions.length > 1) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'multiple-motion-resolutions', repo: spec.name,
        path: 'pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: state.motionResolutions.join(','), evidence: JSON.stringify(state.motionResolutions),
      }));
    }
    if (state.framerResolutions.length > 1) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'multiple-framer-resolutions', repo: spec.name,
        path: 'pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: state.framerResolutions.join(','), evidence: JSON.stringify(state.framerResolutions),
      }));
    }
    if (canonicalFramer && state.framerResolutions.some((version) => version !== canonicalFramer)) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'noncanonical-framer-resolution', repo: spec.name,
        path: 'pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: state.framerResolutions.join(','), evidence: JSON.stringify(state.framerResolutions),
      }));
    }
    if (directSuppliers.has('motion') && canonicalFramer && (
      state.framerResolutions.length !== 1 || state.framerResolutions[0] !== canonicalFramer
    )) {
      findings.push(finding({
        channel: 'dependency-drift', kind: 'noncanonical-transitive-framer-resolution', repo: spec.name,
        path: 'pnpm-lock.yaml', scope: 'repository', line: 1,
        symbol: state.framerResolutions.join(',') || 'missing', evidence: JSON.stringify(state.framerResolutions),
      }));
    }
  }

  const prefixes = new Map(repositories.map((spec) => [spec.name, spec.prefix]));
  const definitionsByName = new Map();
  for (const definition of allDefinitions) {
    if (!definitionsByName.has(definition.name)) definitionsByName.set(definition.name, []);
    definitionsByName.get(definition.name).push(definition);
  }
  for (const definition of allDefinitions) {
    const prefix = prefixes.get(definition.repo);
    const dynamic = definition.name.includes('${');
    const duplicate = definitionsByName.get(definition.name).length > 1;
    if (dynamic || !definition.name.startsWith(prefix) || duplicate) {
      findings.push(finding({
        channel: 'global-keyframes',
        kind: dynamic ? 'dynamic-keyframe-definition' : duplicate ? 'duplicate-keyframe-definition' : 'bare-keyframe-definition',
        repo: definition.repo, path: definition.path, scope: definition.scope, line: definition.line,
        symbol: definition.name, evidence: definition.evidence,
      }));
    }
  }
  const definedNames = new Set(allDefinitions.map((entry) => entry.name));
  for (const reference of allReferences) {
    const prefix = prefixes.get(reference.repo);
    if (definedNames.has(reference.name) && !reference.name.startsWith(prefix)) {
      findings.push(finding({
        channel: 'global-keyframes', kind: 'bare-animation-reference', repo: reference.repo,
        path: reference.path, scope: reference.scope, line: reference.line,
        symbol: reference.name, evidence: reference.evidence,
      }));
    }
  }

  findings = findings.filter((record) => {
    if (record.channel === 'direct-motion-import' && allowedDirectImport(record, registry)) return false;
    if (record.kind === 'dynamic-keyframe-definition' && allowedDynamicDefinition(record, registry, workspaceRoot)) return false;
    return true;
  });
  return findings.sort((a, b) => (
    a.channel.localeCompare(b.channel) || a.repo.localeCompare(b.repo) ||
    a.path.localeCompare(b.path) || a.line - b.line || a.kind.localeCompare(b.kind)
  ));
}

function groupFindings(findings) {
  const groups = new Map();
  for (const record of findings) {
    const key = `${record.channel}\0${record.repo}\0${record.path}\0${record.scope}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
}

function groupDigest(records, { includePath = false } = {}) {
  const rows = records.map((record) => (
    `${includePath ? `${record.path}\0` : ''}${record.kind}\0${record.symbol}\0${record.evidence}`
  )).sort();
  return hash(rows.join('\n'));
}

export function buildBaselines(findings, metadata = {}) {
  const hardFinding = findings.find((record) => HARD_FAIL_CHANNELS.has(record.channel));
  if (hardFinding) {
    throw new Error(
      `${hardFinding.channel}: hard policy findings cannot be baselined ` +
      `(${hardFinding.repo}/${hardFinding.path}:${hardFinding.line} ${hardFinding.kind})`,
    );
  }
  const channels = {};
  const snapshotGroups = new Map();
  for (const record of findings) {
    const key = `${record.channel}\0${record.repo}\0${record.scope}`;
    if (!snapshotGroups.has(key)) snapshotGroups.set(key, []);
    snapshotGroups.get(key).push(record);
  }
  for (const [key, records] of snapshotGroups) {
    const [channel, repo, scope] = key.split('\0');
    channels[channel] ??= {
      owner: metadata[channel]?.owner ?? 'design-system',
      reason: metadata[channel]?.reason ?? 'CRA12 pre-existing debt; exact decrease-only snapshot',
      expires: metadata[channel]?.expires ?? '2026-12-31',
      files: [],
    };
    channels[channel].files.push({
      repo,
      scope,
      maxCount: records.length,
      maxFiles: new Set(records.map((record) => record.path)).size,
      digest: groupDigest(records, { includePath: true }),
    });
  }
  for (const channel of Object.values(channels)) {
    channel.files.sort((a, b) => a.repo.localeCompare(b.repo) || a.scope.localeCompare(b.scope));
  }
  return channels;
}

export function auditFindings({ findings, registry, now = new Date() }) {
  const failures = [];
  const actual = new Map();
  for (const record of findings) {
    if (HARD_FAIL_CHANNELS.has(record.channel)) {
      failures.push(
        `${record.channel}: hard policy violation ${record.repo}/${record.path}:${record.line} ` +
        `(${record.kind} ${record.symbol})`,
      );
      continue;
    }
    const key = `${record.channel}\0${record.repo}\0${record.scope}`;
    if (!actual.has(key)) actual.set(key, []);
    actual.get(key).push(record);
  }
  const expected = new Map();
  for (const [channel, contract] of Object.entries(registry.baselines ?? {})) {
    if (HARD_FAIL_CHANNELS.has(channel)) {
      failures.push(`${channel}: hard-fail channel cannot be registered as baseline debt`);
      continue;
    }
    if (!contract.owner || !contract.reason || !contract.expires) {
      failures.push(`${channel}: baseline metadata requires owner, reason, and expires`);
      continue;
    }
    const expiry = new Date(`${contract.expires}T23:59:59Z`);
    if (!Number.isFinite(expiry.getTime()) || expiry < now) failures.push(`${channel}: baseline expired on ${contract.expires}`);
    for (const row of contract.files ?? []) {
      const key = `${channel}\0${row.repo}\0${row.scope}`;
      if (expected.has(key)) failures.push(`${channel}: duplicate registry row ${row.repo}/${row.scope}`);
      expected.set(key, row);
    }
  }
  for (const [key, records] of actual) {
    const row = expected.get(key);
    const [channel, repo, scope] = key.split('\0');
    if (!row) {
      failures.push(`${channel}: unregistered finding ${repo}/${records[0].path}:${records[0].line} (${records[0].kind} ${records[0].symbol})`);
      continue;
    }
    const fileCount = new Set(records.map((record) => record.path)).size;
    if (records.length > row.maxCount) failures.push(`${channel}: ratchet grew at ${repo}/${scope}: ${records.length} > ${row.maxCount}`);
    if (fileCount > row.maxFiles) failures.push(`${channel}: file ratchet grew at ${repo}/${scope}: ${fileCount} > ${row.maxFiles}`);
    const digest = groupDigest(records, { includePath: true });
    if (digest !== row.digest) failures.push(`${channel}: path/body hash drift at ${repo}/${scope}: ${digest} != ${row.digest}`);
    expected.delete(key);
  }
  for (const [key] of expected) {
    const [channel, repo, scope] = key.split('\0');
    failures.push(`${channel}: stale registry row ${repo}/${scope}`);
  }
  return failures;
}

export function auditWorkspace({ workspaceRoot = defaultWorkspaceRoot, registryPath = defaultRegistryPath, now } = {}) {
  if (!existsSync(registryPath)) return [`CRA12 missing registry: ${registryPath}`];
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  if (registry.schemaVersion !== 1) return [`CRA12 unsupported registry schema: ${registry.schemaVersion}`];
  try {
    const findings = scanWorkspace({ workspaceRoot, registry });
    return auditFindings({ findings, registry, now });
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

function cliOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace-root') options.workspaceRoot = resolve(argv[++index]);
    else if (argv[index] === '--registry') options.registryPath = resolve(argv[++index]);
    else if (argv[index] === '--print-baseline') options.printBaseline = true;
    else throw new Error(`Unknown CRA12 option: ${argv[index]}`);
  }
  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = cliOptions(process.argv.slice(2));
  const registryPath = options.registryPath ?? defaultRegistryPath;
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  if (options.printBaseline) {
    const findings = scanWorkspace({ workspaceRoot: options.workspaceRoot ?? defaultWorkspaceRoot, registry });
    console.log(JSON.stringify(buildBaselines(findings), null, 2));
  } else {
    const failures = auditWorkspace(options);
    if (failures.length) {
      console.error(`CRA12 motion governance failed (${failures.length}):`);
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
    } else {
      console.log('CRA12 motion governance: PASS');
    }
  }
}
