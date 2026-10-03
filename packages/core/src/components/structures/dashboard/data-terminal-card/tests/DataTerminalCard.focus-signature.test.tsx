import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { screen } from '@testing-library/react';

import { DataTerminalCard } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css'),
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

const FOCUS = '.ds-data-terminal-card__link:focus-visible';

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

describe('DataTerminalCard — the full-body link wears the tenant focus signature', () => {
  it('carries the signature on an overlay above the card, never a solid outline', () => {
    expect(focusRules(AUTHORED).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules(AUTHORED)).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      {
        selector: `${FOCUS}::after`,
        declarations: [
          'position: absolute',
          'inset: 0',
          'z-index: var(--ds-z-index-relative-above, 1)',
          "content: ''",
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
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
        ],
      },
      { selector: `${FOCUS}::after`, declarations: ['box-shadow: none'] },
    ]);
  });

  it.each([1, 2, 3, 4] as const)('wraps variant %i in the one link the overlay is hosted on', async (variant) => {
    const { container } = renderSurface(
      <DataTerminalCard
        variant={variant}
        label="Active pipelines"
        value={128450}
        icon={StubIcon}
        path="/dashboard"
      />,
      { engine: 'modern' },
    );
    await screen.findByText('128,450');

    const links = container.querySelectorAll<HTMLAnchorElement>('a.ds-data-terminal-card__link');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/dashboard');
    expect(links[0].querySelector('.ds-data-terminal-card[data-part="root"]')).not.toBeNull();
  });
});
