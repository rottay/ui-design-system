/**
 * A Segmented option wears the tenant focus signature (`--ds-focus-ring`, a
 * box-shadow) for keyboard focus, never a solid or a suppressed outline, and
 * keeps a system-colour outline in forced colors, where the box-shadow is
 * dropped.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface SkinRule {
  readonly selector: string;
  readonly body: string;
  readonly forced: boolean;
}

function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Every style rule of the skin, with whether a forced-colors block holds it. */
function skinRules(css: string): SkinRule[] {
  const rules: SkinRule[] = [];
  const open: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      open.push(normalise(css.slice(start, index)));
      start = index + 1;
    } else if (char === '}') {
      const prelude = open.pop() ?? '';
      if (!prelude.startsWith('@')) {
        rules.push({
          selector: prelude,
          body: normalise(css.slice(start, index)),
          forced: open.some((at) => at.includes('forced-colors: active')),
        });
      }
      start = index + 1;
    }
  }
  return rules;
}

const RULES = skinRules(SKIN);
const OPTION_FOCUS =
  ".ds-segmented--modern[role='radiogroup'] [data-part='option']:is([data-state~='focus-visible'], :focus-visible)";
const KEYBOARD_RULES = RULES.filter((rule) => /:focus|focus-visible/.test(rule.selector));

function declarations(rule: SkinRule, property: string): string[] {
  return Array.from(rule.body.matchAll(new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`, 'g')), (match) => match[1]!.trim());
}

describe('segmented -- the option wears the tenant focus signature', () => {
  it('paints the signature on exactly the option, for the stamp and for native keyboard focus', () => {
    expect(
      RULES.filter((rule) => !rule.forced && /box-shadow: var\(--ds-focus-ring\);/.test(rule.body)).map(
        (rule) => rule.selector,
      ),
    ).toEqual([OPTION_FOCUS]);
  });

  it('never draws or suppresses focus with a solid or absent outline outside forced colors', () => {
    const outlines = KEYBOARD_RULES.filter((rule) => !rule.forced).flatMap((rule) => declarations(rule, 'outline'));
    expect(outlines).toEqual(['var(--ds-focus-ring-width) solid transparent']);
    for (const rule of KEYBOARD_RULES) {
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary/);
    }
  });

  it('keeps a system-colour outline on the focused option in forced colors', () => {
    const forced = RULES.filter(
      (rule) => rule.forced && /outline: max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/.test(rule.body),
    );
    expect(forced.map((rule) => rule.selector)).toEqual([OPTION_FOCUS]);
    expect(forced[0]!.body).toMatch(/outline-offset: var\(--ds-focus-ring-offset\);/);
  });

  it('lets the focus rule outrank the resting rule that clears the outline', () => {
    const cleared = RULES.filter((rule) => !rule.forced && declarations(rule, 'outline').includes('none'));
    expect(cleared.map((rule) => rule.selector)).toEqual([".ds-segmented--modern[role='radiogroup'] [data-part='option']"]);
    const order = RULES.map((rule) => rule.selector);
    expect(order.indexOf(OPTION_FOCUS)).toBeGreaterThan(order.indexOf(cleared[0]!.selector));
    expect(OPTION_FOCUS.startsWith(cleared[0]!.selector)).toBe(true);
  });
});
