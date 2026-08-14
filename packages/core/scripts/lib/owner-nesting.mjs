/**
 * Detects family-inventory rows whose `sourceOwner` folder physically nests
 * inside another row's `sourceOwner` folder.
 *
 * WHY THIS CHECK EXISTS. CLAUDE.md's canonical family-manifest taxonomy says
 * "every public component has exactly one canonical family id and one source
 * owner." A nested owner breaks that independence even when both rows are
 * individually well-formed: moving, deleting, or reasoning about the outer
 * family's folder silently drags the inner family's files with it, and any
 * tool that walks a family by its `sourceOwner` path prefix (lane-control's
 * derived `writeExcludes`, the taxonomy-parity gate's unowned-sibling walk,
 * a plain `rm -rf <owner>`) cannot tell the two families apart without a
 * special case. `structure/workspace/search-command-bar` living inside
 * `structure/workspace/connected-command-palette`'s owner folder was exactly
 * this defect (WO Modern Rescue lane 2).
 *
 * Pure and dependency-free by design: no `fs`, no `path` module, no
 * filesystem access. It operates purely over an in-memory `rows` array
 * shaped like the canonical `family-inventory.json` rows
 * (`{ id, sourceOwner, ... }`), so callers can drill it against a synthetic
 * fixture (see `owner-nesting.test.mjs`) or wire it into a gate that loads
 * the real inventory and hands it the parsed rows.
 */

/**
 * Returns every ancestor/descendant `sourceOwner` pair in `rows`.
 *
 * A violation is a pair of DIFFERENT rows where one row's `sourceOwner`
 * folder path is a strict ancestor directory of another row's `sourceOwner`
 * folder path -- i.e. the inner owner equals the outer owner plus one or
 * more additional `/segment` path components. The comparison is
 * segment-boundary aware: `.../workspace/table` is not considered an
 * ancestor of `.../workspace/table-toolbar` merely because one string is a
 * textual prefix of the other -- only a shared `/` boundary counts.
 *
 * Two rows that declare the exact same `sourceOwner` are a different defect
 * (duplicate/shared ownership, not nesting) and are not reported here. Rows
 * with a missing or non-string `sourceOwner` are ignored rather than
 * crashing the check.
 *
 * @param {ReadonlyArray<{id?: string, sourceOwner?: string}>} rows
 * @returns {Array<{outerId: string, outerOwner: string, innerId: string, innerOwner: string}>}
 */
export function findNestedOwners(rows) {
  const owners = (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({
      id: typeof row?.id === 'string' && row.id.length > 0 ? row.id : `#${index}`,
      owner: typeof row?.sourceOwner === 'string' ? row.sourceOwner : '',
    }))
    .filter((row) => row.owner.length > 0);

  const violations = [];
  for (const outer of owners) {
    for (const inner of owners) {
      if (inner === outer || inner.owner === outer.owner) continue;
      if (inner.owner.startsWith(`${outer.owner}/`)) {
        violations.push({
          outerId: outer.id,
          outerOwner: outer.owner,
          innerId: inner.id,
          innerOwner: inner.owner,
        });
      }
    }
  }
  return violations;
}
