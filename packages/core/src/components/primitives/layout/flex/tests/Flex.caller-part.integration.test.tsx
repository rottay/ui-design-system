/**
 * A composite may name the Flex node it renders, and the Modern skin must still
 * lay that node out. The part belongs to the caller; the layout is keyed on the
 * owned `data-component` stamp, which no caller spread can remove.
 *
 * jsdom loads no skin, so the proof is Chromium's computed style. The default
 * root instance is the control: both must read identically.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernFlex from '../engines/modern';
import { measureArms } from '@tests/support/family-causality';

type FlexProps = React.ComponentProps<typeof ModernFlex>;

function flex(props: Omit<FlexProps, 'children'>): string {
  return renderToStaticMarkup(
    <ModernFlex {...props}>
      <button type="button">One</button>
      <button type="button">Two</button>
    </ModernFlex>,
  );
}

const LAYOUT = { align: 'center', justify: 'between', gap: 12, wrap: 'wrap' } as const;

const markup = [
  `<div id="owned">${flex({ ...LAYOUT, 'data-part': 'header' })}</div>`,
  `<div id="default">${flex(LAYOUT)}</div>`,
  `<div id="ownedColumn">${flex({ direction: 'column', inline: true, gap: ['sm', 'lg'], 'data-part': 'title-group' })}</div>`,
  `<div id="defaultColumn">${flex({ direction: 'column', inline: true, gap: ['sm', 'lg'] })}</div>`,
].join('');

const PROPERTIES = [
  'display',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'column-gap',
  'row-gap',
  'min-inline-size',
] as const;

const NODE = "[data-component='flex']";

describe('Flex with a caller-owned data-part', () => {
  it('keeps the caller part in the DOM', () => {
    expect(markup).toContain('data-part="header"');
    expect(markup).toContain('data-part="title-group"');
    expect(markup).toContain('data-part="root"');
  });

  it('receives the same skin layout as the default root', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: ['owned', 'default', 'ownedColumn', 'defaultColumn'].flatMap((scope) =>
        PROPERTIES.map((property) => ({
          id: `${scope}:${property}`,
          selector: `#${scope} > ${NODE}`,
          property,
        })),
      ),
    });
    const r = result.base!;

    expect(r['owned:display']).toBe('flex');
    expect(r['owned:flex-wrap']).toBe('wrap');
    expect(r['owned:justify-content']).toBe('space-between');
    expect(r['owned:align-items']).toBe('center');
    expect(r['owned:column-gap']).toBe('12px');
    expect(r['owned:row-gap']).toBe('12px');
    expect(r['owned:min-inline-size']).toBe('0px');

    expect(r['ownedColumn:display']).toBe('inline-flex');
    expect(r['ownedColumn:flex-direction']).toBe('column');
    expect(r['ownedColumn:column-gap']).not.toBe(r['ownedColumn:row-gap']);

    for (const property of PROPERTIES) {
      expect(r[`owned:${property}`], property).toBe(r[`default:${property}`]);
      expect(r[`ownedColumn:${property}`], property).toBe(r[`defaultColumn:${property}`]);
    }
  }, 60_000);

  it('does not lay out a node that merely borrows the root part (negative control)', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="forged"><div class="rottay-flex rottay-flex--modern" data-part="root" data-wrap="wrap"></div></div>`,
      arms: { base: {} },
      targets: [{ id: 'display', selector: '#forged > div', property: 'display' }],
    });
    expect(result.base!.display).toBe('block');
  }, 60_000);
});
