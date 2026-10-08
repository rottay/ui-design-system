import { readFileSync } from 'node:fs';

/* ============================================================================
   Content-integrity gate (WO-ENG-09, spec section 9): "Overlay layering uses
   a tokenized z-index scale; tooltips/callouts must not land on top of
   unrelated content."
   ============================================================================ */

/**
 * Count numeric `zIndex` (JS/inline-style, camelCase) and `z-index` (raw CSS,
 * kebab-case) literals in modern-engine component files that are NOT sourced
 * from the tokenized overlay-stack scale (`var(--ds-z-*)`, minted in
 * `foundation/themes/default/index.css` as short aliases onto the pre-existing
 * canonical `--ds-z-index-*` scale). A literal is tokenized when its value is
 * a `var(--ds-z-...)` reference; this function's regex only ever matches a
 * BARE digit (or `auto`) immediately after `zIndex:`/`z-index:`, so any such
 * reference already can't match -- no separate "is it var()-sourced" check is
 * needed.
 *
 * Exemptions (spec-directed):
 *  - `0` and `-1`: the CSS defaults for "no stacking context" / "just behind
 *    this element's own sibling" (e.g. Popover's decorative arrow, drawn one
 *    step behind the popover body it belongs to) -- not a page-level overlay
 *    layering decision.
 *  - `auto`: the CSS keyword default: never a magic number.
 *  - A literal with a trailing same-line `//` comment is treated as
 *    documented (e.g. "local stacking context, not a page overlay") and
 *    exempted -- still visible to a human reviewer, just not counted as
 *    undocumented magic-number debt.
 *
 * Deliberately narrow, like the other single-purpose counters in this file:
 * a zIndex driven by a variable/expression (e.g. `zIndex: zBase + 1`, or a
 * value buried inside a quoted `var(--x, var(--y, 1070))` fallback-chain
 * string) is a DIFFERENT defect shape (an opaque default or a dead-token
 * fallback) that this regex will not see either -- WO-ENG-09 fixed every
 * such case found in the overlay/tooltip/callout/modal/drawer/dropdown
 * family by inspection, not by relying on this counter to find them.
 *
 * Baseline measured at WO-ENG-09 implementation time (after routing the
 * overlay/tooltip/callout/modal/drawer/dropdown engines through
 * `var(--ds-z-*)`); target 0; decrease-only. The residual at that baseline
 * is sticky/local-stacking usage (data-table column pinning + sticky header,
 * the Table primitive, filter/menu/select-family floating popups) that
 * WO-ENG-09 left untouched -- out of its named file scope -- for a later pass.
 */
function countMagicZIndex(files) {
  const literalRe = /\b(?:zIndex|z-index)\s*:\s*(['"]?)(-?\d+|auto)\1/g;
  let count = 0;
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      literalRe.lastIndex = 0;
      let m;
      while ((m = literalRe.exec(line))) {
        const raw = m[2];
        if (raw === 'auto') continue;
        const num = Number(raw);
        if (num === 0 || num === -1) continue;
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1 && commentIdx > m.index) continue; // documented inline
        count += 1;
      }
    }
  }
  return count;
}

export {
  countMagicZIndex,
};
