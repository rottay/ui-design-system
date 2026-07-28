import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { NotificationCenterProps } from '../contracts';
import ClassicNotificationCenter from '../engines/classic';
import ModernNotificationCenter from '../engines/modern';
import RusticNotificationCenter from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<NotificationCenterProps>> = {
  classic: ClassicNotificationCenter,
  modern: ModernNotificationCenter,
  rustic: RusticNotificationCenter,
};

function createProps(overrides: Partial<NotificationCenterProps> = {}): NotificationCenterProps {
  return {
    notifications: [
      { id: 'n1', title: 'New message', message: 'You have a new message from Alice', type: 'info', read: false, timestamp: new Date().toISOString() },
      { id: 'n2', title: 'Upload complete', message: 'Your file has been uploaded', type: 'success', read: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    ...overrides,
  };
}

describe('PatternNotificationCenter', () => {
  it.each(STABLE_ENGINES)(
    'renders trigger button with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByTestId('notification-trigger')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows notifications when trigger is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ open: true })} />, engine);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('New message')).toBeInTheDocument();
      expect(screen.getByText('Upload complete')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows empty message when no notifications in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ notifications: [], open: true, emptyMessage: 'All caught up!' })} />,
        engine,
      );

      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'fires onRead when a notification is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onRead = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onRead, open: true })} />,
        engine,
      );

      fireEvent.click(screen.getByText('New message'));
      expect(onRead).toHaveBeenCalledWith('n1');
    },
  );

  it.each(STABLE_ENGINES)(
    'renders mark all read button when onReadAll provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onReadAll = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onReadAll, open: true })} />,
        engine,
      );

      expect(screen.getByText('Mark all read')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Mark all read'));
      expect(onReadAll).toHaveBeenCalled();
    },
  );

  // R1-P Phase5 — run in serial tanda
  describe('modern trigger composes the Button primitive', () => {
    it('renders a native button rather than a role=button reconstruction', () => {
      renderWithEngine(<ModernNotificationCenter {...createProps()} />, 'modern');

      const trigger = screen.getByTestId('notification-trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).not.toHaveAttribute('role', 'button');
      // The skin paints the trigger through this hook; the primitive must not
      // overwrite the caller's anatomy part.
      expect(trigger).toHaveAttribute('data-part', 'trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Notifications');
    });

    it('activates from the keyboard, which the div reconstruction could not', () => {
      const onOpenChange = vi.fn();
      renderWithEngine(
        <ModernNotificationCenter {...createProps({ onOpenChange })} />,
        'modern',
      );

      // A native button fires click for Enter/Space; the previous
      // div[role=button] had no key handler and was mouse-only.
      screen.getByTestId('notification-trigger').focus();
      fireEvent.click(screen.getByTestId('notification-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('preserves the 40x40 icon geometry the trigger authored inline', () => {
      renderWithEngine(<ModernNotificationCenter {...createProps()} />, 'modern');

      const trigger = screen.getByTestId('notification-trigger');
      expect(trigger.style.height).toBe('40px');
      expect(trigger.style.width).toBe('40px');
      expect(trigger.style.padding).toBe('0px');
    });
  });
});
