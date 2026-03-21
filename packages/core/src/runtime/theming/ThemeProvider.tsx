/**
 * @fileoverview ThemeProvider - Rottay Design System
 * @description Manages theme state, CSS variable injection, and tenant-specific
 * styling with automatic fallback to Rottay theme on load failures.
 *
 * @remarks
 * The ThemeProvider is responsible for:
 * - **Tenant CSS Loading**: Dynamically loads tenant-specific CSS files
 * - **Theme Variants**: Supports light, dark, and custom theme variants
 * - **Fallback System**: Automatically falls back to Rottay if tenant CSS fails
 * - **Emergency Tokens**: Injects inline tokens if even Rottay CSS fails
 * - **Branding Override**: Allows runtime branding color customization
 *
 * The provider implements a robust fallback hierarchy:
 * 1. Requested tenant CSS
 * 2. Rottay (default) tenant CSS
 * 3. Emergency inline Rottay tokens
 *
 * @example Basic usage
 * ```tsx
 * import { ThemeProvider } from '@rottay/design-system';
 *
 * <ThemeProvider tenant="acme" theme="light">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example With error handling
 * ```tsx
 * <ThemeProvider
 *   tenant="acme"
 *   onError={(error, tenant) => console.error(`Failed: ${tenant}`, error)}
 *   onFallback={(tenant) => console.warn(`Fallback from ${tenant}`)}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Custom CSS base URL
 * ```tsx
 * <ThemeProvider
 *   tenant="client-x"
 *   cssBaseUrl="https://cdn.example.com/themes"
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Runtime branding
 * ```tsx
 * <ThemeProvider
 *   tenant="rottay"
 *   branding={{ primaryColor: '#FF5733', accentColor: '#33FF57' }}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @see {@link useThemeContext} - Hook to access theme context
 * @see {@link ThemeConfig} - Theme configuration structure
 * @module System/Providers/Theme
 * @category System
 * @package @rottay/design-system
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { ThemeContextValue, ThemeConfig, TenantBranding, TenantTokenOverrides } from '../../contracts';
import { getDefaultTenant } from '../tenancy/registry';
import { errorInDev, warnInDev, warnOnceInDev } from '../../_internal/utils/runtime-logger';

// ─────────────────────────────────────────────────────────────────
// COLOR HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Validates that a string is a well-formed 3- or 6-digit hex color.
 *
 * WHY strict validation: runtime white-labeling only works if we update the
 * same CSS variables the components actually consume. The previous implementation
 * wrote `--tenant-*` variables that nothing in the system read, so tenant
 * branding appeared to "work" in config but not on screen. Now we target
 * `--ds-color-*` directly and need clean hex input for the scale generator.
 */
function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/**
 * Expands shorthand hex (`#abc`) to full form (`#aabbcc`) for consistent
 * parsing in `hexToRgb()`. Non-hex strings pass through unchanged.
 */
function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    return value;
  }

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  return value;
}

/** Clamps a color channel to the valid 0-255 range and rounds to integer. */
function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Parses a hex color string into its RGB components.
 * Returns `null` for non-hex inputs so callers can skip scale generation
 * and fall back to the raw value for CSS variable inputs.
 */
function hexToRgb(value: string): { r: number; g: number; b: number } | null {
  const normalizedValue = normalizeHexColor(value);

  if (!isHexColor(normalizedValue)) {
    return null;
  }

  const parsedInt = Number.parseInt(normalizedValue.slice(1), 16);
  return {
    r: (parsedInt >> 16) & 255,
    g: (parsedInt >> 8) & 255,
    b: parsedInt & 255,
  };
}

/** Converts RGB components back to a 6-digit hex string. */
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Linearly interpolates between two hex colors by `mixRatio` (0 = base, 1 = mix).
 * If either input is not a valid hex color, returns `baseColor` unchanged.
 * This keeps the runtime safe when CSS variable references are passed through.
 */
function mixColor(baseColor: string, mixWith: string, mixRatio: number): string {
  const baseRgb = hexToRgb(baseColor);
  const mixRgb = hexToRgb(mixWith);

  // If the input is not a hex color we keep it as-is for the 500 slot and skip
  // generated scales. That keeps the runtime logic safe with CSS variable inputs.
  if (!baseRgb || !mixRgb) {
    return baseColor;
  }

  return rgbToHex({
    r: baseRgb.r + (mixRgb.r - baseRgb.r) * mixRatio,
    g: baseRgb.g + (mixRgb.g - baseRgb.g) * mixRatio,
    b: baseRgb.b + (mixRgb.b - baseRgb.b) * mixRatio,
  });
}

/**
 * Generates a 10-step color scale (50-900) from a single base color.
 *
 * WHY runtime scale generation: tenant branding provides a single primary
 * color, but the DS token system expects a full scale (50-900). Pre-computing
 * a palette server-side would add latency and coupling. Generating it here
 * keeps the branding API simple (one color) while the components get a rich
 * palette. Steps 50-400 mix toward white; 600-900 mix toward black.
 */
function buildRuntimeScale(baseColor: string): Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string> {
  return {
    50: mixColor(baseColor, '#ffffff', 0.92),
    100: mixColor(baseColor, '#ffffff', 0.82),
    200: mixColor(baseColor, '#ffffff', 0.68),
    300: mixColor(baseColor, '#ffffff', 0.48),
    400: mixColor(baseColor, '#ffffff', 0.2),
    500: normalizeHexColor(baseColor),
    600: mixColor(baseColor, '#000000', 0.12),
    700: mixColor(baseColor, '#000000', 0.24),
    800: mixColor(baseColor, '#000000', 0.36),
    900: mixColor(baseColor, '#000000', 0.48),
  };
}

/**
 * Picks a readable foreground color (dark or white) for text placed on top
 * of `baseColor`, using the NTSC luminance formula. The 186 threshold is
 * a standard heuristic that produces good contrast for WCAG AA compliance.
 */
function getReadableForegroundColor(baseColor: string): string {
  const rgbColor = hexToRgb(baseColor);

  if (!rgbColor) {
    return '#ffffff';
  }

  const luminance = (0.299 * rgbColor.r) + (0.587 * rgbColor.g) + (0.114 * rgbColor.b);
  return luminance > 186 ? '#171717' : '#ffffff';
}

// ─────────────────────────────────────────────────────────────────
// WCAG CONTRAST VALIDATION
// ─────────────────────────────────────────────────────────────────

/**
 * Converts a single sRGB channel (0-255) to its linear-light value
 * per the WCAG 2.x relative luminance formula.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function srgbChannelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the WCAG 2.x relative luminance of a hex color.
 * Returns a value between 0 (black) and 1 (white).
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const rLinear = srgbChannelToLinear(rgb.r);
  const gLinear = srgbChannelToLinear(rgb.g);
  const bLinear = srgbChannelToLinear(rgb.b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculates the WCAG 2.x contrast ratio between two hex colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast, black on white).
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(hex1: string, hex2: string): number | null {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);

  if (lum1 === null || lum2 === null) return null;

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA minimum contrast ratio for normal text */
const WCAG_AA_NORMAL_TEXT = 4.5;

/** WCAG AA minimum contrast ratio for large text (>=18pt or >=14pt bold) */
const WCAG_AA_LARGE_TEXT = 3;

/**
 * Validates that a hex color meets WCAG AA contrast ratio requirements
 * against a given background color.
 *
 * @param foreground - The foreground (text) hex color to validate
 * @param background - The background hex color to check against
 * @param threshold  - Minimum contrast ratio (defaults to 4.5 for AA normal text)
 * @returns `true` if the contrast ratio meets the threshold, `false` otherwise.
 *          Returns `true` for non-hex inputs to avoid false warnings on CSS variable values.
 */
function validateContrast(foreground: string, background: string, threshold = WCAG_AA_NORMAL_TEXT): boolean {
  const ratio = getContrastRatio(foreground, background);
  // If either color is not a valid hex (e.g. CSS variable), skip validation
  if (ratio === null) return true;
  return ratio >= threshold;
}

/**
 * Validates branding colors against WCAG AA contrast requirements and logs
 * development-only warnings for colors that may cause accessibility issues.
 *
 * Uses `warnOnceInDev` to avoid duplicate warnings across React re-renders.
 * Only validates hex color inputs; CSS variable references are skipped.
 */
function validateBrandingContrast(branding: TenantBranding): void {
  const LIGHT_BG = '#ffffff';
  const DARK_BG = '#171717';

  if (branding.primaryColor && isHexColor(normalizeHexColor(branding.primaryColor))) {
    const color = normalizeHexColor(branding.primaryColor);

    if (!validateContrast(color, LIGHT_BG)) {
      const ratio = getContrastRatio(color, LIGHT_BG);
      warnOnceInDev(
        `wcag:primary:light:${color}`,
        `[DS] Primary color ${color} may not meet WCAG AA contrast ratio on light backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_NORMAL_TEXT}:1 for normal text, ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }

    if (!validateContrast(color, DARK_BG)) {
      const ratio = getContrastRatio(color, DARK_BG);
      warnOnceInDev(
        `wcag:primary:dark:${color}`,
        `[DS] Primary color ${color} may not meet WCAG AA contrast ratio on dark backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_NORMAL_TEXT}:1 for normal text, ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }
  }

  if (branding.secondaryColor && isHexColor(normalizeHexColor(branding.secondaryColor))) {
    const color = normalizeHexColor(branding.secondaryColor);

    if (!validateContrast(color, LIGHT_BG)) {
      const ratio = getContrastRatio(color, LIGHT_BG);
      warnOnceInDev(
        `wcag:secondary:light:${color}`,
        `[DS] Secondary color ${color} may not meet WCAG AA contrast ratio on light backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_NORMAL_TEXT}:1 for normal text, ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }

    if (!validateContrast(color, DARK_BG)) {
      const ratio = getContrastRatio(color, DARK_BG);
      warnOnceInDev(
        `wcag:secondary:dark:${color}`,
        `[DS] Secondary color ${color} may not meet WCAG AA contrast ratio on dark backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_NORMAL_TEXT}:1 for normal text, ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }
  }

  if (branding.accentColor && isHexColor(normalizeHexColor(branding.accentColor))) {
    const color = normalizeHexColor(branding.accentColor);

    if (!validateContrast(color, LIGHT_BG, WCAG_AA_LARGE_TEXT)) {
      const ratio = getContrastRatio(color, LIGHT_BG);
      warnOnceInDev(
        `wcag:accent:light:${color}`,
        `[DS] Accent color ${color} may not meet WCAG AA contrast ratio on light backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }

    if (!validateContrast(color, DARK_BG, WCAG_AA_LARGE_TEXT)) {
      const ratio = getContrastRatio(color, DARK_BG);
      warnOnceInDev(
        `wcag:accent:dark:${color}`,
        `[DS] Accent color ${color} may not meet WCAG AA contrast ratio on dark backgrounds ` +
        `(ratio: ${ratio?.toFixed(2)}:1, required: ${WCAG_AA_LARGE_TEXT}:1 for large text)`
      );
    }
  }
}

/**
 * Keeping the scale steps as a typed constant avoids lossy `Object.keys()`
 * casts later. That matters because TypeScript otherwise widens the keys to
 * plain `string`, even though the runtime object is a fixed token scale.
 */
const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Writes a full color scale (50-900) plus semantic aliases to the `:root`
 * element's inline styles for the given brand color family.
 *
 * WHY inline styles on `:root`: the CSS token layer may have already loaded a
 * tenant stylesheet via `<link>`. Runtime branding overrides need higher
 * specificity than the stylesheet, and inline styles on the root element
 * achieve that without `!important` or injecting additional `<style>` tags.
 *
 * For `primary`, we also set semantic tokens like `--ds-color-primary-hover`,
 * `--ds-color-primary-foreground`, `--ds-color-link`, etc. so that buttons,
 * links, and focus rings all pick up the brand color automatically.
 */
/** Color families that support runtime branding scale generation. */
type BrandColorFamily = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

function applyRuntimeBrandColorScale(
  variablePrefix: BrandColorFamily,
  colorValue: string
): void {
  const runtimeScale = buildRuntimeScale(colorValue);
  const rgbColor = hexToRgb(colorValue);
  const style = document.documentElement.style;

  style.setProperty(`--ds-color-${variablePrefix}`, runtimeScale[500]);

  if (rgbColor) {
    style.setProperty(
      `--ds-color-${variablePrefix}-rgb`,
      `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
    );
    style.setProperty(
      `--ds-color-alpha-${variablePrefix}-10`,
      `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.10)`
    );
    style.setProperty(
      `--ds-color-alpha-${variablePrefix}-20`,
      `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.20)`
    );
  }

  COLOR_STEPS.forEach((step) => {
    const colorAtStep = runtimeScale[step];
    style.setProperty(`--ds-color-${variablePrefix}-${step}`, colorAtStep);
  });

  // Primary-specific semantic aliases
  if (variablePrefix === 'primary') {
    style.setProperty('--ds-color-primary-hover', runtimeScale[600]);
    style.setProperty('--ds-color-primary-subtle', runtimeScale[100]);
    style.setProperty(
      '--ds-color-primary-foreground',
      getReadableForegroundColor(runtimeScale[500])
    );
    style.setProperty('--ds-color-border-focus', runtimeScale[500]);
    style.setProperty('--ds-color-link', runtimeScale[500]);
    style.setProperty('--ds-color-link-hover', runtimeScale[600]);
  }

  // Semantic color families (success, warning, error, info) get extra
  // -bg and -border tokens that feedback components consume.
  if (variablePrefix === 'success' || variablePrefix === 'warning' || variablePrefix === 'error' || variablePrefix === 'info') {
    if (rgbColor) {
      style.setProperty(
        `--ds-color-${variablePrefix}-bg`,
        `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1)`
      );
      style.setProperty(
        `--ds-color-${variablePrefix}-border`,
        `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.25)`
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

/**
 * Rottay is the base and fallback tenant when no vertical is specified. If any
 * other theme fails to load, the provider attempts the vertical-aware default
 * tenant CSS; if even that fails, emergency inline tokens are injected so the
 * UI is never left without styling.
 *
 * When a `vertical` prop is provided (e.g., 'bithire', 'evnto'), the fallback
 * uses that vertical's default tenant instead of hardcoded 'rottay'.
 */
const DEFAULT_TENANT = 'rottay';

/** Maximum time (ms) to wait for a tenant CSS `<link>` to load before giving up. */
const THEME_LOAD_TIMEOUT = 5000;

/** ID prefix for tenant CSS `<link>` elements so we can find/remove them later. */
const THEME_LINK_ID_PREFIX = 'tenant-theme-';

// Emergency Rottay tokens inline (if even Rottay CSS fails).
// WHY hardcoded: these tokens are the absolute last resort. They are a minimal
// subset of the Rottay token system -- just enough to make text, backgrounds,
// borders, and spacing render sensibly. The full token set is ~200 variables;
// we only include the ones that prevent a blank/broken UI.
const ROTTAY_EMERGENCY_TOKENS = `
  :root {
    --ds-color-primary: #0066CC;
    --ds-color-primary-500: #0066CC;
    --ds-color-secondary: #6B6BD4;
    --ds-color-secondary-500: #6B6BD4;
    --ds-color-bg-primary: #FFFFFF;
    --ds-color-bg-secondary: #FAFAFA;
    --ds-color-border: #E5E5E5;
    --ds-color-text-primary: #171717;
    --ds-color-text-secondary: #525252;
    --ds-text-primary: var(--ds-color-text-primary);
    --ds-text-secondary: var(--ds-color-text-secondary);
    --ds-bg-primary: var(--ds-color-bg-primary);
    --ds-bg-secondary: var(--ds-color-bg-secondary);
    --ds-spacing-xs: 4px;
    --ds-spacing-sm: 8px;
    --ds-spacing-md: 16px;
    --ds-spacing-lg: 24px;
    --ds-radius-sm: 4px;
    --ds-radius-md: 8px;
    --ds-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
`;

// ─────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────

// WHY `null` default: same pattern as FeatureContext -- lets consumer hooks
// distinguish "no provider" from "provider with default state" and throw a
// helpful error message.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────

/**
 * Props for the {@link ThemeProvider} component.
 *
 * The provider manages two orthogonal axes of styling:
 * - **Tenant** (which brand): determines the CSS token file to load.
 * - **Theme** (which variant): determines light/dark/auto via `data-theme` attribute.
 *
 * Both can change at runtime via `setTenant` / `setTheme` on the context value.
 */
export interface ThemeProviderProps {
  /** React subtree that gains access to the theme context. */
  children: ReactNode;
  /** Initial theme variant. Defaults to `'base'`. Supports `'light'`, `'dark'`, `'auto'`. */
  theme?: string;
  /** Initial tenant slug. Defaults to `'rottay'`. */
  tenant?: string;
  /**
   * Industry vertical hint for fallback resolution.
   * When the requested tenant CSS fails to load, the provider falls back to
   * the default tenant for this vertical (e.g., 'bithire' falls back to the
   * bithire tenant instead of rottay). If omitted, falls back to 'rottay'.
   */
  vertical?: string;
  /** Runtime branding overrides (colors, fonts, semantic colors). Applied as inline CSS variables. */
  branding?: TenantBranding;
  /** Token overrides for glass, gradients, and overlays. Applied as inline CSS variables. */
  tokenOverrides?: TenantTokenOverrides;
  /** Called when tenant CSS loading fails, before fallback kicks in. */
  onError?: (error: Error, tenant: string) => void;
  /** Called when the provider falls back from the requested tenant to Rottay. */
  onFallback?: (originalTenant: string) => void;
  /** Base URL for tenant CSS files (e.g., `'/themes'` or `'https://cdn.example.com/themes'`). */
  cssBaseUrl?: string;
  /**
   * When `true`, skips loading individual tenant CSS `<link>` elements.
   * Use this when importing the bundled CSS via `@rottay/design-system/tokens/css`,
   * which includes all tenant styles using `html[data-tenant='x']` selectors.
   * The `TenantProvider` sets the `data-tenant` attribute on the HTML element.
   */
  skipCssLoading?: boolean;
}

export function ThemeProvider({
  children,
  theme: initialTheme = 'base',
  tenant: initialTenant = DEFAULT_TENANT,
  vertical,
  branding,
  tokenOverrides,
  onError,
  onFallback,
  cssBaseUrl = '/themes',
  skipCssLoading = false,
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState(initialTheme);
  const [tenant, setTenantState] = useState(initialTenant);
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [emergencyTokensInjected, setEmergencyTokensInjected] = useState(false);

  // Resolve the fallback tenant slug based on the vertical. When a vertical
  // is provided (e.g., 'bithire'), the fallback uses that vertical's default
  // tenant instead of always falling back to 'rottay'.
  const fallbackTenantSlug = useMemo(
    () => getDefaultTenant(vertical).slug,
    [vertical]
  );

  useEffect(() => {
    setThemeState(initialTheme);
  }, [initialTheme]);

  /**
   * Injects emergency Rottay tokens as inline style element
   * This is the last resort if even the Rottay CSS file fails to load
   */
  const injectEmergencyTokens = useCallback(() => {
    if (emergencyTokensInjected) return;

    const styleId = 'rottay-emergency-tokens';
    const existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = ROTTAY_EMERGENCY_TOKENS;
      document.head.appendChild(styleElement);
      setEmergencyTokensInjected(true);

      warnInDev('[ThemeProvider] Emergency Rottay tokens injected as fallback');
    }
  }, [emergencyTokensInjected]);

  /**
   * Loads tenant CSS file via <link> element
   * Returns a promise that resolves when CSS is loaded or rejects on timeout/error
   */
  const loadTenantCSS = useCallback(
    (tenantName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const cssUrl = `${cssBaseUrl}/${tenantName}.css`;
        const linkId = `${THEME_LINK_ID_PREFIX}${tenantName}`;

        // Check if already loaded
        const existingLink = document.getElementById(linkId) as HTMLLinkElement;
        if (existingLink && existingLink.sheet) {
          resolve();
          return;
        }

        // Create new link element
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = cssUrl;

        // Setup timeout
        const timeoutId = setTimeout(() => {
          link.remove();
          reject(new Error(`Theme "${tenantName}" loading timeout after ${THEME_LOAD_TIMEOUT}ms`));
        }, THEME_LOAD_TIMEOUT);

        // Success handler
        link.onload = () => {
          clearTimeout(timeoutId);
          resolve();
        };

        // Error handler
        link.onerror = () => {
          clearTimeout(timeoutId);
          link.remove();
          reject(new Error(`Failed to load theme "${tenantName}" from ${cssUrl}`));
        };

        // Append to head
        document.head.appendChild(link);
      });
    },
    [cssBaseUrl]
  );

  /**
   * Falls back to the vertical-aware default tenant theme.
   * When a vertical is specified (e.g., 'bithire'), falls back to that
   * vertical's default tenant instead of always falling back to 'rottay'.
   */
  const fallbackToDefault = useCallback(
    async (originalTenant: string, error: Error) => {
      warnInDev(`[ThemeProvider] Falling back to "${fallbackTenantSlug}" theme due to error:`, error);

      // Notify parent
      if (onFallback) {
        onFallback(originalTenant);
      }

      setIsFallback(true);
      setTenantState(fallbackTenantSlug);

      try {
        // Try to load the vertical-aware default tenant CSS
        await loadTenantCSS(fallbackTenantSlug);

        setConfig({
          name: fallbackTenantSlug,
          tenant: fallbackTenantSlug,
          cssUrl: `${cssBaseUrl}/${fallbackTenantSlug}.css`,
          isLoaded: true,
          isError: false,
          isFallback: true,
          variables: {},
        });
      } catch (fallbackError) {
        // Even the default tenant failed - inject emergency tokens
        errorInDev(
          `[ThemeProvider] Even "${fallbackTenantSlug}" theme failed to load. Using emergency inline tokens.`,
          fallbackError
        );
        injectEmergencyTokens();

        setConfig({
          name: `${fallbackTenantSlug}-emergency`,
          tenant: fallbackTenantSlug,
          cssUrl: 'inline',
          isLoaded: true,
          isError: true,
          isFallback: true,
          variables: {},
        });
      }
    },
    [cssBaseUrl, fallbackTenantSlug, loadTenantCSS, injectEmergencyTokens, onFallback]
  );

  /**
   * Loads the specified tenant theme
   */
  const loadTenant = useCallback(
    async (tenantName: string) => {
      // Don't reload if already loaded
      if (tenant === tenantName && config?.isLoaded && !config?.isError) {
        return;
      }

      setIsLoading(true);
      setIsFallback(false);

      // When using bundled CSS (skipCssLoading=true), skip individual CSS loading
      // The tenant styles are applied via html[data-tenant='x'] selectors
      // which TenantProvider sets on the HTML element
      if (skipCssLoading) {
        setConfig({
          name: tenantName,
          tenant: tenantName,
          cssUrl: 'bundled',
          isLoaded: true,
          isError: false,
          isFallback: false,
          variables: {},
        });
        setTenantState(tenantName);
        setIsLoading(false);
        return;
      }

      try {
        // Remove previous theme links (except the one we're loading)
        const allThemeLinks = document.querySelectorAll(`[id^="${THEME_LINK_ID_PREFIX}"]`);
        allThemeLinks.forEach((link) => {
          if (link.id !== `${THEME_LINK_ID_PREFIX}${tenantName}`) {
            link.remove();
          }
        });

        // Load the tenant CSS
        await loadTenantCSS(tenantName);

        // Update config
        setConfig({
          name: tenantName,
          tenant: tenantName,
          cssUrl: `${cssBaseUrl}/${tenantName}.css`,
          isLoaded: true,
          isError: false,
          isFallback: false,
          variables: {},
        });

        setTenantState(tenantName);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorInDev(`[ThemeProvider] Failed to load tenant "${tenantName}":`, err);

        // Notify error callback
        if (onError) {
          onError(err, tenantName);
        }

        // Fall back to vertical-aware default if loading a non-default tenant fails
        if (tenantName !== fallbackTenantSlug) {
          await fallbackToDefault(tenantName, err);
        } else {
          // Default tenant itself failed - inject emergency tokens
          injectEmergencyTokens();
          setConfig({
            name: `${fallbackTenantSlug}-emergency`,
            tenant: fallbackTenantSlug,
            cssUrl: 'inline',
            isLoaded: true,
            isError: true,
            isFallback: true,
            variables: {},
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [tenant, config, cssBaseUrl, fallbackTenantSlug, loadTenantCSS, fallbackToDefault, injectEmergencyTokens, onError, skipCssLoading]
  );

  /**
   * Public API to change tenant
   */
  const setTenant = useCallback(
    (newTenant: string) => {
      if (newTenant !== tenant) {
        loadTenant(newTenant);
      }
    },
    [tenant, loadTenant]
  );

  /**
   * Public API to change theme variant (e.g., 'base', 'dark', 'light')
   */
  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
  }, []);

  // Apply branding colors, fonts, semantic colors, and token overrides as CSS
  // variables. WHY a separate effect: branding can change independently of
  // tenant/theme (e.g., a white-label admin adjusting colors in real time).
  // Running this in its own effect avoids re-triggering the tenant CSS load cycle.
  useEffect(() => {
    const style = document.documentElement.style;
    // Track every CSS variable we set so we can clean them up on unmount or
    // when branding/tokenOverrides change.
    const appliedVars: string[] = [];

    const safeSetProperty = (name: string, value: string) => {
      style.setProperty(name, value);
      appliedVars.push(name);
    };

    // Validate branding colors against WCAG AA contrast requirements.
    // Warnings are logged once per color value and only in development.
    if (branding) {
      validateBrandingContrast(branding);
    }

    // ── Color scales (primary, secondary) ──────────────────────────
    // Runtime branding has to target the variable families the live DS
    // actually consumes. We separate semantic secondary from accent-specific
    // tokens so tenant config produces predictable output.
    if (branding?.primaryColor) {
      try {
        applyRuntimeBrandColorScale('primary', branding.primaryColor);
        // Track the vars applyRuntimeBrandColorScale sets
        appliedVars.push(
          '--ds-color-primary', '--ds-color-primary-rgb',
          '--ds-color-alpha-primary-10', '--ds-color-alpha-primary-20',
          '--ds-color-primary-hover', '--ds-color-primary-subtle',
          '--ds-color-primary-foreground', '--ds-color-border-focus',
          '--ds-color-link', '--ds-color-link-hover',
          ...COLOR_STEPS.map((s) => `--ds-color-primary-${s}`)
        );
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[DS] Invalid branding color "${branding.primaryColor}":`, error);
        }
      }
    }

    if (branding?.secondaryColor) {
      try {
        applyRuntimeBrandColorScale('secondary', branding.secondaryColor);
        appliedVars.push(
          '--ds-color-secondary', '--ds-color-secondary-rgb',
          '--ds-color-alpha-secondary-10', '--ds-color-alpha-secondary-20',
          ...COLOR_STEPS.map((s) => `--ds-color-secondary-${s}`)
        );
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[DS] Invalid branding color "${branding.secondaryColor}":`, error);
        }
      }
    }

    if (branding?.accentColor) {
      safeSetProperty('--ds-color-accent', branding.accentColor);
      safeSetProperty('--ds-color-accent-hover', branding.accentColor);
    }

    // ── Semantic colors (success, warning, error, info) ────────────
    const semanticColors: Array<{ key: keyof TenantBranding; prefix: BrandColorFamily }> = [
      { key: 'successColor', prefix: 'success' },
      { key: 'warningColor', prefix: 'warning' },
      { key: 'errorColor', prefix: 'error' },
      { key: 'infoColor', prefix: 'info' },
    ];

    for (const { key, prefix } of semanticColors) {
      const value = branding?.[key] as string | undefined;
      if (value) {
        try {
          applyRuntimeBrandColorScale(prefix, value);
          appliedVars.push(
            `--ds-color-${prefix}`, `--ds-color-${prefix}-rgb`,
            `--ds-color-alpha-${prefix}-10`, `--ds-color-alpha-${prefix}-20`,
            `--ds-color-${prefix}-bg`, `--ds-color-${prefix}-border`,
            ...COLOR_STEPS.map((s) => `--ds-color-${prefix}-${s}`)
          );
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[DS] Invalid branding ${key} "${value}":`, error);
          }
        }
      }
    }

    // ── Dark mode color overrides ──────────────────────────────────
    // These are applied unconditionally; the CSS specificity of
    // [data-theme='dark'] selectors in tenant stylesheets will be
    // overridden by inline styles only when dark mode is active.
    // Components that reference these vars will pick them up when
    // the theme switches to dark.
    if (branding?.darkPrimaryColor) {
      safeSetProperty('--ds-color-dark-primary', branding.darkPrimaryColor);
    }
    if (branding?.darkSecondaryColor) {
      safeSetProperty('--ds-color-dark-secondary', branding.darkSecondaryColor);
    }
    if (branding?.darkAccentColor) {
      safeSetProperty('--ds-color-dark-accent', branding.darkAccentColor);
    }
    if (branding?.darkBackgroundColor) {
      safeSetProperty('--ds-color-dark-bg', branding.darkBackgroundColor);
    }

    // ── Font families ──────────────────────────────────────────────
    if (branding?.fontFamilyBase) {
      safeSetProperty('--ds-font-family-base', branding.fontFamilyBase);
    }
    if (branding?.fontFamilyHeading) {
      safeSetProperty('--ds-font-family-heading', branding.fontFamilyHeading);
    }
    if (branding?.fontFamilyMono) {
      safeSetProperty('--ds-font-family-mono', branding.fontFamilyMono);
    }
    if (branding?.fontFamilyDisplay) {
      safeSetProperty('--ds-font-family-display', branding.fontFamilyDisplay);
    }

    // ── Token overrides: glass, gradients, overlays ────────────────
    if (tokenOverrides?.glass) {
      const glass = tokenOverrides.glass;
      if (glass.blur) {
        safeSetProperty('--ds-glass-blur', glass.blur);
      }
      if (glass.background) {
        safeSetProperty('--ds-glass-bg', glass.background);
      }
      if (glass.border) {
        safeSetProperty('--ds-glass-border', glass.border);
      }
    }

    if (tokenOverrides?.gradients) {
      const gradients = tokenOverrides.gradients;
      if (gradients.primary) {
        safeSetProperty('--ds-gradient-primary', gradients.primary);
      }
      if (gradients.surface) {
        safeSetProperty('--ds-gradient-surface', gradients.surface);
      }
      if (gradients.mesh) {
        safeSetProperty('--ds-gradient-mesh', gradients.mesh);
      }
    }

    if (tokenOverrides?.overlays) {
      const overlays = tokenOverrides.overlays;
      if (overlays.light) {
        safeSetProperty('--ds-overlay-light', overlays.light);
      }
      if (overlays.medium) {
        safeSetProperty('--ds-overlay-medium', overlays.medium);
      }
      if (overlays.heavy) {
        safeSetProperty('--ds-overlay-heavy', overlays.heavy);
      }
    }

    // Cleanup: remove all CSS variables this effect set when branding or
    // tokenOverrides change, or when the component unmounts. This prevents
    // stale branding from leaking across tenant switches.
    return () => {
      for (const varName of appliedVars) {
        style.removeProperty(varName);
      }
    };
  }, [branding, tokenOverrides]);

  /**
   * Theme state needs to materialize into DOM attributes because the CSS token
   * layer resolves variants through selectors, not through React context alone.
   * Without this sync, calling `setTheme('dark')` changes state but not the
   * actual variables the UI consumes.
   */
  useEffect(() => {
    const rootElement = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (): 'dark' | 'light' | 'base' => {
      if (theme === 'auto') {
        return mediaQuery.matches ? 'dark' : 'light';
      }

      return theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'base';
    };

    const applyThemeToDom = () => {
      const resolvedTheme = resolveTheme();

      rootElement.setAttribute('data-theme', resolvedTheme);
      rootElement.classList.toggle('dark', resolvedTheme === 'dark');
      rootElement.style.colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    };

    applyThemeToDom();

    if (theme !== 'auto') {
      return () => {
        rootElement.removeAttribute('data-theme');
        rootElement.classList.remove('dark');
        rootElement.style.removeProperty('color-scheme');
      };
    }

    const handleMediaChange = () => {
      applyThemeToDom();
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      rootElement.removeAttribute('data-theme');
      rootElement.classList.remove('dark');
      rootElement.style.removeProperty('color-scheme');
    };
  }, [theme]);

  // Load tenant on mount and when initialTenant prop changes
  useEffect(() => {
    loadTenant(initialTenant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTenant]);

  // Memoize context value to prevent unnecessary re-renders in consumers.
  // Every field in the dependency array is either a primitive or a stable
  // callback (via useCallback), so this memo only breaks when real state changes.
  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      setTheme,
      config,
      tenant,
      setTenant,
      isLoading,
      isFallback,
    }),
    [theme, setTheme, config, tenant, setTenant, isLoading, isFallback]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to access the full theme context value from the nearest ThemeProvider.
 *
 * Provides the current theme variant, tenant slug, loading/fallback state,
 * and setter functions (`setTheme`, `setTenant`).
 *
 * @returns The current ThemeContextValue.
 * @throws If called outside a ThemeProvider subtree.
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

// ThemeContext is exported inline at declaration. Types are re-exported from
// contracts so consumers can import them alongside the provider without
// needing a separate `contracts` import.
export type { ThemeConfig, ThemeContextValue } from '../../contracts';
