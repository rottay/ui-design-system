import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { PatternFilterPanel } from '..';
import type { FilterDef } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 3 -- FilterPanel data-part contract evidence.
//
// The pre-step stamps `data-part`/`data-sidebar`/`data-loading`/`data-tone`
// attributes and the root `ds-pattern-filter-panel ds-engine-<engine>` class
// pair on both engines without moving any paint. `PatternFilterPanel` is a
// lazily-loaded engine router (createEngineComponent), so every assertion
// here goes through `screen.findBy*`/`waitFor` to await the real mount
// rather than importing the engine module directly.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search owner' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    // One option per inferOptionTone branch (modern-only option-icon-badge coverage).
    options: [
      { value: 'rejected', label: 'Rejected candidate' }, // danger
      { value: 'needs-review', label: 'Needs review' }, // warning
      { value: 'completed', label: 'Completed' }, // success
      { value: 'scheduled', label: 'Scheduled' }, // primary
      { value: 'remote', label: 'Remote' }, // info
      { value: 'other', label: 'Other' }, // neutral
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'indoor', label: 'Indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'window', label: 'Window', type: 'date-range' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

// Every filter carries a non-empty value so rustic's chip row (all active
// filters) and modern's active-count badge both have something to render.
const VALUES: Record<string, unknown> = {
  query: 'ada',
  status: 'scheduled',
  tags: ['vip'],
  enabled: true,
  window: ['2026-01-01', '2026-02-01'],
  capacity: [10, 50],
};

// text(1) + date-range(2) + number-range(2); select/multi-select/boolean
// land on non-input DS primitives or native checkboxes with no data-part.
const EXPECTED_INPUT_COUNT = 5;
const EXPECTED_RANGE_SEPARATOR_COUNT = 2;
const OPTION_TONES = ['danger', 'warning', 'success', 'primary', 'info', 'neutral'] as const;

const SHARED_MIN_PART_COUNTS: Record<string, number> = {
  header: 1,
  'collapse-toggle': 1,
  title: 1,
  'active-count-badge': 1,
  'reset-button': 1,
  'field-row': FILTERS.length,
  'field-label': FILTERS.length,
  input: EXPECTED_INPUT_COUNT,
  'range-separator': EXPECTED_RANGE_SEPARATOR_COUNT,
  'apply-button': 1,
};

describe('FilterPanel data-part contract', () => {
  it.each(ENGINES)('stamps the root/header/field anatomy under the %s engine', async (engine) => {
    const { container } = renderWithEngine(
      <PatternFilterPanel
        engine={engine}
        filters={FILTERS}
        values={VALUES}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        layout="inline"
        collapsible
        title="Filters"
        activeCount={6}
        showApply
        showReset
      />,
      engine,
    );

    expect(await screen.findByText('Filters')).toBeInTheDocument();

    const root = container.querySelector('[data-part="root"]');
    expect(root, `${engine}: root data-part is missing`).not.toBeNull();
    expect(root?.className).toContain('ds-pattern-filter-panel');
    expect(root?.className).toContain(`ds-engine-${engine}`);
    expect(root?.getAttribute('data-sidebar'), `${engine}: root should carry data-sidebar="false"`).toBe('false');

    for (const [part, minCount] of Object.entries(SHARED_MIN_PART_COUNTS)) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `${engine}: data-part="${part}" did not reach the DOM`).toBeGreaterThanOrEqual(minCount);
    }

    if (engine === 'modern') {
      expect(container.querySelectorAll('[data-part="content"]').length).toBeGreaterThanOrEqual(1);
    } else {
      expect(container.querySelectorAll('[data-part="select"]').length).toBeGreaterThanOrEqual(1);
      expect(container.querySelectorAll('[data-part="filter-chip"]').length).toBeGreaterThanOrEqual(FILTERS.length);
      expect(container.querySelectorAll('[data-part="filter-chip-remove"]').length).toBeGreaterThanOrEqual(
        FILTERS.length,
      );
    }
  });

  it('reaches option-icon-badge parts inside the modern select dropdown, one per inferred tone', async () => {
    renderWithEngine(
      <PatternFilterPanel engine="modern" filters={FILTERS} values={VALUES} onChange={vi.fn()} />,
      'modern',
    );

    expect(await screen.findByText('Status')).toBeInTheDocument();

    const combobox = document.querySelector('[role="combobox"]');
    if (!(combobox instanceof HTMLElement)) {
      throw new Error('Expected the modern Select combobox trigger to render');
    }
    fireEvent.click(combobox);

    await waitFor(() => {
      expect(document.querySelectorAll('[role="option"]').length).toBeGreaterThanOrEqual(
        FILTERS[1].options?.length ?? 0,
      );
    });

    const badges = document.querySelectorAll('[data-part="option-icon-badge"]');
    expect(badges.length).toBeGreaterThanOrEqual(OPTION_TONES.length);
    expect(Array.from(badges).every((badge) => badge.className.includes('ds-pattern-filter-panel__option-icon'))).toBe(
      true,
    );

    const tones = new Set(Array.from(badges).map((badge) => badge.getAttribute('data-tone')));
    for (const tone of OPTION_TONES) {
      expect(tones.has(tone), `missing option-icon-badge for tone "${tone}"`).toBe(true);
    }
  });

  it.each(ENGINES)('stamps data-sidebar="true" on the root when layout="sidebar" (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternFilterPanel engine={engine} filters={[FILTERS[0]]} values={{}} onChange={vi.fn()} layout="sidebar" />,
      engine,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="root"]')).not.toBeNull();
    });

    const root = container.querySelector('[data-part="root"]');
    expect(root?.className).toContain(`ds-engine-${engine}`);
    expect(root?.getAttribute('data-sidebar'), `${engine}: sidebar layout should stamp data-sidebar="true"`).toBe(
      'true',
    );
  });

  it.each(ENGINES)('stamps the loading root variant (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternFilterPanel engine={engine} filters={FILTERS} values={VALUES} onChange={vi.fn()} loading />,
      engine,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="root"]')).not.toBeNull();
    });

    const root = container.querySelector('[data-part="root"]');
    expect(root?.className).toContain('ds-pattern-filter-panel');
    expect(root?.className).toContain(`ds-engine-${engine}`);

    if (engine === 'modern') {
      expect(root?.getAttribute('data-loading'), 'modern loading root should carry data-loading="true"').toBe('true');
      expect(container.querySelector('[data-part="loading-spinner"]')).not.toBeNull();
    } else {
      expect(container.querySelector('[data-part="loading-text"]')).not.toBeNull();
    }
  });
});
