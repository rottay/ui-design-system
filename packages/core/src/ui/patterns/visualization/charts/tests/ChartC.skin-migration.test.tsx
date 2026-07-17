import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GaugeChart, SankeyChart, Sparkline } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const CHART_C_SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/chart-c.css'),
  'utf8'
);

const injectedStyles: HTMLStyleElement[] = [];

function injectStyles(css: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  injectedStyles.push(style);
  return style;
}

function computed(element: Element, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property).trim();
}

function happyDomWhereCompatibility(css: string): string {
  // happy-dom 20 parses :where() into cssRules but does not match it during
  // getComputedStyle(). Keep the real stylesheet installed, then mirror only
  // those declarations with their inner selector so computed-paint assertions
  // can execute. The source contract below pins the shipped selectors to
  // zero-specificity :where(); this compatibility text never ships.
  return [...css.matchAll(/:where\(([^{}]+)\)\s*\{([^{}]+)\}/g)]
    .map(([, selector, declarations]) => `${selector} { ${declarations} }`)
    .join('\n');
}

function installChartCSkin(): void {
  injectStyles(`
    :root {
      --ds-color-error: rgb(201, 11, 21);
      --ds-color-warning: rgb(202, 122, 22);
      --ds-color-success: rgb(23, 153, 73);
      --ds-color-text-primary: rgb(31, 41, 55);
      --ds-color-text-secondary: rgb(75, 85, 99);
      --ds-color-bg-primary: rgb(255, 255, 255);
      --ds-color-bg-tertiary: rgb(243, 244, 246);
      --ds-color-border-primary: rgb(209, 213, 219);
    }
    ${CHART_C_SKIN}
    ${happyDomWhereCompatibility(CHART_C_SKIN)}
  `);
}

afterEach(() => {
  for (const style of injectedStyles.splice(0)) style.remove();
});

describe('CK-E chart C skin migration', () => {
  it('uses the real skin for private gauge defaults while preserving every caller-owned color', async () => {
    installChartCSkin();
    const defaults = renderSurface(
      <GaugeChart
        value={50}
        width={400}
        height={260}
        responsive={false}
        legend
        animate={false}
        className="consumer-gauge"
      />
    );

    await waitFor(() => expect(defaults.container.querySelectorAll('[data-part="segment"]')).toHaveLength(3));

    const defaultSegments = [...defaults.container.querySelectorAll('[data-part="segment"]')];
    expect(defaultSegments.map((segment) => segment.getAttribute('data-tone'))).toEqual([
      'error',
      'warning',
      'success',
    ]);
    const defaultPaint = [
      'rgb(201, 11, 21)',
      'rgb(202, 122, 22)',
      'rgb(23, 153, 73)',
    ];
    for (const [index, segment] of defaultSegments.entries()) {
      expect(segment).toHaveAttribute('data-color-source', 'default');
      expect(segment).not.toHaveAttribute('fill');
      expect(computed(segment, 'fill')).toBe(defaultPaint[index]);
    }

    const defaultSwatches = [...defaults.container.querySelectorAll('[data-part="legend-swatch"]')];
    expect(defaultSwatches.map((swatch) => swatch.getAttribute('data-tone'))).toEqual([
      'error',
      'warning',
      'success',
    ]);
    const defaultInlinePaint = [
      'var(--ds-color-error)',
      'var(--ds-color-warning)',
      'var(--ds-color-success)',
    ];
    for (const [index, swatch] of defaultSwatches.entries()) {
      expect(swatch).toHaveAttribute('data-color-source', 'default');
      expect((swatch as HTMLElement).style.backgroundColor).toBe(defaultInlinePaint[index]);
      expect(computed(swatch, 'background-color')).toBe(defaultInlinePaint[index]);
    }

    // Both rules are ordinary author CSS. The SVG override wins because the
    // finite default selector is zero-specificity; the swatch remains caller-
    // compatible inline paint and therefore keeps its original precedence.
    injectStyles(`
      .consumer-gauge.consumer-gauge [data-part='segment'][data-color-source='default'][data-tone] {
        fill: rgb(7, 8, 9);
      }
      .consumer-gauge [data-part='legend-swatch'] { background-color: rgb(9, 8, 7); }
    `);
    expect(computed(defaultSegments[0], 'fill')).toBe('rgb(7, 8, 9)');
    expect(computed(defaultSwatches[0], 'background-color')).toBe(defaultInlinePaint[0]);

    defaults.unmount();

    const custom = renderSurface(
      <GaugeChart
        value={50}
        width={400}
        height={260}
        responsive={false}
        legend
        animate={false}
        segments={[
          { from: 0, to: 50, label: 'Custom', color: '#123456' },
          { from: 50, to: 100, label: 'Intentionally empty', color: '' },
        ]}
      />
    );

    await waitFor(() => expect(custom.container.querySelectorAll('[data-part="segment"]')).toHaveLength(2));
    const customSegments = [...custom.container.querySelectorAll('[data-part="segment"]')];
    const customSwatches = [...custom.container.querySelectorAll('[data-part="legend-swatch"]')] as HTMLElement[];
    for (const segment of customSegments) {
      expect(segment).toHaveAttribute('data-color-source', 'custom');
      expect(segment).toHaveAttribute('data-tone', 'custom');
    }
    expect(customSegments[0]).toHaveAttribute('fill', '#123456');
    // happy-dom does not fold SVG presentation attributes into computedStyle;
    // an empty computed value here proves the default skin did not capture the
    // caller segment, while the exact attribute pins browser paint semantics.
    expect(computed(customSegments[0], 'fill')).toBe('');
    expect(customSegments[1]).toHaveAttribute('fill', '');
    expect(computed(customSegments[1], 'fill')).toBe('');
    expect(customSwatches[0]).toHaveAttribute('data-color-source', 'custom');
    expect(customSwatches[0].style.backgroundColor).toBe('#123456');
    expect(customSwatches[1]).toHaveAttribute('data-color-source', 'custom');
    expect(customSwatches[1].style.backgroundColor).toBe('');
  });

  it('renders the Sankey hover ring from the skin without stealing consumer cascade precedence', async () => {
    installChartCSkin();
    const { container } = renderSurface(
      <SankeyChart
        width={520}
        height={280}
        responsive={false}
        animate={false}
        className="consumer-sankey"
        nodes={[
          { id: 'source', label: 'Source', color: '#123456' },
          { id: 'target', label: 'Target', color: '#abcdef' },
        ]}
        links={[{ source: 'source', target: 'target', value: 10, color: '#654321' }]}
      />
    );

    await waitFor(() => expect(container.querySelector('[data-part="node"]')).toBeTruthy());
    const node = container.querySelector('[data-part="node"]') as SVGGElement;
    const mark = node.querySelector('[data-part="node-mark"]');
    expect(node).toHaveAttribute('data-state', 'idle');
    expect(mark).not.toHaveAttribute('stroke');
    expect(computed(mark!, 'stroke')).toBe('');

    fireEvent.mouseEnter(node);
    expect(node).toHaveAttribute('data-state', 'hovered');
    expect(mark).not.toHaveAttribute('stroke');
    expect(computed(mark!, 'stroke')).toBe('rgb(31, 41, 55)');
    expect(computed(mark!, 'stroke-width')).toBe('1.5');

    injectStyles(`
      .consumer-sankey.consumer-sankey [data-part='node'][data-state='hovered'] [data-part='node-mark'] {
        stroke: rgb(4, 5, 6);
        stroke-width: 3px;
      }
    `);
    expect(computed(mark!, 'stroke')).toBe('rgb(4, 5, 6)');
    expect(computed(mark!, 'stroke-width')).toBe('3px');

    fireEvent.mouseLeave(node);
    expect(node).toHaveAttribute('data-state', 'idle');
    expect(mark).not.toHaveAttribute('stroke');
    expect(computed(mark!, 'stroke')).toBe('');
  });

  it('keeps Sparkline caller paint inline and exposes static marker paint to its skin', () => {
    const { container } = renderSurface(
      <Sparkline
        data={[4, 1, 6, 3]}
        width={180}
        height={48}
        color="#123456"
        fill
        showEndDot
        showMinMax
        animate={false}
      />
    );

    const stops = [...container.querySelectorAll('[data-part="area-gradient-stop"]')];
    expect(stops).toHaveLength(2);
    for (const stop of stops) expect(stop).toHaveAttribute('stop-color', '#123456');
    expect(container.querySelector('[data-part="line"]')).toHaveAttribute('stroke', '#123456');
    expect(container.querySelector('[data-part="end-dot"]')).toHaveAttribute('fill', '#123456');

    const minDot = container.querySelector('[data-part="min-dot"]');
    const maxDot = container.querySelector('[data-part="max-dot"]');
    expect(minDot).not.toHaveAttribute('fill');
    expect(minDot).not.toHaveAttribute('stroke');
    expect(maxDot).not.toHaveAttribute('fill');
    expect(maxDot).not.toHaveAttribute('stroke');
  });
});
