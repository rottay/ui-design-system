import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSheet from '../engines/modern';
import RusticSheet from '../engines/rustic';
import { MotionProvider } from '@/infrastructure/runtime/motion';

function part(scope: string, name: string): HTMLElement {
  const node = document.body.querySelector(`${scope} [data-part="${name}"], ${scope}[data-part="${name}"]`);
  expect(node).not.toBeNull();
  return node as HTMLElement;
}

describe('Sheet overlay.sheet motion recipe', () => {
  it('modern engine stamps the animated recipe contract and recipe-driven animation', () => {
    render(
      <ModernSheet open onOpenChange={vi.fn()} title="Recipe">
        body
      </ModernSheet>
    );
    const root = document.body.querySelector('.rottay-sheet--modern') as HTMLElement;

    expect(root).toHaveAttribute('data-recipe', 'overlay.sheet');
    expect(root).toHaveAttribute('data-recipe-state', 'animated');
    expect(root.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');

    const surface = part('.rottay-sheet--modern', 'surface');
    expect(surface.style.animation).toContain('ds-sheet-slide-bottom-modern');
    expect(surface.style.animation).toContain('var(--ds-recipe-enter');
  });

  it('modern engine declares NO animation under reduced motion (final state)', () => {
    render(
      <MotionProvider reducedMotion>
        <ModernSheet open onOpenChange={vi.fn()} title="Recipe">
          body
        </ModernSheet>
      </MotionProvider>
    );
    const root = document.body.querySelector('.rottay-sheet--modern') as HTMLElement;

    expect(root).toHaveAttribute('data-recipe-state', 'final');
    expect(part('.rottay-sheet--modern', 'surface').style.animation).toBe('');
    expect(part('.rottay-sheet--modern', 'backdrop').style.animation).toBe('');
  });

  it('rustic engine wires the recipe contract and drops transitions when reduced', () => {
    const { rerender } = render(
      <RusticSheet open onOpenChange={vi.fn()} title="Recipe">
        body
      </RusticSheet>
    );
    let root = document.body.querySelector('.rottay-sheet--rustic') as HTMLElement;
    expect(root).toHaveAttribute('data-recipe', 'overlay.sheet');
    expect(root).toHaveAttribute('data-recipe-state', 'animated');
    expect(part('.rottay-sheet--rustic', 'surface').style.transition).toContain('var(--ds-recipe-enter');

    rerender(
      <MotionProvider reducedMotion>
        <RusticSheet open onOpenChange={vi.fn()} title="Recipe">
          body
        </RusticSheet>
      </MotionProvider>
    );
    root = document.body.querySelector('.rottay-sheet--rustic') as HTMLElement;
    expect(root).toHaveAttribute('data-recipe-state', 'final');
    expect(part('.rottay-sheet--rustic', 'surface').style.transition).toBe('none');
    expect(part('.rottay-sheet--rustic', 'backdrop').style.transition).toBe('none');
  });
});
