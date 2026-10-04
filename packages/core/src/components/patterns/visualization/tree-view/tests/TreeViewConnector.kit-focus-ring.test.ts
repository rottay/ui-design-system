/**
 * Kit focus law (commercial surfaces, section 2): the ring is a fixed 2px inversion
 * outline in the surface's own foreground, on every tenant focus signature.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/tree-view-connector/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const TARGET_CLASS = '.rt-tree-view__link';
const TARGET = `${TARGET_CLASS}:focus-visible`;

interface SkinRule {
  readonly selector: string;
  readonly body: string;
  readonly forced: boolean;
  readonly contrast: boolean;
}

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
          contrast: open.some((at) => at.includes('prefers-contrast: more')),
        });
      }
      start = index + 1;
    }
  }
  return rules;
}

function declaration(rule: SkinRule, property: string): string | undefined {
  return rule.body
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${property}:`))
    ?.slice(property.length + 1)
    .trim();
}

const FOCUS_RULES = skinRules(SKIN).filter((rule) => rule.selector === TARGET);

describe('tree-view-connector -- the kit focus ring is fixed, not the tenant signature', () => {
  it('paints a 2px inversion outline at a 2px offset on the focus target', () => {
    const resting = FOCUS_RULES.filter((rule) => !rule.forced && !rule.contrast);
    expect(resting).toHaveLength(1);
    expect(declaration(resting[0]!, 'outline')).toBe('2px solid var(--ds-surface-fg, currentColor)');
    expect(declaration(resting[0]!, 'outline-offset')).toBe('2px');
  });

  it('reads no tenant focus channel anywhere in the skin', () => {
    expect(SKIN.match(/--ds-focus-ring[a-z-]*/g) ?? []).toEqual([]);
    expect(SKIN).not.toMatch(/--ds-shadow-focus/);
  });

  it('never thins or removes the indicator in any context, forced colors included', () => {
    const touching = skinRules(SKIN).filter((rule) => rule.selector.includes(`${TARGET_CLASS}:focus`));
    expect(touching.length).toBeGreaterThan(0);
    for (const rule of touching) {
      const outline = declaration(rule, 'outline');
      if (outline !== undefined) expect(outline).toMatch(/^2px solid /);
      expect(declaration(rule, 'outline-style')).toBeUndefined();
      if (!rule.contrast) expect(declaration(rule, 'outline-width')).toBeUndefined();
    }
  });

  it('keeps the increased-contrast floor without the tenant channel that used to carry it', () => {
    const raised = FOCUS_RULES.filter((rule) => rule.contrast);
    expect(raised).toHaveLength(1);
    expect(raised[0]!.forced).toBe(false);
    expect(raised[0]!.body.split(';').map((entry) => entry.trim()).filter(Boolean)).toEqual(['outline-width: 3px']);
  });

  it('states the width the increased-contrast floor gives every other ring', () => {
    const floor = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/foundation/a11y/contrast/index.css'),
      'utf8',
    );
    const width = /--ds-focus-ring-width:\s*([^;]+);/.exec(floor)?.[1]?.trim();
    expect(width).toBe('3px');
    expect(declaration(FOCUS_RULES.filter((rule) => rule.contrast)[0]!, 'outline-width')).toBe(width);
  });
});
