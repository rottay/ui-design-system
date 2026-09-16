/**
 * `divider` is a part the Stack stamps on its own children, so a diff row that
 * is a direct Stack child must not reuse it. jsdom loads no skin: Chromium reads.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernStack from '../../../../primitives/layout/stack/engines/modern';
import { measureArms } from '@tests/support/family-causality';

function card(rowPart: string): string {
  return renderToStaticMarkup(
    <div className="ds-assistant-preview-diff-card" data-part="root">
      <ModernStack spacing="sm">
        <span>Title</span>
        <ModernStack data-part="head" direction="horizontal" spacing="sm" align="center">
          <span>Before</span>
          <span>After</span>
        </ModernStack>
        <ModernStack data-part={rowPart} direction="horizontal" spacing="sm" align="center">
          <span>Label</span>
          <span>Value</span>
        </ModernStack>
      </ModernStack>
    </div>,
  );
}

const SCOPES = {
  renamed: 'diff-row',
  collision: 'divider',
  forcedRoot: 'root',
} as const;

const markup = Object.entries(SCOPES)
  .map(([scope, part]) => `<div id="${scope}">${card(part)}</div>`)
  .join('');

const STACK_OWNED = ['align-self', 'flex-basis', 'flex-shrink', 'opacity', 'pointer-events', 'background-color'] as const;
const CARD_OWNED = ['padding-top', 'border-top-width', 'border-top-style'] as const;

const row = (scope: string) =>
  `#${scope} .ds-assistant-preview-diff-card > [data-component='stack'] > [data-component='stack']:nth-child(3)`;

describe('PreviewDiffCard row part', () => {
  it('stamps the row as a direct Stack child under its own part', () => {
    expect(markup).toContain('data-part="diff-row"');
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
      expect(r[`renamed:${property}`], property).toBe(r[`forcedRoot:${property}`]);
    }
    expect(r['collision:flex-basis']).not.toBe(r['renamed:flex-basis']);
    expect(r['collision:pointer-events']).toBe('none');

    expect(r['renamed:padding-top']).not.toBe('0px');
    expect(r['renamed:border-top-width']).toBe('1px');
    expect(r['renamed:border-top-style']).toBe('solid');
  }, 60_000);
});
