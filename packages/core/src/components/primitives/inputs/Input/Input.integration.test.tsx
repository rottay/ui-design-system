import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('Input integration', () => {
  it.each(STABLE_ENGINES)('renders the live component with the %s engine', async (engine) => {
    const { Input } = await import('.');
    renderWithEngine(<Input engine={engine} placeholder="Email address" />, engine);

    expect(await screen.findByPlaceholderText('Email address', undefined, { timeout: 10000 })).toBeInTheDocument();
  }, 15000);

  it.each(STABLE_ENGINES)('forwards refs through the factory with the %s engine', async (engine) => {
    const { Input } = await import('.');
    const ref = createRef<any>();

    renderWithEngine(<Input ref={ref} engine={engine} placeholder="Forward input ref" />, engine);

    await screen.findByPlaceholderText('Forward input ref', undefined, { timeout: 10000 });
    expect(ref.current).toBeTruthy();
  });
});
