import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tree/index.css'),
  'utf8',
);

function ruleBlock(css: string, selectorPart: string): string {
  const start = css.indexOf(selectorPart);
  if (start === -1) throw new Error(`No rule matching ${selectorPart}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

const SELECTED_ROW = "[data-part='row'][data-selected='true'] {";
const SELECTED_FOCUSED = "[data-part='row'][data-selected='true'][data-focused='true'] {";

describe('Tree modern premium ground', () => {
  it('gives the selected node no frame: it is emphasis, not a card', () => {
    const selected = ruleBlock(skin, SELECTED_ROW);
    expect(selected).not.toContain('box-shadow');
  });

  it('still separates the selected node on three non-border channels', () => {
    const selected = ruleBlock(skin, SELECTED_ROW);
    expect(selected).toContain('background:');
    expect(selected).toContain('color:');
    expect(selected).toContain('font-weight:');
  });

  it('composes selected with focus as the ring alone', () => {
    const compound = ruleBlock(skin, SELECTED_FOCUSED);
    expect(compound).toContain('box-shadow');
    expect(compound).not.toContain('inset');
  });

  it('never rules a divider between rows', () => {
    const rowRules = skin
      .split('}')
      .filter((rule) => /\[data-part='row'\]/.test(rule) && !/connector|drop-indicator/.test(rule));
    for (const rule of rowRules) {
      expect(rule).not.toMatch(/border-block-end\s*:|border-bottom\s*:/);
    }
  });

  it('sits on the host surface rather than painting a ground', () => {
    const root = ruleBlock(skin, ".rottay-tree.rottay-tree--modern[data-part='root'] {");
    expect(root).toContain('var(--ds-tree-bg)');
  });
});
