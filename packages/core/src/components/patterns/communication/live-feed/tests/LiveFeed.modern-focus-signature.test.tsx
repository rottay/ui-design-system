import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernLiveFeed from '../engines/modern';
import type { FeedItem } from '../contracts';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css',
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

type Item = FeedItem & { title: string };

const items: Item[] = [
  { key: 'a', title: 'First' },
  { key: 'b', title: 'Second' },
];

const BUTTON_PARTS = ['refresh', 'banner', 'load-more'];

const REGION =
  ".ds-pattern-live-feed.ds-engine-modern [data-part='viewport']:is([data-state~='focus-visible'], :focus-visible)";

const settle = () => act(async () => {});

function renderFeed(maxHeight?: number) {
  return render(
    <ModernLiveFeed
      items={items}
      renderItem={(item: Item) => <div>{item.title}</div>}
      onRefresh={vi.fn()}
      newItemsCount={2}
      onShowNewItems={vi.fn()}
      hasMore
      onLoadMore={vi.fn()}
      maxHeight={maxHeight}
    />,
  );
}

describe('LiveFeed modern engine — composed controls wear the Button focus signature', () => {
  it('renders refresh, banner and load-more as tab-reachable DS Buttons', async () => {
    const { container } = renderFeed(120);
    await settle();

    for (const part of BUTTON_PARTS) {
      const node = container.querySelector(`[data-part="${part}"]`);
      expect(node?.tagName, part).toBe('BUTTON');
      expect(node).toHaveClass('ds-button', 'ds-button--modern');
      expect(node).not.toHaveAttribute('tabindex', '-1');
    }
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        rule.selector.includes(`[data-part='${part}']`),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });
});

describe('LiveFeed modern engine — the feed region wears the tenant focus signature', () => {
  it('is a tab stop when bounded and a script-only focus target otherwise', async () => {
    const bounded = renderFeed(120);
    await settle();
    const region = bounded.container.querySelector<HTMLElement>('[data-part="viewport"]');
    expect(region?.tabIndex).toBe(0);
    expect(region).toHaveAttribute('role', 'region');
    expect(region?.parentElement).toHaveAttribute('data-part', 'body');
    expect(region?.parentElement?.parentElement).toHaveAttribute('data-part', 'root');
    bounded.unmount();

    const unbounded = renderFeed();
    await settle();
    expect(unbounded.container.querySelector<HTMLElement>('[data-part="viewport"]')?.tabIndex).toBe(-1);
  });

  it('receives the hand-off from the banner and stamps the state the skin selects', async () => {
    const { container } = renderFeed();
    await settle();
    const region = container.querySelector<HTMLElement>('[data-part="viewport"]');

    fireEvent.click(screen.getByRole('button', { name: /new items/ }));
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.body, { key: 'Tab' });
    fireEvent.blur(region as HTMLElement);
    fireEvent.focus(region as HTMLElement);
    expect(region?.getAttribute('data-state')).toContain('focus-visible');
  });

  it('dresses the region in the signature, never in a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));
    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(SKIN).not.toContain(':has(');

    expect(focusRules.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        REGION,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('keeps a system-colour outline in forced colors', () => {
    expect(
      rulesOf(FORCED)
        .filter((rule) => /focus/.test(rule.selector))
        .map((rule) => [rule.selector, declarations(rule.body)]),
    ).toEqual([
      [
        REGION,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      ],
    ]);
  });
});
