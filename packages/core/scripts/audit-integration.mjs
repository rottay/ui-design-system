#!/usr/bin/env node

/**
 * audit-integration.mjs -- Integration guardrail for the Rottay Design System.
 *
 * Detects:
 * 1. Premium chrome CSS variables emitted by the brand compiler that have
 *    no non-test reader in engines/, ui/, or surfaces/.
 * 2. Duplicate local `useCountUp` implementations that should use the
 *    canonical `useSmoothCounter` from motion/react/runtime/.
 * 3. Debug console.log/console.debug calls in runtime/ core files.
 *
 * Exit 0 = all checks passed.
 * Exit 1 = violations found.
 *
 * Run: `node scripts/audit-integration.mjs`
 * Hook: `"lint:integration": "node scripts/audit-integration.mjs"`
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SRC_ROOT = resolve(__dirname, '../src');

const violations = [];

// ============================================================================
// Helpers
// ============================================================================

function walkFiles(dir, pattern) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
        results.push(...walkFiles(full, pattern));
      } else if (e.isFile() && pattern.test(e.name)) {
        results.push(full);
      }
    }
  } catch { /* dir might not exist */ }
  return results;
}

function readSafe(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

function relPath(abs) {
  return abs.replace(SRC_ROOT + '/', '');
}

// ============================================================================
// Rule 1: Premium chrome vars without non-test consumers
// ============================================================================

// Chrome vars have one canonical emitter (compilers/kernel/foundation/css/chrome-variables,
// scanned whole -- the entire file IS the chrome channel) plus the two
// compilers that call it (kernel/runtime/brand-theme, runtime/appearance -- each
// scanned only within its chrome-handling function, so a stray
// vars['--ds-...'] assignment added directly to either compiler, bypassing
// the shared module, is caught too). This is a LIST, not one file: a var
// emitted by any one of these with no consumer is a violation, and the
// violation names every emitter that produced it. Palette, typography, and
// surface vars are foundational theme output and out of scope for this rule.
const CHROME_EMITTERS = [
  {
    path: join(SRC_ROOT, 'infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts'),
    extract: (source) => source,
  },
  {
    path: join(SRC_ROOT, 'infrastructure/compilers/kernel/runtime/brand-theme/index.ts'),
    extract: (source) => {
      const start = source.indexOf('export function brandThemeToChromeVariables');
      const end = source.indexOf('export const compileBrandTheme', start);
      return start >= 0 ? source.slice(start, end >= 0 ? end : undefined) : '';
    },
  },
  {
    path: join(SRC_ROOT, 'infrastructure/compilers/kernel/runtime/appearance/index.ts'),
    extract: (source) => {
      const start = source.indexOf('export function appearanceAdvancedToVariables');
      const end = source.indexOf('// ── Combined', start);
      return start >= 0 ? source.slice(start, end >= 0 ? end : undefined) : '';
    },
  },
];

const varPattern = /vars\['(--ds-[a-z0-9-]+)'\]/g;
// Also catch the direct string literals like `--ds-sidebar-*`
const directVarPattern = /['"`](--ds-(?:sidebar|layout|shell|page-shell|button-disabled|button-default|button-ghost|input-disabled|input-bg-disabled|input-color-disabled|input-border-disabled|table)[a-z0-9-]*)['"`]/g;

// varName -> Set of emitter file paths that emit it, so a violation names
// every emitter producing an orphan var, not just "the compiler".
const emittedVars = new Map();
for (const emitter of CHROME_EMITTERS) {
  if (!existsSync(emitter.path)) {
    violations.push({
      rule: 'canonical-source-missing',
      path: relPath(emitter.path),
      message: 'Required premium-chrome emitter is missing; integration coverage cannot be certified.',
    });
    continue;
  }
  const scoped = emitter.extract(readSafe(emitter.path));
  if (!scoped) continue;

  for (const pattern of [varPattern, directVarPattern]) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(scoped)) !== null) {
      const varName = match[1];
      if (!emittedVars.has(varName)) emittedVars.set(varName, new Set());
      emittedVars.get(varName).add(relPath(emitter.path));
    }
  }
}

// Known aliases: these vars duplicate a consumed var with a different naming
// convention. They exist for compatibility with component token files.
const KNOWN_ALIASES = new Set([
  '--ds-button-disabled-border-color', // alias for --ds-button-disabled-border
  '--ds-input-border-color-disabled',  // alias for --ds-input-border-disabled
]);

if (emittedVars.size > 0) {
  // Search for consumers in engines/, ui/, and token CSS
  // (excluding test files).
  const consumerDirs = [
    join(SRC_ROOT, 'foundation/tokens/css/runtime/engines'),
    join(SRC_ROOT, 'ui'),
    join(SRC_ROOT, 'foundation/tokens/css/presentation/components'),
    join(SRC_ROOT, 'foundation/tokens/css/runtime'),
    join(SRC_ROOT, 'foundation/tokens/css/foundation'),
  ];

  const consumerFiles = [];
  for (const dir of consumerDirs) {
    consumerFiles.push(...walkFiles(dir, /\.(css|tsx?)$/));
  }

  // Filter out test files
  const nonTestConsumers = consumerFiles.filter(
    (f) => !f.includes('.test.') && !f.includes('.spec.') && !f.includes('.stories.')
  );

  const allConsumerContent = nonTestConsumers.map((f) => readSafe(f)).join('\n');

  for (const [varName, emitterPaths] of emittedVars) {
    if (KNOWN_ALIASES.has(varName)) continue;
    // Check if the var is consumed (referenced via var(--ds-...) or as a property name in CSS)
    if (!allConsumerContent.includes(varName)) {
      violations.push({
        rule: 'orphan-premium-var',
        path: [...emitterPaths].join(', '),
        message: `Premium chrome var "${varName}" is emitted but has no non-test consumer in engines/ui/surfaces/token CSS.`,
      });
    }
  }
}

// ============================================================================
// Rule 2: Duplicate local useCountUp implementations
// ============================================================================

const componentFiles = walkFiles(join(SRC_ROOT, 'ui'), /\.tsx?$/);
for (const file of componentFiles) {
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('.stories.')) continue;

  const content = readSafe(file);
  if (/function\s+useCountUp\s*\(/.test(content)) {
    // Check if it's the thin wrapper in StatsHeader (delegating to useSmoothCounter)
    if (content.includes('useSmoothCounter')) continue;

    violations.push({
      rule: 'duplicate-use-count-up',
      path: relPath(file),
      message: 'Local useCountUp implementation found. Use the canonical useSmoothCounter from motion/react/runtime/ instead.',
    });
  }
}

// ============================================================================
// Rule 3: Debug console logging in runtime core
// ============================================================================

const runtimeFiles = walkFiles(join(SRC_ROOT, 'infrastructure/runtime'), /\.tsx?$/);
for (const file of runtimeFiles) {
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('.stories.')) continue;

  const content = readSafe(file);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip commented-out lines
    if (/^\s*\/\//.test(line)) continue;
    // Skip multi-line comment bodies
    if (/^\s*\*/.test(line)) continue;

    if (/console\.(log|debug)\s*\(/.test(line)) {
      // Allow NODE_ENV-gated dev-only logging (check preceding 5 lines)
      const context = lines.slice(Math.max(0, i - 5), i + 1).join('\n');
      if (/NODE_ENV\s*===?\s*['"]development['"]/.test(context)) continue;
      if (/process\.env\.NODE_ENV/.test(context)) continue;
      if (/__DEV__/.test(context)) continue;

      violations.push({
        rule: 'runtime-debug-log',
        path: `${relPath(file)}:${i + 1}`,
        message: `Debug logging found in runtime core. Remove or gate behind __DEV__/NODE_ENV check.`,
      });
    }
  }
}

// ============================================================================
// Rule 4: Stale "not yet wired" comments in contracts
// ============================================================================

const contractFiles = walkFiles(join(SRC_ROOT, 'foundation', 'contracts'), /\.ts$/);
for (const file of contractFiles) {
  const content = readSafe(file);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/not yet wired|not yet implemented|declaration[- ]only/i.test(lines[i])) {
      violations.push({
        rule: 'stale-contract-comment',
        path: `${relPath(file)}:${i + 1}`,
        message: `Stale comment found: "${lines[i].trim()}". Update to reflect current implementation status.`,
      });
    }
  }
}

// ============================================================================
// Rule 5: Token surface consumption ratio
// ============================================================================
// For component token CSS files, count defined --ds-{name}-* vars.
// For the corresponding modern engine file, count references.
// Flag if a component has >15 defined tokens but the modern engine references
// fewer than the integration floor. Flagship families deliberately carry a
// much higher floor: declaring a rich white-label contract without consuming
// it throughout the skin is an integration defect, not future potential.

const COMPONENT_TOKEN_DIR = join(SRC_ROOT, 'foundation/tokens/css/presentation/components');
const FLAGSHIP_MIN_TOKEN_REFS = new Map([
  ['button', 120],
  ['card', 80],
  ['tabs', 80],
  ['tooltip', 80],
  ['popover', 60],
]);
const componentTokenFiles = walkFiles(COMPONENT_TOKEN_DIR, /\.css$/).filter(
  (f) => !f.endsWith('index.css')
);

for (const tokenFile of componentTokenFiles) {
  const tokenContent = readSafe(tokenFile);
  if (!tokenContent) continue;

  // Derive the component name from the CSS filename (e.g. button.css -> button)
  const baseName = tokenFile.split('/').pop().replace('.css', '');
  const tokenPrefix = `--ds-${baseName}-`;

  // Count defined vars (lines that declare --ds-{name}-* inside :root)
  const definedMatches = tokenContent.match(new RegExp(tokenPrefix, 'g'));
  const definedCount = definedMatches ? definedMatches.length : 0;

  if (definedCount <= 15) continue;

  // Find the corresponding modern engine file.
  // Component names are PascalCase in the file system; try common mappings.
  const pascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  // Search across all primitive categories for the modern engine
  const primitiveDirs = ['display', 'inputs', 'feedback', 'layout', 'navigation', 'overlay'];
  let modernContent = '';
  let modernPath = '';
  for (const category of primitiveDirs) {
    const candidate = join(
      SRC_ROOT,
      'ui/primitives',
      category,
      pascalName,
      'engines',
      'modern',
      'index.tsx',
    );
    const content = readSafe(candidate);
    if (content) {
      modernContent = content;
      modernPath = candidate;
      break;
    }
  }

  if (!modernContent) continue; // No modern engine found -- skip silently

  // A modern engine is its component AND its skin stylesheet, when it has one.
  // WO-ARC-07 moves a component's paint out of an inline `style={}` object into
  // `foundation/tokens/css/runtime/engines/modern/skin/<name>.css`; the tokens are consumed there,
  // by the same engine, and a rule that reads only the .tsx would report zero
  // consumption for a component that consumes every one of them.
  const skinPath = join(
    SRC_ROOT,
    'foundation/tokens/css/runtime/engines/modern/skin',
    `${baseName}.css`,
  );
  const skinContent = readSafe(skinPath) ?? '';

  const countRefs = (text) => (text.match(new RegExp(tokenPrefix, 'g')) ?? []).length;
  const refCount = countRefs(modernContent) + countRefs(skinContent);

  const minimumRefs = FLAGSHIP_MIN_TOKEN_REFS.get(baseName) ?? 3;
  if (refCount < minimumRefs) {
    const searched = skinContent
      ? `${relPath(modernPath)} + ${relPath(skinPath)}`
      : relPath(modernPath);
    violations.push({
      rule: 'token-consumption-ratio',
      path: relPath(modernPath),
      message: `Component "${baseName}" defines ${definedCount} ${tokenPrefix}* tokens but the modern engine only references ${refCount} (searched ${searched}). Expected >= ${minimumRefs} references.`,
    });
  }
}

// ============================================================================
// Rule 6: Personality variable duplication guard
// ============================================================================
// resolvePartialPersonalityCssVariables
// (foundation/tokens/ts/runtime/personality/index.ts) is
// the single canonical source of personality-derived CSS variable names.
// resolvePersonalityCssVariables (the runtime bridge) and personalityVariables
// (the tenant visual compiler, infrastructure/compilers/runtime/tenant-css/visual-config) both
// delegate to it rather than each declaring these keys by hand. A literal
// '--ds-...' key reappearing directly inside the generator's function, or the
// delegation call disappearing, is the WO-TOK-09 defect regenerating: a third
// hand-written copy the gate would otherwise not see.

const PERSONALITY_CANONICAL_PATH = join(
  SRC_ROOT,
  'foundation/tokens/ts/runtime/personality/index.ts',
);
const PERSONALITY_GENERATOR_PATH = join(SRC_ROOT, 'infrastructure/compilers/runtime/tenant-css/visual-config/index.ts');
const PERSONALITY_DELEGATION_CALL = 'resolvePartialPersonalityCssVariables(';

function extractDsObjectKeysFrom(text) {
  const keys = new Set();
  const pattern = /^\s*'(--ds-[a-z0-9-]+)':/gm;
  let match;
  while ((match = pattern.exec(text)) !== null) keys.add(match[1]);
  return keys;
}

const generatorSource = readSafe(PERSONALITY_GENERATOR_PATH);
const generatorFnStart = generatorSource.indexOf('function personalityVariables(config: TenantConfig)');

if (!readSafe(PERSONALITY_CANONICAL_PATH)) {
  violations.push({
    rule: 'personality-emitter-duplication',
    path: relPath(PERSONALITY_CANONICAL_PATH),
    message: 'resolvePartialPersonalityCssVariables not found. This is the canonical personality-variable emitter every other emitter must delegate to.',
  });
} else if (generatorFnStart < 0) {
  violations.push({
    rule: 'personality-emitter-duplication',
    path: relPath(PERSONALITY_GENERATOR_PATH),
    message: 'personalityVariables() not found. The static tenant generator must keep a personality-variable function that delegates to resolvePartialPersonalityCssVariables().',
  });
} else {
  const generatorFnEnd = generatorSource.indexOf('\n}\n', generatorFnStart);
  const generatorFnBody = generatorSource.slice(generatorFnStart, generatorFnEnd >= 0 ? generatorFnEnd : undefined);

  if (!generatorFnBody.includes(PERSONALITY_DELEGATION_CALL)) {
    violations.push({
      rule: 'personality-emitter-duplication',
      path: relPath(PERSONALITY_GENERATOR_PATH),
      message: 'personalityVariables() no longer delegates to resolvePartialPersonalityCssVariables(). This is the WO-TOK-09 defect: a hand-written duplicate personality emitter.',
    });
  }

  for (const key of extractDsObjectKeysFrom(generatorFnBody)) {
    violations.push({
      rule: 'personality-emitter-duplication',
      path: relPath(PERSONALITY_GENERATOR_PATH),
      message: `personalityVariables() declares "${key}" directly instead of solely through resolvePartialPersonalityCssVariables(). This re-creates the WO-TOK-09 duplicate-emitter defect.`,
    });
  }
}

// ============================================================================
// Rule 7: Personality variable orphan guard
// ============================================================================
// P-43: resolvePartialPersonalityCssVariables() (runtime/personality/
// primitives.ts) is the single place a `--ds-*` personality variable comes
// into existence. Every key in the object it returns is a channel a tenant
// can set through TenantConfig -- a channel nothing reads is a promise the
// design system cannot keep, and a rule that cannot see personality
// variables at all is the hole --ds-badge-hover-transform walked through
// (Rule 1 above only ever scanned the chrome-variable emitters).
//
// A variable counts as READ when a non-emitter, non-test file under
// packages/core/src/** or packages/showroom/src/** contains either:
//   (a) `var(--the-name` -- genuine CSS custom-property consumption, in a
//       .css file or inside a string literal in a .ts/.tsx inline style; or
//   (b) the quoted literal '--the-name' (or "--the-name") in a file that
//       ALSO calls `.getPropertyValue(` somewhere -- the JS-side CSSOM-read
//       idiom this codebase actually uses (Toast/utils/animations.ts reads
//       --ds-toast-enter-duration this way). The literal is assigned to a
//       local before being passed to getPropertyValue on a later line, so
//       the two never sit on the same line; same-file co-occurrence is the
//       precision this check can actually deliver without a real parser.
// This deliberately does NOT count:
//   - anything inside the canonical emitter file itself. Every appearance
//     of a variable's name there is production -- an object key assigning
//     it a value, or that value's own string embedding a DIFFERENT
//     variable's var() reference to build a fallback -- never consumption.
//     Rule 6 above already owns the one dangerous shape here (a second
//     hand-written emitter re-declaring the same keys).
//   - a bare re-declaration of the same key elsewhere, e.g. `'--ds-x': ...`
//     as an object-literal key, or `--ds-x: ...` as a CSS custom-property
//     declaration. Under a plain substring search this LOOKS like the name
//     is "used", but it is a producer, not a reader -- requiring the
//     literal `var(` immediately before the name (CSS consumption) or a
//     companion `.getPropertyValue(` call in the same file (the JS idiom)
//     is what excludes it.
// This does NOT attempt to prove a matched `var(--the-name...)` call is
// itself reachable at runtime -- e.g. sitting inside the dead fallback
// chain of some OTHER variable nothing ever applies to a rendered element.
// That needs a real CSS/JS evaluator, not a text scan; a variable whose
// only match is nested inside such a chain reads as "consumed" here.
// Narrowing further is future work, not silence about the gap.
//
// PRE_EXISTING_PERSONALITY_ORPHANS below is exactly what it looks like: an
// enumerated, dated, reasoned EXEMPTION LIST, not a self-enforcing ratchet.
// It was called a "decrease-only baseline" in an earlier version of this
// comment; that claim was wrong -- nothing in this rule counts, compares
// against a stored number, or otherwise notices if the set grows or
// shrinks, and it is worth naming precisely rather than describing a
// mechanism the code does not have.
//
// Building the reader search above against the full source tree (not Rule
// 1's fixed consumerDirs list, per this WO's ask) surfaced 26 personality
// variables beyond --ds-badge-hover-transform that are ALSO emitted with
// zero readers under the definition above -- almost entirely the raw
// `--ds-personality-{animation,chart,card,accent,typography}-*` mirror of
// each personality field (as opposed to the derived, component-shorthand
// variables like --ds-card-shadow or --ds-button-hover-transform, which DO
// have readers), plus the unrelated --ds-duration-normal. Wiring or
// deleting 26 variables across components this change does not otherwise
// touch is outside P-43's fence and this WO's scope; hiding them behind a
// widened, permanent exemption is exactly what WO-TOK-09's executor
// declined to do for the one orphan they found, and for the same reason
// (see roadmap/proposals.md P-43 and roadmap/STATUS.md's WO-TOK-09 entry).
// This list is that same decision made 26 times over, each one named.
//
// A count-based ratchet (store N, fail when the live orphan count exceeds
// N) was the other option and is NOT what this is, on purpose: this repo
// runs several WOs concurrently against the same tree (five, the day this
// rule was written), so a count can move in both directions in the same
// window -- one WO fixes an old orphan while an unrelated one introduces a
// new one, net count unchanged, and a pure count ratchet would stay green
// through a real regression. A named list still cannot stop someone from
// adding a genuinely-new orphan's name to hide it -- nothing except a
// reviewer reading the diff and asking "why is this here" can -- but it
// can at least be checked for staleness: PERSONALITY_ORPHAN_EXEMPTION_CHECK
// below fails if a name in this list is no longer something the emitter
// even emits, so the list cannot silently drift from reality. Shrinking it
// (wiring a variable up, or deleting its emission) is always welcome and
// never required to keep the audit green; growing it is a change a
// reviewer should see and question, the same as any other exemption list.
const PERSONALITY_SHOWROOM_ROOT = resolve(__dirname, '../../showroom/src');

const PRE_EXISTING_PERSONALITY_ORPHANS = new Set([
  '--ds-personality-animation-intensity',
  '--ds-personality-animation-stagger-delay',
  '--ds-personality-animation-stagger-max',
  '--ds-personality-animation-entrance',
  '--ds-personality-animation-hover-lift',
  '--ds-personality-animation-hover-scale',
  '--ds-personality-animation-spring-tension',
  '--ds-personality-animation-spring-friction',
  '--ds-personality-animation-pulse-speed',
  '--ds-personality-animation-skeleton-style',
  '--ds-personality-animation-count-up-enabled',
  '--ds-personality-chart-mount-duration',
  '--ds-personality-chart-line-style',
  '--ds-personality-chart-tooltip-style',
  '--ds-personality-card-padding-density',
  '--ds-personality-card-default-elevation',
  '--ds-personality-card-hover-elevation',
  '--ds-personality-card-show-border',
  '--ds-personality-card-hover-tint',
  '--ds-personality-accent-bar-position',
  '--ds-personality-accent-badge-shape',
  '--ds-personality-accent-icon-shape',
  '--ds-personality-accent-divider-style',
  '--ds-personality-typography-heading-weight-bias',
  '--ds-personality-typography-label-style',
  '--ds-duration-normal',
]);

const personalitySourceForReaderCheck = readSafe(PERSONALITY_CANONICAL_PATH);
const emittedPersonalityVars = extractDsObjectKeysFrom(personalitySourceForReaderCheck);

// PERSONALITY_ORPHAN_EXEMPTION_CHECK: every name in the exemption list must
// still be something resolvePartialPersonalityCssVariables() actually
// emits. This does not verify the name is STILL unread (fixing one and
// forgetting to remove it from the list is harmless -- the exemption just
// goes unused), only that it has not gone stale by naming a key that was
// renamed or deleted, which would otherwise sit in this file forever,
// unnoticed, exempting nothing.
for (const exemptedName of PRE_EXISTING_PERSONALITY_ORPHANS) {
  if (!emittedPersonalityVars.has(exemptedName)) {
    violations.push({
      rule: 'stale-personality-orphan-exemption',
      path: relPath(PERSONALITY_CANONICAL_PATH),
      message: `PRE_EXISTING_PERSONALITY_ORPHANS names "${exemptedName}", which resolvePartialPersonalityCssVariables() no longer emits. Remove it from the exemption list in scripts/audit-integration.mjs.`,
    });
  }
}

if (emittedPersonalityVars.size > 0) {
  // The reference adoption app is part of the reader census: the R1-P drain
  // moved real consumption of foundation vocabulary (e.g. --ds-duration-slow,
  // 10 readers) into app-bithire, and a DS-only scan re-reports those channels
  // as orphans. Same corpus-widening the boundary/hook gates already use;
  // absence of the sibling checkout keeps the census DS-only rather than failing.
  const PERSONALITY_APP_ROOT =
    process.env.APP_BITHIRE_ROOT ?? resolve(SRC_ROOT, '../../../../app-bithire/src');
  const personalityConsumerFiles = [
    ...walkFiles(SRC_ROOT, /\.(css|tsx?)$/),
    ...walkFiles(PERSONALITY_SHOWROOM_ROOT, /\.(css|tsx?)$/),
    ...(existsSync(PERSONALITY_APP_ROOT) ? walkFiles(PERSONALITY_APP_ROOT, /\.(css|tsx?)$/) : []),
  ].filter((f) => {
    if (f.includes('.test.') || f.includes('.spec.') || f.includes('.stories.')) return false;
    if (resolve(f) === resolve(PERSONALITY_CANONICAL_PATH)) return false;
    return true;
  });

  const personalityConsumerFileContents = personalityConsumerFiles.map((f) => readSafe(f));
  const personalityAllConsumerContent = personalityConsumerFileContents.join('\n');

  const isPersonalityVarRead = (varName) => {
    // Fast path: one regex test against the whole joined corpus for the
    // common case, a real var() consumer somewhere (mirrors Rule 1's
    // allConsumerContent.includes() idiom).
    if (new RegExp(`var\\(\\s*${varName}(?![a-z0-9-])`).test(personalityAllConsumerContent)) {
      return true;
    }
    // Slow path: the JS-side CSSOM-read idiom needs same-file precision --
    // joining all files first would let a quoted literal in one file pair
    // with an unrelated getPropertyValue( call in another and falsely read
    // as consumed.
    for (const content of personalityConsumerFileContents) {
      if (!content) continue;
      if (!content.includes(`'${varName}'`) && !content.includes(`"${varName}"`)) continue;
      if (/\.getPropertyValue\(/.test(content)) return true;
    }
    return false;
  };

  for (const varName of emittedPersonalityVars) {
    if (isPersonalityVarRead(varName)) continue;
    if (PRE_EXISTING_PERSONALITY_ORPHANS.has(varName)) continue;

    violations.push({
      rule: 'orphan-personality-var',
      path: relPath(PERSONALITY_CANONICAL_PATH),
      message: `Personality var "${varName}" is emitted by resolvePartialPersonalityCssVariables() but has no reader (no var(${varName}...) and no companion getPropertyValue('${varName}') call) in packages/core/src/** or packages/showroom/src/** outside tests.`,
    });
  }
}

// ============================================================================
// Report
// ============================================================================

if (violations.length === 0) {
  console.log('audit-integration: all checks passed.');
  process.exit(0);
} else {
  console.error(`audit-integration: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.path}`);
    console.error(`    ${v.message}\n`);
  }
  process.exit(1);
}
