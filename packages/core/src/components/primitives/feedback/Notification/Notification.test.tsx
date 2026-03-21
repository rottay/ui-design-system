/**
 * Notification Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { NotificationProvider, useNotification } from './';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

const NotificationTester = ({ onMount }: { onMount: (api: any) => void }) => {
  const [notificationApi, contextHolder] = useNotification();
  onMount(notificationApi);
  return <>{contextHolder}</>;
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

    it.each(['modern', 'rustic'] as const)(
      'updates notifications with the same key in the live %s engine',
      async (engine) => {
        let notificationApi: any;
        renderWithEngine(
          <NotificationProvider engine={engine}>
            <NotificationTester onMount={(api) => (notificationApi = api)} />
          </NotificationProvider>,
          engine
        );

        act(() => {
          notificationApi.info({
            key: 'sync',
            message: 'Syncing',
            duration: 0,
          });
        });

        expect(await screen.findByText('Syncing')).toBeInTheDocument();

        act(() => {
          notificationApi.success({
            key: 'sync',
            message: 'Synced',
            duration: 0,
          });
        });

        await waitFor(() => {
          expect(screen.queryByText('Syncing')).not.toBeInTheDocument();
          expect(screen.getByText('Synced')).toBeInTheDocument();
        });
      }
    );

    it.each(['modern', 'rustic'] as const)(
      'enforces maxCount in the live %s engine',
      async (engine) => {
        let notificationApi: any;
        renderWithEngine(
          <NotificationProvider engine={engine} maxCount={1}>
            <NotificationTester onMount={(api) => (notificationApi = api)} />
          </NotificationProvider>,
          engine
        );

        act(() => {
          notificationApi.info({ message: 'First', duration: 0 });
          notificationApi.warning({ message: 'Second', duration: 0 });
        });

        await waitFor(() => {
          expect(screen.queryByText('First')).not.toBeInTheDocument();
          expect(screen.getByText('Second')).toBeInTheDocument();
        });
      }
    );

    // Skipped: Ant Design's destroy() method relies on internal state management
    // that doesn't work reliably in jsdom. Test in browser environment instead.
    it.skip('destroys all notifications', async () => {
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
          actions: <button>Click me</button>,
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
    it.each(['classic', 'modern', 'rustic'] as const)(
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

  describe('Notification tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', async (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      let notificationApi: any;
      render(
        <NotificationProvider>
          <NotificationTester onMount={(api) => (notificationApi = api)} />
        </NotificationProvider>
      );

      act(() => {
        notificationApi.info({
          message: 'Tenant notification',
          description: 'Tenant test',
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
