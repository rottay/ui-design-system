/**
 * @fileoverview Where this harness is, resolved once.
 *
 * Its own place on disk is the one fact every layer needs and none should
 * re-derive: a second `resolve(HERE, '../../..')` written from a different
 * depth is a silent off-by-one that surfaces as a missing CSS input three
 * layers away.
 *
 * @module Tooling/ResolutionProbe/Foundation/Paths
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** `packages/core`. */
export const CORE_ROOT = resolve(HERE, '../../../../..');

/** The authored CSS tree the `fresh` bundle is composed from. */
export const SRC_CSS = resolve(CORE_ROOT, 'src/foundation/tokens/css');

/** The shipped bundles. Stale as of this writing; see runtime/bundle. */
export const DIST = resolve(CORE_ROOT, 'dist');

/** The committed mirrors, verified byte-identical to DIST. */
export const STYLES = resolve(CORE_ROOT, 'styles');

/** Renders an absolute path relative to `packages/core`, for artifacts. */
export function fromCoreRoot(absolutePath) {
  return absolutePath.startsWith(CORE_ROOT) ? absolutePath.slice(CORE_ROOT.length + 1) : absolutePath;
}
