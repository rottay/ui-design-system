/**
 * Busy-state consolidation tests (WO-CRA-02).
 *
 * Pins three things an adversarial review found missing:
 * 1. The precedence order `resolveButtonBusyState` implements across the
 *    overlapping busy props (`pending`/`pendingLabel` vs the deprecated
 *    `loading`/`loadingText`).
 * 2. That a `pending` button never fires `onClick`.
 * 3. That the modern engine's `pending` posture is UNCONDITIONALLY
 *    width-stable -- not just when `pendingLabel` happens to be short.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { resolveButtonBusyState } from '../contracts';
import ModernButton from '../engines/modern';
import ClassicButton from '../engines/classic';
import RusticButton from '../engines/rustic';

describe('resolveButtonBusyState (busy-prop resolution order)', () => {
  it('is not busy when neither pending nor loading is set', () => {
    expect(resolveButtonBusyState({})).toEqual({
      busy: false,
      widthStable: false,
      label: undefined,
    });
  });

  it('is busy via the deprecated loading alone, without width stability', () => {
    expect(resolveButtonBusyState({ loading: true })).toEqual({
      busy: true,
      widthStable: false,
      label: undefined,
    });
  });

  it('is busy and width-stable via pending alone', () => {
    expect(resolveButtonBusyState({ pending: true })).toEqual({
      busy: true,
      widthStable: true,
      label: undefined,
    });
  });

  it('keeps width stability when both pending and the deprecated loading are set (pending wins the render path)', () => {
    expect(resolveButtonBusyState({ pending: true, loading: true })).toEqual({
      busy: true,
      widthStable: true,
      label: undefined,
    });
  });

  it('resolves pendingLabel over the deprecated loadingText when both are set', () => {
    expect(
      resolveButtonBusyState({
        pending: true,
        pendingLabel: 'Saving',
        loading: true,
        loadingText: 'Loading legacy',
      }).label
    ).toBe('Saving');
  });

  it('falls back to the deprecated loadingText when pendingLabel is absent', () => {
    expect(resolveButtonBusyState({ loading: true, loadingText: 'Verifying...' }).label).toBe(
      'Verifying...'
    );
  });

  it('resolves no label when neither pendingLabel nor loadingText is set', () => {
    expect(resolveButtonBusyState({ pending: true }).label).toBeUndefined();
  });
});

describe('ModernButton pending posture', () => {
  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <ModernButton pending onClick={handleClick}>
        Save
      </ModernButton>
    );

    // Busy presentation never erases the action's accessible name.
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders the deprecated loadingText as the busy label when set via loading alone', () => {
    render(
      <ModernButton loading loadingText="Verifying...">
        Continue
      </ModernButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    // loadingText must never leak onto the DOM as a raw attribute.
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <ModernButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </ModernButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });
});

describe('ModernButton pending width stability', () => {
  it('reserves the resting content in flow and isolates any longer pending label in an overlay', () => {
    const { container } = render(
      <ModernButton pending pendingLabel="Saving your extremely long document title now">
        Save
      </ModernButton>
    );

    const frame = container.querySelector('[data-part="content-frame"]');
    const reserve = frame?.querySelector('[data-part="content"][data-layer="reserve"]');
    const busyLayer = frame?.querySelector('[data-part="busy-content"]');
    expect(frame).toBeInTheDocument();
    expect(reserve).toHaveTextContent('Save');
    expect(reserve).toHaveAttribute('aria-hidden', 'true');
    expect(busyLayer).toHaveTextContent('Saving your extremely long document title now');
    expect(screen.getByRole('button', { name: /saving your extremely long/i })).toBeDisabled();
  });

  it('keeps the same reserve anatomy for icon and full-width buttons', () => {
    const { container } = render(
      <ModernButton fullWidth icon={<span>*</span>} pending pendingLabel="Publishing your changes to production">
        Publish changes
      </ModernButton>
    );

    const button = screen.getByRole('button', { name: /publishing your changes/i });
    expect(button).toHaveAttribute('data-full-width', 'true');
    expect(container.querySelector('[data-layer="reserve"] [data-part="icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="content-frame"]')).toBeInTheDocument();
  });
});

describe('ClassicButton legacy busy props', () => {
  it('renders the deprecated loadingText as content while busy and does not leak it onto the DOM', () => {
    render(
      <ClassicButton loading loadingText="Verifying...">
        Continue
      </ClassicButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    expect(button).not.toHaveTextContent('Continue');
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <ClassicButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </ClassicButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });

  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <ClassicButton pending onClick={handleClick}>
        Save
      </ClassicButton>
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('RusticButton legacy busy props', () => {
  it('renders the deprecated loadingText as content while busy and does not leak it onto the DOM', () => {
    render(
      <RusticButton loading loadingText="Verifying...">
        Continue
      </RusticButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <RusticButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </RusticButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });

  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <RusticButton pending onClick={handleClick}>
        Save
      </RusticButton>
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
