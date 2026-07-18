import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * MOT-06: every @keyframes name defined under foundation/animations must
 * carry the ds- namespace prefix. CSS @keyframes names are global (not
 * scoped per file or per cascade layer) -- an un-namespaced name here can
 * silently collide with an identically-named keyframe defined anywhere else
 * in the tree, with the last-loaded definition winning outright rather than
 * merging. Mirrors the bare-keyframe-definition rule CRA12 motion governance
 * enforces workspace-wide (scripts/cra-12-motion-governance.mjs), scoped to
 * this package's own foundation layer as a fast, standalone regression gate.
 */
const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ANIMATIONS_DIR = resolve(TEST_DIR, '..', 'css/foundation/animations');
const NAMESPACE_PREFIX = 'ds-';

function collectCssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
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

describe('foundation animations keyframe namespace contract', () => {
  const files = collectCssFiles(ANIMATIONS_DIR);

  it('scans at least the known foundation animation stylesheets', () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it('names every @keyframes in foundation/animations with the ds- prefix', () => {
    const unnamespaced: string[] = [];
    for (const file of files) {
      const css = readFileSync(file, 'utf8');
      for (const name of keyframeNames(css)) {
        if (!name.startsWith(NAMESPACE_PREFIX)) {
          unnamespaced.push(`${name} (${file})`);
        }
      }
    }
    expect(unnamespaced).toEqual([]);
  });

  it('defines at least one keyframe (guards against a vacuous pass from an empty/broken scan)', () => {
    const total = files.reduce((sum, file) => sum + keyframeNames(readFileSync(file, 'utf8')).length, 0);
    expect(total).toBeGreaterThan(0);
  });
});
