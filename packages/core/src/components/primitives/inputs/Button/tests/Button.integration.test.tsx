import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Button integration', () => {
  it.each(STABLE_ENGINES)('renders the live component with the %s engine', async (engine) => {
    const { Button } = await import('..');
    renderWithEngine(<Button engine={engine}>Save changes</Button>, engine);

    expect(
      await screen.findByRole('button', { name: /save changes/i }, { timeout: 30000 })
    ).toBeInTheDocument();
  }, 45000);

  it.each(STABLE_ENGINES)('forwards refs through the factory with the %s engine', async (engine) => {
    const { Button } = await import('..');
    const ref = createRef<any>();

    renderWithEngine(
      <Button ref={ref} engine={engine}>
        Forward ref
      </Button>,
      engine
    );

    await screen.findByRole('button', { name: /forward ref/i }, { timeout: 30000 });
    expect(ref.current).toBeTruthy();
  });

  it('covers rustic anchor, loading, and disabled link fallbacks through the live engine', async () => {
    const { Button } = await import('..');
    const handleClick = vi.fn();

    const { rerender } = renderWithEngine(
      <Button
        engine="rustic"
        href="/events"
        target="_blank"
        icon={<span data-testid="button-icon-end">I</span>}
        prefix={<span data-testid="button-prefix">P</span>}
        suffix={<span data-testid="button-suffix">S</span>}
        iconPosition="end"
        fullWidth
        shadow
        gradient
        pulse
        bordered
      >
        Open event
      </Button>,
      'rustic'
    );

    const link = await screen.findByRole('link', { name: /open event/i });
    expect(link).toHaveAttribute('href', '/events');
    expect(screen.getByTestId('button-prefix')).toBeInTheDocument();
    expect(screen.getByTestId('button-suffix')).toBeInTheDocument();
    expect(screen.getByTestId('button-icon-end')).toBeInTheDocument();

    rerender(
      <Button
        engine="rustic"
        href="/events"
        loading
        onClick={handleClick}
        icon={<span data-testid="button-icon-end">I</span>}
      >
        Open event
      </Button>
    );

    const loadingButton = await screen.findByRole('button', { name: /open event/i });
    expect(screen.queryByRole('link', { name: /open event/i })).not.toBeInTheDocument();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('button-icon-end')).not.toBeInTheDocument();
    fireEvent.click(loadingButton);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button engine="rustic" href="/events" disabled onClick={handleClick}>
        Open event
      </Button>
    );

    const disabledButton = await screen.findByRole('button', { name: /open event/i });
    fireEvent.click(disabledButton);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('covers rustic interactive state branches through the live engine', async () => {
    const { Button } = await import('..');
    const handleClick = vi.fn();

    renderWithEngine(
      <Button engine="rustic" danger shape="circle" onClick={handleClick}>
        Go
      </Button>,
      'rustic'
    );

    const button = await screen.findByRole('button', { name: /go/i });

    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    fireEvent.mouseDown(button);
    expect(button.style.transform).toContain('var(--ds-button-active-transform');

    fireEvent.mouseUp(button);
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.blur(button);
    fireEvent.mouseLeave(button);
    expect(button.style.transform).toBe('translateY(0) scale(1)');
  });
});
