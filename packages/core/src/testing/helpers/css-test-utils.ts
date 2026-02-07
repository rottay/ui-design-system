/**
 * @fileoverview CSS Test Utilities
 * @description Utilities for testing CSS variables, computed styles, and theme application
 */

import type { EngineName } from '../../core/types';
import type { TestTenantName } from './tenant-test-utils';

/**
 * Gets a CSS variable value from an element
 *
 * @example
 * ```tsx
 * const bgColor = getCSSVariable(button, '--ds-button-primary-bg');
 * expect(bgColor).toBe('#0066CC');
 * ```
 */
export function getCSSVariable(element: Element, variableName: string): string {
  return window.getComputedStyle(element).getPropertyValue(variableName).trim();
}

/**
 * Gets a CSS variable value from the document root
 *
 * @example
 * ```tsx
 * const primaryColor = getRootCSSVariable('--ds-color-primary-500');
 * expect(primaryColor).toBe('#0066CC');
 * ```
 */
export function getRootCSSVariable(variableName: string): string {
  return getCSSVariable(document.documentElement, variableName);
}

/**
 * Checks if a CSS variable is defined (not empty)
 */
export function hasCSSVariable(element: Element, variableName: string): boolean {
  return getCSSVariable(element, variableName) !== '';
}

/**
 * Gets multiple CSS variables from an element
 *
 * @example
 * ```tsx
 * const vars = getCSSVariables(button, ['--ds-button-bg', '--ds-button-color']);
 * expect(vars['--ds-button-bg']).toBe('#0066CC');
 * ```
 */
export function getCSSVariables(
  element: Element,
  variableNames: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of variableNames) {
    result[name] = getCSSVariable(element, name);
  }
  return result;
}

/**
 * Gets computed style property from an element
 *
 * @example
 * ```tsx
 * const bgColor = getComputedStyleProperty(button, 'backgroundColor');
 * expect(bgColor).toBe('rgb(0, 102, 204)');
 * ```
 */
export function getComputedStyleProperty(
  element: Element,
  property: keyof CSSStyleDeclaration
): string {
  return String(window.getComputedStyle(element)[property] || '');
}

/**
 * Asserts that an element has a specific CSS variable value
 */
export function expectCSSVariable(
  element: Element,
  variableName: string,
  expectedValue: string
): void {
  const actual = getCSSVariable(element, variableName);
  if (actual !== expectedValue) {
    throw new Error(
      `Expected CSS variable ${variableName} to be "${expectedValue}", but got "${actual}"`
    );
  }
}

/**
 * Injects CSS text into the document head
 * Returns a cleanup function to remove it
 *
 * @example
 * ```tsx
 * const cleanup = injectCSS(':root { --ds-test: red; }');
 * // ... tests
 * cleanup();
 * ```
 */
export function injectCSS(css: string, id?: string): () => void {
  const style = document.createElement('style');
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  document.head.appendChild(style);

  return () => {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  };
}

/**
 * Removes all injected test styles
 */
export function clearInjectedStyles(): void {
  const styles = document.head.querySelectorAll('style[data-test-style]');
  styles.forEach((style) => style.parentNode?.removeChild(style));
}

/**
 * Expected CSS variable mappings for each tenant
 */
export const TENANT_CSS_EXPECTATIONS: Record<TestTenantName, Record<string, string>> = {
  rottay: {
    '--ds-color-primary-500': '#0066CC',
    '--ds-button-primary-bg': '#0066CC',
  },
  bithire: {
    '--ds-color-primary-500': '#6366F1',
    '--ds-button-primary-bg': '#6366F1',
  },
  default: {
    '--ds-color-primary-500': '#0066CC',
    '--ds-button-primary-bg': '#0066CC',
  },
};

/**
 * Expected class prefixes for each engine
 */
export const ENGINE_CLASS_PREFIXES: Record<Exclude<EngineName, 'athena'>, string> = {
  classic: 'ant-',
  modern: 'btn',
  rustic: 'ds-',
};

/**
 * Checks if an element has classes matching an engine's pattern
 */
export function hasEngineClasses(element: Element, engine: EngineName): boolean {
  if (engine === 'athena') return false;

  const prefix = ENGINE_CLASS_PREFIXES[engine as keyof typeof ENGINE_CLASS_PREFIXES];
  const classes = Array.from(element.classList);

  return classes.some((className) => className.startsWith(prefix));
}

/**
 * Gets all classes that match an engine's pattern
 */
export function getEngineClasses(element: Element, engine: EngineName): string[] {
  if (engine === 'athena') return [];

  const prefix = ENGINE_CLASS_PREFIXES[engine as keyof typeof ENGINE_CLASS_PREFIXES];
  return Array.from(element.classList).filter((className) => className.startsWith(prefix));
}

/**
 * Waits for CSS to be applied (useful after dynamic style injection)
 */
export async function waitForStyles(timeout = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Creates a style snapshot of an element's key properties
 */
export function getStyleSnapshot(
  element: Element,
  properties: (keyof CSSStyleDeclaration)[] = [
    'backgroundColor',
    'color',
    'padding',
    'margin',
    'borderRadius',
    'fontSize',
    'fontWeight',
  ]
): Record<string, string> {
  const computed = window.getComputedStyle(element);
  const snapshot: Record<string, string> = {};

  for (const prop of properties) {
    snapshot[prop as string] = String(computed[prop] || '');
  }

  return snapshot;
}

/**
 * Compares style snapshots between two elements
 */
export function compareStyleSnapshots(
  snapshot1: Record<string, string>,
  snapshot2: Record<string, string>
): { matching: string[]; different: Array<{ property: string; value1: string; value2: string }> } {
  const matching: string[] = [];
  const different: Array<{ property: string; value1: string; value2: string }> = [];

  const allProps = new Set([...Object.keys(snapshot1), ...Object.keys(snapshot2)]);

  for (const prop of allProps) {
    const value1 = snapshot1[prop] || '';
    const value2 = snapshot2[prop] || '';

    if (value1 === value2) {
      matching.push(prop);
    } else {
      different.push({ property: prop, value1, value2 });
    }
  }

  return { matching, different };
}

/**
 * Creates CSS fixture content for a tenant
 */
export function createTenantCSSFixture(tenant: TestTenantName): string {
  const expectations = TENANT_CSS_EXPECTATIONS[tenant];

  const variables = Object.entries(expectations)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `[data-tenant="${tenant}"] {\n${variables}\n}`;
}

/**
 * Loads all tenant CSS fixtures into the document
 */
export function loadTenantCSSFixtures(): () => void {
  const cleanups: Array<() => void> = [];

  // Base CSS
  cleanups.push(
    injectCSS(
      `
    :root {
      --ds-color-primary-500: #0066CC;
      --ds-button-primary-bg: #0066CC;
      --ds-button-md-height: 40px;
      --ds-button-md-padding: 0 16px;
      --ds-radius-md: 8px;
    }
  `,
      'test-base-css'
    )
  );

  // Tenant-specific CSS
  for (const tenant of ['rottay', 'bithire', 'default'] as TestTenantName[]) {
    cleanups.push(injectCSS(createTenantCSSFixture(tenant), `test-tenant-${tenant}-css`));
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
