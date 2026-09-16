/**
 * A composite may name the Grid node it renders, and the Modern skin must still
 * lay that node out. The part belongs to the caller; the layout is keyed on the
 * owned `data-component` stamp, which no caller spread can remove.
 *
 * jsdom loads no skin, so the proof is Chromium's computed style. The default
 * root instance is the control: both must read identically.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernGrid, { ModernGridItem } from '../engines/modern';
import { measureArms } from '@tests/support/family-causality';

type GridProps = React.ComponentProps<typeof ModernGrid>;

function grid(props: Omit<GridProps, 'children'>): string {
  return renderToStaticMarkup(
    <ModernGrid {...props}>
      <ModernGridItem>One</ModernGridItem>
      <ModernGridItem>Two</ModernGridItem>
    </ModernGrid>,
  );
}

const UNIFORM = { columns: 2, gap: 'md' } as const;
const SPLIT = { columns: 2, inline: true, gap: 'sm', columnGap: '2xl', motion: 'rearrange' } as const;

const markup = [
  `<div id="owned">${grid({ ...UNIFORM, 'data-part': 'results' })}</div>`,
  `<div id="default">${grid(UNIFORM)}</div>`,
  `<div id="ownedSplit">${grid({ ...SPLIT, 'data-part': 'gallery' })}</div>`,
  `<div id="defaultSplit">${grid(SPLIT)}</div>`,
].join('');

const PROPERTIES = ['display', 'column-gap', 'row-gap', 'min-inline-size', 'transition-duration'] as const;

const NODE = "[data-component='grid']";

describe('Grid with a caller-owned data-part', () => {
  it('keeps the caller part in the DOM', () => {
    expect(markup).toContain('data-part="results"');
    expect(markup).toContain('data-part="gallery"');
    expect(markup).toContain('data-part="root"');
    expect(markup.match(/data-component="grid"/g)).toHaveLength(4);
  });

  it('receives the same skin layout as the default root', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        ...['owned', 'default', 'ownedSplit', 'defaultSplit'].flatMap((scope) =>
          PROPERTIES.map((property) => ({
            id: `${scope}:${property}`,
            selector: `#${scope} > ${NODE}`,
            property,
          })),
        ),
        ...['owned', 'default'].map((scope) => ({
          id: `${scope}:cell:min-inline-size`,
          selector: `#${scope} > ${NODE} > [data-part='grid-cell']`,
          property: 'min-inline-size',
        })),
      ],
    });
    const r = result.base!;

    expect(r['owned:display']).toBe('grid');
    expect(r['owned:min-inline-size']).toBe('0px');
    expect(r['owned:column-gap']).not.toBe('normal');
    expect(r['owned:cell:min-inline-size']).toBe('0px');

    expect(r['ownedSplit:display']).toBe('inline-grid');
    expect(r['ownedSplit:column-gap']).not.toBe(r['ownedSplit:row-gap']);
    expect(r['ownedSplit:transition-duration']).not.toBe('0s');

    for (const property of PROPERTIES) {
      expect(r[`owned:${property}`], property).toBe(r[`default:${property}`]);
      expect(r[`ownedSplit:${property}`], property).toBe(r[`defaultSplit:${property}`]);
    }
    expect(r['owned:cell:min-inline-size']).toBe(r['default:cell:min-inline-size']);
  }, 60_000);

  it('places the tracks on the inline axis in LTR and RTL', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: (['ltr', 'rtl'] as const).flatMap((dir) =>
        ['owned', 'default'].flatMap((scope) =>
          [1, 2].map((child) => ({
            id: `${dir}:${scope}:${child}`,
            selector: `#${scope} > ${NODE} > [data-part='grid-cell']:nth-child(${child})`,
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
      markup: `<div id="forged"><div class="rottay-grid rottay-grid--modern" style="--ds-grid-gap:12px" data-part="root" data-inline="true" data-gap-preset="md"></div></div>`,
      arms: { base: {} },
      targets: [
        { id: 'display', selector: '#forged > div', property: 'display' },
        { id: 'gap', selector: '#forged > div', property: 'column-gap' },
      ],
    });
    // The modern framework bridge grants `.rottay-grid` a plain grid context
    // outside this skin, so the witness is the skin-only inline arm.
    expect(result.base!.display).not.toBe('inline-grid');
    expect(result.base!.gap).toBe('normal');
  }, 60_000);
});
