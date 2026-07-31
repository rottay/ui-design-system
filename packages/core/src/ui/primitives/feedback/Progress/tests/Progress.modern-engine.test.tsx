/**
 * Progress modern engine -- focused real-engine coverage (K1 Lane C).
 *
 * Exercises the real modern engine after the Daisy drain: no `progress` /
 * `progress-*` / `radial-progress` classes remain, percent clamps like the
 * rustic engine, the circle exposes full progressbar ARIA, and indeterminate
 * mode omits the value semantics per WAI-ARIA while rendering the canon
 * sliding bar / spinning arc hooks the skin animates.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernProgress from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Progress modern engine (post Daisy drain)', () => {
  it('line: carries no DaisyUI class and stamps data-type/data-status', () => {
    const { container } = renderWithEngine(
      <ModernProgress percent={42} status="success" />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-type', 'line');
    expect(root).toHaveAttribute('data-status', 'success');
    expect(root).toHaveAttribute('data-indeterminate', 'false');
    const tokens = `${root.className} ${(container.querySelector('[data-part="fill"]') as HTMLElement).className}`.split(/\s+/);
    for (const drained of ['progress', 'progress-primary', 'progress-success', 'progress-error', 'radial-progress']) {
      expect(tokens).not.toContain(drained);
    }
  });

  it('line: clamps percent into 0..100 (rustic parity)', () => {
    const { container } = renderWithEngine(<ModernProgress percent={150} />, 'modern');
    const fill = container.querySelector('[data-part="fill"]');
    expect(fill).toHaveAttribute('value', '100');
  });

  it('line: native element keeps determinate value semantics', () => {
    const { container } = renderWithEngine(<ModernProgress percent={64} />, 'modern');
    const fill = container.querySelector('[data-part="fill"]');
    expect(fill?.tagName).toBe('PROGRESS');
    expect(fill).toHaveAttribute('value', '64');
    expect(fill).toHaveAttribute('max', '100');
  });

  it('line indeterminate: omits value, renders the canon sliding bar part', () => {
    const { container } = renderWithEngine(<ModernProgress percent={0} indeterminate />, 'modern');

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-indeterminate', 'true');
    const fill = container.querySelector('[data-part="fill"]');
    expect(fill).not.toHaveAttribute('value');
    expect(container.querySelector('[data-part="indeterminate"]')).not.toBeNull();
    // An indeterminate meter has no value to report.
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });

  it('circle: single root with full progressbar ARIA and geometry hatches', () => {
    const { container } = renderWithEngine(
      <ModernProgress percent={60} type="circle" strokeWidth={10} />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-type', 'circle');
    expect(root).toHaveAttribute('role', 'progressbar');
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
    expect(root).toHaveAttribute('aria-valuenow', '60');
    expect(root.style.getPropertyValue('--ds-progress-circle-value')).toBe('60');
    expect(root.style.getPropertyValue('--ds-progress-circle-thickness')).toBe('10px');
    // The drained DaisyUI arc class must not reappear.
    expect(root.className.split(/\s+/)).not.toContain('radial-progress');
    expect(container.querySelector('[data-part="label"]')?.textContent).toBe('60%');
  });

  it('circle determinate: carries a localized accessible name including the percent (axe aria-progressbar-name)', () => {
    const { container } = renderWithEngine(
      <ModernProgress percent={65} type="circle" />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const name = root.getAttribute('aria-label') ?? '';
    // EN catalog components.progress.percent_complete = "{percent}% complete".
    expect(name.length).toBeGreaterThan(0);
    expect(name).toContain('65');
    expect(name).toBe('65% complete');
  });

  it('circle indeterminate: omits aria-valuenow and the label, carries a localized indeterminate name', () => {
    const { container } = renderWithEngine(
      <ModernProgress percent={0} type="circle" indeterminate />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('role', 'progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
    expect(root).toHaveAttribute('data-indeterminate', 'true');
    expect(container.querySelector('[data-part="label"]')).toBeNull();
    // EN catalog components.progress.indeterminate = "In progress".
    const name = root.getAttribute('aria-label') ?? '';
    expect(name.length).toBeGreaterThan(0);
    expect(name).toBe('In progress');
    expect(name).not.toContain('%');
  });

  it('strokeColor rides the shared arc hatch on both types', () => {
    const { container: line } = renderWithEngine(
      <ModernProgress percent={10} strokeColor="rebeccapurple" />,
      'modern',
    );
    expect(
      (line.querySelector('[data-part="root"]') as HTMLElement).style.getPropertyValue(
        '--ds-progress-arc-color',
      ),
    ).toBe('rebeccapurple');

    const { container: circle } = renderWithEngine(
      <ModernProgress percent={10} type="circle" strokeColor="rebeccapurple" />,
      'modern',
    );
    expect(
      (circle.querySelector('[data-part="root"]') as HTMLElement).style.getPropertyValue(
        '--ds-progress-arc-color',
      ),
    ).toBe('rebeccapurple');
  });
});
