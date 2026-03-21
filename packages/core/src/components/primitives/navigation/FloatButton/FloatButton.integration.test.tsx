import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('FloatButton integration', () => {
  it.each(STABLE_ENGINES)('renders the live float button with the %s engine', async (engine) => {
    const { FloatButton } = await import('..');

    renderWithEngine(
      <FloatButton
        engine={engine}
        shape={engine === 'classic' ? 'square' : undefined}
        description="Create"
        tooltip="Create record"
      />,
      engine
    );

    expect(
      await screen.findByRole('button', { name: /create/i }, { timeout: 30000 })
    ).toBeInTheDocument();
  }, 45000);

  it.each(STABLE_ENGINES)('forwards refs through the live %s engine', async (engine) => {
    const { FloatButton } = await import('..');
    const ref = createRef<any>();

    renderWithEngine(
      <FloatButton
        ref={ref}
        engine={engine}
        shape={engine === 'classic' ? 'square' : undefined}
        description="Ref test"
      />,
      engine
    );

    await screen.findByRole('button', { name: /ref test/i }, { timeout: 30000 });
    expect(ref.current).toBeTruthy();
  });
});
