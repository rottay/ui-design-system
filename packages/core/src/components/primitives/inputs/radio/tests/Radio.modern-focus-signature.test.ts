/**
 * The circle wears the tenant focus signature: `--ds-focus-ring` on a
 * box-shadow, never a solid outline built from the width, colour and offset
 * operands, with a system-colour outline kept clear of the control in forced
 * colors and no indicator after a pointer press on the label.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

interface SkinRule {
  readonly selector: string;
  readonly body: string;
  readonly forced: boolean;
  readonly container: string | undefined;
}

/** Every style rule of the skin, with the forced-colors or container block that holds it. */
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
          container: open.find((at) => at.startsWith('@container')),
        });
      }
      start = index + 1;
    }
  }
  return rules;
}

const RULES = skinRules(SKIN);
const FOCUS_RULES = RULES.filter((rule) => /:focus|focus-visible/.test(rule.selector));

const KEYBOARD =
  ".ds-radio.ds-radio--modern[data-state~='focus-visible']:not(:has(input:focus:not(:focus-visible))) [data-part='circle'], " +
  ".ds-radio.ds-radio--modern input:focus-visible ~ [data-part='circle']";

describe('radio -- the circle wears the tenant focus signature', () => {
  it('paints the signature on the circle for keyboard focus only', () => {
    expect(
      RULES.filter((rule) => !rule.forced && /box-shadow:\s*var\(--ds-focus-ring\)/.test(rule.body)).map((rule) => rule.selector),
    ).toEqual([KEYBOARD]);
    for (const rule of FOCUS_RULES) {
      expect(rule.selector).toBe(KEYBOARD);
    }
  });

  it('never draws focus as a solid outline outside forced colors', () => {
    const outlines = FOCUS_RULES.filter((rule) => !rule.forced).flatMap((rule) =>
      Array.from(rule.body.matchAll(/(?:^|[;\s])outline:\s*([^;]+);/g), (match) => match[1]!.trim()),
    );
    expect(outlines).toEqual(['var(--ds-radio-focus-ring-width, var(--ds-focus-ring-width)) solid transparent']);
    for (const rule of FOCUS_RULES.filter((rule) => rule.container === undefined)) {
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary/);
    }
  });

  it('paints the outline only for an authored family colour or a signature without an offset', () => {
    const coloured = FOCUS_RULES.filter((rule) => /outline-color:/.test(rule.body));
    expect(coloured.map((rule) => [rule.container, rule.selector, rule.body.trim()])).toEqual([
      [
        '@container not style(--ds-radio-focus-ring-color: var(--ds-focus-ring-color))',
        KEYBOARD,
        'outline-color: var(--ds-radio-focus-ring-color, transparent);',
      ],
      [
        '@container style(--ds-focus-ring-offset: 0px)',
        KEYBOARD,
        'outline-color: var(--ds-radio-focus-ring-color, var(--ds-focus-ring-color));',
      ],
    ]);
  });

  it('keeps a system-colour outline clear of the control in forced colors', () => {
    const forced = FOCUS_RULES.filter((rule) => rule.forced);
    expect(forced.map((rule) => rule.selector)).toEqual([KEYBOARD]);
    const body = forced[0]!.body;
    expect(body).toMatch(/outline:\s*max\(2px, var\(--ds-radio-focus-ring-width, var\(--ds-focus-ring-width\)\)\) solid Highlight;/);
    expect(body).toMatch(/outline-offset:\s*max\(2px, var\(--ds-radio-focus-ring-offset, var\(--ds-focus-ring-offset\)\)\);/);
    expect(body).toMatch(/box-shadow:\s*none;/);
  });
});
