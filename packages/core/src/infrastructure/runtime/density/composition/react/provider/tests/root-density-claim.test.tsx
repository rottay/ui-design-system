/**
 * The root density channel has ONE owner.
 *
 * `RootDensityProvider` used to write `<html>` with its own save/restore, which
 * decides ownership by VALUE. Codex's probe is the third case below: mount the
 * provider, take a live claim on the same channel from somewhere else, unmount
 * the provider — and the provider restored what IT had found, silently
 * overwriting a claim that was still outstanding. Routing the write through the
 * claim registry makes ownership identity-keyed, so a release either hands the
 * channel down or restores the baseline, and never touches a channel this
 * provider no longer owns.
 */

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDensity } from '@/infrastructure/runtime/foundation/density';
import {
  claimRootAttribute,
  outstandingRootClaims,
} from '@/infrastructure/runtime/foundation/root-attributes';

import { RootDensityProvider } from '..';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-density');
});

function Probe() {
  const { posture } = useDensity();
  return <span data-testid="probe">{posture}</span>;
}

describe('RootDensityProvider', () => {
  it('keeps the root DOM label and JS posture in agreement, then restores prior state', () => {
    document.documentElement.setAttribute('data-density', 'spacious');
    const { getByTestId, rerender, unmount } = render(
      <RootDensityProvider posture="compact">
        <Probe />
      </RootDensityProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(getByTestId('probe')).toHaveTextContent('compact');

    rerender(
      <RootDensityProvider posture="comfortable">
        <Probe />
      </RootDensityProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'comfortable');
    expect(getByTestId('probe')).toHaveTextContent('comfortable');

    unmount();
    expect(document.documentElement).toHaveAttribute('data-density', 'spacious');
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('takes the channel through the registry, not with a bare setAttribute', () => {
    const { unmount } = render(
      <RootDensityProvider posture="compact">
        <Probe />
      </RootDensityProvider>,
    );

    // A raw writer leaves the registry empty; a claim is visible in it.
    expect(outstandingRootClaims(document.documentElement)).toBe(1);
    unmount();
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('does not overwrite a claim taken after it (the reproduced defect)', () => {
    document.documentElement.setAttribute('data-density', 'spacious');
    const { unmount } = render(
      <RootDensityProvider posture="comfortable">
        <Probe />
      </RootDensityProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'comfortable');

    const releaseOther = claimRootAttribute(
      document.documentElement,
      'data-density',
      'compact',
    );
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(outstandingRootClaims(document.documentElement)).toBe(2);

    unmount();

    // Before the fix: 'spacious', with the compact claim still outstanding.
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(outstandingRootClaims(document.documentElement)).toBe(1);

    releaseOther();
    expect(document.documentElement).toHaveAttribute('data-density', 'spacious');
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('hands the channel back down when the later claim releases first', () => {
    const { unmount } = render(
      <RootDensityProvider posture="comfortable">
        <Probe />
      </RootDensityProvider>,
    );
    const releaseOther = claimRootAttribute(
      document.documentElement,
      'data-density',
      'compact',
    );

    releaseOther();

    // The provider is the remaining owner, so its value comes back.
    expect(document.documentElement).toHaveAttribute('data-density', 'comfortable');
    unmount();
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });
});
