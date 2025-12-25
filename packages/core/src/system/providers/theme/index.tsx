/**
 * Theme Provider
 * Manages theme state and CSS variable injection with tenant CSS loading and Rottay fallback
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
import type { ThemeContextValue, ThemeConfig, TenantBranding } from '../../../types';

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
    --color-primary-500: #0066CC;
    --color-secondary-500: #6B6BD4;
    --color-background: #FFFFFF;
    --color-text-primary: #171717;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
}

export function ThemeProvider({
  children,
  theme: initialTheme = 'base',
  tenant: initialTenant = DEFAULT_TENANT,
  branding,
  onError,
  onFallback,
  cssBaseUrl = '/themes',
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState(initialTheme);
  const [tenant, setTenantState] = useState(initialTenant);
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [emergencyTokensInjected, setEmergencyTokensInjected] = useState(false);

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

      console.warn('[ThemeProvider] Emergency Rottay tokens injected as fallback');
    }
  }, [emergencyTokensInjected]);

  /**
   * Removes theme link element from DOM
   */
  const removeThemeLink = useCallback((tenantName: string) => {
    const linkId = `${THEME_LINK_ID_PREFIX}${tenantName}`;
    const existingLink = document.getElementById(linkId);
    if (existingLink) {
      existingLink.remove();
    }
  }, []);

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
          console.log(`[ThemeProvider] Theme "${tenantName}" already loaded`);
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
          console.log(`[ThemeProvider] Theme "${tenantName}" loaded successfully from ${cssUrl}`);
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
      console.warn(`[ThemeProvider] Falling back to Rottay theme due to error:`, error);

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
        console.error('[ThemeProvider] Even Rottay theme failed to load. Using emergency inline tokens.', rottayError);
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
        console.log(`[ThemeProvider] Tenant "${tenantName}" activated successfully`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`[ThemeProvider] Failed to load tenant "${tenantName}":`, err);

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
    [tenant, config, cssBaseUrl, loadTenantCSS, fallbackToRottay, injectEmergencyTokens, onError]
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
    if (branding?.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
    }
    if (branding?.accentColor) {
      document.documentElement.style.setProperty('--tenant-accent', branding.accentColor);
    }
  }, [branding]);

  // Load initial tenant on mount
  useEffect(() => {
    loadTenant(initialTenant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export { ThemeContext };
export type { ThemeConfig, ThemeContextValue } from '../../../types';
