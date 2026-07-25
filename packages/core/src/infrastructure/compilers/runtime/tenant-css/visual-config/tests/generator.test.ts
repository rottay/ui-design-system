/**
 * @fileoverview Tests for the tenant CSS generator -- validates color scale
 * generation, dark mode selectors, personality variables, and token overrides.
 */

import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../../foundation/contracts';
import { appearanceToVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';
import {
  buildTenantSelector,
  generateTenantCss,
  generateTenantCssFile,
  resolveTenantVisualConfig,
} from '..';

const TENANT: TenantConfig = {
  slug: 'evnto-labs',
  name: 'Evnto Labs',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['events', 'ai'],
  branding: {
    companyName: 'Evnto Labs',
    primaryColor: '#f97316',
    secondaryColor: '#0f766e',
    accentColor: '#8b5cf6',
  },
  tokenOverrides: {
    borderRadius: {
      md: '18px',
    },
    shadows: {
      md: '0 20px 40px rgba(15, 23, 42, 0.18)',
    },
    densityScale: 1.1,
  },
  personality: {
    animation: {
      intensity: 1.2,
      staggerDelay: 55,
      staggerMax: 220,
      entrance: 'slideUp',
      entranceDuration: 280,
      hoverLift: 3,
      hoverScale: 1.015,
      useSpring: true,
      springTension: 210,
      springFriction: 18,
      pulseSpeed: 'fast',
      skeletonStyle: 'wave',
      countUpEnabled: true,
    },
    typography: {
      headingWeightBias: 'heavier',
      headingLetterSpacing: '-0.02em',
      labelStyle: 'capitalize',
    },
    accent: {
      barPosition: 'top',
      barThickness: 4,
      barStyle: 'gradient',
      iconContainerShape: 'rounded',
      badgeShape: 'pill',
      dividerStyle: 'dashed',
    },
    card: {
      defaultElevation: 'md',
      hoverElevation: 'lift-two',
      showBorder: true,
      hoverTint: true,
      paddingDensity: 'spacious',
    },
  },
};

describe('tenant css generator', () => {
  it('builds the expected tenant selector', () => {
    expect(buildTenantSelector('bithire')).toBe("html[data-tenant='bithire']");
  });

  it('serializes branding, token overrides, and personality variables into CSS', () => {
    const css = generateTenantCss(TENANT);

    expect(css).toContain("html[data-tenant='evnto-labs']");
    // The light block must also declare directly on the DS-root wrapper:
    // without it, a vertical artifact's own `:where([data-ds-root][data-vertical])`
    // declarations on that wrapper shadow the tenant's inherited values (the
    // documented merge order puts Appearance above the vertical artifact).
    expect(css).toContain("html[data-tenant='evnto-labs'] [data-ds-root]");
    expect(css).toContain("--ds-color-primary: #f97316;");
    expect(css).toContain("--ds-color-primary-500: #f97316;");
    expect(css).toContain("--ds-color-link-hover:");
    expect(css).toContain('--ds-radius-md: 18px;');
    expect(css).toContain('--ds-shadow-md: 0 20px 40px rgba(15, 23, 42, 0.18);');
    expect(css).toContain('--ds-density-scale: 1.1;');
    expect(css).toContain('--ds-personality-animation-entrance: slideUp;');
    expect(css).toContain('--ds-button-hover-transform: translateY(-3px) scale(1.015);');
    expect(css).toContain('--ds-badge-radius: var(--ds-radius-full);');
    expect(css).toContain('--ds-divider-style: dashed;');
    expect(css).toContain('--ds-typography-label-transform: capitalize;');
    expect(css).toContain('--ds-card-shadow: var(--ds-shadow-md);');
  });

  it('keeps tenant compatibility fields while Appearance owns the final semantic color and OKLCH ramp', () => {
    const config: TenantConfig = {
      ...TENANT,
      slug: 'precedence',
      name: 'Precedence',
      branding: {
        companyName: 'Precedence',
        primaryColor: '#123456',
      },
      brandTheme: {
        id: 'precedence-brand',
        name: 'Precedence Brand',
        palette: {
          primaryColor: '#654321',
        },
        surfaces: {
          densityScale: 0.9,
          borderRadius: {
            md: '10px',
          },
        },
        chrome: {
          sidebar: {
            bg: '#111111',
          },
        },
      },
      tokenOverrides: {
        densityScale: 1.2,
        borderRadius: {
          md: '18px',
        },
      },
      appearance: {
        general: {
          palette: {
            primary: '#abcdef',
          },
        },
        advanced: {
          tokenOverrides: {
            '--ds-radius-md': '22px',
            '--ds-sidebar-bg': '#222222',
          },
        },
      },
    };

    const resolved = resolveTenantVisualConfig(config);
    const css = generateTenantCss(config, { includeDarkSelector: false });
    const appearanceVars = appearanceToVariables(config.appearance!);

    expect(resolved.compiledBrand?.tokenOverrides.borderRadius?.md).toBe('10px');
    expect(resolved.config.branding.primaryColor).toBe('#123456');
    expect(resolved.config.tokenOverrides?.densityScale).toBe(1.2);
    expect(resolved.config.tokenOverrides?.borderRadius?.md).toBe('18px');

    // Appearance is the final visual layer. Its compiler-owned perceptual ramp
    // must replace both the BrandTheme ramp and the legacy tenant scale.
    expect(css).toContain(
      `--ds-color-primary-500: ${appearanceVars['--ds-color-primary-500']};`,
    );
    expect(css).not.toContain('--ds-color-primary-500: #123456;');
    expect(css).toContain('--ds-color-primary: #abcdef;');
    expect(css).toContain('--ds-density-scale: 1.2;');
    expect(css).toContain('--ds-radius-md: 22px;');
    expect(css).toContain('--ds-sidebar-bg: #222222;');
  });

  it('includes a dark selector block by default and can package a file artifact', () => {
    const css = generateTenantCss(TENANT);
    const artifact = generateTenantCssFile(TENANT);

    expect(css).toContain("html[data-tenant='evnto-labs'][data-theme='dark']");
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--ds-color-bg-primary: #0a0a0a;');
    expect(css).toContain('--ds-color-text-primary: #fafafa;');
    expect(css).toContain('--ds-color-link-hover:');
    // Verify dark-specific values are truly different from light
    expect(css).toContain('--ds-color-bg: #0a0a0a;');
    expect(css).toContain('--ds-color-text: #fafafa;');
    expect(css).toContain('--ds-color-border-primary: rgba(255, 255, 255, 0.12);');
    expect(css).toContain('--ds-shadow-sm: var(--ds-elevation-1)');
    expect(artifact.path).toBe('evnto-labs/index.css');
    expect(artifact.contents).toContain('Auto-generated tenant theme for Evnto Labs');
  });

  it('emits the same APCA-corrected foreground used by the runtime provider', () => {
    const config: TenantConfig = {
      ...TENANT,
      slug: 'contrast-proof',
      appearance: {
        general: {
          palette: {
            background: '#FFFFFF',
            foreground: {
              primary: '#B8B8B8',
            },
          },
        },
      },
    };

    const css = generateTenantCss(config, {
      includeDarkSelector: false,
      includeSystemDarkSelector: false,
    });

    expect(css).toContain('--ds-color-bg-primary: #FFFFFF;');
    expect(css).not.toContain('--ds-color-text-primary: #B8B8B8;');
    expect(css).toMatch(/--ds-color-text-primary: #[0-9A-F]{6};/);
  });

  it('can skip dark blocks entirely when requested', () => {
    const css = generateTenantCss(TENANT, {
      includeDarkSelector: false,
      includeSystemDarkSelector: false,
    });

    expect(css).not.toContain("[data-theme='dark']");
    expect(css).not.toContain('@media (prefers-color-scheme: dark)');
  });

  it('handles shorthand hex colors, css variable colors, and sparse tenant configs safely', () => {
    const css = generateTenantCss({
      ...TENANT,
      slug: 'minimal',
      name: 'Minimal',
      branding: {
        companyName: 'Minimal',
        primaryColor: '#abc',
        secondaryColor: 'var(--brand-secondary)',
      },
      tokenOverrides: undefined,
      personality: undefined,
    });

    expect(css).toContain("html[data-tenant='minimal']");
    expect(css).toContain('--ds-color-primary: #aabbcc;');
    expect(css).toContain('--ds-color-secondary: var(--brand-secondary);');
    expect(css).toContain('--ds-color-bg-primary: #0a0a0a;');
  });

  it('serializes the low-intensity personality branches and keeps the dark selector without the system block', () => {
    const css = generateTenantCss(
      {
        ...TENANT,
        slug: 'subtle',
        name: 'Subtle',
        branding: {
          companyName: 'Subtle',
          secondaryColor: '#0f766e',
          accentColor: '#8b5cf6',
        },
        personality: {
          animation: {
            hoverLift: 0,
            hoverScale: 1,
            pulseSpeed: 'none',
            countUpEnabled: false,
          },
          typography: {
            headingWeightBias: 'lighter',
            labelStyle: 'uppercase',
          },
          accent: {
            badgeShape: 'square',
            dividerStyle: 'none',
          },
          card: {
            defaultElevation: 'sm',
            hoverElevation: 'none',
            showBorder: false,
            hoverTint: false,
            paddingDensity: 'compact',
          },
        },
      },
      {
        includeDarkSelector: true,
        includeSystemDarkSelector: false,
      }
    );

    expect(css).toContain("html[data-tenant='subtle'][data-theme='dark']");
    expect(css).not.toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--ds-badge-radius: var(--ds-radius-sm);');
    expect(css).toContain('--ds-divider-style: solid;');
    expect(css).toContain('--ds-divider-color: transparent;');
    expect(css).toContain('--ds-card-shadow: var(--ds-shadow-sm);');
    expect(css).toContain('--ds-card-shadow-hover: var(--ds-card-shadow);');
    expect(css).toContain('--ds-card-border: transparent;');
    expect(css).toContain('--ds-card-bg-hover: var(--ds-card-bg);');
    expect(css).toContain('--ds-button-hover-transform: translateY(0) scale(1);');
    expect(css).toContain('--ds-button-active-transform: translateY(0) scale(0.98);');
    expect(css).toContain('--ds-skeleton-animation-duration: 0s;');
    expect(css).toContain('--ds-typography-heading-font-weight: 500;');
    expect(css).toContain('--ds-typography-label-transform: uppercase;');
    expect(css).toContain('--ds-personality-animation-count-up-enabled: 0;');
    expect(css).toContain('--ds-color-link: #7dd3fc;');
  });

  it('covers the remaining label, heading, badge, and dark-scale branches through generated css', () => {
    const css = generateTenantCss({
      ...TENANT,
      slug: 'balanced',
      name: 'Balanced',
      branding: {
        companyName: 'Balanced',
        primaryColor: '#10b981',
      },
      tokenOverrides: undefined,
      personality: {
        animation: {
          hoverLift: -2,
          hoverScale: 0.9,
          pulseSpeed: 'slow',
          entranceDuration: 180,
        },
        typography: {
          headingWeightBias: 'normal',
          labelStyle: 'sentence',
        },
        accent: {
          badgeShape: 'rounded',
          dividerStyle: 'solid',
        },
        card: {
          defaultElevation: 'lg',
          hoverElevation: 'lift-one',
          showBorder: true,
          hoverTint: true,
          paddingDensity: 'comfortable',
        },
      },
    });

    expect(css).toContain('--ds-badge-radius: var(--ds-radius-lg);');
    expect(css).toContain('--ds-divider-style: solid;');
    expect(css).toContain('--ds-divider-color: var(--ds-color-border-primary);');
    expect(css).toContain('--ds-card-shadow: var(--ds-shadow-lg);');
    expect(css).toContain('--ds-card-shadow-hover: var(--ds-shadow-md);');
    expect(css).toContain('--ds-card-border: var(--ds-color-border-primary);');
    expect(css).toContain('--ds-card-border-hover: var(--ds-color-border-secondary);');
    expect(css).toContain('--ds-button-hover-transform: translateY(0) scale(1);');
    expect(css).toContain('--ds-button-active-transform: translateY(0) scale(0.98);');
    expect(css).toContain('--ds-skeleton-animation-duration: 1.9s;');
    expect(css).toContain('--ds-typography-heading-font-weight: 600;');
    expect(css).toContain('--ds-typography-label-transform: none;');
    expect(css).toContain('--ds-color-primary-50:');
    expect(css).toContain('--ds-color-primary-900:');
  });

  it('covers non-hex branding fallbacks plus surface and motion token overrides', () => {
    const css = generateTenantCss({
      ...TENANT,
      slug: 'custom-runtime',
      name: 'Custom Runtime',
      branding: {
        companyName: 'Custom Runtime',
        primaryColor: 'rebeccapurple',
        secondaryColor: 'var(--secondary-brand)',
      },
      tokenOverrides: {
        surface: {
          borderWidth: '3px',
          borderStyle: 'dotted',
          useGradients: true,
          useGlass: true,
        },
        motion: {
          hover: '160ms ease',
          transform: 'translateY(-2px)',
          spring: '240 18',
          durationScale: 0.85,
        },
      },
      personality: undefined,
    });

    expect(css).toContain('--ds-color-primary: rebeccapurple;');
    expect(css).toContain('--ds-color-primary-50: rebeccapurple;');
    expect(css).toContain('--ds-color-primary-foreground: #ffffff;');
    expect(css).toContain('--ds-color-secondary: var(--secondary-brand);');
    expect(css).toContain('--ds-surface-border-width: 3px;');
    expect(css).toContain('--ds-surface-border-style: dotted;');
    expect(css).toContain('--ds-surface-use-gradients: 1;');
    expect(css).toContain('--ds-surface-use-glass: 1;');
    expect(css).toContain('--ds-motion-hover-transition: 160ms ease;');
    expect(css).toContain('--ds-motion-hover-transform: translateY(-2px);');
    expect(css).toContain('--ds-motion-spring: 240 18;');
    expect(css).toContain('--ds-motion-duration-scale: 0.85;');
  });

  it("layers a dark tenant's compiled chrome over the generated dark defaults (WO-TOK-05)", () => {
    const config: TenantConfig = {
      ...TENANT,
      slug: 'dark-chrome-tenant',
      name: 'Dark Chrome Tenant',
      tokenOverrides: undefined,
      personality: undefined,
      brandTheme: {
        id: 'dark-chrome-brand',
        name: 'Dark Chrome Brand',
        chrome: {
          cardComponent: { bg: '#120010', border: '#4D0033' },
          controls: {
            input: { bg: '#1A0014', border: '#661144', color: '#FF99DD' },
          },
          modal: { bg: '#1F0016' },
        },
      },
    };

    const css = generateTenantCss(config);
    const darkSelectorIndex = css.indexOf(`${buildTenantSelector('dark-chrome-tenant')}[data-theme='dark']`);
    expect(darkSelectorIndex).toBeGreaterThan(-1);
    const darkBlock = css.slice(darkSelectorIndex);

    expect(darkBlock).toContain('--ds-card-bg: #120010;');
    expect(darkBlock).toContain('--ds-card-border-color: #4D0033;');
    expect(darkBlock).toContain('--ds-input-bg: #1A0014;');
    expect(darkBlock).toContain('--ds-input-border: #661144;');
    expect(darkBlock).toContain('--ds-input-color: #FF99DD;');
    expect(darkBlock).toContain('--ds-modal-bg: #1F0016;');
  });

  it('keeps the generated dark defaults when a tenant brandTheme declares no chrome (WO-TOK-05)', () => {
    const config: TenantConfig = {
      ...TENANT,
      slug: 'dark-no-chrome-tenant',
      name: 'Dark No Chrome Tenant',
      tokenOverrides: undefined,
      personality: undefined,
      brandTheme: {
        id: 'dark-no-chrome-brand',
        name: 'Dark No Chrome Brand',
        palette: { primaryColor: '#336699' },
      },
    };

    const css = generateTenantCss(config);
    const darkSelectorIndex = css.indexOf(`${buildTenantSelector('dark-no-chrome-tenant')}[data-theme='dark']`);
    expect(darkSelectorIndex).toBeGreaterThan(-1);
    const darkBlock = css.slice(darkSelectorIndex);

    expect(darkBlock).toContain('--ds-card-bg: #111827;');
    expect(darkBlock).toContain('--ds-input-bg: #0f172a;');
    expect(darkBlock).toContain('--ds-modal-bg: #111827;');
  });

  it('neutralizes comment breakout via tenant name or slug in the generated header', () => {
    const config: TenantConfig = {
      ...TENANT,
      name: 'Evil */ body { background: red } /*',
      slug: 'evil */ * { display: none } /*',
    };

    const css = generateTenantCss(config);
    const headerEnd = css.indexOf('\n');
    const header = css.slice(0, headerEnd);

    expect(header.startsWith('/* Auto-generated tenant theme for ')).toBe(true);
    expect(header.endsWith('*/')).toBe(true);
    // The interpolated strings must not terminate the comment early: the
    // first `*/` in the stylesheet is the header's own closer, so the hostile
    // payload never becomes live CSS.
    expect(header.slice(2, -2)).not.toContain('*/');
    expect(css.indexOf('*/')).toBe(header.length - 2);
  });

  it('keeps a benign header byte-identical after comment hardening', () => {
    const css = generateTenantCss(TENANT);
    expect(css.startsWith('/* Auto-generated tenant theme for Evnto Labs (evnto-labs) */\n')).toBe(true);
  });
});
