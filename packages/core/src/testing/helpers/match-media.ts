import { vi } from 'vitest';

function queryMatches(query: string, width: number, prefersReducedMotion = false): boolean {
  if (query.includes('prefers-reduced-motion')) {
    return prefersReducedMotion && query.includes('reduce');
  }

  const min = query.match(/min-width:\s*(\d+)px/);
  const max = query.match(/max-width:\s*(\d+)px/);

  if (min && width < Number(min[1])) {
    return false;
  }

  if (max && width > Number(max[1])) {
    return false;
  }

  if (query.includes('(hover: none)') && query.includes('(pointer: coarse)')) {
    return width < 1024;
  }

  return true;
}

export function mockMatchMedia(width: number, prefersReducedMotion = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: queryMatches(query, width, prefersReducedMotion),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
