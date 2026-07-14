import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import {
  ActivityTicker,
  ActivityTimeline,
  ActivityCompact,
  ActivityCards,
  MetricsMinimal,
  MetricsCards,
  MetricsChart,
  MetricsRows,
  DataTerminalCard,
  DataTerminalStat,
  StatsHeader,
  type ActivityItem,
  type KeyMetric,
  type StatItem,
} from '..';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../../_internal/testing/helpers/match-media';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-A -- dashboard-widgets family data-part contract.
//
// The pre-step stamps scope classes (`ds-activity-*`, `ds-metrics-*`,
// `ds-data-terminal-card`, `ds-data-terminal-stat`, `ds-stats-header`),
// `data-part`, and state attributes (`data-type`, `data-positive`,
// `data-trend`, `data-band`, `data-accent`, `data-change`, `data-variant`)
// onto all ten CK-A files WITHOUT moving any paint. This file proves each
// stamp reaches the DOM under the two skin engines, and -- for the sites that
// key on a bounded enum -- that EVERY value of that enum renders (P-80: an
// unrendered enum value is an unphotographed rule). It does not assert paint;
// that is dashboard-widgets-batch.spec.ts's job.
//
// P-79 survival: every stamped element here is a DS primitive that forwards
// `data-part` in BOTH engines (Box/Text/Flex/Stack) or a lucide icon (which
// spreads rest props onto its <svg>). None is a composed Grid/Card/Button, so
// no stamp is silently dropped. Asserting the stamp is queryable in the DOM,
// under each engine, is the survival proof.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

// All five ActivityItem["type"] values (P-80: every enum value must render).
const ACTIVITY_ITEMS: ActivityItem[] = [
  { text: 'Deployed release', time: '2m', type: 'success' },
  { text: 'New candidate applied', time: '5m', type: 'primary' },
  { text: 'Report generated', time: '12m', type: 'info' },
  { text: 'Quota near limit', time: '30m', type: 'warning' },
  { text: 'Sync failed', time: '1h', type: 'error' },
];

const TYPES = ['success', 'primary', 'info', 'warning', 'error'] as const;

// Both metric.positive branches, so data-positive="true" and "false" both render.
const METRICS: KeyMetric[] = [
  { label: 'Open roles', value: '42', change: '+3', positive: true, icon: StubIcon, trend: 'up', progress: 80 },
  { label: 'Time to hire', value: '18d', change: '-2', positive: false, icon: StubIcon, trend: 'down', progress: 40 },
];

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

const q = (c: HTMLElement, sel: string) => c.querySelectorAll(sel);

describe('DashboardWidgets data-part contract (WO-SKIN-06 CK-A)', () => {
  // -------------------------------------------------------------------------
  // Activity family -- ticker / timeline / compact / cards
  // -------------------------------------------------------------------------
  describe('activity family', () => {
    it.each(ENGINES)('ActivityTicker: root(ds-activity-ticker) + every type on a ticker-dot under %s', async (engine) => {
      const { container } = renderWithEngine(
        <ActivityTicker items={ACTIVITY_ITEMS} viewAllHref="#" />,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-activity-ticker')).toBe(true);
      // header anatomy survived on Box/Text/Flex
      for (const part of ['bell-box', 'badge', 'badge-count', 'title', 'live-dot', 'live-label', 'view-all-link', 'ticker-body', 'progress-track', 'progress-fill']) {
        expect(q(container, `[data-part="${part}"]`).length).toBeGreaterThanOrEqual(1);
      }
      // one ticker-dot per item, each carrying its own data-type -> all five present
      expect(q(container, '[data-part="ticker-dot"]')).toHaveLength(5);
      for (const t of TYPES) {
        expect(q(container, `[data-part="ticker-dot"][data-type="${t}"]`).length).toBe(1);
      }
      // exactly one dot is the active one (data-active="true")
      expect(q(container, '[data-part="ticker-dot"][data-active="true"]')).toHaveLength(1);
      // the current-item type-selected parts carry a valid data-type
      expect((await waitForPart(container, 'item-icon-box')).getAttribute('data-type')).toBe('success');
    });

    it.each(ENGINES)('ActivityTimeline: one item per type, each with data-type on icon-box + content under %s', async (engine) => {
      const { container } = renderWithEngine(
        <ActivityTimeline items={ACTIVITY_ITEMS} viewAllHref="#" />,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-activity-timeline')).toBe(true);
      expect(q(container, '[data-part="item"]')).toHaveLength(5);
      for (const t of TYPES) {
        expect(q(container, `[data-part="item-icon-box"][data-type="${t}"]`)).toHaveLength(1);
        expect(q(container, `[data-part="item-content"][data-type="${t}"]`)).toHaveLength(1);
        expect(q(container, `[data-part="item-dot"][data-type="${t}"]`)).toHaveLength(1);
      }
      expect(q(container, '[data-part="scroll-area"]').length).toBe(1);
    });

    it.each(ENGINES)('ActivityCompact: item-row anchor + every type under %s', async (engine) => {
      const { container } = renderWithEngine(
        <ActivityCompact items={ACTIVITY_ITEMS} viewAllHref="#" />,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-activity-compact')).toBe(true);
      expect(q(container, '[data-part="item"]')).toHaveLength(5);
      expect(q(container, '[data-part="item-row"]')).toHaveLength(5);
      for (const t of TYPES) {
        expect(q(container, `[data-part="accent-bar"][data-type="${t}"]`)).toHaveLength(1);
        expect(q(container, `[data-part="item-icon-box"][data-type="${t}"]`)).toHaveLength(1);
      }
      expect(q(container, '[data-part="update-count"]').length).toBe(1);
    });

    it.each(ENGINES)('ActivityCards: item-row anchor + every type under %s', async (engine) => {
      const { container } = renderWithEngine(
        <ActivityCards items={ACTIVITY_ITEMS} viewAllHref="#" />,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-activity-cards')).toBe(true);
      expect(q(container, '[data-part="item"]')).toHaveLength(5);
      expect(q(container, '[data-part="item-row"]')).toHaveLength(5);
      for (const t of TYPES) {
        expect(q(container, `[data-part="accent-bar"][data-type="${t}"]`)).toHaveLength(1);
        expect(q(container, `[data-part="item-dot"][data-type="${t}"]`)).toHaveLength(1);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Metrics family -- minimal / cards / chart / rows
  // -------------------------------------------------------------------------
  describe('metrics family', () => {
    const cases: Array<[string, React.ComponentType<{ metrics: KeyMetric[] }>, string, string]> = [
      ['MetricsMinimal', MetricsMinimal, 'ds-metrics-minimal', 'metric-row'],
      ['MetricsCards', MetricsCards, 'ds-metrics-cards', 'metric-card'],
      ['MetricsChart', MetricsChart, 'ds-metrics-chart', 'metric-row'],
      ['MetricsRows', MetricsRows, 'ds-metrics-rows', 'metric-row'],
    ];

    for (const [name, Comp, scope, rowPart] of cases) {
      it.each(ENGINES)(`${name}: root(${scope}) + data-positive both branches + trend/value under %s`, async (engine) => {
        const { container } = renderWithEngine(<Comp metrics={METRICS} />, engine);
        // MetricsCards nests its rows in a lazy Grid; wait for the row part itself,
        // not just the panel root, so the Suspense-loaded children are present.
        await waitForPart(container, rowPart);
        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        expect(root.classList.contains(scope)).toBe(true);
        // two rows -> data-positive true AND false both present (the state a rule keys on)
        expect(q(container, `[data-part="${rowPart}"]`)).toHaveLength(2);
        expect(q(container, `[data-part="${rowPart}"][data-positive="true"]`)).toHaveLength(1);
        expect(q(container, `[data-part="${rowPart}"][data-positive="false"]`)).toHaveLength(1);
        // painted parts present in ALL four variants survived their primitives
        // (rows has no meter bar, so meter-fill is asserted per-variant below)
        expect(q(container, '[data-part="trend-icon"]').length).toBeGreaterThanOrEqual(2);
        expect(q(container, '[data-part="metric-value"]').length).toBeGreaterThanOrEqual(2);
        // meter-fill exists in minimal/cards/chart (not rows)
        if (name !== 'MetricsRows') {
          expect(q(container, '[data-part="meter-fill"]').length).toBeGreaterThanOrEqual(2);
        }
        // panel chrome
        expect(q(container, '[data-part="live-dot"]').length).toBe(1);
      });
    }
  });

  // -------------------------------------------------------------------------
  // data-terminal-card -- four variant bodies + DataTerminalStat
  // -------------------------------------------------------------------------
  describe('data-terminal-card', () => {
    const DTC_BASE = {
      label: 'Tickets',
      value: 1234,
      change: '+12%',
      icon: StubIcon,
      path: '#',
      subtitle: 'This week',
      hideOnFocus: false,
    } as const;

    // variant -> a part that ONLY that body renders, proving the switch reached it.
    const bodyMarker: Record<1 | 2 | 3 | 4, string> = {
      1: 'terminal-bar', // CommandCard
      2: 'grid-texture', // HUDCard
      3: 'circuit-pattern', // CircuitCard
      4: 'matrix-texture', // MatrixCard
    };

    it.each(ENGINES)('mounts variant 1..4, each body renders with data-variant + data-band under %s', async (engine) => {
      const bands: Array<[1 | 2 | 3 | 4, number, 'up' | 'down', string]> = [
        [1, 85, 'up', 'high'],
        [2, 60, 'down', 'mid'],
        [3, 30, 'up', 'low'],
        [4, 90, 'down', 'high'],
      ];
      for (const [variant, progress, trend, band] of bands) {
        const { container } = renderWithEngine(
          <DataTerminalCard {...DTC_BASE} variant={variant} progress={progress} trend={trend} />,
          engine,
        );
        const root = await waitForPart(container, 'root');
        expect(root.classList.contains('ds-data-terminal-card')).toBe(true);
        expect(root.getAttribute('data-variant')).toBe(String(variant));
        expect(root.getAttribute('data-trend')).toBe(trend);
        expect(root.getAttribute('data-band')).toBe(band);
        // this variant's private body rendered (the switch reached it)
        expect(q(container, `[data-part="${bodyMarker[variant]}"]`).length).toBeGreaterThanOrEqual(1);
        // trend icon (lucide) forwarded its data-part onto the <svg>
        expect(q(container, '[data-part="trend-icon"]').length).toBeGreaterThanOrEqual(1);
        // ProgressBar fill carries the band it computed from progress
        const fill = q(container, '[data-part="progress-fill"]')[0] as HTMLElement;
        expect(fill).toBeTruthy();
        expect(fill.getAttribute('data-band')).toBe(band);
      }
    });

    it.each(ENGINES)('DataTerminalStat: own scope class + value + trend icon under %s', async (engine) => {
      const { container } = renderWithEngine(
        <DataTerminalStat label="Latency" value={99} change="+1" trend="up" icon={StubIcon} progress={50} />,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-data-terminal-stat')).toBe(true);
      expect(root.getAttribute('data-trend')).toBe('up');
      expect(q(container, '[data-part="corner-bracket"]')).toHaveLength(2);
      expect(q(container, '[data-part="value"]').length).toBe(1);
      expect(q(container, '[data-part="trend-icon"]').length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // stats-header -- cards, change-indicator enum, sparkline, progress, skeletons
  // -------------------------------------------------------------------------
  describe('stats-header', () => {
    const STATS: StatItem[] = [
      { key: 'a', label: 'Revenue', value: 1200, change: 8, changeType: 'increase', periodLabel: 'this week', prefix: '$', suffix: '/mo', icon: <StubIcon />, insight: 'Ahead of plan', sparkDots: [3, 5, 6, 4, 8, 7, 9], accentColor: 'primary' },
      { key: 'b', label: 'Churn', value: 12, change: 2, changeType: 'decrease', periodLabel: 'this week', icon: <StubIcon />, insight: 'Watch closely', sparkDots: [1, 2, 3, 2, 4, 3, 5], accentColor: 'error' },
      { key: 'c', label: 'Flat', value: 5, change: 0, changeType: 'neutral', accentColor: 'success' },
      { key: 'd', label: 'Load', value: 50, progress: 60, accentColor: 'warning' },
    ];

    it.each(ENGINES)('loaded: root(ds-stats-header) + all three data-change values + spark/progress/insight under %s', async (engine) => {
      mockMatchMedia(1280);
      const { container } = renderWithEngine(<StatsHeader engine={engine} stats={STATS} />, engine);
      const root = await waitForPart(container, 'root');
      expect(root.classList.contains('ds-stats-header')).toBe(true);
      expect(q(container, '[data-part="stat-card"]')).toHaveLength(4);
      // every changeType renders (P-80): increase / decrease / neutral
      for (const c of ['increase', 'decrease', 'neutral']) {
        expect(q(container, `[data-part="change-row"][data-change="${c}"]`)).toHaveLength(1);
        expect(q(container, `[data-part="change-value"][data-change="${c}"]`)).toHaveLength(1);
      }
      // sparkline dots carry data-accent (two stats have sparkDots -> 14 dots)
      expect(q(container, '[data-part="spark-dot"]')).toHaveLength(14);
      expect(q(container, '[data-part="spark-dot"][data-accent="primary"]')).toHaveLength(7);
      // the progress-only stat renders the ProgressBar (sparkDots absent)
      expect(q(container, '[data-part="progress-fill"][data-accent="warning"]')).toHaveLength(1);
      // insight + accent carrier survived
      expect(q(container, '[data-part="stat-insight"]')).toHaveLength(2);
      expect(q(container, '[data-part="stat-card"][data-accent="primary"]')).toHaveLength(1);
    });

    it.each(ENGINES)('loading: skeleton parts stamped under %s', async (engine) => {
      mockMatchMedia(1280);
      const { container } = renderWithEngine(<StatsHeader engine={engine} stats={STATS} loading />, engine);
      await waitForPart(container, 'root');
      expect(q(container, '[data-part="skeleton-card"]').length).toBeGreaterThanOrEqual(1);
      expect(q(container, '[data-part="skeleton-bar"]').length).toBeGreaterThanOrEqual(1);
      expect(q(container, '[data-part="skeleton-dot"]').length).toBeGreaterThanOrEqual(1);
      expect(q(container, '[data-part="skeleton-glow"]').length).toBeGreaterThanOrEqual(1);
    });
  });
});
