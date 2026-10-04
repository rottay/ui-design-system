import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/operational-ledger/index.css',
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

const focusRules = (rules: Rule[]) =>
  rules.filter((rule) => /focus/.test(rule.selector)).map((rule) => [rule.selector, declarations(rule.body)]);

const ENTRIES: LedgerEntry[] = [
  {
    id: '1',
    timestamp: '2026-03-18T10:00:00.000Z',
    description: 'Stock received',
    quantity: 50,
    type: 'credit',
    actor: 'Warehouse Bot',
    reason: 'PO-1234',
  },
];

const REGION =
  ".ds-pattern-operational-ledger.ds-engine-modern [data-part='table-region']:is([data-state~='focus-visible'], :focus-visible)";
const CARRIER = `${REGION}:not(:focus-within:not(:focus))::before`;
const REACH = 'var(--ds-focus-ring-offset) + var(--ds-focus-ring-width)';

describe('OperationalLedger modern engine — the scroll region wears the tenant focus signature', () => {
  it('stamps the keyboard focus the skin selects, and none on a pointer focus', () => {
    render(<ModernOperationalLedger entries={ENTRIES} />);
    const region = screen.getByRole('region', { name: 'Ledger entries' });
    expect(region).toHaveAttribute('data-part', 'table-region');
    expect(region.tabIndex).toBe(0);
    expect(region.parentElement).toHaveAttribute('data-part', 'root');

    fireEvent.pointerDown(region);
    fireEvent.focus(region);
    expect(region.getAttribute('data-state') ?? '').not.toContain('focus-visible');
    fireEvent.pointerUp(region);
    fireEvent.blur(region);

    fireEvent.keyDown(document.body, { key: 'Tab' });
    fireEvent.focus(region);
    expect(region.getAttribute('data-state')).toContain('focus-visible');
  });

  it('carries the signature on an overlay hung from the root, never on a solid outline', () => {
    const rules = AUTHORED.filter((rule) => /focus/.test(rule.selector));
    expect(rules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(SKIN).not.toContain(':has(');

    expect(focusRules(AUTHORED)).toEqual([
      [
        REGION,
        ['outline: var(--ds-focus-ring-width) solid transparent', 'outline-offset: calc(-1 * var(--ds-focus-ring-width))'],
      ],
      [
        CARRIER,
        [
          'position: absolute',
          `inset: calc(${REACH})`,
          'z-index: var(--ds-z-index-relative-top, 10)',
          "content: ''",
          'border-radius: max(0px, calc(var(--ds-radius-lg) - var(--ds-edge-hairline-width, 1px) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)))',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
    ]);
  });

  it('positions the overlay against the clipping root, not the scrolling region', () => {
    const root = AUTHORED.find(
      (rule) => rule.selector === ".ds-pattern-operational-ledger.ds-engine-modern[data-part='root']",
    );
    expect(declarations(root?.body ?? '')).toEqual(expect.arrayContaining(['overflow: hidden', 'position: relative']));

    const region = AUTHORED.find(
      (rule) => rule.selector === ".ds-pattern-operational-ledger.ds-engine-modern [data-part='table-region']",
    );
    expect(declarations(region?.body ?? '').some((declaration) => /^position\s*:/.test(declaration))).toBe(false);
  });

  it('keeps a system-colour outline on the overlay in forced colors', () => {
    expect(focusRules(rulesOf(FORCED))).toEqual([
      [REGION, ['outline: none']],
      [
        CARRIER,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          `outline-offset: calc(${REACH} - max(2px, var(--ds-focus-ring-width)))`,
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
