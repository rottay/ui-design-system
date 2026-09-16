/**
 * The aspect-ratio family in a real browser: the reserved box resolves from the
 * cascade when the caller states nothing, the crop channels reach both a direct
 * child and an art-directed `<picture>`, the frame transition answers the tenant
 * motion dial, and no gated vertical mode carries a serious axe finding beyond
 * the pinned ground debt.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernAspectRatio from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type FrameProps = React.ComponentProps<typeof ModernAspectRatio>;

function frame(props: Omit<FrameProps, 'children'>, children: React.ReactNode): string {
  return renderToStaticMarkup(
    <div style={{ inlineSize: '32rem' }}>
      <ModernAspectRatio {...props}>{children}</ModernAspectRatio>
    </div>,
  );
}

const markup = [
  `<div id="default">${frame({}, <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />)}</div>`,
  `<div id="square">${frame({ ratio: 1 }, <video aria-label="Intro" />)}</div>`,
  `<div id="capped">${frame({ maxWidth: 320 }, <canvas aria-label="Plot" />)}</div>`,
  `<div id="art">${frame({ ratio: 2 }, <picture><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></picture>)}</div>`,
].join('');

const ROOT = "#default [data-part='root']";

/**
 * NOT this family's debt: in bithire's dark mode the harness ground
 * `--ds-color-bg-primary` stays #FFFFFF while the ink follows the mode, so any
 * text in that scope fails the contrast floor. This family renders no text of
 * its own, so the scope is clean; the pin exists to make a new finding red.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'aspect-ratio',
  markup,
  targets: [
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
    { id: 'reserved', selector: ROOT, property: 'aspect-ratio' },
  ],
  decisions: {
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'reserved', in: VERTICALS },
  },
});

describe('aspect-ratio reserved box, crop policy and accessibility', () => {
  it('reserves the caller ratio and falls back to the cascade default', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'defaultRatio', selector: ROOT, property: 'aspect-ratio' },
        { id: 'squareRatio', selector: "#square [data-part='root']", property: 'aspect-ratio' },
        { id: 'cascadeDefault', selector: ROOT, property: '--ds-aspect-ratio-instance-ratio' },
        { id: 'cappedMeasure', selector: "#capped [data-part='root']", property: 'max-inline-size' },
        { id: 'uncappedMeasure', selector: ROOT, property: 'max-inline-size' },
      ],
    });
    const r = result.base!;
    expect(r.squareRatio).toBe('1 / 1');
    expect(r.defaultRatio).not.toBe(r.squareRatio);
    expect(r.cascadeDefault!.trim().length).toBeGreaterThan(0);
    expect(r.cappedMeasure).toBe('320px');
    expect(r.uncappedMeasure).toBe('none');
  }, 60_000);

  it('crops a direct child and an art-directed picture through the same channels', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'directFit', selector: `${ROOT} > img`, property: 'object-fit' },
        { id: 'directPosition', selector: `${ROOT} > img`, property: 'object-position' },
        { id: 'pictureDisplay', selector: "#art [data-part='root'] > picture", property: 'display' },
        { id: 'pictureFit', selector: "#art [data-part='root'] > picture > img", property: 'object-fit' },
        { id: 'clip', selector: ROOT, property: 'overflow-x' },
      ],
    });
    const r = result.base!;
    expect(r.directFit).toBe('cover');
    expect(r.directPosition).toBe('50% 50%');
    expect(r.pictureDisplay).toBe('block');
    expect(r.pictureFit).toBe(r.directFit);
    expect(r.clip).toBe('hidden');
  }, 60_000);

  it('collapses the frame transition to the reduced-motion floor', async () => {
    const resting = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [{ id: 'duration', selector: ROOT, property: 'transition-duration' }],
    });
    const reduced = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [{ id: 'duration', selector: ROOT, property: 'transition-duration' }],
      environment: { reducedMotion: 'reduce' },
    });
    expect(Number.parseFloat(resting.base!.duration!)).toBeGreaterThan(0.05);
    expect(Number.parseFloat(reduced.base!.duration!)).toBeLessThan(0.001);
  }, 120_000);

  it('carries no serious axe finding beyond the pinned ground debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
