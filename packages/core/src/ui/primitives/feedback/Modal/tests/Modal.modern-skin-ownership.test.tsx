/**
 * feedback/Modal modern engine — skin ownership + i18n floor pins (R2+R3 batch E).
 *
 * The modern engine stamps parts and state; the canonical modern skin
 * (`modern/skin/overlay-modal.css`) owns section layout AND typography. These pins
 * fail if paint/typography creeps back inline, and if the English
 * accessibility floor breaks when no I18nProvider is mounted.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ModernModal from '../engines/modern';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';

const DESKTOP_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

function renderModal(ui: React.ReactElement) {
  return render(
    <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
      {ui}
    </ResponsiveContext.Provider>,
  );
}

function part(name: string): HTMLElement {
  const el = document.querySelector(`[data-part='${name}']`);
  expect(el, `expected data-part='${name}'`).not.toBeNull();
  return el as HTMLElement;
}

describe('feedback/Modal modern — skin ownership', () => {
  it('stamps header parts with NO inline layout or typography (the skin owns them)', () => {
    renderModal(
      <ModernModal open title="Quarterly review" description="Confirm the scope" onClose={() => {}}>
        Body
      </ModernModal>,
    );

    const header = part('header');
    expect(header.style.padding).toBe('');
    expect(header.style.display).toBe('');

    const title = part('title');
    expect(title.textContent).toBe('Quarterly review');
    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(title.style.lineHeight).toBe('');

    const description = part('description');
    expect(description.textContent).toBe('Confirm the scope');
    expect(description.style.fontSize).toBe('');
    expect(description.style.lineHeight).toBe('');
    expect(description.style.marginTop).toBe('');
  });

  it('stamps footer actions with NO inline typography and paints confirmLoading via :disabled only', () => {
    renderModal(
      <ModernModal
        open
        title="t"
        onOk={() => {}}
        onCancel={() => {}}
        confirmLoading
        onClose={() => {}}
      >
        Body
      </ModernModal>,
    );

    const footer = part('footer');
    expect(footer.style.padding).toBe('');
    expect(footer.style.display).toBe('');

    const ok = document.querySelector("[data-part='action'][data-action='ok']") as HTMLButtonElement;
    const cancel = document.querySelector("[data-part='action'][data-action='cancel']") as HTMLButtonElement;
    expect(ok).not.toBeNull();
    expect(cancel).not.toBeNull();
    for (const action of [ok, cancel]) {
      expect(action.style.padding).toBe('');
      expect(action.style.fontSize).toBe('');
      expect(action.style.fontWeight).toBe('');
    }
    // The pending state is the `disabled` attribute; the skin's :disabled
    // rule owns the dimmed/wait paint — no inline opacity/cursor ternary.
    expect(ok.disabled).toBe(true);
    expect(ok.style.opacity).toBe('');
    expect(ok.style.cursor).toBe('');
  });

  it('keeps the close button geometry skin-owned', () => {
    renderModal(
      <ModernModal open title="t" onClose={() => {}}>
        Body
      </ModernModal>,
    );

    const close = part('close-button');
    expect(close.style.width).toBe('');
    expect(close.style.height).toBe('');
    expect(close.style.display).toBe('');
  });
});

describe('feedback/Modal modern — i18n English floor (no I18nProvider)', () => {
  it('resolves close/ok/cancel to the English floor without a provider', () => {
    renderModal(
      <ModernModal open title="t" onOk={() => {}} onCancel={() => {}} onClose={() => {}}>
        Body
      </ModernModal>,
    );

    expect(part('close-button')).toHaveAttribute('aria-label', 'Close');
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('caller-supplied okText/cancelText still win over the floor', () => {
    renderModal(
      <ModernModal
        open
        title="t"
        okText="Apply changes"
        cancelText="Discard"
        onOk={() => {}}
        onCancel={() => {}}
        onClose={() => {}}
      >
        Body
      </ModernModal>,
    );

    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('fires onCancel and onOpenChange(false) from the cancel action', () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    renderModal(
      <ModernModal open title="t" onCancel={onCancel} onOpenChange={onOpenChange} onClose={() => {}}>
        Body
      </ModernModal>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
