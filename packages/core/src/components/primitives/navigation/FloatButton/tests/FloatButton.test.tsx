import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FloatButton } from '..';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../testing/helpers/engine-test-utils';

describe('FloatButton live behavior', () => {
  it.each(STABLE_ENGINES)('renders badges and click handlers with the %s engine', async (engine) => {
    const onClick = vi.fn();

    renderWithEngine(
      <FloatButton
        engine={engine}
        icon={<span aria-hidden="true">+</span>}
        description="Create"
        badge={{ count: 7 }}
        shape={engine === 'classic' ? 'square' : undefined}
        onClick={onClick}
      />,
      engine
    );

    const button = await screen.findByRole('button', { name: /create/i });
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders as a live link with the %s engine', async (engine) => {
    renderWithEngine(
      <FloatButton
        engine={engine}
        href="https://example.com"
        target="_blank"
        description="Docs"
        shape={engine === 'classic' ? 'square' : undefined}
      />,
      engine
    );

    const link = await screen.findByRole('link', { name: /docs/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe.each(['modern', 'rustic'] as const)('FloatButton group/backtop %s engine', (engine) => {
  it('toggles group state through the live trigger', async () => {
    const onOpenChange = vi.fn();

    renderWithEngine(
      <FloatButton.Group
        engine={engine}
        trigger="click"
        icon={<span>?</span>}
        closeIcon={<span>×</span>}
        onOpenChange={onOpenChange}
      >
        <FloatButton engine={engine} description="Child action" />
      </FloatButton.Group>,
      engine
    );

    const trigger = await screen.findByRole('button', { name: /\?/i });

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('shows back-to-top when scroll crosses the threshold and triggers smooth scroll', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    renderWithEngine(
      <FloatButton.BackTop
        engine={engine}
        visibilityHeight={10}
        description="Back to top"
      />,
      engine
    );

    Object.defineProperty(window, 'scrollY', {
      value: 50,
      configurable: true,
    });

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });

    const button = await screen.findByRole('button', { name: /back to top/i });
    fireEvent.click(button);

    expect(scrollToSpy).toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});
