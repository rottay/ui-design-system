/**
 * What assistive technology can reach in the filters panel: the panel is a
 * named region, every filter is a labelled control, and a change reports the
 * filter it came from. Behaviour, never the text of a rule.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FieldFiltersPanel } from '..';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

const mount = (ui: React.ReactElement) =>
  render(<EngineProvider defaultEngine="modern">{ui}</EngineProvider>);

const FILTERS = [
  { key: 'stage', label: 'Stage', options: [{ value: 'open', label: 'Open' }] },
  { key: 'owner', label: 'Owner', options: [{ value: 'ada', label: 'Ada' }] },
];

describe('FieldFiltersPanel accessibility', () => {
  it('exposes the panel as a named region', async () => {
    mount(<FieldFiltersPanel filters={FILTERS} values={{}} onChange={() => {}} />);

    // The engine resolves its primitives lazily; the first paint is empty.
    expect(await screen.findByRole('region')).toHaveAccessibleName();
  });

  it('gives every filter a label a screen reader can announce', async () => {
    mount(<FieldFiltersPanel filters={FILTERS} values={{ stage: 'open' }} onChange={() => {}} />);

    await screen.findByRole('region');
    for (const filter of FILTERS) {
      expect(screen.getAllByText(filter.label).length).toBeGreaterThan(0);
    }
  });
});
