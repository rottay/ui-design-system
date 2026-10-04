/**
 * The HoverCard surface is never a focus target, so it paints no focus signature
 * and no forced-colors outline of its own: the control the keyboard holds inside
 * it wears its indicator. Its hook outline stays read, transparent by default.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css'), 'utf8').replace(
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

const SIGNATURE_RULES: string[] = [];

const FORCED_RULES: string[] = [];

describe('hover-card -- the frame is retired and the hook outline stays read', () => {
  it('paints no focus signature of its own', () => {
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
      expect(outline).toMatch(/(?:\btransparent|, var\(--ds-border-color-transparent\)\))$/);
    }
    expect(
      readFileSync(resolve(process.cwd(), 'src/foundation/tokens/css/foundation/base/borders/index.css'), 'utf8'),
    ).toMatch(/--ds-border-color-transparent:\s*transparent;/);
    for (const rule of FOCUS_RULES) {
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary/);
    }
  });

  it('adds no forced-colors outline over the focused control', () => {
    const forced = RULES.filter((rule) => rule.forced && /outline:\s*max\(2px, [^;]+\) solid Highlight/.test(rule.body)).map(
      (rule) => rule.selector,
    );
    expect(forced).toEqual(FORCED_RULES);
  });
});
