/**
 * The surface, the step actions and the close control wears the tenant focus signature: `--ds-focus-ring` on a
 * box-shadow, never a solid outline built from the width, colour and offset
 * operands, with a system-colour outline kept for forced colors.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

interface SkinRule {
  readonly selector: string;
  readonly body: string;
  readonly forced: boolean;
}

/** Every style rule of the skin, with whether a forced-colors block holds it. */
function skinRules(css: string): SkinRule[] {
  const rules: SkinRule[] = [];
  const open: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      open.push(css.slice(start, index).replace(/\s+/g, ' ').trim());
      start = index + 1;
    } else if (char === '}') {
      const prelude = open.pop() ?? '';
      if (!prelude.startsWith('@')) {
        rules.push({
          selector: prelude,
          body: css.slice(start, index),
          forced: open.some((at) => at.includes('forced-colors: active')),
        });
      }
      start = index + 1;
    }
  }
  return rules;
}

const RULES = skinRules(SKIN);
const FOCUS_RULES = RULES.filter((rule) => /:focus|focus-visible/.test(rule.selector));

const SIGNATURE_RULES = [
  ".ds-tour.ds-tour--modern[data-part='root'] > [data-part='surface']:is([data-state~='focus-visible'], :focus-visible)",
  ".ds-tour.ds-tour--modern[data-part='root'] > [data-part='surface']:is([data-state~='focus-visible'], :focus-visible)",
  ".ds-tour.ds-tour--modern[data-part='root'] :is([data-part='action'], [data-part='close-button'])[data-part]:is([data-state~='focus-visible'], :focus-visible)",
];

const FORCED_RULES = [
  ".ds-tour.ds-tour--modern[data-part='root'] > [data-part='surface']:is([data-state~='focus-visible'], :focus-visible), .ds-tour.ds-tour--modern[data-part='root'] :is([data-part='action'], [data-part='close-button'])[data-part]:is([data-state~='focus-visible'], :focus-visible)",
];

describe('tour -- the surface, the step actions and the close control wears the tenant focus signature', () => {
  it('paints the signature on exactly the family focus targets', () => {
    expect(
      RULES.filter((rule) => !rule.forced && /box-shadow:\s*var\(--ds-focus-ring\)/.test(rule.body)).map(
        (rule) => rule.selector,
      ),
    ).toEqual(SIGNATURE_RULES);
  });

  it('never draws focus as a solid outline outside forced colors', () => {
    const outlines = FOCUS_RULES.filter((rule) => !rule.forced).flatMap((rule) =>
      Array.from(rule.body.matchAll(/(?:^|[;\s])outline:\s*([^;]+);/g), (match) => match[1]!.trim()),
    );
    expect(outlines.length).toBeGreaterThan(0);
    for (const outline of outlines) {
      expect(outline).toMatch(/\btransparent\)?$/);
    }
    for (const rule of FOCUS_RULES) {
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary/);
    }
  });

  it('keeps a system-colour outline on every focus target in forced colors', () => {
    const forced = RULES.filter((rule) => rule.forced && /outline:\s*max\(2px, [^;]+\) solid Highlight/.test(rule.body)).map(
      (rule) => rule.selector,
    );
    expect(forced).toEqual(FORCED_RULES);
  });
});
