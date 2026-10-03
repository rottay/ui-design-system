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

const REGION_HOST =
  ".ds-pattern-shift-matrix.ds-engine-modern[data-part='root']:has(> [data-part='table-region']:is([data-state~='focus-visible'], :focus-visible))";
const REGION_FOCUS =
  ".ds-pattern-shift-matrix.ds-engine-modern [data-part='table-region']:is([data-state~='focus-visible'], :focus-visible)";
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

    expect(
      focusRules
        .filter((rule) => rule.selector.startsWith(CELL_FOCUS))
        .map((rule) => [rule.selector, declarations(rule.body)]),
    ).toEqual([
      [
        `${CELL_FOCUS}::after`,
        [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          "content: ''",
          'border-radius: max( 0px, calc(var(--_ds-button-resolved-radius) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)) )',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
    ]);
  });

  it('keeps the scroll region a named tab stop that is a direct child of the clipping root', () => {
    render(
      <ModernShiftMatrix
        roles={['Bartender']}
        timeSlots={[{ label: '18:00-21:00', start: '18:00', end: '21:00' }]}
        assignments={[{ role: 'Bartender', timeSlot: '18:00-21:00', assigned: 2, required: 3 }]}
      />,
    );

    const region = screen.getByRole('region', { name: 'Shift coverage matrix' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.parentElement).toHaveAttribute('data-part', 'root');
    expect(region.parentElement).toHaveClass('ds-pattern-shift-matrix', 'ds-engine-modern');
  });

  it('dresses the root in the signature while the clipped region holds focus', () => {
    const regionRules = AUTHORED.filter(
      (rule) => rule.selector.startsWith(REGION_HOST) || rule.selector === REGION_FOCUS,
    );
    expect(regionRules.filter(paintsSolidOutline)).toEqual([]);
    expect(regionRules.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        REGION_HOST,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
      [REGION_HOST, ['box-shadow: var(--ds-focus-ring), var(--ds-elevation-1)']],
      [
        `${REGION_HOST}::after`,
        [
          'position: absolute',
          'inset: 0',
          'z-index: var(--_ds-shift-matrix-focus-z, 4)',
          "content: ''",
          'border-radius: inherit',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
      [REGION_FOCUS, ['outline: none']],
    ]);
    // A `none` elevation would void the whole shadow list, signature included.
    expect(SKIN.replace(/\s+/g, ' ')).toContain(
      `@container not style(--ds-elevation-1: none) { ${REGION_HOST} { box-shadow: var(--ds-focus-ring), var(--ds-elevation-1); } }`,
    );
  });

  it('swaps the overlays for system-colour outlines in forced colors', () => {
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
      [
        REGION_HOST,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
      [`${REGION_HOST}::after`, ['box-shadow: none']],
    ]);
  });
});
