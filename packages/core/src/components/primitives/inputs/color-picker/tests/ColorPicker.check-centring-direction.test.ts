/**
 * WO-INV-01 -- the selected-preset checkmark is centred in BOTH reading
 * directions.
 *
 * The defect: the modern skin anchors the check with a LOGICAL
 * `inset-inline-start: 50%` while the producer pulled it back with a PHYSICAL
 * `translate(-50%, ...)`. Under `dir=rtl` the anchored edge becomes the right
 * one and the pull-back keeps travelling left, so the glyph lands its whole
 * width off the swatch centre (measured in Chromium: 12px on a 20px swatch --
 * see the sibling `*.browser-geometry.integration.test.ts`).
 *
 * WHY THIS FILE DERIVES THE CASCADE INSTEAD OF READING getComputedStyle:
 * happy-dom does not implement `:dir()` at all (`element.matches(':dir(rtl)')`
 * is false and a later `:dir(rtl)` rule never wins), and it does not inherit a
 * custom property declared on an ancestor, so a DOM-computed assertion here
 * would resolve the `:root` value in both directions and pass vacuously. The
 * channel is therefore resolved the way the cascade resolves it -- last
 * matching declaration of the applicable rules -- and the REAL computed matrix
 * is measured in the Chromium sibling. The stroke geometry (border-left +
 * border-bottom) is deliberately NOT mirrored: glyph-geometry ruling.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../../..');

const producer = readFileSync(
  resolve(PACKAGE_ROOT, 'src/foundation/tokens/css/presentation/components/color-picker/index.css'),
  'utf8',
);
const skin = readFileSync(
  resolve(PACKAGE_ROOT, 'src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css'),
  'utf8',
);
const engine = readFileSync(
  resolve(PACKAGE_ROOT, 'src/components/primitives/inputs/color-picker/engines/modern/index.tsx'),
  'utf8',
);

const CHANNEL = '--ds-color-picker-check-transform';

/** Every `selector { ... }` block of a stylesheet, in declaration order. */
function rules(css: string): { selector: string; body: string }[] {
  const stripped = css.replace(/\/\*[^]*?\*\//g, '');
  return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.trim(),
    body: match[2]!,
  }));
}

/**
 * The value the cascade hands an element of the given directionality. The
 * applicable rules here are `:root` (0,1,0) and the `:dir()` twin (0,2,0);
 * the twin out-specifies the root, so the last applicable declaration wins.
 */
function resolveChannel(direction: 'ltr' | 'rtl'): string {
  const applicable = rules(producer).filter((rule) => {
    if (rule.selector.includes(':dir(')) return rule.selector.includes(`:dir(${direction})`);
    return true;
  });
  const declarations = applicable
    .flatMap((rule) => [...rule.body.matchAll(new RegExp(`${CHANNEL}\\s*:\\s*([^;]+);`, 'g'))])
    .map((match) => match[1]!.trim());
  expect(declarations.length).toBeGreaterThan(0);
  return declarations[declarations.length - 1]!;
}

describe('ColorPicker selected-check centring channel', () => {
  it('pulls the check back toward the inline-start edge in each direction', () => {
    expect(resolveChannel('ltr')).toBe('translate(-50%, -65%) rotate(-45deg)');
    expect(resolveChannel('rtl')).toBe('translate(50%, -65%) rotate(-45deg)');
  });

  it('keeps the same glyph in both directions: only the x offset differs', () => {
    const ltr = resolveChannel('ltr');
    const rtl = resolveChannel('rtl');
    expect(ltr.replace('translate(-50%', 'translate(50%')).toBe(rtl);
    // The rotation is what draws the tick; mirroring it would draw it backwards.
    expect(rtl).toContain('rotate(-45deg)');
  });

  it('mirrors on the part itself, so a portalled panel is judged by its own direction', () => {
    expect(producer).toContain("[data-part='preset-swatch']:dir(rtl) {");
  });

  it('still anchors the check with the logical edge the mirror is paired with', () => {
    const checkRule = rules(skin).find((rule) =>
      rule.selector.includes("[data-part='preset-swatch'][data-selected='true']::after"),
    );
    expect(checkRule?.body).toContain('inset-inline-start: 50%;');
    expect(checkRule?.body).toContain(`transform: var(${CHANNEL});`);
    // Glyph geometry: the two strokes stay physical by ruling.
    expect(checkRule?.body).toContain('border-left:');
    expect(checkRule?.body).toContain('border-bottom:');
  });

  it('is keyed on the anatomy the engine actually stamps', () => {
    expect(engine).toContain("partAttributes('preset-swatch'");
    expect(engine).toContain('data-selected={selected || undefined}');
  });
});
