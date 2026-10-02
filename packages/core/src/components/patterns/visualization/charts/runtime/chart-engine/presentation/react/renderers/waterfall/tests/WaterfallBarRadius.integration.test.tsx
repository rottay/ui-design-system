/**
 * The waterfall bar corner joins the radius dial. A caller that states
 * `barRadius` (0 included) owns the corner through the `rx` attribute; omitted,
 * the skin derives it from `--ds-radius-scale-normalized`, so every vertical at
 * rest paints the authored 2px and a moved dial re-measures the bars. Read as
 * computed `rx` in a real Chromium page.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { measureArms, type ProbeReadings, type ProbeTarget, type ProbeVertical } from '@tests/support/family-causality';

import { SvgWaterfallRenderer } from '..';

const TENANT: TenantConfig = {
  slug: 'waterfall-radius',
  name: 'Waterfall radius',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Waterfall radius' },
};

const DATA = [
  { label: 'Revenue', value: 420 },
  { label: 'COGS', value: -200 },
  { label: 'Net', value: 220, type: 'total' as const },
];

const CASES = { omitted: undefined, zero: 0, six: 6 } as const;
type CaseId = keyof typeof CASES;

function markup(vertical: ProbeVertical, interactive: boolean): string {
  return renderToStaticMarkup(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual(vertical, 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      {Object.entries(CASES).map(([id, barRadius]) => (
        <section key={id} data-probe={id}>
          <SvgWaterfallRenderer
            ariaLabel="Profit"
            width={600}
            height={360}
            responsive={false}
            data={DATA}
            {...(barRadius === undefined ? {} : { barRadius })}
            {...(interactive ? { interaction: { mode: 'explore' as const } } : {})}
          />
        </section>
      ))}
    </DesignSystemProvider>,
  );
}

const TARGETS: readonly ProbeTarget[] = (Object.keys(CASES) as CaseId[]).flatMap((id) => [
  { id: `${id}.bar`, selector: `[data-probe='${id}'] [data-part='bar'][data-status='increase']`, property: 'rx' },
  { id: `${id}.total`, selector: `[data-probe='${id}'] [data-part='bar'][data-status='total']`, property: 'rx' },
  { id: `${id}.halo`, selector: `[data-probe='${id}'] [data-part='interaction-halo']`, property: 'rx' },
]);

const VERTICALS: readonly ProbeVertical[] = ['rottay', 'bithire', 'evnto'];
const ARMS = { rest: {}, dialed: { 'shape.radius-scale': 1.2 } } as const;
/** `--ds-radius-scale-rest` per vertical: the dialed arm paints 2px * 1.2 / rest. */
const REST: Record<ProbeVertical, number> = { rottay: 1, bithire: 0.8, evnto: 1 };

describe('the waterfall renderer stamps rx only when the caller states barRadius', () => {
  const html = markup('rottay', true);
  const section = (id: CaseId) => html.split(`data-probe="${id}"`)[1]!.split('</section>')[0]!;

  it('omitted: neither the bars nor the halo carry an rx attribute', () => {
    expect(section('omitted')).not.toMatch(/\srx="/);
    expect(section('omitted')).not.toMatch(/\sry="/);
  });

  it('explicit 0 and 6 are stamped, the halo keeping its 4px floor', () => {
    expect(section('zero')).toMatch(/data-part="bar"[^>]*\srx="0" ry="0"/);
    expect(section('zero')).toMatch(/data-part="interaction-halo"[^>]*\srx="4"/);
    expect(section('six')).toMatch(/data-part="bar"[^>]*\srx="6" ry="6"/);
    expect(section('six')).toMatch(/data-part="interaction-halo"[^>]*\srx="6"/);
  });
});

describe.each(VERTICALS)('%s: the painted waterfall corner', (vertical) => {
  let readings: ProbeReadings;

  beforeAll(async () => {
    readings = await measureArms({ vertical, markup: markup(vertical, true), arms: ARMS, targets: TARGETS });
  }, 120_000);

  it('records the scene', () => {
    // eslint-disable-next-line no-console
    console.log(vertical, JSON.stringify(readings));
    expect(Object.values(readings.rest!).every((value) => !value.startsWith('<no match'))).toBe(true);
  });

  it('omitted: the vertical at rest paints the authored 2px', () => {
    expect(readings.rest!['omitted.bar']).toBe('2px');
    expect(readings.rest!['omitted.total']).toBe('2px');
    expect(readings.rest!['omitted.halo']).toBe('4px');
  });

  it('omitted: the moved dial re-measures the bars', () => {
    const expected = Math.round(((2 * 1.2) / REST[vertical]) * 1000) / 1000;
    expect(Number.parseFloat(readings.dialed!['omitted.bar']!)).toBeCloseTo(expected, 3);
    expect(Number.parseFloat(readings.dialed!['omitted.total']!)).toBeCloseTo(expected, 3);
    expect(readings.dialed!['omitted.bar']).not.toBe(readings.rest!['omitted.bar']);
  });

  it('explicit 0 wins over the dial in both arms', () => {
    for (const arm of ['rest', 'dialed'] as const) {
      expect(readings[arm]!['zero.bar']).toBe('0px');
      expect(readings[arm]!['zero.total']).toBe('0px');
      expect(readings[arm]!['zero.halo']).toBe('4px');
    }
  });

  it('explicit 6 wins over the dial in both arms', () => {
    for (const arm of ['rest', 'dialed'] as const) {
      expect(readings[arm]!['six.bar']).toBe('6px');
      expect(readings[arm]!['six.total']).toBe('6px');
      expect(readings[arm]!['six.halo']).toBe('6px');
    }
  });
});
