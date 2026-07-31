import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';
import { BulkSelectToggle } from '../bulk-select-toggle';
import { cellRenderers } from '../cell-renderers';
import { PatternGalleryView } from '../gallery-view/presentation/gallery';
import { PatternGridView } from '../grid-view/presentation/grid';
import ModernStatsGrid from '../stats-grid/engines/modern';
import RusticStatsGrid from '../stats-grid/engines/rustic';

// WO-SKIN-06 CK-I pre-migration anatomy contract (Unit I-2).
//
// These assertions intentionally exercise the rendered DOM rather than
// grepping source. Cell renderers are createElement-only, while the selectable
// gallery/grid controls are composed primitives whose caller data attributes
// do not necessarily land on the painted node. The private BEM landing hooks
// are therefore part of the contract as well.

const q = (container: HTMLElement, selector: string) => container.querySelectorAll(selector);

async function waitForSelector(container: HTMLElement, selector: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(selector)).not.toBeNull());
  return container.querySelector(selector) as HTMLElement;
}

const DATA = [
  { id: 'one', image: '', title: 'One' },
  { id: 'two', image: '/two.png', title: 'Two' },
];

describe('CK-I patterns/data anatomy', () => {
  it('pins BulkSelectToggle active/selection states and primitive landing hooks', async () => {
    const active = renderWithEngine(
      <BulkSelectToggle active selectedCount={3} onToggle={() => undefined} />,
      'modern',
    );

    const activeRoot = await waitForSelector(
      active.container,
      '.ds-pattern-bulk-select-toggle[data-part="root"][data-active="true"][data-has-selection="true"]',
    );
    expect(activeRoot).not.toBeNull();
    expect(q(active.container, '.ds-bulk-select-toggle__trigger')).toHaveLength(1);
    expect(q(active.container, '.ds-bulk-select-toggle__count')).toHaveLength(1);
    expect(q(active.container, '[data-part="icon"]')).toHaveLength(1);
    const authoredLabel = Array.from(
      active.container.querySelectorAll('.ds-bulk-select-toggle__trigger [data-part="label"]'),
    ).find((node) => node.textContent === 'Done');
    expect(authoredLabel).toBeTruthy();
    active.unmount();

    const inactive = renderWithEngine(
      <BulkSelectToggle active={false} selectedCount={0} onToggle={() => undefined} />,
      'rustic',
    );
    await waitForSelector(
      inactive.container,
      '.ds-pattern-bulk-select-toggle[data-part="root"][data-active="false"][data-has-selection="false"]',
    );
    expect(q(inactive.container, '.ds-bulk-select-toggle__count')).toHaveLength(0);
  });

  it('pins every createElement cell-renderer island and bounded selector state', () => {
    const Icon = (props: React.HTMLAttributes<HTMLSpanElement>) => <span {...props} />;
    const { container } = renderWithEngine(
      <div>
        {cellRenderers.avatarName('Ana Gomez', 'Owner', { size: 'lg' })}
        {cellRenderers.nameStack('Ana Gomez', 'Owner')}
        {cellRenderers.statusBadge('Healthy', 'success')}
        {cellRenderers.simpleBadge('Warning', 'warning')}
        {cellRenderers.mono(null, { size: 'xs' })}
        {cellRenderers.iconText(Icon, null, { placeholder: 'Missing' })}
        {cellRenderers.countWithIcon(Icon, 4, 'items')}
        {cellRenderers.date(null)}
        {cellRenderers.tags(['one', 'two', 'three'], { maxDisplay: 2 })}
        {cellRenderers.score(12)}
        {cellRenderers.score(50)}
        {cellRenderers.score(90)}
        {cellRenderers.boolean(true)}
        {cellRenderers.boolean(false)}
        {cellRenderers.boolean(null)}
        {cellRenderers.truncated(null)}
      </div>,
      'modern',
    );

    for (const part of [
      'avatar-name', 'avatar', 'content', 'name', 'subtitle', 'name-stack',
      'status-badge', 'simple-badge', 'mono', 'icon-text', 'icon', 'value',
      'count-with-icon', 'date', 'tags', 'tag', 'overflow', 'score',
      'score-track', 'score-bar', 'score-value', 'boolean', 'truncated',
    ]) {
      expect(q(container, `[data-part="${part}"]`).length, part).toBeGreaterThan(0);
    }
    expect(q(container, '.ds-pattern-cell-renderers')).toHaveLength(16);
    expect(q(container, '[data-part="status-badge"][data-variant="success"]')).toHaveLength(1);
    expect(q(container, '[data-part="simple-badge"][data-variant="warning"]')).toHaveLength(1);
    expect(q(container, '[data-part="mono"][data-empty="true"][data-size="xs"]')).toHaveLength(1);
    expect(q(container, '[data-part="icon-text"][data-empty="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="count-with-icon"][data-has-label="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="tags"][data-empty="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="overflow"][data-count="1"]')).toHaveLength(1);
    for (const band of ['low', 'mid', 'high']) {
      expect(q(container, `[data-part="score"][data-band="${band}"]`)).toHaveLength(1);
      expect(q(container, `[data-part="score-bar"][data-band="${band}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="boolean"][data-value="true"][data-empty="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="boolean"][data-value="false"][data-empty="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="boolean"][data-value="false"][data-empty="true"]')).toHaveLength(1);
    expect(q(container, '.ds-cell-renderers__icon')).toHaveLength(2);
  });

  it('pins gallery selected/unselected cards, image branches and BEM checkbox landing', async () => {
    const view = renderWithEngine(
      <PatternGalleryView
        data={DATA}
        imageField="image"
        captionField="title"
        rowKey="id"
        selectable
        selectedKeys={['one']}
        pagination={{ current: 1, pageSize: 2, total: 4, onChange: () => undefined }}
      />,
      'modern',
    );

    await waitForSelector(
      view.container,
      '.ds-pattern-gallery-view[data-part="root"][data-loading="false"][data-empty="false"][data-selectable="true"]',
    );
    expect(q(view.container, '[data-part="card"][data-selected="true"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="card"][data-selected="false"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="checkbox"][data-selected="true"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="checkbox"][data-selected="false"]')).toHaveLength(1);
    expect(q(view.container, '.ds-gallery-card')).toHaveLength(2);
    expect(q(view.container, '.ds-gallery-checkbox')).toHaveLength(2);
    expect(q(view.container, '.ds-gallery-view__checkbox-control')).toHaveLength(2);
    expect(q(view.container, '[data-part="image-placeholder"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="image"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="caption"]')).toHaveLength(2);
    view.unmount();

    const loading = renderWithEngine(
      <PatternGalleryView data={[]} imageField="image" loading />,
      'rustic',
    );
    await waitForSelector(
      loading.container,
      '.ds-pattern-gallery-view[data-part="root"][data-loading="true"][data-empty="false"]',
    );
    expect(q(loading.container, '[data-part="skeleton-card"]')).toHaveLength(8);
    loading.unmount();

    const empty = renderWithEngine(
      <PatternGalleryView data={[]} imageField="image" />,
      'modern',
    );
    await waitForSelector(
      empty.container,
      '.ds-pattern-gallery-view[data-part="root"][data-loading="false"][data-empty="true"]',
    );
    expect(q(empty.container, '[data-part="empty-state"]')).toHaveLength(1);
  });

  it('pins grid selected/unselected shells, BEM checkbox landing, empty and loading roots', async () => {
    const view = renderWithEngine(
      <PatternGridView
        data={DATA}
        rowKey="id"
        selectable
        selectedKeys={['one']}
        renderCard={(item) => <div>{item.title}</div>}
        pagination={{ current: 1, pageSize: 2, total: 4, onChange: () => undefined }}
      />,
      'rustic',
    );

    await waitForSelector(
      view.container,
      '.ds-pattern-grid-view[data-part="root"][data-loading="false"][data-empty="false"][data-selectable="true"]',
    );
    expect(q(view.container, '[data-part="card-shell"][data-selected="true"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="card-shell"][data-selected="false"]')).toHaveLength(1);
    expect(q(view.container, '[data-part="checkbox-overlay"]')).toHaveLength(2);
    expect(q(view.container, '.ds-grid-view__checkbox-control')).toHaveLength(2);
    view.unmount();

    const loading = renderWithEngine(
      <PatternGridView data={[]} renderCard={() => null} loading />,
      'modern',
    );
    await waitForSelector(
      loading.container,
      '.ds-pattern-grid-view[data-part="root"][data-loading="true"][data-empty="false"]',
    );
    expect(q(loading.container, '.ds-grid-view__skeleton')).toHaveLength(6);
    loading.unmount();

    const empty = renderWithEngine(
      <PatternGridView data={[]} renderCard={() => null} />,
      'modern',
    );
    await waitForSelector(
      empty.container,
      '.ds-pattern-grid-view[data-part="root"][data-loading="false"][data-empty="true"]',
    );
    expect(q(empty.container, '[data-part="empty-state"]')).toHaveLength(1);
  });

  it.each([
    ['modern', ModernStatsGrid],
    ['rustic', RusticStatsGrid],
  ] as const)('pins StatsGrid anatomy, bounded trend states and both loading engines (%s)', async (engine, Component) => {
    const stats = [
      { key: 'up', label: 'Up', value: 10, suffix: '%', change: 2, changeType: 'increase' as const, description: 'Rising', sparklineData: [1, 2, 3] },
      { key: 'down', label: 'Down', value: 9, change: -2, changeType: 'decrease' as const },
      { key: 'flat', label: 'Flat', value: 8, change: 0, changeType: 'neutral' as const },
    ];
    const view = renderWithEngine(
      <Component
        stats={stats}
        columns={3}
        variant="outlined"
        sparkline
        animate={false}
        onStatClick={() => undefined}
      />,
      engine,
    );

    const root = await waitForSelector(
      view.container,
      `.ds-pattern-stats-grid.ds-engine-${engine}[data-part="root"][data-loading="false"][data-variant="outlined"]`,
    );
    expect(root).not.toBeNull();
    expect(q(view.container, '[data-part="card"][data-variant="outlined"][data-interactive="true"]')).toHaveLength(3);
    for (const change of ['increase', 'decrease', 'neutral']) {
      expect(q(view.container, `[data-part="trend"][data-change="${change}"]`)).toHaveLength(1);
    }
    // Modern composes the certified Statistic primitive (`title`, `value`,
    // `suffix`); Rustic retains its frozen bespoke `label` part.
    const metricLabelPart = engine === 'modern' ? 'title' : 'label';
    for (const part of ['label-row', metricLabelPart, 'value', 'suffix', 'description', 'sparkline', 'sparkline-line']) {
      expect(q(view.container, `[data-part="${part}"]`).length, `${engine}: ${part}`).toBeGreaterThan(0);
    }
    if (engine === 'modern') {
      expect(q(view.container, '[data-part="sparkline-area"]')).toHaveLength(1);
    } else {
      expect(q(view.container, '[data-part="trend-icon"]')).toHaveLength(2);
    }
    view.unmount();

    const loading = renderWithEngine(
      <Component stats={[]} columns={2} loading />,
      engine,
    );
    const loadingRoot = await waitForSelector(
      loading.container,
      `.ds-pattern-stats-grid.ds-engine-${engine}[data-part="root"][data-loading="true"]`,
    );
    if (engine === 'rustic') {
      expect(['pulse', 'wave']).toContain(loadingRoot.getAttribute('data-skeleton-animation'));
    }
    expect(q(loading.container, '[data-part="skeleton"]')).toHaveLength(2);
    expect(q(loading.container, '[data-part="skeleton-bar"][data-kind="label"]')).toHaveLength(2);
    expect(q(loading.container, '[data-part="skeleton-bar"][data-kind="value"]')).toHaveLength(2);
    expect(q(loading.container, '[data-part="skeleton-bar"][data-kind="trend"]')).toHaveLength(2);
  });
});
