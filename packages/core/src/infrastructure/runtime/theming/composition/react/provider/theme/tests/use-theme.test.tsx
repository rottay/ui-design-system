import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeContext } from '../..';
import { useTheme, useThemeContext } from '..';

describe('useTheme hook', () => {
  it('throws when used outside ThemeContext', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider');
  });

  it('returns the current theme and setter when context is present', () => {
    const setTheme = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeContext.Provider
        value={{ theme: 'dark', setTheme, config: { name: 'dark', variables: {} } }}
      >
        {children}
      </ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(result.current.config).toEqual({ name: 'dark', variables: {} });
    result.current.setTheme('light');
    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('keeps backwards compatibility via useThemeContext alias', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeContext.Provider value={{ theme: 'light', setTheme: vi.fn(), config: null }}>
        {children}
      </ThemeContext.Provider>
    );

    const { result } = renderHook(() => useThemeContext(), { wrapper });

    expect(result.current.theme).toBe('light');
  });
});
