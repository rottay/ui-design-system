/**
 * Notification Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../';

const NotificationTester = ({ onMount }: { onMount: (api: any) => void }) => {
  const notification = useNotification();
  onMount(notification);
  return null;
};

describe('Notification', () => {
  describe('NotificationProvider', () => {
    it('renders children', () => {
      render(
        <NotificationProvider>
          <div>Child content</div>
        </NotificationProvider>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('provides notification context', () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );
      expect(notificationApi).toBeDefined();
      expect(typeof notificationApi.success).toBe('function');
      expect(typeof notificationApi.error).toBe('function');
      expect(typeof notificationApi.info).toBe('function');
      expect(typeof notificationApi.warning).toBe('function');
      expect(typeof notificationApi.open).toBe('function');
    });
  });

  describe('Notification Methods', () => {
    it('shows success notification', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.success({
          message: 'Success Title',
          description: 'Success description',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Success Title')).toBeInTheDocument();
        expect(screen.getByText('Success description')).toBeInTheDocument();
      });
    });

    it('shows error notification', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.error({
          message: 'Error Title',
          description: 'Error description',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Error Title')).toBeInTheDocument();
      });
    });

    it('shows info notification', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.info({
          message: 'Info Title',
          description: 'Info description',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Info Title')).toBeInTheDocument();
      });
    });

    it('shows warning notification', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.warning({
          message: 'Warning Title',
          description: 'Warning description',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Warning Title')).toBeInTheDocument();
      });
    });
  });

  describe('Notification Options', () => {
    it('auto closes after duration', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.info({
          message: 'Quick',
          description: 'Goes away fast',
          duration: 0.5,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Quick')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.queryByText('Quick')).not.toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('renders notification with custom placement', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.open({
          message: 'Placed Notification',
          description: 'At bottom left',
          placement: 'bottomLeft',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Placed Notification')).toBeInTheDocument();
      });
    });

    it('destroys all notifications', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.success({ message: 'Notification 1', duration: 0 });
        notificationApi.info({ message: 'Notification 2', duration: 0 });
      });

      await waitFor(() => {
        expect(screen.getByText('Notification 1')).toBeInTheDocument();
        expect(screen.getByText('Notification 2')).toBeInTheDocument();
      });

      act(() => {
        notificationApi.destroy();
      });

      await waitFor(() => {
        expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Notification 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification with Actions', () => {
    it('renders notification with button', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.open({
          message: 'Action Notification',
          description: 'Has a button',
          btn: <button>Click me</button>,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('notification has alert role', async () => {
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.success({
          message: 'Alert notification',
          description: 'For accessibility',
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Engine Support', () => {
    it.each(['titan', 'hermes', 'apollo'] as const)(
      'works with %s engine provider',
      async (engine) => {
        let notificationApi: any;
        render(
          <NotificationProvider engine={engine}>
            <NotificationTester onMount={(api) => (notificationApi = api)} />
          </NotificationProvider>
        );

        act(() => {
          notificationApi.info({
            message: `${engine} notification`,
            description: 'Engine test',
          });
        });

        await waitFor(() => {
          expect(screen.getByText(`${engine} notification`)).toBeInTheDocument();
        });
      }
    );
  });
});
