import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import ModernActivityLog from '../engines/modern';
import type { Activity } from '../contracts';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/activity-log/index.css'),
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
  ".ds-pattern-activity-log.ds-engine-modern [data-part='item-body'][data-interactive='true']:is([data-state~='focus-visible'], :focus-visible)";

const ACTIVITIES: Activity[] = [
  {
    id: '1',
    user: { name: 'Ann Lee' },
    action: 'updated',
    timestamp: '2026-10-01T10:00:00Z',
    diff: { title: { from: 'Engineer', to: 'Senior engineer' } },
  },
];

describe('ModernActivityLog — the interactive item body wears the tenant focus signature', () => {
  it('carries the signature on an overlay above the diff panel, never a solid outline', () => {
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
          "content: ''",
          'border-radius: inherit',
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

  it('keeps the item body a tab stop only when it is actionable', async () => {
    const interactive = render(<ModernActivityLog activities={ACTIVITIES} onActivityClick={vi.fn()} />);
    // The tab stop is the chrome-less Button stretched over the body.
    const activation = await interactive.findByRole('button');
    expect(activation.getAttribute('data-part')).toBe('item-activate');
    const body = activation.closest('[data-part="item-body"]');
    expect(body?.getAttribute('data-part')).toBe('item-body');
    expect(body?.getAttribute('data-interactive')).toBe('true');
    expect(activation.tabIndex).toBe(0);
    interactive.unmount();

    const passive = render(<ModernActivityLog activities={ACTIVITIES} />);
    const still = passive.container.querySelector<HTMLElement>('[data-part="item-body"]');
    expect(still?.getAttribute('data-interactive')).toBe('false');
    expect(still?.hasAttribute('tabindex')).toBe(false);
    expect(passive.queryByRole('button')).toBeNull();
  });
});
