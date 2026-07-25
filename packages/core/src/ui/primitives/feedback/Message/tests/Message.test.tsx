/**
 * Message Component Tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MessageProvider, useMessage } from '..';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const MessageTester = ({ onMount }: { onMount: (api: any) => void }) => {
  const [messageApi, contextHolder] = useMessage();
  onMount(messageApi);
  return <>{contextHolder}</>;
};

describe('Message', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('MessageProvider', () => {
    it('renders children', () => {
      render(
        <MessageProvider>
          <div>Child content</div>
        </MessageProvider>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('provides message context', () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );
      expect(messageApi).toBeDefined();
      expect(typeof messageApi.success).toBe('function');
      expect(typeof messageApi.error).toBe('function');
    });
  });

  describe('Message Methods', () => {
    it('shows success message', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.success('Success!');
      });

      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
    });

    it('shows error message', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.error('Error occurred');
      });

      await waitFor(() => {
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
      });
    });

    it('shows info message', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.info('Info message');
      });

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });

    it('shows warning message', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.warning('Warning message');
      });

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('shows loading message', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.loading('Loading...');
      });

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('Message Options', () => {
    // Reactivated against the modern engine: the classic engine delegates
    // auto-close to Ant Design's CSS-animation-driven removal, which
    // happy-dom cannot observe. The modern engine runs the lifecycle on
    // plain timers: expiry stamps data-state='exit' for one 160ms skin exit
    // cadence, then removes the node.
    it('auto closes after duration', () => {
      vi.useFakeTimers();
      let messageApi: any;
      renderWithEngine(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>,
        'modern'
      );

      act(() => {
        messageApi.success({ content: 'Quick', duration: 0.5 });
      });

      expect(screen.getByText('Quick')).toBeInTheDocument();

      // Expiry begins the exit lifecycle: the node stays mounted, stamped
      // data-state='exit', until the skin's 160ms exit cadence elapses.
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('alert')).toHaveAttribute('data-state', 'exit');

      act(() => {
        vi.advanceTimersByTime(160);
      });
      expect(screen.queryByText('Quick')).not.toBeInTheDocument();
    });

    it('updates existing message by key', async () => {
      let messageApi: any;
      render(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>
      );

      act(() => {
        messageApi.loading({ content: 'Loading...', key: 'update-key', duration: 0 });
      });

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => {
        messageApi.success({ content: 'Done!', key: 'update-key' });
      });

      await waitFor(() => {
        expect(screen.getByText('Done!')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    // Reactivated against the modern engine, whose destroy() synchronously
    // clears the stack. (The classic engine routes keyless destroy() to the
    // global Ant Design singleton, which cannot see hook-instance messages.)
    it('destroys all messages', () => {
      let messageApi: any;
      renderWithEngine(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>,
        'modern'
      );

      act(() => {
        messageApi.success({ content: 'Message 1', duration: 0 });
        messageApi.info({ content: 'Message 2', duration: 0 });
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();

      act(() => {
        messageApi.destroy();
      });

      expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    // Reactivated against the modern live-region contract: the stack is a
    // polite role='log' live region (rustic parity) and each item keeps
    // role='alert' inside it. Ant Design renders messages without any
    // landmark role, so the classic engine has no equivalent to assert.
    it('message has alert role', () => {
      let messageApi: any;
      renderWithEngine(
        <MessageProvider>
          <MessageTester onMount={(api) => (messageApi = api)} />
        </MessageProvider>,
        'modern'
      );

      act(() => {
        messageApi.success({ content: 'Alert message', duration: 0 });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Alert message');

      const stack = screen.getByRole('log');
      expect(stack).toHaveAttribute('aria-live', 'polite');
      expect(stack).toContainElement(alert);
    });
  });
});

describe('Message tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <MessageProvider>
        <div>Test content</div>
      </MessageProvider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
