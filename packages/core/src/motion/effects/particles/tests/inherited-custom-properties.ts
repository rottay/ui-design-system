import { vi } from 'vitest';

/**
 * happy-dom does not inherit authored custom properties into child computed
 * styles. Model that browser behavior without changing the production
 * resolver's explicit owner boundary.
 */
export function installInheritedCustomPropertyModel(): void {
  const getComputedStyle = window.getComputedStyle.bind(window);

  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
    const computed = getComputedStyle(element, pseudoElement);

    return new Proxy(computed, {
      get(target, property) {
        if (property === 'getPropertyValue') {
          return (name: string): string => {
            const computedValue = target.getPropertyValue(name);
            if (computedValue || !name.startsWith('--')) return computedValue;

            let current: Element | null = element;
            while (current) {
              if (current instanceof HTMLElement || current instanceof SVGElement) {
                const authoredValue = current.style.getPropertyValue(name);
                if (authoredValue) return authoredValue;
              }
              current = current.parentElement;
            }

            return '';
          };
        }

        const value = Reflect.get(target, property, target) as unknown;
        return typeof value === 'function'
          ? value.bind(target)
          : value;
      },
    });
  });
}
