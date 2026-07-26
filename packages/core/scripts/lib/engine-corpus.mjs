import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The engine-source corpus: which files under `src/ui` an engine ratchet audits.
 *
 * Lives here rather than inside `engine-token-audit.mjs` because the audit runs
 * its whole pipeline on import, so a test cannot ask it what its corpus is. The
 * alternative -- a second walk in the test -- is how a corpus and its guard
 * drift apart until the guard is describing a file set nobody scans. One
 * implementation, two callers.
 */

/**
 * Path segments and filename suffixes that are NOT shipped engine source.
 *
 * The corpus is recursive, so it reaches test and story files that live beside
 * an engine implementation (`Box/engines/modern/tests/customization.test.tsx`
 * today). Those are excluded DECLARATIVELY -- one list, matched against whole
 * path segments and whole filename suffixes -- rather than by an ad-hoc string
 * check at each call site, so "what is not audited" is something a reader can
 * enumerate instead of something they have to grep for. Adding an exclusion
 * means editing this list, in view of every counter that depends on it.
 */
export const NON_SOURCE_SEGMENTS = ['tests', '__tests__', '__fixtures__', '__mocks__', 'stories'];

export const NON_SOURCE_SUFFIXES = [
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  '.stories.ts',
  '.stories.tsx',
];

const EXCLUDED_SEGMENTS = new Set(NON_SOURCE_SEGMENTS);

/** True when a POSIX path is shipped engine source rather than a test/story. */
export function isEngineSourceFile(posixPath) {
  if (posixPath.split('/').some((segment) => EXCLUDED_SEGMENTS.has(segment))) return false;
  return !NON_SOURCE_SUFFIXES.some((suffix) => posixPath.endsWith(suffix));
}

/**
 * Every `engines/<engineName>.tsx` or `engines/<engineName>/**\/*.ts(x)` source file
 * under `dir`, with the extension set widened by `extensions`.
 *
 * RECURSIVE. The predecessor pattern was `engines/<name>(/[^/]+)?\.tsx?$`, which
 * reached exactly one level below the engine folder, so
 * `patterns/data/data-table/engines/modern/cell-editor/index.tsx` sat outside
 * every modern counter. That file scans clean, so nothing was hidden -- but any
 * future `engines/modern/<sub>/index.tsx` would have escaped the ratchet in
 * silence, which is precisely the failure a ratchet exists to prevent.
 */
export function collectEngineFiles(dir, engineName, extensions = 'tsx?') {
  const out = [];
  const engineRe = new RegExp(`engines/${engineName}(\\.(?:${extensions})$|/.*\\.(?:${extensions})$)`);
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectEngineFiles(full, engineName, extensions));
      continue;
    }
    const posix = full.replace(/\\/g, '/');
    if (engineRe.test(posix) && isEngineSourceFile(posix)) out.push(full);
  }
  return out;
}

/** Every modern-engine component source file -- the `daisy.classConsumers` corpus. */
export function modernEngineFiles(dir) {
  return collectEngineFiles(dir, 'modern');
}

/**
 * The color-purity file set (WO-ENG-06, spec section 6): modern-engine `.tsx`,
 * `.ts` OR `.css`. No `.css` sibling exists under an `engines/modern/` path
 * today, so this currently returns the same set as `modernEngineFiles()`; the
 * `.css` branch is here so a future modern-engine stylesheet is covered
 * automatically instead of silently escaping the ratchet.
 */
export function modernEngineColorFiles(dir) {
  return collectEngineFiles(dir, 'modern', 'tsx?|css');
}
