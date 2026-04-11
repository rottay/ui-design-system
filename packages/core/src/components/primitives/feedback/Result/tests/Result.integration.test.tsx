import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Result integration', () => {
  it.each(STABLE_ENGINES)('renders the live result with the %s engine', async (engine) => {
    const { Result } = await import('..');

    renderWithEngine(
      <Result
        engine={engine}
        status="success"
        title="Payment complete"
        subTitle="Your order was processed successfully."
      />,
      engine
    );

    expect(await screen.findByText('Payment complete', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(screen.getByText('Your order was processed successfully.')).toBeInTheDocument();
  }, 45000);

  it.each(STABLE_ENGINES)('forwards refs through the live %s engine', async (engine) => {
    const { Result } = await import('..');
    const ref = createRef<HTMLDivElement>();

    renderWithEngine(<Result ref={ref} engine={engine} title="Forwarded" />, engine);

    await screen.findByText('Forwarded', undefined, { timeout: 30000 });
    expect(ref.current).toBeTruthy();
  });
});
