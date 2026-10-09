import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCalendarView from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pattern-calendar-view/index.css',
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
    (declaration) =>
      /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const focusRulesOf = (rules: Rule[]) =>
  rules
    .filter((rule) => /focus/.test(rule.selector))
    .map((rule): [string, string[]] => [rule.selector, declarations(rule.body)]);

const GRID = ".ds-pattern-calendar-view.ds-engine-modern[data-part='root'] > [data-part='grid']";
const CELL_FOCUS = `${GRID} [data-part='day-cell'][data-empty='false']:is([data-state~='focus-visible'], :focus-visible)`;
const CELL_CARRIER = `${CELL_FOCUS}:not(:focus-within:not(:focus))::after`;
const CHIP_FOCUS = `${GRID} [data-part='day-cell'] .ds-pattern-calendar-view__event:is([data-state~='focus-visible'], :focus-visible)`;

const CURRENT = new Date(2026, 2, 13, 10);
const EVENTS = [
  { id: 'evt-1', title: 'Launch planning', start: CURRENT, end: new Date(2026, 2, 13, 11) },
  { id: 'evt-2', title: 'Panel interview', start: new Date(2026, 2, 13, 12), end: new Date(2026, 2, 13, 13) },
];

function mount() {
  return render(
    <ModernCalendarView
      events={EVENTS}
      view="month"
      currentDate={CURRENT}
      onDateChange={vi.fn()}
      onViewChange={vi.fn()}
      onEventClick={vi.fn()}
      onDateClick={vi.fn()}
    />,
  );
}

describe('Modern PatternCalendarView — cells and chips wear the tenant focus signature', () => {
  it('keeps one roving tab stop among the day cells and reaches chips through the cell', () => {
    const { container } = mount();

    const cells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="day-cell"][data-empty="false"]'),
    );
    expect(cells.length).toBeGreaterThan(27);
    expect(cells.filter((cell) => cell.tabIndex === 0)).toHaveLength(1);
    expect(cells.every((cell) => cell.getAttribute('role') === 'gridcell')).toBe(true);

    const chips = Array.from(container.querySelectorAll<HTMLElement>('[data-part="event"]'));
    expect(chips).toHaveLength(2);
    expect(chips.every((chip) => chip.tabIndex === -1)).toBe(true);

    const busy = chips[0].closest<HTMLElement>('[data-part="day-cell"]');
    expect(busy).not.toBeNull();
    act(() => busy?.focus());
    fireEvent.keyDown(busy as HTMLElement, { key: 'F2' });
    expect(document.activeElement).toBe(chips[0]);
    fireEvent.keyDown(chips[0], { key: 'Escape' });
    expect(document.activeElement).toBe(busy);
  });

  it('clips its cells in the grid, which is why the cell signature cannot paint outward', () => {
    const grid = AUTHORED.find((rule) => rule.selector === GRID);
    expect(declarations(grid?.body ?? '')).toContain('overflow: hidden');
  });

  it('carries the cell signature on an inset overlay and paints the chip signature on the chip, never a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRulesOf(AUTHORED)).toEqual([
      [
        CELL_FOCUS,
        [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: calc(-1 * var(--ds-focus-ring-width))',
        ],
      ],
      [
        CELL_CARRIER,
        [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          "content: ''",
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
      [
        CHIP_FOCUS,
        [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('wears the chip signature on the chip itself: no overlay, no clip margin, no private channel', () => {
    const everyRule = [...AUTHORED, ...rulesOf(FORCED)];
    /* P-88 (kernel/common, owner ruling 2026-10-06): the chip is keyed through its class door; the retired
       caller-part form stays in the filter as a reintroduction guard (rule vii). */
    const CHIP = /\.ds-pattern-calendar-view__event(?![\w-])|\[data-part='event'\]/;
    expect(everyRule.filter((rule) => CHIP.test(rule.selector)).length).toBeGreaterThan(0);
    expect(
      everyRule.filter((rule) => new RegExp(`(?:${CHIP.source}).*::(before|after)`).test(rule.selector)).map((rule) => rule.selector),
    ).toEqual([]);
    expect(SKIN).not.toContain('overflow-clip-margin');
    expect(SKIN).not.toContain('--_ds-calendar-view-focus-clip');
    expect(SKIN).not.toContain('@supports (overflow');
  });

  it('leaves the selected frame on the cell itself, under the overlay', () => {
    const selected = AUTHORED.find(
      (rule) => rule.selector === `${GRID} [data-part='day-cell'][data-selected='true']`,
    );
    expect(selected?.body).toMatch(/box-shadow:\s*inset 0 0 0/);
    expect(selected?.selector).not.toMatch(/::after/);
  });

  it('swaps both for system-colour outlines in forced colors', () => {
    expect(focusRulesOf(rulesOf(FORCED))).toEqual([
      [
        CELL_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
        ],
      ],
      [CELL_CARRIER, ['box-shadow: none']],
      [
        CHIP_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
