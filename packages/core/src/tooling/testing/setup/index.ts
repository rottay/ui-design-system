/**
 * @fileoverview Global test setup for Vitest + Testing Library.
 * @description Configures the test environment before any suite runs:
 * - Extends Vitest `expect` with Testing Library DOM matchers
 * - Sets a generous async timeout (30s) for lazy-loaded engine code
 * - Polyfills browser APIs absent in happy-dom: ResizeObserver,
 *   IntersectionObserver, matchMedia, Canvas getContext, getComputedStyle
 * - Cleans up tenant/theme/engine data attributes between tests
 */

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import '@ant-design/v5-patch-for-react-19';
import { expect, afterEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

/**
 * The DS test suite exercises a large amount of lazy-loaded engine code. The
 * default Testing Library timeout is too small for full coverage runs, which
 * can otherwise produce false negatives while imports are still resolving.
 * This value must stay BELOW vitest's testTimeout (15000 in vitest.config.ts):
 * a failing findBy or waitFor call must reject with the real query error
 * instead of outliving the test and surfacing as an opaque per-test timeout.
 */
configure({
  asyncUtilTimeout: 10000,
});

if ('happyDOM' in window) {
  const happyDom = window.happyDOM as {
    settings?: {
      disableCSSFileLoading?: boolean;
      handleDisabledFileLoadingAsSuccess?: boolean;
    };
  };

  if (happyDom.settings) {
    happyDom.settings.disableCSSFileLoading = true;
    happyDom.settings.handleDisabledFileLoadingAsSuccess = false;
  }
}

// Vitest's v8 coverage writer expects the reports directory to exist before it
// flushes per-file artifacts. Creating the common report directories here keeps
// coverage runs reproducible without relying on manual shell setup.
for (const reportsDirectory of ['coverage', 'coverage-final']) {
  mkdirSync(resolve(process.cwd(), reportsDirectory, '.tmp'), { recursive: true });
}

// Polyfill for ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

// Polyfill for IntersectionObserver
class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
global.IntersectionObserver = IntersectionObserverMock;

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  })),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  writable: true,
  value: vi.fn().mockReturnValue('data:image/png;base64,'),
});

function installMatchMediaMock(): void {
  const noop = () => undefined;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    } as MediaQueryList),
  });
}

// Polyfill for matchMedia. Keep this as a plain function rather than a vi.fn()
// so test-level vi.restoreAllMocks() cannot erase the browser shim.
installMatchMediaMock();

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
  installMatchMediaMock();
  // Clean up tenant attribute to prevent leaks between tests
  document.documentElement.removeAttribute('data-tenant');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-engine');
});
