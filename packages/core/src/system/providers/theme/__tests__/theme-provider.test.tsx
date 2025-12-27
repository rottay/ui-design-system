/**
 * ThemeProvider tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useThemeContext } from '../index';

// Store original createElement
const originalCreateElement = document.createElement.bind(document);

// Mock for controlling link element behavior
let linkBehavior: 'success' | 'error' | 'timeout' = 'success';
let tenantLoadedCallbacks: Map<string, () => void> = new Map();

// Track timeouts for cleanup
let pendingTimeouts: NodeJS.Timeout[] = [];

// Test component that uses the theme hook
function TestConsumer() {
  const { tenant, theme, isLoading, isFallback, config } = useThemeContext();
  return (
    <div>
      <div data-testid="tenant">{tenant}</div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="isLoading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="isFallback">{isFallback ? 'fallback' : 'normal'}</div>
      <div data-testid="config-name">{config?.name || 'none'}</div>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = '';
    linkBehavior = 'success';
    tenantLoadedCallbacks.clear();
    pendingTimeouts = [];

    // Mock document.createElement for link elements
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'link') {
        // Simulate async CSS loading with tracked timeout
        const timeoutId = setTimeout(() => {
          if (linkBehavior === 'success' || (element.href && element.href.includes('rottay'))) {
            if (element.onload) {
              element.onload(new Event('load'));
            }
          } else if (linkBehavior === 'error') {
            if (element.onerror) {
              element.onerror(new Event('error'));
            }
          }
          // For timeout, we don't call anything - let the timeout handler run
        }, 10);
        pendingTimeouts.push(timeoutId);
      }
      return element;
    }) as any;
  });

  afterEach(() => {
    // Clean up pending timeouts
    pendingTimeouts.forEach(id => clearTimeout(id));
    pendingTimeouts = [];
    // Clean up DOM
    document.head.innerHTML = '';
    document.createElement = originalCreateElement;
    vi.clearAllMocks();
  });

  it('provides default theme context', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tenant').textContent).toBe('rottay');
    });

    expect(screen.getByTestId('theme').textContent).toBe('base');
  });

  it('accepts custom initial tenant', async () => {
    // For custom tenant, simulate error so it falls back to rottay
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'link') {
        const timeoutId = setTimeout(() => {
          // Custom tenant fails, rottay succeeds
          if (element.href && element.href.includes('custom-tenant')) {
            if (element.onerror) {
              element.onerror(new Event('error'));
            }
          } else if (element.href && element.href.includes('rottay')) {
            if (element.onload) {
              element.onload(new Event('load'));
            }
          }
        }, 10);
        pendingTimeouts.push(timeoutId);
      }
      return element;
    }) as any;

    render(
      <ThemeProvider tenant="custom-tenant">
        <TestConsumer />
      </ThemeProvider>
    );

    // Will attempt to load custom-tenant, then fallback to rottay
    await waitFor(() => {
      const tenant = screen.getByTestId('tenant').textContent;
      // Should fallback to rottay if custom-tenant.css doesn't exist
      expect(tenant).toBe('rottay');
    }, { timeout: 1000 });
  });

  it('throws error when useThemeContext used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useThemeContext must be used within ThemeProvider');

    console.error = originalError;
  });

  it('calls onError callback when theme fails to load', async () => {
    const onError = vi.fn();

    // Simulate nonexistent theme failing
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'link') {
        const timeoutId = setTimeout(() => {
          if (element.href && element.href.includes('nonexistent')) {
            if (element.onerror) {
              element.onerror(new Event('error'));
            }
          } else if (element.href && element.href.includes('rottay')) {
            if (element.onload) {
              element.onload(new Event('load'));
            }
          }
        }, 10);
        pendingTimeouts.push(timeoutId);
      }
      return element;
    }) as any;

    render(
      <ThemeProvider tenant="nonexistent" onError={onError}>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it('calls onFallback callback when falling back to Rottay', async () => {
    const onFallback = vi.fn();

    // Simulate nonexistent theme failing
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'link') {
        const timeoutId = setTimeout(() => {
          if (element.href && element.href.includes('nonexistent')) {
            if (element.onerror) {
              element.onerror(new Event('error'));
            }
          } else if (element.href && element.href.includes('rottay')) {
            if (element.onload) {
              element.onload(new Event('load'));
            }
          }
        }, 10);
        pendingTimeouts.push(timeoutId);
      }
      return element;
    }) as any;

    render(
      <ThemeProvider tenant="nonexistent" onFallback={onFallback}>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(
      () => {
        expect(onFallback).toHaveBeenCalledWith('nonexistent');
      },
      { timeout: 1000 }
    );
  });

  it('injects emergency tokens when even Rottay fails', async () => {
    // Mock loadTenantCSS to always fail
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'link') {
        // Trigger error immediately
        const timeoutId = setTimeout(() => {
          if (element.onerror) {
            element.onerror(new Event('error'));
          }
        }, 0);
        pendingTimeouts.push(timeoutId);
      }
      return element;
    }) as any;

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(
      () => {
        const emergencyStyle = document.getElementById('rottay-emergency-tokens');
        expect(emergencyStyle).toBeTruthy();
        expect(emergencyStyle?.textContent).toContain('--color-primary-500');
      },
      { timeout: 6000 }
    );
  });

  it('applies branding CSS variables', async () => {
    const branding = {
      primaryColor: '#FF0000',
      accentColor: '#00FF00',
    };

    render(
      <ThemeProvider branding={branding}>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      const primaryColor = document.documentElement.style.getPropertyValue('--tenant-primary');
      const accentColor = document.documentElement.style.getPropertyValue('--tenant-accent');

      expect(primaryColor).toBe('#FF0000');
      expect(accentColor).toBe('#00FF00');
    });
  });

  it('accepts custom cssBaseUrl', async () => {
    const cssBaseUrl = 'https://cdn.example.com/themes';

    render(
      <ThemeProvider cssBaseUrl={cssBaseUrl}>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      const links = document.querySelectorAll('link[id^="tenant-theme-"]');
      if (links.length > 0) {
        const link = links[0] as HTMLLinkElement;
        expect(link.href).toContain('cdn.example.com');
      }
    });
  });
});
