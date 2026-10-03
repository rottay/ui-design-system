import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pricing-table/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  declarations: string[];
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    declarations: match[2]
      .split(';')
      .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
  }));
}

function forcedColorsBlock(css: string): string {
  const start = css.indexOf('@media (forced-colors: active)');
  if (start === -1) return '';
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

const paintsSolidOutline = (rule: Rule) =>
  rule.declarations.some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));
const focusRules = (rules: Rule[]) => rules.filter((rule) => rule.selector.includes('focus-visible'));

const FOCUS =
  ".ds-pattern-pricing-table.ds-engine-modern[data-part='root'] .ds-pricing-table__feature-label:is([data-state~='focus-visible'], :focus-visible)";

describe('ModernPricingTable — the described feature label wears the tenant focus signature', () => {
  it('paints the signature with box-shadow, never a solid outline', () => {
    expect(focusRules(AUTHORED).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules(AUTHORED)).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'border-block-end-style: solid',
          'color: var(--ds-color-primary)',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      },
    ]);
  });

  it('keeps a system-colour outline in forced colors', () => {
    expect(focusRules(rulesOf(FORCED))).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      },
    ]);
  });
});
