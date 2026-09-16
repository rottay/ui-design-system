/**
 * A composite may name the Stack node it renders, and the Modern skin must still
 * lay that node out. The part belongs to the caller; the layout is keyed on the
 * owned `data-component` stamp, which no caller spread can remove.
 *
 * jsdom loads no skin, so the proof is Chromium's computed style. The default
 * root instance is the control: both must read identically.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernStack from '../engines/modern';
import { measureArms } from '@tests/support/family-causality';

type StackProps = React.ComponentProps<typeof ModernStack>;

function stack(props: Omit<StackProps, 'children'>): string {
  return renderToStaticMarkup(
    <ModernStack {...props}>
      <button type="button">One</button>
      <button type="button">Two</button>
    </ModernStack>,
  );
}

const ROW = { direction: 'horizontal', align: 'center', justify: 'space-between', spacing: 'lg', wrap: true } as const;
const COLUMN = { spacing: 'md', divider: true } as const;

const markup = [
  `<div id="owned">${stack({ ...ROW, 'data-part': 'mobile-layout' })}</div>`,
  `<div id="default">${stack(ROW)}</div>`,
  `<div id="ownedColumn">${stack({ ...COLUMN, 'data-part': 'panel' })}</div>`,
  `<div id="defaultColumn">${stack(COLUMN)}</div>`,
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

const NODE = "[data-component='stack']";

describe('Stack with a caller-owned data-part', () => {
  it('keeps the caller part in the DOM', () => {
    expect(markup).toContain('data-part="mobile-layout"');
    expect(markup).toContain('data-part="panel"');
    expect(markup).toContain('data-part="root"');
    expect(markup.match(/data-component="stack"/g)).toHaveLength(4);
  });

  it('receives the same skin layout as the default root', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        ...['owned', 'default', 'ownedColumn', 'defaultColumn'].flatMap((scope) =>
          PROPERTIES.map((property) => ({
            id: `${scope}:${property}`,
            selector: `#${scope} > ${NODE}`,
            property,
          })),
        ),
        ...['ownedColumn', 'defaultColumn'].flatMap((scope) =>
          ['margin-top', 'flex-basis'].map((property) => ({
            id: `${scope}:divider:${property}`,
            selector: `#${scope} > ${NODE} > [data-part='divider']`,
            property,
          })),
        ),
      ],
    });
    const r = result.base!;

    expect(r['owned:display']).toBe('flex');
    expect(r['owned:flex-direction']).toBe('row');
    expect(r['owned:flex-wrap']).toBe('wrap');
    expect(r['owned:justify-content']).toBe('space-between');
    expect(r['owned:align-items']).toBe('center');
    expect(r['owned:column-gap']).not.toBe('normal');
    expect(r['owned:min-inline-size']).toBe('0px');

    expect(r['ownedColumn:display']).toBe('flex');
    expect(r['ownedColumn:flex-direction']).toBe('column');
    expect(r['ownedColumn:divider:margin-top']).not.toBe('0px');

    for (const property of PROPERTIES) {
      expect(r[`owned:${property}`], property).toBe(r[`default:${property}`]);
      expect(r[`ownedColumn:${property}`], property).toBe(r[`defaultColumn:${property}`]);
    }
    for (const property of ['margin-top', 'flex-basis']) {
      expect(r[`ownedColumn:divider:${property}`], property).toBe(r[`defaultColumn:divider:${property}`]);
    }
  }, 60_000);

  it('places the row on the inline axis in LTR and RTL', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: (['ltr', 'rtl'] as const).flatMap((dir) =>
        ['owned', 'default'].flatMap((scope) =>
          [1, 2].map((child) => ({
            id: `${dir}:${scope}:${child}`,
            selector: `#${scope} > ${NODE} > button:nth-child(${child})`,
            property: '@rect.left',
            dir,
          })),
        ),
      ),
    });
    const r = result.base!;

    expect(Number(r['ltr:owned:1'])).toBeLessThan(Number(r['ltr:owned:2']));
    expect(Number(r['rtl:owned:1'])).toBeGreaterThan(Number(r['rtl:owned:2']));
    for (const dir of ['ltr', 'rtl']) {
      for (const child of [1, 2]) {
        expect(r[`${dir}:owned:${child}`]).toBe(r[`${dir}:default:${child}`]);
      }
    }
  }, 60_000);

  it('does not lay out a node that merely borrows the root part (negative control)', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="forged"><div class="rottay-stack rottay-stack--modern" data-part="root" data-direction="horizontal"></div></div>`,
      arms: { base: {} },
      targets: [{ id: 'display', selector: '#forged > div', property: 'display' }],
    });
    expect(result.base!.display).toBe('block');
  }, 60_000);
});
