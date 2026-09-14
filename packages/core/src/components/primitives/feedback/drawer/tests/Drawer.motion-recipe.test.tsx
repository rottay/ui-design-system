import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernDrawer from '../engines/modern';
import { MotionProvider } from '@/infrastructure/runtime/motion';
import { renderWithEngine } from '@tests/support/engine';

function surface(): HTMLElement {
  const node = document.body.querySelector('[role="dialog"][data-part="surface"]');
  expect(node).not.toBeNull();
  return node as HTMLElement;
}

describe('Drawer overlay.sheet motion recipe', () => {
  it('modern engine stamps the animated recipe contract on the family motion channels', () => {
    renderWithEngine(
      <ModernDrawer open onClose={vi.fn()} title="Recipe">
        body
      </ModernDrawer>,
      'modern'
    );
    const panel = surface();

    expect(panel).toHaveAttribute('data-recipe', 'overlay.sheet');
    expect(panel).toHaveAttribute('data-recipe-state', 'animated');
    expect(panel).toHaveAttribute('data-motion', 'animated');
    expect(panel.style.getPropertyValue('--ds-drawer-enter-duration')).not.toBe('0ms');
    expect(panel.style.animation).toBe('');
  });

  it('modern engine declares NO animation under reduced motion (final state)', () => {
    renderWithEngine(
      <MotionProvider reducedMotion>
        <ModernDrawer open onClose={vi.fn()} title="Recipe">
          body
        </ModernDrawer>
      </MotionProvider>,
      'modern'
    );
    const panel = surface();

    expect(panel).toHaveAttribute('data-recipe-state', 'final');
    expect(panel).toHaveAttribute('data-motion', 'final');
    expect(panel.style.animation).toBe('');
    expect(panel.style.getPropertyValue('--ds-drawer-enter-duration')).toBe('0ms');

    const backdrop = document.body.querySelector('[data-part="backdrop"]') as HTMLElement;
    expect(backdrop).toHaveAttribute('data-motion', 'final');
  });
});
