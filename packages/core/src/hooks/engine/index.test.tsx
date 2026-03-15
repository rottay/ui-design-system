import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EngineContext } from '../../engines';
import { useEngine, useEngineContext } from '.';

describe('useEngine hook', () => {
  it('throws when used outside EngineContext', () => {
    expect(() => renderHook(() => useEngine())).toThrow('useEngine must be used within EngineProvider');
  });

  it('returns the current engine and setter when context is present', () => {
    const setEngine = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EngineContext.Provider value={{ engine: 'modern', setEngine }}>
        {children}
      </EngineContext.Provider>
    );

    const { result } = renderHook(() => useEngine(), { wrapper });

    expect(result.current.engine).toBe('modern');
    result.current.setEngine('rustic');
    expect(setEngine).toHaveBeenCalledWith('rustic');
  });

  it('keeps backwards compatibility via useEngineContext alias', () => {
    const setEngine = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EngineContext.Provider value={{ engine: 'classic', setEngine }}>
        {children}
      </EngineContext.Provider>
    );

    const { result } = renderHook(() => useEngineContext(), { wrapper });

    expect(result.current.engine).toBe('classic');
  });
});
