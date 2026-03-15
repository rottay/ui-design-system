import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../testing/helpers/engine-test-utils';

describe('Statistic integration', () => {
  it.each(STABLE_ENGINES)('renders the live statistic component with the %s engine', async (engine) => {
    const { Statistic } = await import('..');
    renderWithEngine(
      <Statistic engine={engine} title="Revenue" value={12345} animateValue={false} />,
      engine
    );

    expect(await screen.findByText(/revenue/i, undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText(/12,345|12345/)).toBeInTheDocument();
  }, 15000);
});
