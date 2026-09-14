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
  it('modern engine stamps the animated recipe contract on the family motion channels', () => {
    render(
      <ModernSheet open onOpenChange={vi.fn()} title="Recipe">
        body
      </ModernSheet>
    );
    const root = document.body.querySelector('.ds-sheet--modern') as HTMLElement;

    expect(root).toHaveAttribute('data-recipe', 'overlay.sheet');
    expect(root).toHaveAttribute('data-recipe-state', 'animated');
    expect(root).toHaveAttribute('data-motion', 'animated');
    expect(root.style.getPropertyValue('--ds-sheet-enter-duration')).not.toBe('0ms');

    const surface = part('.ds-sheet--modern', 'surface');
    expect(surface).toHaveAttribute('data-placement', 'bottom');
    expect(surface.style.animation).toBe('');
  });

  it('modern engine declares NO animation under reduced motion (final state)', () => {
    render(
      <MotionProvider reducedMotion>
        <ModernSheet open onOpenChange={vi.fn()} title="Recipe">
          body
        </ModernSheet>
      </MotionProvider>
    );
    const root = document.body.querySelector('.ds-sheet--modern') as HTMLElement;

    expect(root).toHaveAttribute('data-recipe-state', 'final');
    expect(root).toHaveAttribute('data-motion', 'final');
    expect(part('.ds-sheet--modern', 'surface').style.animation).toBe('');
    expect(part('.ds-sheet--modern', 'backdrop').style.animation).toBe('');
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
