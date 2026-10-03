import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTimeline from '../engines/modern';
import type { TimelineItem } from '../contracts';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css',
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
  ".ds-pattern-timeline.ds-engine-modern[data-part='root'] .ds-timeline-modern__item-card[data-part='item-card'][data-clickable='true']:is([data-state~='focus-visible'], :focus-visible)";
const CARD_HOVER_FOCUS =
  ".ds-pattern-timeline.ds-engine-modern[data-part='root'] .ds-timeline-modern__item-card[data-part='item-card'][data-clickable='true']:is([data-state~='hovered'], :hover):is([data-state~='focus-visible'], :focus-visible)";
const RESTING_SHADOW = '0 1px 2px 0 color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)';
const HOVER_SHADOW = '0 4px 6px -1px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)';

const items: TimelineItem[] = [
  { key: 'created', timestamp: new Date('2026-03-01T10:00:00Z'), title: 'Created' },
];

describe('Modern PatternTimeline — the clickable card wears the tenant focus signature', () => {
  it('makes a clickable card a tab stop the skin selects, and leaves a read-only card out', () => {
    const { container, unmount } = render(<ModernTimeline items={items} onItemClick={vi.fn()} />);
    const card = screen.getByRole('button', { name: /Created/ });
    expect(card).toHaveAttribute('data-part', 'item-card');
    expect(card).toHaveAttribute('data-clickable', 'true');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveClass('ds-timeline-modern__item-card');
    expect(container.querySelector('.ds-pattern-timeline.ds-engine-modern[data-part="root"]')).not.toBeNull();
    unmount();

    const readOnly = render(<ModernTimeline items={items} />);
    const still = readOnly.container.querySelector('[data-part="item-card"]');
    expect(still).not.toHaveAttribute('tabindex');
    expect(still).not.toHaveAttribute('data-clickable');
  });

  it('composes the signature ahead of the resting shadow, never a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRulesOf(AUTHORED)).toEqual([
      [
        CARD_FOCUS,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          `box-shadow: var(--ds-focus-ring), ${RESTING_SHADOW}`,
        ],
      ],
      [CARD_HOVER_FOCUS, [`box-shadow: var(--ds-focus-ring), var(--ds-shadow-md, ${HOVER_SHADOW})`]],
    ]);
    // A `none` hover elevation would void the whole shadow list, signature included.
    expect(SKIN.replace(/\s+/g, ' ')).toContain(
      `@container not style(--ds-shadow-md: none) { ${CARD_HOVER_FOCUS} { box-shadow: var(--ds-focus-ring), var(--ds-shadow-md, ${HOVER_SHADOW}); } }`,
    );
  });

  it('composes with the literal resting shadow of the card, which can never be none', () => {
    const resting = AUTHORED.find(
      (rule) =>
        rule.selector ===
        ".ds-pattern-timeline.ds-engine-modern[data-part='root'] .ds-timeline-modern__item-card[data-part='item-card']",
    );
    expect(declarations(resting?.body ?? '')).toContain(`box-shadow: ${RESTING_SHADOW}`);
  });

  it('keeps a system-colour outline for forced colors, where the signature is dropped', () => {
    expect(focusRulesOf(rulesOf(FORCED))).toEqual([
      [
        CARD_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
