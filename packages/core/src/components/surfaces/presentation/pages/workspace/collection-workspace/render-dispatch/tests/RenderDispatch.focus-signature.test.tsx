import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CollectionRenderDispatch } from '..';
import type { ColumnDef } from '../../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../../foundation/common/test-utils';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../../../foundation/tokens/css/presentation/components/skin/collection-workspace-render-dispatch/index.css',
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

const ROOT = '.ds-surface.ds-collection-render-dispatch';
const CARD_HOST = `${ROOT} .ds-collection-render-dispatch__card-item[data-part="card-item"]:has(.ds-collection-render-dispatch__card-activation.ds-collection-render-dispatch__card-activation:focus-visible)`;
const ACTIVATION = `${ROOT} .ds-collection-render-dispatch__card-activation.ds-collection-render-dispatch__card-activation`;
const BUTTON_ACTIVATION = `${ROOT} .ds-button.ds-collection-render-dispatch__card-activation.ds-collection-render-dispatch__card-activation`;
const OPEN_LINK = `${ROOT} a.ds-collection-render-dispatch__fallback-open-link.ds-collection-render-dispatch__fallback-open-link:is( [data-state~="focus-visible"], :focus-visible )`;

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];
const columns: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', accessorKey: 'name' }];

describe('CollectionRenderDispatch — card and open link wear the tenant focus signature', () => {
  it('hosts the hidden activation control inside the positioned card item the skin selects', async () => {
    const onRowClick = vi.fn();
    const { container } = renderSurface(
      <CollectionRenderDispatch<Row>
        viewMode="cards"
        data={rows}
        columns={columns}
        rowKey="id"
        onRowClick={onRowClick}
        viewModes={{ cards: { renderCard: (row) => <div>{row.name}</div> } }}
      />,
      { engine: 'modern' },
    );
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="card-activation"]')).toHaveLength(rows.length),
    );

    const activation = container.querySelector<HTMLElement>('[data-part="card-activation"]');
    expect(activation?.tagName).toBe('BUTTON');
    expect(activation).toHaveClass('ds-button');
    expect(activation).toHaveAttribute('type', 'button');
    expect(activation).toHaveAccessibleName('Open item 1');
    expect(activation).toHaveClass('ds-collection-render-dispatch__card-activation');
    expect(activation).not.toHaveAttribute('tabindex', '-1');
    expect(activation?.parentElement).toHaveAttribute('data-part', 'card-item');
    expect(activation?.parentElement).toHaveClass('ds-collection-render-dispatch__card-item');
    expect(activation?.closest('.ds-surface.ds-collection-render-dispatch')).not.toBeNull();

    const item = AUTHORED.find(
      (rule) => rule.selector === `${ROOT} .ds-collection-render-dispatch__card-item[data-part="card-item"]`,
    );
    expect(declarations(item?.body ?? '')).toContain('position: relative');

    fireEvent.click(activation as HTMLElement);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0);
  });

  it('keeps the Button overlay out of flow, without the Button chrome or boxed wrappers', () => {
    const hidden = AUTHORED.find((rule) => rule.selector === ACTIVATION);
    expect(declarations(hidden?.body ?? '')).toEqual(
      expect.arrayContaining([
        'position: absolute',
        'inline-size: 1px',
        'block-size: 1px',
        'overflow: hidden',
        'clip-path: inset(50%)',
        'pointer-events: none',
      ]),
    );

    const button = AUTHORED.find((rule) => rule.selector === BUTTON_ACTIVATION);
    expect(declarations(button?.body ?? '')).toEqual(
      expect.arrayContaining(['min-block-size: 0', 'box-shadow: none', 'transition: none']),
    );
    for (const property of ['position', 'overflow', 'inline-size', 'block-size', 'clip-path']) {
      expect(declarations(button?.body ?? '').some((d) => d.startsWith(`${property}:`))).toBe(false);
    }

    const wrappers = AUTHORED.find(
      (rule) =>
        rule.selector === `${BUTTON_ACTIVATION} :is([data-part="content"], [data-part="label"])`,
    );
    expect(declarations(wrappers?.body ?? '')).toContain('display: contents');
  });

  it('renders the open affordance as a composed Button when there is no destination', async () => {
    const { container } = renderSurface(
      <CollectionRenderDispatch<Row> viewMode="cards" data={rows} columns={columns} rowKey="id" onRowClick={vi.fn()} />,
      { engine: 'modern' },
    );
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="fallback-open-link"]')).toHaveLength(rows.length),
    );

    const open = container.querySelector<HTMLElement>('[data-part="fallback-open-link"]');
    expect(open?.tagName).toBe('BUTTON');
    expect(open).toHaveClass('ds-button');
  });

  it('carries the card signature on an inset overlay and paints the anchor signature directly, never a solid outline', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRulesOf(AUTHORED)).toEqual([
      [
        CARD_HOST,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: calc(-1 * var(--ds-focus-ring-width))',
        ],
      ],
      [
        `${CARD_HOST}::after`,
        [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          'z-index: var(--ds-z-index-relative-above, 1)',
          "content: ''",
          'border-radius: max( 0px, calc( var(--ds-collection-card-radius, var(--ds-radius-lg, 12px)) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width) ) )',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
      [
        OPEN_LINK,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('stacks no second indicator on the composed Button', () => {
    const stacked = [...AUTHORED, ...rulesOf(FORCED)].filter(
      (rule) =>
        /focus/.test(rule.selector) &&
        /fallback-open-link/.test(rule.selector) &&
        !/\ba\.ds-collection-render-dispatch__fallback-open-link/.test(rule.selector),
    );
    expect(stacked).toEqual([]);
  });

  it('swaps both for system-colour outlines in forced colors', () => {
    expect(focusRulesOf(rulesOf(FORCED))).toEqual([
      [
        CARD_HOST,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
        ],
      ],
      [`${CARD_HOST}::after`, ['box-shadow: none']],
      [
        OPEN_LINK,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
