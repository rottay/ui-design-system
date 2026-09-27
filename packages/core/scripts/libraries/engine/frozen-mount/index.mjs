/**
 * The frozen-engine mount: the one place that names where the Classic and Rustic
 * CSS enters a shipped bundle. `base` never reaches it; the build composes it into
 * its own bundle behind `./styles/frozen-engines`, and the paint-layers
 * reachability arm counts it as mounted, the way the roster mounts tenant artifacts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** CSS-root-relative path of the aggregator the build mounts. */
export const FROZEN_ENGINE_MOUNT = 'runtime/engines/frozen/index.css';

/** Where the composed bundle ships, where its committed mirror lives, and its export. */
export const FROZEN_ENGINE_BUNDLE = Object.freeze({
  dist: 'dist/frozen-engines.css',
  mirror: 'artifacts/generated/css/engines/frozen/index.css',
  subpath: './styles/frozen-engines',
});

/** A stylesheet is frozen-engine source when it lives under a frozen engine's tree. */
export const FROZEN_ENGINE_SOURCE = /[\\/]runtime[\\/]engines[\\/](classic|rustic)[\\/]/;

/** A selector member only a frozen engine can match: a --classic/--rustic modifier, its ds-engine class or its data-engine. */
export const FROZEN_SELECTOR_SIGNATURE =
  /(\.[\w-]+--(rustic|classic)\b|\.ds-engine-(rustic|classic)\b|data-engine\s*=\s*['"]?(rustic|classic)\b)/;

const IMPORT_RE = /@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g;

/** Every relative stylesheet the file at `entry` reaches through `@import`, itself included. */
export function importClosure(entry, seen = new Set()) {
  const full = resolve(entry);
  if (seen.has(full) || !existsSync(full)) return seen;
  seen.add(full);
  const text = readFileSync(full, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of text.matchAll(IMPORT_RE)) {
    if (match[1].startsWith('.')) importClosure(resolve(dirname(full), match[1]), seen);
  }
  return seen;
}
