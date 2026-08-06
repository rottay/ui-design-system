/**
 * Toast modern skin -- the data-shadow='false' knob must reach paint.
 *
 * The rest rule doubles both the class and [data-part='root'] to clear a tenant
 * floor, reaching (0,4,0), and it is the sole author of the surface depth. The
 * public knob was authored single-class at (0,3,0), so it lost the cascade
 * outright: a documented API that silently did nothing.
 *
 * This asserts the CASCADE, not a substring -- it recomputes selector
 * specificity from the file and checks the knob actually wins, so the
 * regression cannot return under a different but equally losing selector.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/toast.css'),
  'utf8',
);

/** Classes and attribute selectors both score in the `b` column. */
function specificityB(selector: string): number {
  const classes = selector.match(/\.[A-Za-z_-][\w-]*/g) ?? [];
  const attributes = selector.match(/\[[^\]]*\]/g) ?? [];
  return classes.length + attributes.length;
}

function ruleFor(pattern: RegExp): { selector: string; index: number } {
  const match = SKIN.match(pattern);
  expect(match, `no rule matched ${pattern}`).not.toBeNull();
  return { selector: match![1].trim(), index: match!.index! };
}

/** The doubled rest rule that authors the surface depth. */
const REST = ruleFor(/(\.rottay-toast--modern[^\n{]*\[data-part='root'\]\[data-part='root'\])\s*\{/);
/** The public opt-out knob. */
const KNOB = ruleFor(/(\.rottay-toast--modern[^\n{]*\[data-shadow='false'\])\s*\{\s*box-shadow:\s*none;\s*\}/);

describe("Toast modern skin data-shadow='false' knob", () => {
  it('is not outranked by the rest rule that sets the shadow', () => {
    expect(specificityB(KNOB.selector)).toBeGreaterThanOrEqual(specificityB(REST.selector));
  });

  it('wins the cascade on source order when specificity ties', () => {
    if (specificityB(KNOB.selector) === specificityB(REST.selector)) {
      expect(KNOB.index).toBeGreaterThan(REST.index);
    }
  });

  it('still switches the depth off with a whole-value none', () => {
    expect(SKIN).toContain(`${KNOB.selector} { box-shadow: none; }`);
  });

  it('leaves the default depth paint unchanged', () => {
    expect(SKIN).toContain(
      'box-shadow: var(--ds-material-overlay-shadow, var(--ds-elevation-3));',
    );
    expect(KNOB.selector).toContain("[data-shadow='false']");
  });
});
