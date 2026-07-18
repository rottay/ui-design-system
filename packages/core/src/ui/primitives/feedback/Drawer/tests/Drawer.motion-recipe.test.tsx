import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernDrawer from '../engines/modern';
import { MotionProvider } from '@/infrastructure/runtime/motion';

function surface(): HTMLElement {
  const node = document.body.querySelector('[role="dialog"][data-part="surface"]');
  expect(node).not.toBeNull();
  return node as HTMLElement;
}

describe('Drawer overlay.sheet motion recipe', () => {
  it('modern engine stamps the animated recipe contract and recipe-driven animation', () => {
    render(
      <ModernDrawer open onClose={vi.fn()} title="Recipe">
        body
      </ModernDrawer>
    );
    const panel = surface();

    expect(panel).toHaveAttribute('data-recipe', 'overlay.sheet');
    expect(panel).toHaveAttribute('data-recipe-state', 'animated');
    expect(panel.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');
    expect(panel.style.animation).toContain('var(--ds-recipe-enter');
  });

  it('modern engine declares NO animation under reduced motion (final state)', () => {
    render(
      <MotionProvider reducedMotion>
        <ModernDrawer open onClose={vi.fn()} title="Recipe">
          body
        </ModernDrawer>
      </MotionProvider>
    );
    const panel = surface();

    expect(panel).toHaveAttribute('data-recipe-state', 'final');
    expect(panel.style.animation).toBe('');
    expect(panel.style.getPropertyValue('--ds-recipe-enter')).toBe('0ms');

    const backdrop = document.body.querySelector('[data-part="backdrop"]') as HTMLElement;
    expect(backdrop.style.animation).toBe('');
  });
});
