/**
 * @fileoverview DS-internal read counts for `--ds-*` names.
 *
 * EVERY COUNT HERE IS A FLOOR, and the gate that consumes it says so in its own
 * output rather than leaving the reader to remember.
 *
 * Two reasons, both structural:
 *
 *   THE THREE APPS ARE NOT IN THIS REPOSITORY. `app-bithire`, `app-evnto` and
 *   `app-platform` are separate repos, so a name with zero reads here may have
 *   hundreds there. A zero NEVER proves a name unused; it bounds nothing.
 *
 *   INTERPOLATED READS ARE INVISIBLE. `var(--ds-${role}-bg)` is a read that no
 *   text scan attributes to `--ds-primary-bg`. The same trap that hides
 *   emissions hides reads.
 *
 * The direction matters for the ratchet. A read floor EXCLUDES names below it,
 * so undercounting reads excludes names that should have been gated — the
 * ratchet under-reports rather than inventing findings. That is the safe
 * direction for a floor, and it is why the floor defaults to 1 rather than
 * something larger.
 *
 * The artifacts themselves are excluded from the corpus: they are the
 * generated declarations under test, and letting them count as readers of
 * their own names would be circular.
 */
import { readFileSync } from 'node:fs';
import { listFiles } from '../../foundation/git/index.mjs';

export const READ_CORPUS_ROOT = 'packages/core/src';
export const EXCLUDED = 'packages/core/src/foundation/tokens/css/facade/artifacts/';
const EXTENSIONS = /\.(css|ts|tsx)$/;

export const SCOPE_STATEMENT =
  'scope: packages/core/src/**/*.{css,ts,tsx}, excluding the generated vertical artifacts. ' +
  'The three consuming apps are NOT in this repository and interpolated reads are invisible to text scans, ' +
  'so every count is a FLOOR and a zero never proves a name unused.';

/** `var(--name` occurrences per name, across the DS-internal corpus. */
export function readCounts({ root }) {
  const counts = new Map();
  let filesScanned = 0;

  for (const file of listFiles(root)) {
    if (!file.startsWith(READ_CORPUS_ROOT)) continue;
    if (file.startsWith(EXCLUDED)) continue;
    if (!EXTENSIONS.test(file)) continue;

    let source;
    try {
      source = readFileSync(`${root}/${file}`, 'utf8');
    } catch {
      continue;
    }
    filesScanned += 1;
    for (const match of source.matchAll(/var\(\s*(--ds-[A-Za-z0-9-]+)/g)) {
      counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
    }
  }

  if (filesScanned === 0) {
    throw new Error('ds-reads: the corpus is empty — a gate that scans nothing passes everything');
  }
  return { counts, filesScanned };
}
