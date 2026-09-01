/**
 * Notification card activation (modern engine).
 *
 * A clickable notification wraps consumer-supplied `actions`. Activation on
 * one of those controls used to bubble to the card: the pointer path fired the
 * card's `onClick` on top of the action, and the keyboard path was worse --
 * the card's Enter/Space branch called `preventDefault()`, so the button the
 * user actually pressed never activated at all.
 *
 * @module Notification/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationItem as ModernNotificationItem } from '../engines/modern';

function renderClickableCard(onCardClick: () => void, onActionClick: () => void) {
  return render(
    <ModernNotificationItem
      id="deploy-1"
      type="info"
      message="Deploy finished"
      duration={0}
      onClick={onCardClick}
      actions={
        <button type="button" onClick={onActionClick}>
          View log
        </button>
      }
    />
  );
}

describe('Notification modern card activation', () => {
  it('does not fire the card onClick when an action inside it is clicked', () => {
    const onCardClick = vi.fn();
    const onActionClick = vi.fn();
    renderClickableCard(onCardClick, onActionClick);

    fireEvent.click(screen.getByRole('button', { name: 'View log' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('leaves Enter/Space on an inner control to that control', () => {
    const onCardClick = vi.fn();
    const onActionClick = vi.fn();
    renderClickableCard(onCardClick, onActionClick);

    const action = screen.getByRole('button', { name: 'View log' });
    const enter = fireEvent.keyDown(action, { key: 'Enter', bubbles: true });

    expect(onCardClick).not.toHaveBeenCalled();
    // The card must not swallow the key: a prevented default would stop the
    // browser from turning it into the button's own activation.
    expect(enter).toBe(true);
  });

  it('still activates the card itself from pointer and keyboard', () => {
    const onCardClick = vi.fn();
    const onActionClick = vi.fn();
    const { container } = renderClickableCard(onCardClick, onActionClick);

    const card = container.querySelector('[data-part="root"]') as HTMLElement;
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onCardClick).toHaveBeenCalledTimes(2);
    expect(onActionClick).not.toHaveBeenCalled();
  });
});
