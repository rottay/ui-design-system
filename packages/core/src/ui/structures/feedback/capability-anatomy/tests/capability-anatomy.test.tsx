/**
 * Capability anatomy -- ownership contract.
 *
 * Moved here with the component when it left the
 * `ui/surfaces/runtime/helpers/states` support path. It kept its own suite
 * rather than folding into `surface-lifecycle/states/tests` for the same
 * reason it kept its own owner: it renders a capability registry, not a
 * lifecycle moment.
 */

import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { SurfaceCapabilityAnatomy } from '..';

beforeEach(() => {
  mockMatchMedia(1280);
});

describe('SurfaceCapabilityAnatomy', () => {
  it('renders capability anatomy with catalog copy and skin-owned layout', async () => {
    const { container } = renderSurface(
      <SurfaceCapabilityAnatomy
        capabilities={[
          { kind: 'action', id: 'export', label: 'Export' },
          { kind: 'tab', id: 'kanban', disabled: true },
        ]}
      />,
      { engine: 'modern' },
    );

    let root: Element | null = null;
    await waitFor(() => {
      root = container.querySelector('[data-part="capability-anatomy"]');
      expect(root).not.toBeNull();
    });

    // EN catalog floors: surfaces.states.capability_label / capability_aria.
    expect(root).toHaveAttribute('aria-label', 'Registered surface capabilities');
    expect(root).toHaveTextContent('Available when data is retrieved');
    expect(root).not.toHaveAttribute('style');
    expect(container.querySelector('[data-part="capability-list"]')).not.toHaveAttribute('style');
    expect(
      container.querySelector('[data-part="capability"][data-disabled="true"]'),
    ).not.toHaveAttribute('style');
  });

  it('renders nothing when the surface registered no capabilities', () => {
    const { container } = renderSurface(<SurfaceCapabilityAnatomy capabilities={[]} />, {
      engine: 'modern',
    });

    expect(container.querySelector('[data-part="capability-anatomy"]')).toBeNull();
  });
});
