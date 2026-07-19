import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * MOT-06 (scope extended, W6-H): every @keyframes name defined in this
 * package's own foundation/tokens/css source must carry the ds- namespace
 * prefix. CSS @keyframes names are global (not scoped per file or per
 * cascade layer) -- an un-namespaced name here can silently collide with an
 * identically-named keyframe defined anywhere else in the tree, with the
 * last-loaded definition winning outright rather than merging. Mirrors the
 * bare-keyframe-definition rule CRA12 motion governance enforces
 * workspace-wide (scripts/cra-12-motion-governance.mjs), scoped to this
 * package's own foundation/tokens/css tree as a fast, standalone regression
 * gate. Originally scoped to foundation/animations/ only; W6-H widened the
 * scan to the full css tree after landing ds- renames across the 7
 * runtime/engines/{modern,rustic}/skin files that still declared
 * `@keyframes rottay-*`.
 *
 * SCOPE excludes facade/artifacts/: that subtree is generated per-tenant
 * BrandTheme output (plus its _source/ input), governed by its own
 * lint:artifacts + build:vertical-css pipeline under tenancy ownership --
 * not this package's DS-authored keyframe surface.
 *
 * PRE-EXISTING non-ds- keyframes discovered outside the runtime/engines/
 * scope this contract originated from are ratcheted through
 * keyframe-namespace-contract.allowlist.json (same shape/semantics as
 * scripts/css-layer-paint-gate.allowlist.json: a decrease-only per-file
 * ceiling with a mandatory reason) rather than failing this suite on debt
 * a different lane owns. Every file under runtime/engines/ must carry zero
 * allowlist entries and stay at zero -- enforced by a dedicated assertion
 * below so the ratchet can never be used to paper over engine-skin debt.
 */
const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, '..', '..', '..', '..');
const CSS_ROOT = resolve(TEST_DIR, '..', 'css');
const NAMESPACE_PREFIX = 'ds-';
const EXCLUDED_ROOTS = [resolve(CSS_ROOT, 'facade', 'artifacts')];
const ALLOWLIST_PATH = resolve(TEST_DIR, 'keyframe-namespace-contract.allowlist.json');

interface AllowlistEntry {
  file: string;
  maxUnnamespaced: number;
  reason: string;
}

function collectCssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (EXCLUDED_ROOTS.includes(full)) continue;
    if (statSync(full).isDirectory()) {
      out.push(...collectCssFiles(full));
    } else if (full.endsWith('.css')) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Blanks /* ... *\/ block-comment content (preserving newlines) so a prose
 * mention such as "CSS @keyframes definitions for..." in a header comment
 * cannot be mistaken for a real rule. Only a `@keyframes NAME {` with an
 * actual trailing block is counted as a definition. */
function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

function keyframeNames(css: string): string[] {
  const stripped = stripBlockComments(css);
  return [...stripped.matchAll(/@(?:-webkit-)?keyframes\s+([A-Za-z0-9_-]+)\s*\{/g)].map((match) => match[1]);
}

function toRelative(file: string): string {
  return relative(PACKAGE_ROOT, file).split('\\').join('/');
}

function loadAllowlist(): AllowlistEntry[] {
  if (!existsSync(ALLOWLIST_PATH)) return [];
  const parsed: unknown = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error(`allowlist must be an array: ${ALLOWLIST_PATH}`);
  return parsed as AllowlistEntry[];
}

describe('foundation css keyframe namespace contract', () => {
  const files = collectCssFiles(CSS_ROOT);
  const allowlist = loadAllowlist();
  const allowlistByFile = new Map(allowlist.map((entry) => [entry.file, entry]));

  it('scans the full foundation css tree, including the known foundation animation stylesheets', () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it('has a well-formed allowlist (file, non-empty reason, maxUnnamespaced integer >= 1)', () => {
    const malformed = allowlist.filter(
      (entry) =>
        !entry ||
        typeof entry.file !== 'string' ||
        typeof entry.reason !== 'string' ||
        entry.reason.trim() === '' ||
        !Number.isInteger(entry.maxUnnamespaced) ||
        entry.maxUnnamespaced < 1,
    );
    expect(malformed).toEqual([]);
  });

  it('names every @keyframes with the ds- prefix, except decrease-only allowlisted pre-existing debt', () => {
    const regressions: string[] = [];
    const seenAllowlisted = new Set<string>();

    for (const file of files) {
      const rel = toRelative(file);
      const css = readFileSync(file, 'utf8');
      const unnamespaced = keyframeNames(css).filter((name) => !name.startsWith(NAMESPACE_PREFIX));
      if (unnamespaced.length === 0) continue;

      const entry = allowlistByFile.get(rel);
      if (!entry) {
        regressions.push(`${rel}: ${unnamespaced.join(', ')} (not allowlisted)`);
        continue;
      }
      seenAllowlisted.add(rel);
      if (unnamespaced.length > entry.maxUnnamespaced) {
        regressions.push(
          `${rel}: ${unnamespaced.length} unnamespaced keyframe(s) exceeds allowlist ceiling ${entry.maxUnnamespaced}: ${unnamespaced.join(', ')}`,
        );
      } else if (unnamespaced.length < entry.maxUnnamespaced) {
        // eslint-disable-next-line no-console
        console.log(`keyframe-namespace-contract: ${rel} is at ${unnamespaced.length}/${entry.maxUnnamespaced} -- tighten the allowlist ceiling`);
      }
    }

    for (const entry of allowlist) {
      if (!seenAllowlisted.has(entry.file)) {
        regressions.push(`stale allowlist entry (file has zero unnamespaced keyframes, or was not scanned): ${entry.file}`);
      }
    }

    expect(regressions).toEqual([]);
  });

  it('never allowlists runtime/engines/ -- the ratchet must not paper over engine-skin debt', () => {
    const engineEntries = allowlist.filter((entry) => entry.file.includes('/runtime/engines/'));
    expect(engineEntries).toEqual([]);
  });

  it('defines at least one keyframe (guards against a vacuous pass from an empty/broken scan)', () => {
    const total = files.reduce((sum, file) => sum + keyframeNames(readFileSync(file, 'utf8')).length, 0);
    expect(total).toBeGreaterThan(0);
  });
});
