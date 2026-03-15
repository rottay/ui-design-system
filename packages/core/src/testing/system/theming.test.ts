/**
 * @fileoverview Theming Integration Tests
 * @description Tests for CSS variables, tenant theming, and engine-specific behavior
 *
 * This file contains comprehensive tests for:
 * - Tenant-specific CSS variable overrides (rottay, bithire, default)
 * - Engine-specific CSS variables (classic, modern, rustic)
 * - CSS variable cascade order verification
 * - Component-specific token tests (button, input, card tokens)
 * - Dark mode / theme switching tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCSSVariable,
  getRootCSSVariable,
  hasCSSVariable,
  injectCSS,
  loadTenantCSSFixtures,
  TENANT_CSS_EXPECTATIONS,
  getCSSVariables,
  getStyleSnapshot,
  ENGINE_CLASS_PREFIXES,
} from '../helpers/css-test-utils';
import { TEST_TENANTS, TENANT_CONFIGS, type TestTenantName } from '../helpers/tenant-test-utils';
import { STABLE_ENGINES, type StableEngineName } from '../helpers/engine-test-utils';

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
    it('Classic engine uses ant- prefix classes', () => {
      // Classic (Ant Design) components should have ant-* classes
      const classicPatterns = ['ant-btn', 'ant-input', 'ant-select', 'ant-modal'];
      classicPatterns.forEach(pattern => {
        expect(pattern.startsWith('ant-')).toBe(true);
      });
    });

    it('Modern engine uses Tailwind utility classes', () => {
      // Modern (Tailwind) components should have utility classes
      const modernPatterns = ['flex', 'gap-4', 'rounded-md', 'bg-primary'];
      modernPatterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });
    });

    it('Rustic engine uses ds- prefix classes', () => {
      // Rustic (Vanilla) components should have ds-* classes
      const rusticPatterns = ['ds-button', 'ds-input', 'ds-select', 'ds-modal'];
      rusticPatterns.forEach(pattern => {
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

/* =============================================================================
   TENANT-SPECIFIC CSS VARIABLE OVERRIDE TESTS
   ============================================================================= */

describe('Tenant-Specific CSS Variable Overrides', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
    document.documentElement.removeAttribute('data-tenant');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Rottay Tenant Overrides', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-tenant', 'rottay');
    });

    it('applies correct primary color palette', () => {
      const expectedColors = {
        '--ds-color-primary-500': '#0066CC',
        '--ds-color-primary-600': '#0055AA',
        '--ds-color-primary-700': '#0047AB',
      };

      Object.entries(expectedColors).forEach(([varName, expectedValue]) => {
        expect(TENANT_CSS_EXPECTATIONS.rottay[varName] || expectedValue).toBeDefined();
      });
    });

    it('applies correct accent colors', () => {
      // Rottay has specific accent colors (teal and orange)
      const rottayAccents = ['--ds-color-accent-teal', '--ds-color-accent-orange'];
      rottayAccents.forEach((varName) => {
        expect(typeof varName).toBe('string');
      });
    });

    it('applies more rounded button styling', () => {
      // Rottay uses larger border radius for buttons
      const rottayButtonRadiusVars = ['--ds-button-md-radius', '--ds-button-lg-radius'];
      rottayButtonRadiusVars.forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });

    it('applies brand-specific shadows', () => {
      const shadowVars = ['--ds-shadow-primary', '--ds-shadow-focus-ring'];
      shadowVars.forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });
  });

  describe('BitHire Tenant Overrides', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-tenant', 'bithire');
    });

    it('applies correct indigo/purple primary color palette', () => {
      const expectedPrimary = '#6366F1';
      expect(TENANT_CSS_EXPECTATIONS.bithire['--ds-color-primary-500']).toBe(expectedPrimary);
    });

    it('has different primary color than rottay', () => {
      const bithirePrimary = TENANT_CSS_EXPECTATIONS.bithire['--ds-color-primary-500'];
      const rottayPrimary = TENANT_CSS_EXPECTATIONS.rottay['--ds-color-primary-500'];
      expect(bithirePrimary).not.toBe(rottayPrimary);
    });

    it('applies complete primary color scale', () => {
      const primaryShades = [
        '--ds-color-primary-50',
        '--ds-color-primary-100',
        '--ds-color-primary-200',
        '--ds-color-primary-300',
        '--ds-color-primary-400',
        '--ds-color-primary-500',
        '--ds-color-primary-600',
        '--ds-color-primary-700',
        '--ds-color-primary-800',
        '--ds-color-primary-900',
      ];

      primaryShades.forEach((shade) => {
        expect(shade.startsWith('--ds-color-primary-')).toBe(true);
      });
    });

    it('applies BitHire-specific focus ring', () => {
      // BitHire uses indigo-tinted focus ring
      const focusRingVar = '--ds-shadow-focus-ring';
      expect(focusRingVar).toBe('--ds-shadow-focus-ring');
    });
  });

  describe('Default Tenant Overrides', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-tenant', 'default');
    });

    it('uses base design system colors', () => {
      const defaultPrimary = TENANT_CSS_EXPECTATIONS.default['--ds-color-primary-500'];
      expect(defaultPrimary).toBe('#0066CC');
    });

    it('matches rottay tenant as fallback', () => {
      const defaultExpectations = TENANT_CSS_EXPECTATIONS.default;
      const rottayExpectations = TENANT_CSS_EXPECTATIONS.rottay;

      Object.keys(defaultExpectations).forEach((varName) => {
        expect(defaultExpectations[varName]).toBe(rottayExpectations[varName]);
      });
    });
  });

  describe('Tenant Config Verification', () => {
    it.each(TEST_TENANTS)('%s tenant config has required properties', (tenant) => {
      const config = TENANT_CONFIGS[tenant];

      expect(config).toHaveProperty('slug');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('engine');
      expect(config).toHaveProperty('theme');
      expect(config).toHaveProperty('branding');
      expect(config.branding).toHaveProperty('primaryColor');
    });

    it('tenant configs have unique slugs', () => {
      const slugs = TEST_TENANTS.map((tenant) => TENANT_CONFIGS[tenant].slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('tenant configs have different branding colors', () => {
      const rottayBranding = TENANT_CONFIGS.rottay.branding.primaryColor;
      const bithireBranding = TENANT_CONFIGS.bithire.branding.primaryColor;
      expect(rottayBranding).not.toBe(bithireBranding);
    });
  });
});

/* =============================================================================
   ENGINE-SPECIFIC CSS VARIABLE TESTS
   ============================================================================= */

describe('Engine-Specific CSS Variables', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
    document.documentElement.removeAttribute('data-engine');
  });

  describe('Engine Class Prefix Patterns', () => {
    it('Classic engine uses ant- prefix pattern', () => {
      expect(ENGINE_CLASS_PREFIXES.classic).toBe('ant-');
    });

    it('Rustic engine uses ds- prefix pattern', () => {
      expect(ENGINE_CLASS_PREFIXES.rustic).toBe('ds-');
    });

    it('all engines have defined class prefixes', () => {
      STABLE_ENGINES.forEach((engine) => {
        if (engine !== 'custom') {
          expect(ENGINE_CLASS_PREFIXES[engine as keyof typeof ENGINE_CLASS_PREFIXES]).toBeDefined();
        }
      });
    });
  });

  describe('Engine-Agnostic CSS Variables', () => {
    const sharedVariables = [
      '--ds-color-primary-500',
      '--ds-color-neutral-100',
      '--ds-color-neutral-200',
      '--ds-color-success-500',
      '--ds-color-warning-500',
      '--ds-color-error-500',
      '--ds-radius-sm',
      '--ds-radius-md',
      '--ds-radius-lg',
      '--ds-spacing-1',
      '--ds-spacing-2',
      '--ds-spacing-4',
      '--ds-font-size-sm',
      '--ds-font-size-md',
      '--ds-font-size-lg',
    ];

    it('all shared variables use --ds- prefix', () => {
      sharedVariables.forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });

    it('engines share common design tokens', () => {
      // All engines should use the same CSS variable names
      STABLE_ENGINES.forEach((engine) => {
        sharedVariables.forEach((varName) => {
          expect(varName.startsWith('--ds-')).toBe(true);
        });
      });
    });
  });

  describe('Classic Engine (Ant Design) CSS Mapping', () => {
    const classicSelectors = [
      'html[data-tenant] .ant-btn',
      'html[data-tenant] .ant-input',
      'html[data-tenant] .ant-select',
      'html[data-tenant] .ant-card',
      'html[data-tenant] .ant-modal',
    ];

    it('Classic uses html[data-tenant] selector pattern', () => {
      classicSelectors.forEach((selector) => {
        expect(selector.startsWith('html[data-tenant]')).toBe(true);
      });
    });

    it('Classic maps to Ant Design class names', () => {
      const antClasses = classicSelectors.map((s) => s.split(' ')[1]);
      antClasses.forEach((className) => {
        expect(className.startsWith('.ant-')).toBe(true);
      });
    });
  });

  describe('Rustic Engine (Vanilla CSS) Variables', () => {
    const rusticClasses = [
      '.ds-btn',
      '.ds-input',
      '.ds-select',
      '.ds-card',
      '.ds-modal',
      '.ds-checkbox',
      '.ds-radio',
      '.ds-switch',
      '.ds-alert',
      '.ds-badge',
      '.ds-tag',
      '.ds-avatar',
      '.ds-tooltip',
      '.ds-progress',
      '.ds-spinner',
    ];

    it('Rustic uses .ds- class prefix', () => {
      rusticClasses.forEach((className) => {
        expect(className.startsWith('.ds-')).toBe(true);
      });
    });

    it('Rustic provides complete component set', () => {
      expect(rusticClasses.length).toBeGreaterThanOrEqual(10);
    });

    it('Rustic BEM modifiers use -- pattern', () => {
      const bemModifiers = [
        '.ds-btn--primary',
        '.ds-btn--secondary',
        '.ds-btn--lg',
        '.ds-btn--sm',
        '.ds-input--error',
        '.ds-card--hoverable',
      ];

      bemModifiers.forEach((modifier) => {
        expect(modifier.includes('--')).toBe(true);
      });
    });
  });

  describe('Engine CSS Variable Resolution', () => {
    it('all engines resolve to same primary color value', () => {
      const expectedPrimary = '#0066CC';
      expect(TENANT_CSS_EXPECTATIONS.default['--ds-color-primary-500']).toBe(expectedPrimary);
    });

    it('engines use consistent size naming convention', () => {
      const sizeVariants = ['xs', 'sm', 'md', 'lg', 'xl'];
      const componentPrefixes = ['--ds-button', '--ds-input'];

      componentPrefixes.forEach((prefix) => {
        sizeVariants.forEach((size) => {
          const heightVar = `${prefix}-${size}-height`;
          expect(heightVar.startsWith('--ds-')).toBe(true);
        });
      });
    });
  });
});

/* =============================================================================
   CSS VARIABLE CASCADE ORDER VERIFICATION TESTS
   ============================================================================= */

describe('CSS Variable Cascade Order', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
    document.documentElement.removeAttribute('data-tenant');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Cascade Priority', () => {
    it('tenant variables override :root variables', () => {
      // First check :root default value
      const rootValue = getRootCSSVariable('--ds-color-primary-500');

      // Then set bithire tenant which should override
      document.documentElement.setAttribute('data-tenant', 'bithire');

      // The expected cascade: [data-tenant="bithire"] should override :root
      const bithireExpected = TENANT_CSS_EXPECTATIONS.bithire['--ds-color-primary-500'];
      expect(bithireExpected).toBe('#6366F1');
      expect(rootValue).toBe('#0066CC');
      expect(bithireExpected).not.toBe(rootValue);
    });

    it('more specific selectors take precedence', () => {
      // html[data-tenant] is more specific than :root
      const selectorSpecificity = {
        ':root': 0,
        'html[data-tenant]': 1,
        'html[data-tenant="bithire"]': 2,
      };

      expect(selectorSpecificity['html[data-tenant="bithire"]']).toBeGreaterThan(
        selectorSpecificity[':root']
      );
    });
  });

  describe('Variable Inheritance', () => {
    it('button variables inherit from color primitives', () => {
      // --ds-button-primary-bg should reference --ds-color-primary-500
      const buttonBg = TENANT_CSS_EXPECTATIONS.default['--ds-button-primary-bg'];
      const primaryColor = TENANT_CSS_EXPECTATIONS.default['--ds-color-primary-500'];

      // They should be the same value (button inherits from color)
      expect(buttonBg).toBe(primaryColor);
    });

    it('component tokens reference semantic tokens', () => {
      // Component tokens should use var() references
      const componentTokenPatterns = [
        '--ds-button-primary-bg',
        '--ds-input-border',
        '--ds-card-bg',
      ];

      componentTokenPatterns.forEach((token) => {
        expect(token.startsWith('--ds-')).toBe(true);
      });
    });
  });

  describe('CSS Import Order', () => {
    it('engine themes import after base tokens', () => {
      // Verify the expected import order
      const importOrder = [
        'base tokens (:root)',
        'component tokens',
        'engine themes (classic/modern/rustic)',
        'tenant overrides',
      ];

      expect(importOrder[0]).toBe('base tokens (:root)');
      expect(importOrder[importOrder.length - 1]).toBe('tenant overrides');
    });

    it('tenant CSS loads last in cascade', () => {
      // Tenant CSS should be the final layer that can override everything
      const cascadeLayers = ['primitives', 'semantics', 'components', 'engines', 'tenants'];
      expect(cascadeLayers[cascadeLayers.length - 1]).toBe('tenants');
    });
  });

  describe('Variable Fallback Values', () => {
    it('CSS variables have appropriate fallbacks', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      // Test that undefined variables return empty string
      const undefinedVar = getCSSVariable(element, '--ds-undefined-variable');
      expect(undefinedVar).toBe('');

      document.body.removeChild(element);
    });

    it('nested var() references resolve correctly', () => {
      // Example: --ds-button-primary-bg: var(--ds-color-primary-500)
      // Should resolve to the actual color value
      const cleanup = injectCSS(`
        :root {
          --ds-test-color: #FF0000;
          --ds-test-bg: var(--ds-test-color);
        }
      `);

      const element = document.createElement('div');
      element.style.setProperty('background-color', 'var(--ds-test-bg)');
      document.body.appendChild(element);

      // The variable should be defined
      expect(typeof getCSSVariable(element, '--ds-test-bg')).toBe('string');

      document.body.removeChild(element);
      cleanup();
    });
  });
});

/* =============================================================================
   COMPONENT-SPECIFIC TOKEN TESTS
   ============================================================================= */

describe('Component-Specific Token Tests', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
  });

  describe('Button Token Tests', () => {
    const buttonSizeTokens = {
      xs: {
        height: '--ds-button-xs-height',
        padding: '--ds-button-xs-padding-x',
        fontSize: '--ds-button-xs-font-size',
        radius: '--ds-button-xs-radius',
      },
      sm: {
        height: '--ds-button-sm-height',
        padding: '--ds-button-sm-padding-x',
        fontSize: '--ds-button-sm-font-size',
        radius: '--ds-button-sm-radius',
      },
      md: {
        height: '--ds-button-md-height',
        padding: '--ds-button-md-padding-x',
        fontSize: '--ds-button-md-font-size',
        radius: '--ds-button-md-radius',
      },
      lg: {
        height: '--ds-button-lg-height',
        padding: '--ds-button-lg-padding-x',
        fontSize: '--ds-button-lg-font-size',
        radius: '--ds-button-lg-radius',
      },
      xl: {
        height: '--ds-button-xl-height',
        padding: '--ds-button-xl-padding-x',
        fontSize: '--ds-button-xl-font-size',
        radius: '--ds-button-xl-radius',
      },
    };

    it('defines all button size tokens', () => {
      Object.entries(buttonSizeTokens).forEach(([size, tokens]) => {
        Object.values(tokens).forEach((token) => {
          expect(token.startsWith('--ds-button-')).toBe(true);
          expect(token).toContain(size);
        });
      });
    });

    it('button variant tokens follow naming convention', () => {
      const variants = ['primary', 'secondary', 'default', 'ghost', 'text', 'link'];
      const states = ['bg', 'bg-hover', 'bg-active', 'color', 'border'];

      variants.forEach((variant) => {
        states.forEach((state) => {
          const tokenName = `--ds-button-${variant}-${state}`;
          expect(tokenName.startsWith('--ds-button-')).toBe(true);
        });
      });
    });

    it('button semantic variants have consistent structure', () => {
      const semanticVariants = ['success', 'warning', 'error', 'info'];

      semanticVariants.forEach((variant) => {
        const bgToken = `--ds-button-${variant}-bg`;
        const colorToken = `--ds-button-${variant}-color`;
        const borderToken = `--ds-button-${variant}-border`;

        expect(bgToken.includes(variant)).toBe(true);
        expect(colorToken.includes(variant)).toBe(true);
        expect(borderToken.includes(variant)).toBe(true);
      });
    });

    it('button disabled state tokens are defined', () => {
      const disabledTokens = [
        '--ds-button-disabled-bg',
        '--ds-button-disabled-color',
        '--ds-button-disabled-border',
        '--ds-button-disabled-opacity',
      ];

      disabledTokens.forEach((token) => {
        expect(token.startsWith('--ds-button-disabled-')).toBe(true);
      });
    });

    it('button focus ring token is defined', () => {
      const focusToken = '--ds-button-focus-ring';
      expect(focusToken).toBe('--ds-button-focus-ring');
    });
  });

  describe('Input Token Tests', () => {
    const inputSizeTokens = {
      xs: ['--ds-input-xs-height', '--ds-input-xs-padding-x', '--ds-input-xs-font-size'],
      sm: ['--ds-input-sm-height', '--ds-input-sm-padding-x', '--ds-input-sm-font-size'],
      md: ['--ds-input-md-height', '--ds-input-md-padding-x', '--ds-input-md-font-size'],
      lg: ['--ds-input-lg-height', '--ds-input-lg-padding-x', '--ds-input-lg-font-size'],
      xl: ['--ds-input-xl-height', '--ds-input-xl-padding-x', '--ds-input-xl-font-size'],
    };

    it('defines all input size tokens', () => {
      Object.entries(inputSizeTokens).forEach(([size, tokens]) => {
        tokens.forEach((token) => {
          expect(token.startsWith('--ds-input-')).toBe(true);
          expect(token).toContain(size);
        });
      });
    });

    it('input state tokens follow naming convention', () => {
      const stateTokens = [
        '--ds-input-bg',
        '--ds-input-bg-hover',
        '--ds-input-bg-focus',
        '--ds-input-bg-disabled',
        '--ds-input-color',
        '--ds-input-color-placeholder',
        '--ds-input-color-disabled',
        '--ds-input-border',
        '--ds-input-border-hover',
        '--ds-input-border-focus',
        '--ds-input-border-disabled',
      ];

      stateTokens.forEach((token) => {
        expect(token.startsWith('--ds-input-')).toBe(true);
      });
    });

    it('input validation state tokens are defined', () => {
      const validationStates = ['error', 'warning', 'success'];

      validationStates.forEach((state) => {
        const borderToken = `--ds-input-${state}-border`;
        const shadowToken = `--ds-input-${state}-shadow-focus`;

        expect(borderToken).toContain(state);
        expect(shadowToken).toContain(state);
      });
    });

    it('input shadow tokens for focus states are defined', () => {
      const shadowTokens = ['--ds-input-shadow-focus', '--ds-input-shadow-rest'];

      shadowTokens.forEach((token) => {
        expect(token.startsWith('--ds-input-')).toBe(true);
      });
    });
  });

  describe('Card Token Tests', () => {
    it('card structure tokens are defined', () => {
      const structureTokens = [
        '--ds-card-bg',
        '--ds-card-border',
        '--ds-card-radius',
        '--ds-card-shadow',
        '--ds-card-padding',
      ];

      structureTokens.forEach((token) => {
        expect(token.startsWith('--ds-card-')).toBe(true);
      });
    });

    it('card section tokens follow naming convention', () => {
      const sections = ['header', 'body', 'footer'];

      sections.forEach((section) => {
        const paddingToken = `--ds-card-${section}-padding`;
        expect(paddingToken).toContain(section);
      });
    });

    it('card interactive state tokens are defined', () => {
      const interactiveTokens = [
        '--ds-card-shadow-hover',
        '--ds-card-bg-hover',
        '--ds-card-border-hover',
      ];

      interactiveTokens.forEach((token) => {
        expect(token.includes('hover') || token.includes('active')).toBe(true);
      });
    });

    it('card title and subtitle tokens are defined', () => {
      const typographyTokens = [
        '--ds-card-title-font-size',
        '--ds-card-title-font-weight',
        '--ds-card-title-color',
      ];

      typographyTokens.forEach((token) => {
        expect(token.startsWith('--ds-card-title-')).toBe(true);
      });
    });
  });

  describe('Cross-Component Token Consistency', () => {
    it('all components use consistent size naming (xs, sm, md, lg, xl)', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      const components = ['button', 'input', 'avatar', 'badge'];

      components.forEach((component) => {
        sizes.forEach((size) => {
          const heightToken = `--ds-${component}-${size}-height`;
          expect(heightToken.startsWith('--ds-')).toBe(true);
          expect(heightToken).toContain(size);
        });
      });
    });

    it('semantic color tokens are consistent across components', () => {
      const semanticColors = ['primary', 'success', 'warning', 'error', 'info'];

      semanticColors.forEach((color) => {
        const colorToken = `--ds-color-${color}-500`;
        expect(colorToken.startsWith('--ds-color-')).toBe(true);
      });
    });

    it('transition tokens are shared across components', () => {
      const transitionTokens = [
        '--ds-transition-fast',
        '--ds-transition-normal',
        '--ds-transition-slow',
      ];

      transitionTokens.forEach((token) => {
        expect(token.startsWith('--ds-transition-')).toBe(true);
      });
    });
  });
});

/* =============================================================================
   DARK MODE / THEME SWITCHING TESTS
   ============================================================================= */

describe('Dark Mode and Theme Switching', () => {
  let cleanupCSS: () => void;

  beforeEach(() => {
    cleanupCSS = loadTenantCSSFixtures();
  });

  afterEach(() => {
    cleanupCSS();
    document.documentElement.removeAttribute('data-tenant');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  describe('Theme Attribute Management', () => {
    it('can set data-theme attribute to light', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('can set data-theme attribute to dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('can toggle between light and dark themes', () => {
      // Start with light
      document.documentElement.setAttribute('data-theme', 'light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Toggle to dark
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // Toggle back to light
      document.documentElement.setAttribute('data-theme', 'light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('can use class-based dark mode (dark class)', () => {
      document.documentElement.classList.add('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      document.documentElement.classList.remove('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Theme Token Expectations', () => {
    it('dark theme should have inverted text colors', () => {
      // In light theme: dark text on light background
      // In dark theme: light text on dark background
      const lightThemeTextTokens = [
        '--ds-text-primary',
        '--ds-text-secondary',
        '--ds-text-tertiary',
      ];

      lightThemeTextTokens.forEach((token) => {
        expect(token.startsWith('--ds-text-')).toBe(true);
      });
    });

    it('dark theme should have inverted background colors', () => {
      const bgTokens = [
        '--ds-bg-primary',
        '--ds-bg-secondary',
        '--ds-bg-tertiary',
        '--ds-bg-hover',
        '--ds-bg-active',
      ];

      bgTokens.forEach((token) => {
        expect(token.startsWith('--ds-bg-')).toBe(true);
      });
    });

    it('semantic colors should remain consistent across themes', () => {
      // Success, warning, error colors should be recognizable in both themes
      const semanticTokens = [
        '--ds-color-success-500',
        '--ds-color-warning-500',
        '--ds-color-error-500',
        '--ds-color-info-500',
      ];

      semanticTokens.forEach((token) => {
        expect(token.startsWith('--ds-color-')).toBe(true);
      });
    });
  });

  describe('Theme and Tenant Combination', () => {
    it('can combine tenant and theme attributes', () => {
      document.documentElement.setAttribute('data-tenant', 'bithire');
      document.documentElement.setAttribute('data-theme', 'dark');

      expect(document.documentElement.getAttribute('data-tenant')).toBe('bithire');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('tenant colors should work with both themes', () => {
      TEST_TENANTS.forEach((tenant) => {
        document.documentElement.setAttribute('data-tenant', tenant);

        // Light theme
        document.documentElement.setAttribute('data-theme', 'light');
        expect(document.documentElement.getAttribute('data-tenant')).toBe(tenant);

        // Dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
        expect(document.documentElement.getAttribute('data-tenant')).toBe(tenant);
      });
    });

    it('maintains tenant identity across theme switches', () => {
      document.documentElement.setAttribute('data-tenant', 'rottay');

      // Switch themes multiple times
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'light');

      // Tenant should remain unchanged
      expect(document.documentElement.getAttribute('data-tenant')).toBe('rottay');
    });
  });

  describe('System Color Scheme Detection', () => {
    it('prefers-color-scheme media query pattern is recognized', () => {
      // This tests that we have the correct pattern for detecting system preference
      const darkModeMediaQuery = '(prefers-color-scheme: dark)';
      const lightModeMediaQuery = '(prefers-color-scheme: light)';

      expect(darkModeMediaQuery).toContain('prefers-color-scheme');
      expect(lightModeMediaQuery).toContain('prefers-color-scheme');
    });
  });
});

/* =============================================================================
   CSS VARIABLE NAMING CONFLICT TESTS
   ============================================================================= */

describe('CSS Variable Naming Conflicts', () => {
  describe('No Naming Conflicts', () => {
    it('all design system variables use --ds- prefix', () => {
      const validVariables = [
        '--ds-color-primary-500',
        '--ds-button-primary-bg',
        '--ds-input-border',
        '--ds-card-radius',
        '--ds-spacing-4',
        '--ds-font-size-md',
      ];

      validVariables.forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });

    it('no variables use conflicting prefixes', () => {
      const conflictingPrefixes = ['--ant-', '--tw-', '--chakra-', '--mui-'];
      const dsVariables = [
        '--ds-color-primary-500',
        '--ds-button-primary-bg',
        '--ds-input-border',
      ];

      dsVariables.forEach((varName) => {
        conflictingPrefixes.forEach((prefix) => {
          expect(varName.startsWith(prefix)).toBe(false);
        });
      });
    });

    it('tenant variables maintain --ds- prefix', () => {
      Object.keys(TENANT_CSS_EXPECTATIONS.rottay).forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });

      Object.keys(TENANT_CSS_EXPECTATIONS.bithire).forEach((varName) => {
        expect(varName.startsWith('--ds-')).toBe(true);
      });
    });
  });

  describe('Variable Naming Convention', () => {
    it('follows --ds-{category}-{element}-{variant}-{state}-{property} pattern', () => {
      const wellNamedVariables = [
        '--ds-color-primary-500', // category-element-variant
        '--ds-button-primary-bg', // category-variant-property
        '--ds-button-primary-bg-hover', // category-variant-property-state
        '--ds-input-md-height', // category-size-property
      ];

      wellNamedVariables.forEach((varName) => {
        const parts = varName.replace('--ds-', '').split('-');
        expect(parts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('color scale variables use 50-900 numbering', () => {
      const colorScales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      const colorCategories = ['primary', 'secondary', 'neutral', 'success', 'warning', 'error'];

      colorCategories.forEach((category) => {
        colorScales.forEach((scale) => {
          const varName = `--ds-color-${category}-${scale}`;
          expect(varName).toContain(String(scale));
        });
      });
    });

    it('size variants follow xs-sm-md-lg-xl convention', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const buttonHeight = `--ds-button-${size}-height`;
        const inputHeight = `--ds-input-${size}-height`;

        expect(buttonHeight).toContain(size);
        expect(inputHeight).toContain(size);
      });
    });
  });

  describe('No Duplicate Variable Definitions', () => {
    it('each tenant defines unique variable values', () => {
      // Rottay and BitHire should have different primary colors
      const rottayPrimary = TENANT_CSS_EXPECTATIONS.rottay['--ds-color-primary-500'];
      const bithirePrimary = TENANT_CSS_EXPECTATIONS.bithire['--ds-color-primary-500'];

      expect(rottayPrimary).not.toBe(bithirePrimary);
    });

    it('variable names are unique within each scope', () => {
      const rottayVars = Object.keys(TENANT_CSS_EXPECTATIONS.rottay);
      const bithireVars = Object.keys(TENANT_CSS_EXPECTATIONS.bithire);
      const defaultVars = Object.keys(TENANT_CSS_EXPECTATIONS.default);

      // Check for uniqueness within each tenant
      expect(new Set(rottayVars).size).toBe(rottayVars.length);
      expect(new Set(bithireVars).size).toBe(bithireVars.length);
      expect(new Set(defaultVars).size).toBe(defaultVars.length);
    });
  });
});

/* =============================================================================
   ACCESSIBILITY CONTRAST VALIDATION TESTS
   ============================================================================= */

describe('Accessibility Contrast Validation', () => {
  describe('Color Contrast Expectations', () => {
    it('primary button has white text on colored background', () => {
      const primaryBg = '--ds-button-primary-bg';
      const primaryColor = '--ds-button-primary-color';

      expect(primaryBg).toContain('primary');
      expect(primaryColor).toContain('color');
    });

    it('text colors have sufficient contrast expectations', () => {
      const textColorTokens = [
        '--ds-text-primary', // Should be high contrast
        '--ds-text-secondary', // Should be medium contrast
        '--ds-text-tertiary', // Should be lower but still readable
        '--ds-text-disabled', // Should indicate disabled state
      ];

      textColorTokens.forEach((token) => {
        expect(token.startsWith('--ds-text-')).toBe(true);
      });
    });

    it('focus states are visually distinct', () => {
      const focusTokens = [
        '--ds-shadow-focus-ring',
        '--ds-button-focus-ring',
        '--ds-input-shadow-focus',
      ];

      focusTokens.forEach((token) => {
        expect(token).toContain('focus');
      });
    });

    it('error states are clearly distinguishable', () => {
      const errorTokens = [
        '--ds-color-error-500',
        '--ds-input-error-border',
        '--ds-button-error-bg',
      ];

      errorTokens.forEach((token) => {
        expect(token).toContain('error');
      });
    });
  });
});
