import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernKanbanBoard from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css',
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

const CARD_FOCUS =
  ".ds-pattern-kanban-board.ds-engine-modern[data-part='root'] > [data-part='board'] > [data-part='column'] > [data-part='column-body'] > [data-part='card-list'] > [data-part='card']:is([data-state~='focus-visible'], :focus-visible)";
const CARD_CARRIER = `${CARD_FOCUS}:not(:focus-within:not(:focus))::after`;

interface Story {
  id: string;
  title: string;
}

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', items: [{ id: 'story-1', title: 'Draft the offer letter' }] },
  { id: 'done', title: 'Done', items: [] as Story[] },
];

describe('Modern PatternKanbanBoard — the card carries the tenant focus signature', () => {
  it('renders the card as a tab stop on the exact chain the skin selects, inside the scrolling list', () => {
    const { container } = render(
      <ModernKanbanBoard<Story>
        columns={COLUMNS}
        itemKey={(story) => story.id}
        renderCard={(story) => <span>{story.title}</span>}
        onItemMove={vi.fn()}
      />,
    );

    const card = screen.getByRole('listitem');
    expect(card).toHaveAttribute('data-part', 'card');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card.parentElement).toHaveAttribute('data-part', 'card-list');
    expect(
      container.querySelector(
        ".ds-pattern-kanban-board.ds-engine-modern[data-part='root'] > [data-part='board'] > [data-part='column'] > [data-part='column-body'] > [data-part='card-list'] > [data-part='card']",
      ),
    ).toBe(card);
  });

  it('clips its cards in the list, which is why the signature cannot paint outward', () => {
    const list = AUTHORED.find(
      (rule) => rule.selector === ".ds-pattern-kanban-board.ds-engine-modern [data-part='card-list']",
    );
    expect(declarations(list?.body ?? '')).toContain('overflow-y: auto');
  });

  it('carries the signature on an overlay inset by its reach, never on a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRulesOf(AUTHORED)).toEqual([
      [
        CARD_FOCUS,
        [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: calc(-1 * var(--ds-focus-ring-width))',
        ],
      ],
      [
        CARD_CARRIER,
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
    expect(focusRulesOf(rulesOf(FORCED))).toEqual([
      [
        CARD_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
        ],
      ],
      [CARD_CARRIER, ['box-shadow: none']],
    ]);
  });
});
