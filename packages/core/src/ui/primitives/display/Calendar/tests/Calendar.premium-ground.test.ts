import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/calendar.css'),
  'utf8',
);

// Assertions here are about the BASE cascade, so conditional blocks
// (forced-colors, coarse pointers, reduced motion) are removed first.
function stripAtRules(css: string): string {
  let out = '';
  for (let i = 0; i < css.length; i++) {
    if (css.startsWith('@media', i)) {
      let depth = 0;
      let j = css.indexOf('{', i);
      for (; j < css.length; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}' && --depth === 0) break;
      }
      i = j;
      continue;
    }
    out += css[i];
  }
  return out;
}

const base = stripAtRules(skin);

function ruleBlock(css: string, selectorPart: string): string {
  const start = css.indexOf(selectorPart);
  if (start === -1) throw new Error(`No rule matching ${selectorPart}`);
  const open = css.indexOf('{', start + selectorPart.length - 1);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

const ROOT = ".rottay-calendar.rottay-calendar--modern[data-part='root'] {";
const CELL = "[data-part='root'] > [data-part='grid'] > [data-part='cell'] {";
const TODAY = "[data-part='cell'][data-today='true']:not([data-selected='true']) {";

describe('Calendar modern premium ground', () => {
  it('brings no ground of its own: the panel sits on the host surface', () => {
    const root = ruleBlock(base, ROOT);
    expect(root).not.toMatch(/(^|\s|;)background(-color)?\s*:/);
  });

  it('keeps the hairline region edge, which is a real boundary', () => {
    const root = ruleBlock(base, ROOT);
    expect(root).toContain('border: 1px solid var(--ds-calendar-border');
  });

  it('carries no resting shadow anywhere in the family', () => {
    const restingShadow = skin
      .split('\n')
      .filter((line) => /box-shadow:/.test(line))
      .filter((line) => !/none|focus|ring|Highlight/.test(line));
    expect(restingShadow).toEqual([]);
  });

  it('aligns the date grid on tabular figures', () => {
    const cell = ruleBlock(base, CELL);
    expect(cell).toContain('font-variant-numeric: tabular-nums');
  });

  it('keeps exactly one loud state: selected fills, today only rings', () => {
    expect(base).toMatch(/\[data-selected='true'\]\s*\{\s*background:\s*var\(--ds-color-primary\)/);
    const today = ruleBlock(base, TODAY);
    expect(today).toContain('border: 1px solid var(--ds-color-primary)');
    expect(today).not.toMatch(/(^|\s|;)background\s*:\s*var\(--ds-color-primary\)/);
  });
});
