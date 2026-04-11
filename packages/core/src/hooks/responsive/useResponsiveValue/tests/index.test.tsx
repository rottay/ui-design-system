import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useResponsiveValue } from '..';

function installMatchMedia(viewportWidth: number): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const minWidth = query.match(/min-width:\s*(\d+)px/);
    const matches = minWidth ? viewportWidth >= Number(minWidth[1]) : false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

describe('useResponsiveValue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the base value on narrow viewports', async () => {
    installMatchMedia(375);

    const { result } = renderHook(() =>
      useResponsiveValue({ base: 'mobile', sm: 'tablet', md: 'desktop' })
    );

    await waitFor(() => {
      expect(result.current).toBe('mobile');
    });
  });

  it('returns the most specific matching breakpoint value', async () => {
    installMatchMedia(1440);

    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'base',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
      })
    );

    await waitFor(() => {
      expect(result.current).toBe('xl');
    });
  });

  it('falls back through the cascade when an intermediate breakpoint is undefined', async () => {
    installMatchMedia(1800);

    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 1,
        sm: 2,
        lg: 4,
        '2xl': 6,
      })
    );

    await waitFor(() => {
      expect(result.current).toBe(6);
    });

    installMatchMedia(900);

    const second = renderHook(() =>
      useResponsiveValue({
        base: 1,
        sm: 2,
        lg: 4,
      })
    );

    await waitFor(() => {
      expect(second.result.current).toBe(2);
    });
  });
});
