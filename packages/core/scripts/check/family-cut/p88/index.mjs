/**
 * G1 (WO-ARC-12, review-arc12-rfc §3): which `data-part` occurrences in a family's sources are P-88
 * CALLER PARTS rather than the family's own anatomy.
 *
 * A data-part an owner stamps on a COMPOSED SKINNED DS CHILD is a caller part (P-88): the child
 * keeps its own part, and the caller literal is debt the 1b engine lots remove. The discriminator is
 * the TARGET ELEMENT's identity, never a class written beside the literal.
 *
 * ONE MEASUREMENT, NEVER TWO. Nothing here classifies. The element list is the pass-through
 * census's caller enumeration (scripts/libraries/engine/skins/pass-through, `enumerateCallerParts`):
 * every JSX element in packages/core/src/components handed a literal data-part, resolved to a child
 * family that owns a part or ships a skin. It is imported as-is and keyed by the element's
 * repo-relative file, opening-tag line and tag, which are the same coordinates the census records.
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { enumerateCallerParts, measurePassThrough } from '../../../libraries/engine/skins/pass-through/index.mjs';

const toPosix = (path) => path.split('\\').join('/');
const cache = new Map();

/**
 * The workspace a package root sits in, when it is the census's own layout
 * (`<workspace>/packages/core`). A drill sandbox shaped as a bare package root has none, and its
 * occurrences are then all native: the arm cannot classify what the census cannot see.
 */
export function workspaceOf(root) {
  const workspace = resolve(root, '..', '..');
  const shaped = resolve(workspace, 'packages/core') === resolve(root)
    && existsSync(join(workspace, 'packages/core/src/components'));
  return shaped ? workspace : null;
}

/**
 * The census caller-part elements for the workspace containing `root`, keyed `file:line:tag`.
 * `fresh` re-runs the census (a drill that edits its sandbox between two measurements).
 */
export function callerPartIndex(root, { fresh = false } = {}) {
  const workspace = workspaceOf(root);
  if (!workspace) return { workspace: null, measured: false, elements: new Map() };
  if (!fresh && cache.has(workspace)) return cache.get(workspace);
  const elements = new Map();
  for (const use of enumerateCallerParts(measurePassThrough({ repoRoot: workspace, fresh }))) {
    elements.set(`${use.file}:${use.line}:${use.child}`, use);
  }
  const index = { workspace, measured: true, elements };
  cache.set(workspace, index);
  return index;
}

/** The census element a JSX `data-part` occurrence sits on, or undefined when it is native anatomy. */
export function callerElementOf(index, file, occurrence) {
  if (!index.workspace) return undefined;
  return index.elements.get(`${toPosix(relative(index.workspace, file))}:${occurrence.line}:${occurrence.tag}`);
}
