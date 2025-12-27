/**
 * Test setup for Vitest
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Polyfill for ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

// Polyfill for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock for getComputedStyle that properly returns inline styles
// This is needed for toHaveStyle matcher to work correctly
const originalGetComputedStyle = window.getComputedStyle;
Object.defineProperty(window, 'getComputedStyle', {
  value: (element: Element) => {
    // Get actual computed styles first
    const computedStyles = originalGetComputedStyle(element);

    // Return a proxy that also checks inline styles
    return new Proxy(computedStyles, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return (propertyName: string) => {
            // Check inline style first
            if (element instanceof HTMLElement) {
              const inlineValue = element.style.getPropertyValue(propertyName);
              if (inlineValue) return inlineValue;
            }
            return target.getPropertyValue(propertyName);
          };
        }

        // For direct property access (like .width, .padding)
        if (typeof prop === 'string' && element instanceof HTMLElement) {
          const camelCase = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          const inlineValue = element.style[camelCase as keyof CSSStyleDeclaration];
          if (inlineValue && typeof inlineValue === 'string') {
            return inlineValue;
          }
        }

        const value = target[prop as keyof CSSStyleDeclaration];
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    });
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
