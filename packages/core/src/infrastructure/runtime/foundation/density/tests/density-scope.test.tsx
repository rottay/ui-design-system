import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DENSITY_POSTURES,
  DensityScope,
  RootDensityProvider,
  deriveDensityPosture,
  useDensity,
} from '../index';

afterEach(cleanup);

function Probe() {
  const { posture } = useDensity();
  return <span data-testid="probe">{posture}</span>;
}

describe('DensityScope (DS-A006 single runtime contract)', () => {
  it('publishes the closed posture vocabulary', () => {
    expect(DENSITY_POSTURES).toEqual(['compact', 'comfortable', 'spacious']);
  });

  it('stamps the scoped data-density boundary the CSS cascade reads', () => {
    const { container } = render(
      <DensityScope posture="compact" as="section">
        <Probe />
      </DensityScope>
    );
    const boundary = container.querySelector('section');
    expect(boundary).toHaveAttribute('data-density', 'compact');
  });

  it('keeps CSS attribute and JS hook in agreement, including nested scopes', () => {
    const { getAllByTestId } = render(
      <DensityScope posture="spacious">
        <Probe />
        <DensityScope posture="compact">
          <Probe />
        </DensityScope>
      </DensityScope>
    );
    const [outer, inner] = getAllByTestId('probe');
    expect(outer).toHaveTextContent('spacious');
    expect(inner).toHaveTextContent('compact');
  });

  it('defaults to comfortable outside any scope', () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('probe')).toHaveTextContent('comfortable');
  });

  it('normalizes only the semantic tenant preference, never structural scale values', () => {
    expect(deriveDensityPosture('compact')).toBe('compact');
    expect(deriveDensityPosture('spacious')).toBe('spacious');
    expect(deriveDensityPosture('normal')).toBe('comfortable');
    expect(deriveDensityPosture('comfortable')).toBe('comfortable');
    expect(deriveDensityPosture(0.85)).toBe('comfortable');
    expect(deriveDensityPosture(1.15)).toBe('comfortable');
  });

  it('keeps the root DOM label and JS posture in agreement, then restores prior state', () => {
    document.documentElement.setAttribute('data-density', 'spacious');
    const { getByTestId, rerender, unmount } = render(
      <RootDensityProvider posture="compact">
        <Probe />
      </RootDensityProvider>
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(getByTestId('probe')).toHaveTextContent('compact');

    rerender(
      <RootDensityProvider posture="comfortable">
        <Probe />
      </RootDensityProvider>
    );
    expect(document.documentElement).toHaveAttribute(
      'data-density',
      'comfortable'
    );
    expect(getByTestId('probe')).toHaveTextContent('comfortable');

    unmount();
    expect(document.documentElement).toHaveAttribute('data-density', 'spacious');
    document.documentElement.removeAttribute('data-density');
  });
});
