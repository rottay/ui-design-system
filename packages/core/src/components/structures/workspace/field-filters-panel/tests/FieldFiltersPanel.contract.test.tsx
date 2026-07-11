import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { FieldFiltersPanel } from '..';
import type { FieldFilterDefinition, FieldFilterPreset, FieldFilterVisual } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const ENGINES = ['modern', 'rustic'] as const;

const FILTERS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'In review' },
      { value: 'expired', label: 'Expired' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'enum',
    placeholder: 'All regions',
    options: [
      { value: 'emea', label: 'EMEA' },
      { value: 'amer', label: 'AMER' },
      { value: 'apac', label: 'APAC' },
    ],
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    type: 'date-range',
    placeholder: 'Any time',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    type: 'multi-select',
    placeholder: 'Search owner',
  },
];

const PRESETS: FieldFilterPreset[] = [
  { key: 'active-emea', label: 'Active in EMEA', values: { status: 'active', region: 'emea' } },
  { key: 'new-joins', label: 'New joins', values: { joinedAt: '30d', status: 'active' } },
];

const VALUES: Record<string, string> = { status: 'active', region: '', joinedAt: '', owner: '' };

const VISUALS: Record<string, FieldFilterVisual> = {
  status: { icon: <span data-testid="status-icon" />, description: 'Filter by lifecycle status.' },
};

/**
 * The parts every render must carry at least once, keyed to the minimum
 * count implied by the fixture above: two InlineSignal instances (active +
 * "Applies live"), two presets, four filter cards.
 */
const EXPECTED_PART_COUNTS: Record<string, number> = {
  'title-pill': 1,
  subtitle: 1,
  signal: 2,
  'signal-label': 2,
  'presets-pill': 1,
  'preset-chip': PRESETS.length,
  'preset-chip-icon': PRESETS.length,
  grid: 1,
  'filter-card': FILTERS.length,
  'filter-card-icon': FILTERS.length,
  'filter-card-label': FILTERS.length,
  'filter-card-description': FILTERS.length,
  'control-slot': FILTERS.length,
};

describe('FieldFiltersPanel data-part contract', () => {
  it.each(ENGINES)('stamps the skin anatomy hooks under the %s engine', async (engine) => {
    const { container } = renderWithEngine(
      <FieldFiltersPanel
        filters={FILTERS}
        presets={PRESETS}
        values={VALUES}
        onChange={() => undefined}
        filterVisuals={VISUALS}
      />,
      engine,
    );

    expect(await screen.findByText('Advanced filters')).toBeTruthy();

    const root = container.querySelector('[data-part="root"]');
    expect(root, 'root data-part is missing').not.toBeNull();
    expect(root?.className).toContain('ds-structure');
    expect(root?.className).toContain('ds-field-filters-panel');

    for (const [part, minCount] of Object.entries(EXPECTED_PART_COUNTS)) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `data-part="${part}" did not reach the DOM`).toBeGreaterThanOrEqual(minCount);
    }

    const signals = container.querySelectorAll('[data-part="signal"]');
    expect(signals[0].getAttribute('data-tone'), 'the active-count signal should carry primary tone').toBe(
      'primary',
    );
    expect(signals[1].getAttribute('data-tone'), 'the "Applies live" signal should carry neutral tone').toBe(
      'neutral',
    );

    const controls = container.querySelectorAll('.ds-field-filters-panel__control');
    expect(controls, 'every filter control landing should carry the control class').toHaveLength(FILTERS.length);
  });
});
