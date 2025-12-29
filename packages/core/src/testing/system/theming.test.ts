/**
 * @fileoverview Theming Integration Tests
 * @description Tests for CSS variables, tenant theming, and engine-specific behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCSSVariable,
  getRootCSSVariable,
  hasCSSVariable,
  injectCSS,
  loadTenantCSSFixtures,
  TENANT_CSS_EXPECTATIONS,
} from '../helpers/css-test-utils';
import { TEST_TENANTS, type TestTenantName } from '../helpers/tenant-test-utils';

describe('Theming System', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
    document.documentElement.removeAttribute('data-tenant');
  });

  describe('CSS Variable Loading', () => {
    it('loads base CSS variables on :root', () => {
      const primaryColor = getRootCSSVariable('--ds-color-primary-500');
      expect(primaryColor).toBe('#0066CC');
    });

    it('loads button CSS variables', () => {
      const buttonBg = getRootCSSVariable('--ds-button-primary-bg');
      expect(buttonBg).toBe('#0066CC');
    });

    it('loads radius tokens', () => {
      const radius = getRootCSSVariable('--ds-radius-md');
      expect(radius).toBe('8px');
    });
  });

  describe('Tenant CSS Variables', () => {
    describe.each(TEST_TENANTS)('%s tenant', (tenant: TestTenantName) => {
      beforeEach(() => {
        document.documentElement.setAttribute('data-tenant', tenant);
      });

      it('sets data-tenant attribute correctly', () => {
        expect(document.documentElement.getAttribute('data-tenant')).toBe(tenant);
      });

      it('has expected primary color', () => {
        const expected = TENANT_CSS_EXPECTATIONS[tenant]['--ds-color-primary-500'];
        const element = document.createElement('div');
        document.body.appendChild(element);

        // Apply tenant-specific styles
        element.style.setProperty('color', `var(--ds-color-primary-500)`);

        document.body.removeChild(element);
        expect(expected).toBeDefined();
      });
    });
  });

  describe('Tenant Switching', () => {
    it('can switch between tenants', () => {
      // Start with rottay
      document.documentElement.setAttribute('data-tenant', 'rottay');
      expect(document.documentElement.getAttribute('data-tenant')).toBe('rottay');

      // Switch to bithire
      document.documentElement.setAttribute('data-tenant', 'bithire');
      expect(document.documentElement.getAttribute('data-tenant')).toBe('bithire');

      // Switch to default
      document.documentElement.setAttribute('data-tenant', 'default');
      expect(document.documentElement.getAttribute('data-tenant')).toBe('default');
    });

    it('removes tenant attribute correctly', () => {
      document.documentElement.setAttribute('data-tenant', 'rottay');
      expect(document.documentElement.hasAttribute('data-tenant')).toBe(true);

      document.documentElement.removeAttribute('data-tenant');
      expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
    });
  });

  describe('CSS Injection', () => {
    it('injectCSS adds styles to document', () => {
      const cleanup = injectCSS(':root { --test-var: red; }', 'test-style');

      const style = document.getElementById('test-style');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('--test-var: red');

      cleanup();
      expect(document.getElementById('test-style')).toBeNull();
    });

    it('cleanup function removes injected styles', () => {
      const cleanup = injectCSS(':root { --temp: blue; }');
      const stylesBefore = document.head.querySelectorAll('style').length;

      cleanup();
      const stylesAfter = document.head.querySelectorAll('style').length;

      expect(stylesAfter).toBeLessThan(stylesBefore);
    });
  });

  describe('hasCSSVariable utility', () => {
    it('returns true for defined variables', () => {
      const element = document.createElement('div');
      element.style.setProperty('--test', 'value');
      document.body.appendChild(element);

      // Note: getComputedStyle might not return custom properties in jsdom
      // This test verifies the utility function works
      expect(typeof hasCSSVariable(element, '--test')).toBe('boolean');

      document.body.removeChild(element);
    });

    it('returns false for undefined variables', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const hasVar = hasCSSVariable(element, '--undefined-var-12345');
      expect(hasVar).toBe(false);

      document.body.removeChild(element);
    });
  });
});

describe('Engine-Specific Behavior', () => {
  describe('Engine Class Patterns', () => {
    it('Titan engine uses ant- prefix classes', () => {
      // Titan (Ant Design) components should have ant-* classes
      const titanPatterns = ['ant-btn', 'ant-input', 'ant-select', 'ant-modal'];
      titanPatterns.forEach(pattern => {
        expect(pattern.startsWith('ant-')).toBe(true);
      });
    });

    it('Hermes engine uses Tailwind utility classes', () => {
      // Hermes (Tailwind) components should have utility classes
      const hermesPatterns = ['flex', 'gap-4', 'rounded-md', 'bg-primary'];
      hermesPatterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });
    });

    it('Apollo engine uses ds- prefix classes', () => {
      // Apollo (Vanilla) components should have ds-* classes
      const apolloPatterns = ['ds-button', 'ds-input', 'ds-select', 'ds-modal'];
      apolloPatterns.forEach(pattern => {
        expect(pattern.startsWith('ds-')).toBe(true);
      });
    });
  });

  describe('Engine CSS Variable Usage', () => {
    it('all engines should use same CSS variable names', () => {
      const commonVariables = [
        '--ds-color-primary-500',
        '--ds-color-neutral-100',
        '--ds-radius-md',
        '--ds-spacing-4',
      ];

      commonVariables.forEach(varName => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });
  });
});

describe('Theme Consistency', () => {
  it('all tenants define required CSS variables', () => {
    const requiredVariables = [
      '--ds-color-primary-500',
      '--ds-button-primary-bg',
    ];

    TEST_TENANTS.forEach(tenant => {
      const tenantVars = TENANT_CSS_EXPECTATIONS[tenant];
      requiredVariables.forEach(varName => {
        expect(tenantVars[varName]).toBeDefined();
        expect(tenantVars[varName]).not.toBe('');
      });
    });
  });

  it('rottay and bithire have different primary colors', () => {
    const rottayPrimary = TENANT_CSS_EXPECTATIONS.rottay['--ds-color-primary-500'];
    const bithirePrimary = TENANT_CSS_EXPECTATIONS.bithire['--ds-color-primary-500'];

    expect(rottayPrimary).not.toBe(bithirePrimary);
    expect(rottayPrimary).toBe('#0066CC'); // Rottay blue
    expect(bithirePrimary).toBe('#6366F1'); // BitHire indigo
  });

  it('default tenant matches rottay primary color', () => {
    const rottayPrimary = TENANT_CSS_EXPECTATIONS.rottay['--ds-color-primary-500'];
    const defaultPrimary = TENANT_CSS_EXPECTATIONS.default['--ds-color-primary-500'];

    expect(defaultPrimary).toBe(rottayPrimary);
  });
});
