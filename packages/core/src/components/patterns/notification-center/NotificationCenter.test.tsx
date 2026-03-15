import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import type { NotificationCenterProps } from './NotificationCenter.types';
import ClassicNotificationCenter from './engines/classic';
import ModernNotificationCenter from './engines/modern';
import RusticNotificationCenter from './engines/rustic';

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
});
