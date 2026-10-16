/**
 * The Modern Stack stamps its own part (ARC-12 M-P2), so a caller part never
 * reaches the diff row: the card paints the row through its class door
 * (`ds-assistant__diff-row`), and a caller `data-part="divider"` can no longer
 * pull the row into the Stack divider rule. jsdom loads no skin: Chromium reads.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernStack from '../../../../primitives/layout/stack/engines/modern';
import { measureArms } from '@tests/support/family-causality';

function card(row: { className?: string; part?: string }): string {
  return renderToStaticMarkup(
    <div className="ds-assistant-preview-diff-card" data-part="root">
      <ModernStack spacing="sm">
        <span>Title</span>
        <ModernStack data-part="head" direction="horizontal" spacing="sm" align="center">
          <span>Before</span>
          <span>After</span>
        </ModernStack>
        <ModernStack className={row.className} data-part={row.part} direction="horizontal" spacing="sm" align="center">
          <span>Label</span>
          <span>Value</span>
        </ModernStack>
      </ModernStack>
    </div>,
  );
}

const SCOPES = {
  hooked: { className: 'ds-assistant__diff-row' },
  collision: { className: 'ds-assistant__diff-row', part: 'divider' },
  bare: {},
} as const;

const markup = Object.entries(SCOPES)
  .map(([scope, row]) => `<div id="${scope}">${card(row)}</div>`)
  .join('');

const STACK_OWNED = ['align-self', 'flex-basis', 'flex-shrink', 'opacity', 'pointer-events', 'background-color'] as const;
const CARD_OWNED = ['padding-top', 'border-top-width', 'border-top-style'] as const;

const row = (scope: string) =>
  `#${scope} .ds-assistant-preview-diff-card > [data-component='stack'] > [data-component='stack']:nth-child(3)`;

describe('PreviewDiffCard row part', () => {
  it('stamps the row as the Stack root and carries the owner class door', () => {
    expect(markup).not.toContain('data-part="diff-row"');
    expect(markup).not.toContain('data-part="divider"');
    expect(markup.match(/class="rottay-stack rottay-stack--modern ds-assistant__diff-row"/g)).toHaveLength(2);
  });

  it('is not painted by the Stack divider rule and keeps the card row rule', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: Object.keys(SCOPES).flatMap((scope) =>
        [...STACK_OWNED, ...CARD_OWNED].map((property) => ({
          id: `${scope}:${property}`,
          selector: row(scope),
          property,
        })),
      ),
    });
    const r = result.base!;

    for (const property of STACK_OWNED) {
      expect(r[`hooked:${property}`], property).toBe(r[`bare:${property}`]);
      expect(r[`collision:${property}`], property).toBe(r[`bare:${property}`]);
    }
    expect(r['collision:pointer-events']).not.toBe('none');

    for (const scope of ['hooked', 'collision'] as const) {
      expect(r[`${scope}:padding-top`], scope).not.toBe('0px');
      expect(r[`${scope}:border-top-width`], scope).toBe('1px');
      expect(r[`${scope}:border-top-style`], scope).toBe('solid');
    }
  }, 60_000);
});
