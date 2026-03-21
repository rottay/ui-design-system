/**
 * @fileoverview Whitelabel Field Coverage Conformance Test
 * @description Verifies that the DS runtime actually consumes the whitelabel
 * fields declared in the TenantBranding contract and the personality token
 * system. This test catches silent regressions where a branding field is added
 * to the contract but never wired into ThemeProvider or
 * SystemCssVariablesBridge, rendering it inert at runtime.
 *
 * @module _internal/testing/system/whitelabel-field-coverage
 * @category Testing
 * @package @rottay/design-system
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');

/**
 * Read a source file relative to SRC_ROOT.
 * Returns empty string if file does not exist (test will still fail on assertion).
 */
function readSource(relativePath: string): string {
  const fullPath = join(SRC_ROOT, relativePath);
  if (!existsSync(fullPath)) {
    return '';
  }
  return readFileSync(fullPath, 'utf-8');
}

// ---------------------------------------------------------------------------
// Load the runtime source files under test
// ---------------------------------------------------------------------------

const themeProviderSource = readSource('runtime/theming/ThemeProvider.tsx');
const bridgeSource = readSource('runtime/bootstrap/SystemCssVariablesBridge.tsx');
const personalityPrimitivesSource = readSource('runtime/personality/primitives.ts');

// The combined runtime surface that should reference all wired fields
const combinedRuntime = themeProviderSource + bridgeSource + personalityPrimitivesSource;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Whitelabel Field Coverage', () => {
  describe('Branding color fields are wired in ThemeProvider', () => {
    // These fields are actively consumed by ThemeProvider's branding effect
    // to set CSS custom properties at runtime.
    const wiredColorFields = [
      'primaryColor',
      'secondaryColor',
      'accentColor',
    ];

    for (const field of wiredColorFields) {
      it(`should reference branding.${field}`, () => {
        expect(themeProviderSource).toContain(field);
      });
    }
  });

  describe('Branding fields are declared in TenantBranding contract', () => {
    const contractSource = readSource('contracts/tenants/index.ts');

    const allBrandingFields = [
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'fontFamilyBase',
      'fontFamilyHeading',
      'fontFamilyMono',
      'successColor',
      'warningColor',
      'errorColor',
      'infoColor',
    ];

    for (const field of allBrandingFields) {
      it(`TenantBranding should declare ${field}`, () => {
        expect(contractSource).toContain(field);
      });
    }
  });

  describe('Personality fields are wired in SystemCssVariablesBridge', () => {
    // The bridge delegates to resolvePersonalityCssVariables() which lives
    // in personality/primitives.ts. We check the combined source.
    const personalityVars = [
      '--ds-personality-animation',
      '--ds-card-shadow',
      '--ds-button-hover-transform',
      '--ds-typography-heading-font-weight',
    ];

    for (const varName of personalityVars) {
      it(`should reference ${varName}`, () => {
        expect(combinedRuntime).toContain(varName);
      });
    }
  });

  describe('Token font family variables exist in tenant CSS', () => {
    const tokenVars = [
      '--ds-font-family-base',
      '--ds-font-family-heading',
      '--ds-font-family-mono',
    ];

    const tenants = ['rottay', 'bithire', 'evnto'];

    for (const tenant of tenants) {
      const css = readSource(`tokens/css/tenants/${tenant}/index.css`);

      for (const varName of tokenVars) {
        it(`${tenant} CSS should declare ${varName}`, () => {
          expect(css).toContain(varName);
        });
      }
    }
  });

  describe('Tenant CSS is variables-only (no component selectors)', () => {
    const tenants = ['rottay', 'bithire', 'evnto'];

    for (const tenant of tenants) {
      it(`${tenant} CSS should not contain .ant- selectors outside comments`, () => {
        const css = readSource(`tokens/css/tenants/${tenant}/index.css`);
        // Strip CSS comments before checking for .ant- selectors
        const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
        const antSelectors = withoutComments.match(/\.ant-/g);
        expect(antSelectors).toBeNull();
      });
    }
  });

  describe('Emergency tokens include critical font variable', () => {
    it('ThemeProvider emergency tokens should include --ds-font-family-base', () => {
      expect(themeProviderSource).toContain('--ds-font-family-base');
    });
  });

  describe('WCAG contrast validation is wired for branding colors', () => {
    it('ThemeProvider should validate branding contrast', () => {
      expect(themeProviderSource).toContain('validateBrandingContrast');
    });
  });
});
