/**
 * The Tooltip bubble is never a tab stop, so its skin states nothing under
 * focus: no focus-gated rule, no read of the focus signature and no focus colour
 * of its own. The control the keyboard holds inside it wears the only indicator.
 * An interactive bubble focused by a pointer press or by script shows the
 * browser's default outline.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Every style rule selector of a sheet, at-rule preludes excluded. */
function ruleSelectors(css: string): string[] {
  const selectors: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      const prelude = css.slice(start, index).replace(/\s+/g, ' ').trim();
      if (!prelude.startsWith('@')) selectors.push(prelude);
      start = index + 1;
    } else if (char === '}' || char === ';') {
      start = index + 1;
    }
  }
  return selectors;
}

const FOCUS_GATE = /:focus|data-state/;

describe('tooltip -- the bubble states nothing under focus', () => {
  it('carries no focus-gated rule, forced colors included', () => {
    const selectors = ruleSelectors(SKIN);
    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter((selector) => FOCUS_GATE.test(selector))).toEqual([]);
  });

  it('reads neither the focus signature nor a focus colour of its own', () => {
    expect(SKIN).not.toMatch(/--ds-focus-ring/);
    expect(SKIN).not.toMatch(/--ds-tooltip-focus-color/);
  });

  it('refuses the retired frame when it is restored', () => {
    const restored = `${SKIN}\n.ds-tooltip[data-part='bubble']:is([data-state~='focus-visible'], :has(:focus-visible)) { outline: var(--ds-focus-ring-width) solid var(--ds-tooltip-focus-color, transparent); }`;
    expect(ruleSelectors(restored).filter((selector) => FOCUS_GATE.test(selector))).toHaveLength(1);
    expect(restored).toMatch(/--ds-focus-ring/);
  });
});
