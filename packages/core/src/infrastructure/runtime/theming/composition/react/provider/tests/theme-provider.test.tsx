import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useThemeContext } from '..';

function TestConsumer() {
  const { tenant, theme, isLoading, isFallback, config, setTenant } = useThemeContext();
  return (
    <div>
      <div data-testid="tenant">{tenant}</div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <div data-testid="is-fallback">{String(isFallback)}</div>
      <div data-testid="config-url">{config?.cssUrl ?? 'none'}</div>
      <button onClick={() => setTenant?.('next-tenant')}>next</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('provides context without resolving or painting a tenant stylesheet', () => {
    const baseline = document.head.innerHTML;
    render(
      <ThemeProvider tenant="custom-tenant" theme="dark">
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('tenant')).toHaveTextContent('custom-tenant');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-fallback')).toHaveTextContent('false');
    expect(screen.getByTestId('config-url')).toHaveTextContent('none');
    expect(document.head.innerHTML).toBe(baseline);
    expect(document.querySelector('link[id^="tenant-theme-"]')).toBeNull();
    expect(document.getElementById('rottay-emergency-tokens')).toBeNull();
  });

  it('keeps setTenant context-only and never creates a style or link', () => {
    const { container } = render(
      <ThemeProvider tenant="first">
        <TestConsumer />
      </ThemeProvider>,
    );

    act(() => screen.getByRole('button', { name: 'next' }).click());

    expect(screen.getByTestId('tenant')).toHaveTextContent('next-tenant');
    expect(container.querySelector('style,link')).toBeNull();
    expect(document.querySelector('link[id^="tenant-theme-"]')).toBeNull();
    expect(document.getElementById('rottay-emergency-tokens')).toBeNull();
  });

  it('throws outside its provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useThemeContext must be used within ThemeProvider',
    );
  });
});
