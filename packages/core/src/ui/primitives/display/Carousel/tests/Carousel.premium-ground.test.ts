import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/carousel.css'),
  'utf8',
);

function ruleBlock(css: string, selectorPart: string): string {
  const start = css.indexOf(selectorPart);
  if (start === -1) throw new Error(`No rule matching ${selectorPart}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

const ARROW_REST = "> [data-part='arrow'][data-direction] {";
const ARROW_HOVER = "> [data-part='arrow'][data-direction]:hover:not(:disabled) {";

describe('Carousel modern premium ground', () => {
  it('rests the arrows without elevation', () => {
    const rest = ruleBlock(skin, ARROW_REST);
    // A `box-shadow` entry inside `transition` is a mention, not a rest shadow.
    expect(rest).not.toMatch(/box-shadow\s*:/);
    expect(rest).not.toContain('--ds-elevation');
  });

  it('does not promote elevation on hover either', () => {
    const hover = ruleBlock(skin, ARROW_HOVER);
    expect(hover).not.toContain('--ds-elevation');
    // Hover still reads, on the ink and edge channels.
    expect(hover).toContain('color:');
    expect(hover).toContain('border-color:');
  });

  it('keeps the arrow ground, which legibility over arbitrary slide art requires', () => {
    const rest = ruleBlock(skin, ARROW_REST);
    expect(rest).toContain('background: var(--ds-surface-card)');
  });

  it('keeps the dot halo: a 0-offset legibility ring, not elevation', () => {
    expect(skin).toMatch(/box-shadow:\s*0 0 0 1px var\(--ds-carousel-dot-halo/);
    expect(skin).toMatch(/box-shadow:\s*0 0 0 1px var\(--ds-carousel-dot-ring/);
  });

  it('brings no ground on the root frame', () => {
    const root = ruleBlock(skin, ".rottay-carousel.rottay-carousel--modern[data-part='root'] {");
    expect(root).not.toMatch(/(^|\s|;)background(-color)?\s*:/);
    expect(root).not.toContain('box-shadow');
  });
});
