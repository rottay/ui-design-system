import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SurfaceErrorBoundary } from '..';

function Bomb({ message }: { message: string }): React.ReactElement {
  throw new Error(message);
}

function silenceReactErrorLogging(): () => void {
  // React intentionally logs boundary catches; keep the suite output clean.
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  return () => spy.mockRestore();
}

describe('SurfaceErrorBoundary default fallback', () => {
  it('announces the failure with role=alert and localized catalog copy', () => {
    const restore = silenceReactErrorLogging();
    try {
      render(
        <SurfaceErrorBoundary surfaceName="billing">
          <Bomb message="quota exceeded" />
        </SurfaceErrorBoundary>,
      );

      // EN catalog: surfaces.states.error_boundary_title / retry.
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('billing encountered an error');
      expect(alert).toHaveTextContent('quota exceeded');
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it('falls back to the generic surface label and resets on retry', () => {
    const restore = silenceReactErrorLogging();
    let shouldThrow = true;
    function MaybeBomb(): React.ReactElement {
      if (shouldThrow) throw new Error('boom');
      return <div>recovered</div>;
    }
    try {
      render(
        <SurfaceErrorBoundary>
          <MaybeBomb />
        </SurfaceErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('This section encountered an error');

      // The retry resets the boundary; children re-render against recovered state.
      shouldThrow = false;
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(screen.getByText('recovered')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      restore();
    }
  });

  /*
   * R4's crash-safe arm at the React level: no DesignSystemProvider, no
   * I18nProvider, no stylesheet loaded by this runner. Everything the user
   * needs to get out of the failure has to come from the markup itself.
   */
  it('stays keyboard-operable with no providers in the tree', async () => {
    const restore = silenceReactErrorLogging();
    const user = userEvent.setup();
    let shouldThrow = true;
    function MaybeBomb(): React.ReactElement {
      if (shouldThrow) throw new Error('boom');
      return <div>recovered</div>;
    }
    try {
      render(
        <SurfaceErrorBoundary surfaceName="billing">
          <MaybeBomb />
        </SurfaceErrorBoundary>,
      );

      const retry = screen.getByRole('button', { name: 'Try again' });
      expect(retry).toHaveAttribute('type', 'button');

      // Tab reaches it, Enter presses it, and the boundary resets -- the whole
      // recovery path without a pointer and without a provider.
      await user.tab();
      expect(retry).toHaveFocus();

      shouldThrow = false;
      await user.keyboard('{Enter}');
      expect(screen.getByText('recovered')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      restore();
    }
  });

  it('prefers a caller fallbackRender over the default fallback', () => {
    const restore = silenceReactErrorLogging();
    try {
      render(
        <SurfaceErrorBoundary
          surfaceName="billing"
          fallbackRender={(error, reset) => (
            <button type="button" onClick={reset}>custom: {error.message}</button>
          )}
        >
          <Bomb message="boom" />
        </SurfaceErrorBoundary>,
      );

      expect(screen.getByRole('button', { name: 'custom: boom' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      restore();
    }
  });
});
