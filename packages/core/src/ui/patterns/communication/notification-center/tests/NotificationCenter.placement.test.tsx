import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernNotificationCenter from '../engines/modern';
import type { Notification, NotificationCenterProps } from '../contracts';

/** The panel anchors on the trigger's inline-end edge; when that edge lacks
    room for the panel width, the anchor must flip to inline-start. */

const PANEL_WIDTH = 360; // 22.5rem, the skin's --ds-notification-center-panel-width
const TRIGGER_WIDTH = 40;

function rect(left: number, width: number): DOMRect {
  return {
    x: left,
    y: 0,
    width,
    height: 40,
    top: 0,
    bottom: 40,
    left,
    right: left + width,
    toJSON: () => ({}),
  } as DOMRect;
}

/** Places the bell's root at `anchorLeft` in a `viewportWidth` viewport. */
function measureAt(anchorLeft: number, viewportWidth: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: viewportWidth,
    configurable: true,
    writable: true,
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function measured(this: HTMLElement): DOMRect {
      const part = this.getAttribute('data-part');
      if (part === 'panel') return rect(anchorLeft, PANEL_WIDTH);
      if (part === 'root') return rect(anchorLeft, TRIGGER_WIDTH);
      return rect(0, 0);
    },
  );
}

function buildProps(overrides: Partial<NotificationCenterProps> = {}): NotificationCenterProps {
  return {
    notifications: [
      {
        id: 'n1',
        title: 'Build passed',
        message: 'CI green on main',
        type: 'success',
        read: false,
        timestamp: '2026-05-18T14:22:00.000Z',
      } as Notification,
    ],
    open: true,
    ...overrides,
  } as NotificationCenterProps;
}

function panel(): HTMLElement {
  return screen.getByRole('region');
}

describe('NotificationCenter (modern) panel placement', () => {
  beforeEach(() => {
    document.documentElement.dir = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.dir = '';
  });

  it('flips to the inline-start anchor when the bell sits near the start edge', () => {
    // Bell at x=8 leaves only 48px of room for a 360px panel, forcing the
    // anchor to flip to inline-start.
    measureAt(8, 1440);
    render(<ModernNotificationCenter {...buildProps()} />);

    expect(panel()).toHaveAttribute('data-placement', 'start');
  });

  it('keeps the inline-end anchor for a bell in the header end (the canonical posture)', () => {
    measureAt(1392, 1440);
    render(<ModernNotificationCenter {...buildProps()} />);

    expect(panel()).toHaveAttribute('data-placement', 'end');
  });

  it('flips on a narrow viewport where the end anchor cannot fit the panel', () => {
    measureAt(8, 390);
    render(<ModernNotificationCenter {...buildProps()} />);

    expect(panel()).toHaveAttribute('data-placement', 'start');
  });

  it('mirrors the overflow test under RTL', () => {
    document.documentElement.dir = 'rtl';
    // Under RTL the end anchor grows toward the viewport's right edge: a bell
    // at x=1392 leaves 48px of room, so it must flip to the start anchor.
    measureAt(1392, 1440);
    render(<ModernNotificationCenter {...buildProps()} />);

    expect(panel()).toHaveAttribute('data-placement', 'start');
  });

  it('restores the default anchor once the panel closes', () => {
    measureAt(8, 1440);
    const { rerender } = render(<ModernNotificationCenter {...buildProps()} />);
    expect(panel()).toHaveAttribute('data-placement', 'start');

    rerender(<ModernNotificationCenter {...buildProps({ open: false })} />);
    measureAt(1392, 1440);
    rerender(<ModernNotificationCenter {...buildProps({ open: true })} />);

    expect(panel()).toHaveAttribute('data-placement', 'end');
  });
});
