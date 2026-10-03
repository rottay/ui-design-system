import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/stats-grid/index.css'),
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

const CARD = '.ds-pattern-stats-grid.ds-engine-modern .ds-stats-grid__card';
const FOCUS = `${CARD}[data-interactive="true"]:is([data-state~='focus-visible'], :focus-visible)`;

describe('ModernStatsGrid — the interactive card wears the tenant focus signature', () => {
  it('paints the signature with box-shadow, never a solid outline', () => {
    expect(focusRules(AUTHORED).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules(AUTHORED)).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      },
      {
        selector: `${CARD}[data-variant="default"][data-interactive="true"]:is([data-state~='focus-visible'], :focus-visible)`,
        declarations: ['box-shadow: var(--ds-focus-ring), var(--ds-elevation-1)'],
      },
      {
        selector: `${FOCUS}:is([data-state~='hovered'], :hover)`,
        declarations: ['box-shadow: var(--ds-focus-ring), var(--ds-elevation-2)'],
      },
    ]);
  });

  it('composes the elevation only where a `none` elevation cannot void the signature', () => {
    for (const level of ['1', '2']) {
      const guard = `@container not style(--ds-elevation-${level}: none)`;
      const at = SKIN.indexOf(guard);
      expect(at).toBeGreaterThan(-1);
      const guarded = SKIN.slice(at, SKIN.indexOf('}', SKIN.indexOf('}', at) + 1) + 1);
      expect(guarded).toContain(`box-shadow: var(--ds-focus-ring), var(--ds-elevation-${level})`);
      expect(SKIN.split(`var(--ds-focus-ring), var(--ds-elevation-${level})`)).toHaveLength(2);
    }
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
