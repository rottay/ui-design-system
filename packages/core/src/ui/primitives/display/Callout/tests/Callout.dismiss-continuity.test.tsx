/**
 * Dismiss continuity for the modern Callout shell.
 *
 * Two defects this file pins, both already governed by the Alert shell the
 * Callout is a twin of:
 *  1. a keyboard dismiss unmounted the subtree under the focused close button,
 *     dropping focus to `<body>`;
 *  2. the dismissal latch was instance-internal, so a reused Callout swallowed
 *     every later message.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernCallout from '../engines/modern';

describe('Callout modern -- dismissal never strands focus', () => {
  it('keyboard dismiss lands focus on the next focusable element, not <body>', () => {
    render(
      <div>
        <ModernCallout closable>Subscription expires in 3 days.</ModernCallout>
        <button type="button">After the callout</button>
      </div>
    );

    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();
    expect(document.activeElement).toBe(close);

    // detail === 0 is the click a keyboard Enter/Space synthesises.
    fireEvent.click(close, { detail: 0 });

    expect(screen.queryByText('Subscription expires in 3 days.')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After the callout' }));
    expect(document.activeElement).not.toBe(document.body);
  });

  it('falls back to the last focusable element before it when nothing follows', () => {
    render(
      <div>
        <button type="button">Before the callout</button>
        <ModernCallout closable>Nothing follows this one.</ModernCallout>
      </div>
    );

    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();
    fireEvent.click(close, { detail: 0 });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before the callout' }));
  });

  it('leaves pointer dismissals to the browser default', () => {
    render(
      <div>
        <ModernCallout closable>Pointer dismissal.</ModernCallout>
        <button type="button">After the callout</button>
      </div>
    );

    const close = screen.getByRole('button', { name: 'Close' });
    // detail >= 1 is a real pointer click.
    fireEvent.click(close, { detail: 1 });

    expect(screen.queryByText('Pointer dismissal.')).toBeNull();
    expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'After the callout' }));
  });
});

describe('Callout modern -- a dismissal dies with the message it dismissed', () => {
  it('re-opens for a new primitive message on a reused instance', () => {
    const { rerender } = render(<ModernCallout closable>First message.</ModernCallout>);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }), { detail: 1 });
    expect(screen.queryByText('First message.')).toBeNull();

    rerender(<ModernCallout closable>Second message.</ModernCallout>);

    expect(screen.getByText('Second message.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('stays dismissed while the same message is re-rendered', () => {
    const { rerender } = render(<ModernCallout closable>Same message.</ModernCallout>);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }), { detail: 1 });
    rerender(<ModernCallout closable>Same message.</ModernCallout>);

    expect(screen.queryByText('Same message.')).toBeNull();
  });

  it('stays dismissed for non-primitive content across re-renders', () => {
    const { rerender } = render(
      <ModernCallout closable>
        <strong>Composed node.</strong>
      </ModernCallout>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }), { detail: 1 });
    rerender(
      <ModernCallout closable>
        <strong>Composed node.</strong>
      </ModernCallout>
    );

    expect(screen.queryByText('Composed node.')).toBeNull();
  });
});
