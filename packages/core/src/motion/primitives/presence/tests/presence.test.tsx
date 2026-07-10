import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Presence } from '../index';

describe('Presence', () => {
  it('renders the child via the render-prop while present', () => {
    render(
      <Presence present={true}>
        {({ dataState, ref }) => (
          <div ref={ref} data-testid="node" data-state={dataState} />
        )}
      </Presence>,
    );
    expect(screen.getByTestId('node')).toHaveAttribute('data-state', 'open');
  });

  it('returns null once shouldRender flips to false', async () => {
    const { rerender } = render(
      <Presence present={true}>
        {({ dataState, ref }) => <div ref={ref} data-testid="node" data-state={dataState} />}
      </Presence>,
    );
    rerender(
      <Presence present={false}>
        {({ dataState, ref }) => <div ref={ref} data-testid="node" data-state={dataState} />}
      </Presence>,
    );

    // No transition declared -- exits immediately.
    await waitFor(() => expect(screen.queryByTestId('node')).not.toBeInTheDocument());
  });

  it('keeps rendering with data-state="closed" until the declared exit transition completes', async () => {
    const onExitComplete = vi.fn();
    const { rerender } = render(
      <Presence present={true} onExitComplete={onExitComplete}>
        {({ dataState, ref }) => (
          <div
            ref={ref}
            data-testid="node"
            data-state={dataState}
            style={{ transitionProperty: 'opacity', transitionDuration: '30ms' }}
          />
        )}
      </Presence>,
    );
    rerender(
      <Presence present={false} onExitComplete={onExitComplete}>
        {({ dataState, ref }) => (
          <div
            ref={ref}
            data-testid="node"
            data-state={dataState}
            style={{ transitionProperty: 'opacity', transitionDuration: '30ms' }}
          />
        )}
      </Presence>,
    );

    const node = screen.getByTestId('node');
    expect(node).toHaveAttribute('data-state', 'closed');

    act(() => {
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });

    await waitFor(() => expect(screen.queryByTestId('node')).not.toBeInTheDocument());
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });
});
