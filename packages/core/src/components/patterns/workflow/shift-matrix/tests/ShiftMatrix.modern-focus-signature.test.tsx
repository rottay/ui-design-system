import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernShiftMatrix from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/shift-matrix/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  body: string;
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    body: match[2],
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

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));

const declarations = (body: string) =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

const paintsSolidOutline = (rule: Rule) =>
  declarations(rule.body).some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const paintsFocusIndicator = (rule: Rule) =>
  /(^|[\s;])outline(-[a-z]+)?\s*:/.test(rule.body) || /--ds-(button-)?focus-ring/.test(rule.body);

const CELL_FOCUS =
  ".ds-pattern-shift-matrix.ds-engine-modern [data-part='cell-button']:is([data-state~='focus-visible'], :focus-visible)";

describe('Modern ShiftMatrix — the assignable cell wears the tenant focus signature', () => {
  it('renders the assignable cell as a tab-reachable DS Button inside its table cell', () => {
    render(
      <ModernShiftMatrix
        roles={['Bartender']}
        timeSlots={[{ label: '18:00-21:00', start: '18:00', end: '21:00' }]}
        assignments={[{ role: 'Bartender', timeSlot: '18:00-21:00', assigned: 2, required: 3 }]}
        onQuickAssign={vi.fn()}
      />,
    );

    const cell = screen.getByRole('button', { name: /Bartender, 18:00-21:00/ });
    expect(cell).toHaveAttribute('data-part', 'cell-button');
    expect(cell).toHaveClass('ds-button', 'ds-button--modern');
    expect(cell).not.toHaveAttribute('tabindex', '-1');
    expect(cell.parentElement?.tagName).toBe('TD');
  });

  it('carries the signature on an overlay inset by its reach, never on a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));
    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');

    expect(focusRules.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        `${CELL_FOCUS}::after`,
        [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          "content: ''",
          'border-radius: inherit',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
    ]);
  });

  it('swaps the overlay for an inset system-colour outline in forced colors', () => {
    expect(
      rulesOf(FORCED)
        .filter((rule) => /focus/.test(rule.selector))
        .map((rule) => [rule.selector, declarations(rule.body)]),
    ).toEqual([
      [
        CELL_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
        ],
      ],
      [`${CELL_FOCUS}::after`, ['box-shadow: none']],
    ]);
  });
});
