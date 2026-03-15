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
import type { ThemeContextValue, ThemeConfig, TenantBranding } from '../contracts';
import { errorInDev, warnInDev } from '../core/utils/runtime-logger';

// ─────────────────────────────────────────────────────────────────
// COLOR HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Runtime white-labeling only works if we update the same CSS variables the
 * components actually consume. The previous implementation wrote `--tenant-*`
 * variables that nothing in the system read, so tenant branding appeared to
 * "work" in config but not on screen.
 */
function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    return value;
  }

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  return value;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

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

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

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

function getReadableForegroundColor(baseColor: string): string {
  const rgbColor = hexToRgb(baseColor);

  if (!rgbColor) {
    return '#ffffff';
  }

  const luminance = (0.299 * rgbColor.r) + (0.587 * rgbColor.g) + (0.114 * rgbColor.b);
  return luminance > 186 ? '#171717' : '#ffffff';
}

/**
 * Keeping the scale steps as a typed constant avoids lossy `Object.keys()`
 * casts later. That matters because TypeScript otherwise widens the keys to
 * plain `string`, even though the runtime object is a fixed token scale.
 */
const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function applyRuntimeBrandColorScale(
  variablePrefix: 'primary' | 'secondary',
  colorValue: string
): void {
  const runtimeScale = buildRuntimeScale(colorValue);
  const rgbColor = hexToRgb(colorValue);

  document.documentElement.style.setProperty(`--ds-color-${variablePrefix}`, runtimeScale[500]);

  if (rgbColor) {
    document.documentElement.style.setProperty(
      `--ds-color-${variablePrefix}-rgb`,
      `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
    );
    document.documentElement.style.setProperty(
      `--ds-color-alpha-${variablePrefix}-10`,
      `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.10)`
    );
    document.documentElement.style.setProperty(
      `--ds-color-alpha-${variablePrefix}-20`,
      `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.20)`
    );
  }

  COLOR_STEPS.forEach((step) => {
    const colorAtStep = runtimeScale[step];
    document.documentElement.style.setProperty(`--ds-color-${variablePrefix}-${step}`, colorAtStep);
  });

  if (variablePrefix === 'primary') {
    document.documentElement.style.setProperty('--ds-color-primary-hover', runtimeScale[600]);
    document.documentElement.style.setProperty('--ds-color-primary-subtle', runtimeScale[100]);
    document.documentElement.style.setProperty(
      '--ds-color-primary-foreground',
      getReadableForegroundColor(runtimeScale[500])
    );
    document.documentElement.style.setProperty('--ds-color-border-focus', runtimeScale[500]);
    document.documentElement.style.setProperty('--ds-color-link', runtimeScale[500]);
    document.documentElement.style.setProperty('--ds-color-link-hover', runtimeScale[600]);
  }
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

/**
 * IMPORTANT: Rottay is the base and fallback tenant.
 * If any other theme fails to load, Rottay is used.
 */
const DEFAULT_TENANT = 'rottay';
const THEME_LOAD_TIMEOUT = 5000; // 5 seconds max to load theme
const THEME_LINK_ID_PREFIX = 'tenant-theme-';

// Emergency Rottay tokens inline (if even Rottay CSS fails)
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

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: ReactNode;
  theme?: string;
  tenant?: string;
  branding?: TenantBranding;
  onError?: (error: Error, tenant: string) => void;
  onFallback?: (originalTenant: string) => void;
  cssBaseUrl?: string; // Base URL for tenant CSS files (e.g., '/themes' or 'https://cdn.example.com/themes')
  /**
   * When true, skips loading individual tenant CSS files.
   * Use this when importing the bundled CSS via @rottay/design-system/tokens/css
   * which includes all tenant styles using html[data-tenant='x'] selectors.
   */
  skipCssLoading?: boolean;
}

export function ThemeProvider({
  children,
  theme: initialTheme = 'base',
  tenant: initialTenant = DEFAULT_TENANT,
  branding,
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
   * Falls back to Rottay theme
   */
  const fallbackToRottay = useCallback(
    async (originalTenant: string, error: Error) => {
      warnInDev(`[ThemeProvider] Falling back to Rottay theme due to error:`, error);

      // Notify parent
      if (onFallback) {
        onFallback(originalTenant);
      }

      setIsFallback(true);
      setTenantState(DEFAULT_TENANT);

      try {
        // Try to load Rottay CSS
        await loadTenantCSS(DEFAULT_TENANT);

        setConfig({
          name: 'rottay',
          tenant: DEFAULT_TENANT,
          cssUrl: `${cssBaseUrl}/${DEFAULT_TENANT}.css`,
          isLoaded: true,
          isError: false,
          isFallback: true,
          variables: {},
        });
      } catch (rottayError) {
        // Even Rottay failed - inject emergency tokens
        errorInDev(
          '[ThemeProvider] Even Rottay theme failed to load. Using emergency inline tokens.',
          rottayError
        );
        injectEmergencyTokens();

        setConfig({
          name: 'rottay-emergency',
          tenant: DEFAULT_TENANT,
          cssUrl: 'inline',
          isLoaded: true,
          isError: true,
          isFallback: true,
          variables: {},
        });
      }
    },
    [cssBaseUrl, loadTenantCSS, injectEmergencyTokens, onFallback]
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

        // Fall back to Rottay if loading a non-Rottay tenant fails
        if (tenantName !== DEFAULT_TENANT) {
          await fallbackToRottay(tenantName, err);
        } else {
          // Rottay itself failed - inject emergency tokens
          injectEmergencyTokens();
          setConfig({
            name: 'rottay-emergency',
            tenant: DEFAULT_TENANT,
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
    [tenant, config, cssBaseUrl, loadTenantCSS, fallbackToRottay, injectEmergencyTokens, onError, skipCssLoading]
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

  // Apply branding colors as CSS variables
  useEffect(() => {
    // Runtime branding has to target the variable families the live DS
    // actually consumes. We separate semantic secondary from accent-specific
    // tokens so tenant config produces predictable output.
    if (branding?.primaryColor) {
      applyRuntimeBrandColorScale('primary', branding.primaryColor);
    }

    if (branding?.secondaryColor) {
      applyRuntimeBrandColorScale('secondary', branding.secondaryColor);
    }

    if (branding?.accentColor) {
      document.documentElement.style.setProperty('--ds-color-accent', branding.accentColor);
      document.documentElement.style.setProperty('--ds-color-accent-hover', branding.accentColor);
    }
  }, [branding]);

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

  // Memoize context value
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
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
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

// ThemeContext is already exported at line 52 via inline export
export type { ThemeConfig, ThemeContextValue } from '../contracts';
