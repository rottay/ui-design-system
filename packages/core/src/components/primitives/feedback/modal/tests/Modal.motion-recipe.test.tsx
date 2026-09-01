import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernModal from '../engines/modern';
import RusticModal from '../engines/rustic';
import { MotionProvider } from '@/infrastructure/runtime/motion';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

function modernDialog(): HTMLDialogElement {
  const dialog = document.body.querySelector('dialog');
  expect(dialog).not.toBeNull();
  return dialog as HTMLDialogElement;
}

describe('Modal overlay.modal motion recipe', () => {
  it('modern engine stamps the animated recipe contract and recipe-driven animation', () => {
    render(
      <I18nProvider locale="en">
        <ModernModal open onClose={vi.fn()} title="Recipe">
          body
        </ModernModal>
      </I18nProvider>
    );
    const dialog = modernDialog();

    expect(dialog).toHaveAttribute('data-recipe', 'overlay.modal');
    expect(dialog).toHaveAttribute('data-recipe-state', 'animated');
    expect(dialog.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');

    const surface = dialog.querySelector('[data-part="surface"]') as HTMLElement;
    expect(surface.style.animation).toContain('ds-overlay-modal-enter-modern');
    expect(surface.style.animation).toContain('var(--ds-recipe-enter');
  });

  it('modern engine declares NO animation under reduced motion (final state)', () => {
    render(
      <I18nProvider locale="en">
        <MotionProvider reducedMotion>
          <ModernModal open onClose={vi.fn()} title="Recipe">
            body
          </ModernModal>
        </MotionProvider>
      </I18nProvider>
    );
    const dialog = modernDialog();

    expect(dialog).toHaveAttribute('data-recipe-state', 'final');
    expect(dialog.style.getPropertyValue('--ds-recipe-enter')).toBe('0ms');

    const surface = dialog.querySelector('[data-part="surface"]') as HTMLElement;
    expect(surface.style.animation).toBe('');
    const backdrop = dialog.querySelector('[data-part="backdrop"]') as HTMLElement;
    expect(backdrop.style.animation).toBe('');
  });

  it('rustic engine wires the recipe contract and drops its transition when reduced', () => {
    const { rerender } = render(
      <I18nProvider locale="en">
        <RusticModal open onClose={vi.fn()} title="Recipe" adaptiveFullscreen={false}>
          body
        </RusticModal>
      </I18nProvider>
    );
    let surface = document.body.querySelector(
      '.rottay-overlay-modal-shell--rustic[data-part="surface"]'
    ) as HTMLElement;
    expect(surface).toHaveAttribute('data-recipe', 'overlay.modal');
    expect(surface).toHaveAttribute('data-recipe-state', 'animated');
    expect(surface.style.transition).toContain('var(--ds-recipe-enter');

    rerender(
      <I18nProvider locale="en">
        <MotionProvider reducedMotion>
          <RusticModal open onClose={vi.fn()} title="Recipe" adaptiveFullscreen={false}>
            body
          </RusticModal>
        </MotionProvider>
      </I18nProvider>
    );
    surface = document.body.querySelector(
      '.rottay-overlay-modal-shell--rustic[data-part="surface"]'
    ) as HTMLElement;
    expect(surface).toHaveAttribute('data-recipe-state', 'final');
    expect(surface.style.transition).toBe('none');
    expect(surface.style.getPropertyValue('--ds-recipe-scale-from')).toBe('1');
  });
});
