import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Meter, resolveMeterThreshold } from '..';

const meterOf = (container: HTMLElement): HTMLElement =>
  container.querySelector('[role="meter"]') as HTMLElement;

describe('resolveMeterThreshold', () => {
  it('returns none when no threshold member is authored', () => {
    expect(resolveMeterThreshold({ value: 50, min: 0, max: 100 })).toBe('none');
  });

  it('applies the WHATWG region algorithm on a full trio', () => {
    const base = { min: 0, max: 100, low: 60, high: 85, optimum: 100 };
    expect(resolveMeterThreshold({ ...base, value: 90 })).toBe('optimal');
    expect(resolveMeterThreshold({ ...base, value: 72 })).toBe('suboptimal');
    expect(resolveMeterThreshold({ ...base, value: 10 })).toBe('critical');
  });

  it('defaults missing members per WHATWG once any is authored', () => {
    // Only `low`: high←max(100), optimum←midpoint(50) < low → the low region
    // is optimal, the middle is suboptimal.
    expect(resolveMeterThreshold({ value: 30, min: 0, max: 100, low: 60 })).toBe('optimal');
    expect(resolveMeterThreshold({ value: 72, min: 0, max: 100, low: 60 })).toBe('suboptimal');
    // Only `optimum` at the ceiling: low←min/high←max make one region: optimal.
    expect(resolveMeterThreshold({ value: 5, min: 0, max: 100, optimum: 100 })).toBe('optimal');
  });

  it('sanitizes an inverted low/high pair instead of going silent', () => {
    // high clamps up to low, so the algorithm still resolves a region.
    expect(
      resolveMeterThreshold({ value: 90, min: 0, max: 100, low: 80, high: 20, optimum: 100 })
    ).toBe('optimal');
  });

  it('is fail-closed on a collapsed or non-finite range', () => {
    expect(resolveMeterThreshold({ value: 50, min: 100, max: 0, low: 10 })).not.toBe(
      undefined
    );
    expect(resolveMeterThreshold({ value: Number.NaN, min: 0, max: 100 })).toBe('none');
  });
});

describe('Meter', () => {
  it('carries the full meter semantics with sanitized bounds', () => {
    const { container } = render(<Meter value={72} label="Storage" />);
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
    expect(meter.getAttribute('aria-valuenow')).toBe('72');
    expect(meter.getAttribute('aria-labelledby')).not.toBeNull();
  });

  it('collapses a NaN reading to an EMPTY meter, never a full one', () => {
    const { container } = render(<Meter value={Number.NaN} label="Storage" />);
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuenow')).toBe('0');
    const fill = container.querySelector('[data-part="fill"]') as HTMLElement;
    expect(fill.style.getPropertyValue('--_meter-ratio')).toBe('0');
  });

  it('clamps an out-of-range reading for geometry AND aria-valuenow', () => {
    const { container } = render(<Meter value={500} label="Storage" />);
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuenow')).toBe('100');
    const value = container.querySelector(
      '[data-part="header"] [data-part="value"]'
    ) as HTMLElement;
    expect(value.textContent).toBe('100');
  });

  it('rejects +/- Infinity fail-closed (an empty meter, like NaN)', () => {
    const positive = render(<Meter value={Number.POSITIVE_INFINITY} label="Up" />);
    expect(meterOf(positive.container).getAttribute('aria-valuenow')).toBe('0');
    const negative = render(<Meter value={Number.NEGATIVE_INFINITY} label="Down" />);
    expect(meterOf(negative.container).getAttribute('aria-valuenow')).toBe('0');
  });

  it('resolves min >= max to a non-degenerate ARIA range and an empty bar', () => {
    const { container } = render(<Meter value={50} min={10} max={5} label="Broken" />);
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuemin')).toBe('10');
    expect(meter.getAttribute('aria-valuemax')).toBe('11');
    expect(meter.getAttribute('aria-valuenow')).toBe('10');
    const fill = container.querySelector('[data-part="fill"]') as HTMLElement;
    expect(fill.style.getPropertyValue('--_meter-ratio')).toBe('0');
  });

  it('rejects an extreme floor that has no finite successor as a whole range', () => {
    const { container } = render(
      <Meter value={Number.MAX_VALUE} min={Number.MAX_VALUE} max={0} label="Extreme" />
    );
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
    expect(meter.getAttribute('aria-valuenow')).toBe('0');
  });

  it('engages thresholds (state, ticks, valuetext) from a partial contract', () => {
    const { container } = render(<Meter value={95} label="Quota" low={60} high={85} />);
    const root = container.querySelector('.ds-meter') as HTMLElement;
    // optimum defaults to the midpoint (middle region) → above high is critical.
    expect(root.getAttribute('data-threshold')).toBe('critical');
    expect(container.querySelectorAll('[data-part="tick"]')).toHaveLength(2);
    expect(meterOf(container).getAttribute('aria-valuetext')).toContain('critical range');
  });

  it('stays tone-only with no threshold members', () => {
    const { container } = render(<Meter value={40} label="Plain" tone="info" />);
    const root = container.querySelector('.ds-meter') as HTMLElement;
    expect(root.getAttribute('data-threshold')).toBe('none');
    expect(container.querySelectorAll('[data-part="tick"]')).toHaveLength(0);
    expect(meterOf(container).getAttribute('aria-valuetext')).toBe('40');
  });

  it('ring variant composes the arc substrate and keeps the meter semantics', () => {
    const { container } = render(<Meter value={25} variant="ring" aria-label="Score" />);
    const ring = container.querySelector('[data-part="ring"]') as HTMLElement;
    expect(ring.classList.contains('ds-arc')).toBe(true);
    expect(ring.getAttribute('role')).toBe('meter');
    expect(ring.getAttribute('aria-label')).toBe('Score');
    expect(ring.style.getPropertyValue('--_ds-arc-value')).toBe('25');
  });

  it('formats deterministically without an i18n provider (en floor)', () => {
    const { container } = render(<Meter value={0.5} min={0} max={1} format="percent" label="Half" />);
    const value = container.querySelector(
      '[data-part="header"] [data-part="value"]'
    ) as HTMLElement;
    expect(value.textContent).toBe('50%');
  });
});
