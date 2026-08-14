/**
 * @fileoverview ThemeProvider for the design system.
 * @description Manages theme and tenant context plus the root theme-mode claim.
 *
 * @remarks
 * The ThemeProvider is responsible for:
 * - **Theme Variants**: Supports light, dark, and custom theme variants
 * - **Context State**: Exposes the active tenant slug without painting it
 *
 * It is explicitly NOT responsible for tenant paint. It collects no branding,
 * compiles nothing, and writes no visual CSS variable. A tenant's visual
 * channels come from a compiled artifact and from nowhere else.
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
 * @see {@link useThemeContext} - Hook to access theme context
 * @see {@link ThemeConfig} - Theme configuration structure
 * @module System/Providers/Theme
 * @category System
 * @package @rottay/design-system
 */

'use client';

import {
  claimRootAttribute,
  composeRootAttributeReleases,
  type ReleaseRootAttribute,
} from '@/infrastructure/runtime/foundation/root-attributes/registry';
import {
  claimRootClass,
  claimRootStyleProperty,
} from '@/infrastructure/runtime/foundation/root-attributes/presentation';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { ThemeContextValue, ThemeConfig } from '../../../../../../foundation/contracts';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

/**
 * Context-only default tenant slug. It never selects or loads visual CSS.
 */
const DEFAULT_TENANT = 'rottay';


// ─────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────

// WHY `null` default: same pattern as FeatureContext -- lets consumer hooks
// distinguish "no provider" from "provider with default state" and throw a
// helpful error message.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Visual authority is resolved before this provider mounts. The re-export is
 * retained as a contract type; ThemeProvider itself owns no visual emitter.
 */
export type { VisualAuthority } from '@/infrastructure/runtime/theming/foundation/visual-authority';

// ─────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────

/**
 * Props for the {@link ThemeProvider} component.
 *
 * The provider manages two orthogonal axes of styling:
 * - **Tenant** (which identity): exposes the current tenant slug to consumers.
 * - **Theme** (which variant): determines light/dark/auto via `data-theme` attribute.
 *
 * Both can change at runtime via `setTenant` / `setTheme` on the context value.
 */
export interface ThemeProviderProps {
  /** React subtree that gains access to the theme context. */
  children: ReactNode;
  /** Initial theme variant. Defaults to `'base'`. Supports `'light'`, `'dark'`, `'auto'`. */
  theme?: string;
  /** Initial tenant slug. Defaults to {@link DEFAULT_TENANT}. */
  tenant?: string;
  /**
   * Deprecated compatibility input. ThemeProvider does not resolve visuals.
   */
  vertical?: string;
  /** Deprecated compatibility callback; ThemeProvider performs no loading. */
  onError?: (error: Error, tenant: string) => void;
  /** Deprecated compatibility callback; ThemeProvider performs no fallback. */
  onFallback?: (originalTenant: string) => void;
  /** Deprecated compatibility input; ThemeProvider creates no link element. */
  cssBaseUrl?: string;
  /**
   * Deprecated compatibility input. Loading is always absent.
   */
  skipCssLoading?: boolean;
}

export function ThemeProvider({
  children,
  theme: initialTheme = 'base',
  tenant: initialTenant = DEFAULT_TENANT,
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState(initialTheme);
  const [tenant, setTenantState] = useState(initialTenant);
  const config = useMemo<ThemeConfig>(() => ({
    name: tenant,
    tenant,
    isLoaded: true,
    isError: false,
    isFallback: false,
    variables: {},
  }), [tenant]);

  useIsomorphicLayoutEffect(() => {
    setThemeState(initialTheme);
  }, [initialTheme]);

  useIsomorphicLayoutEffect(() => {
    setTenantState((current) => (current === initialTenant ? current : initialTenant));
  }, [initialTenant]);

  /**
   * Public API to change tenant
   */
  const setTenant = useCallback((newTenant: string) => {
    setTenantState(newTenant);
  }, []);

  /**
   * Public API to change theme variant (e.g., 'base', 'dark', 'light')
   */
  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
  }, []);

  // NO VISUAL PAINT HERE. This provider owns theme/tenant CONTEXT and the
  // root `data-theme` / `color-scheme` state, and nothing else. Tenant visual
  // channels reach the document through exactly one of the two ingress paths:
  //
  //   first-party static -> compileBrandTheme -> renderFirstPartyArtifact
  //   tenant/DB          -> TenantThemeDocument -> compileTenantThemeConfig
  //
  // Both terminate in a compiled artifact that the application (or its SSR
  // layer) mounts. A provider that ALSO wrote branding scales, token
  // overrides, appearance variables and generated chrome inline on <html> was
  // a second author for every one of those channels, at the highest
  // precedence CSS offers, with no way for the artifact to win. It is gone —
  // not gated, not suppressed behind a flag, gone — so there is exactly one
  // thing that can paint a tenant and it is the artifact.

  /**
   * Theme state needs to materialize into DOM attributes because the CSS token
   * layer resolves variants through selectors, not through React context alone.
   * Without this sync, calling `setTheme('dark')` changes state but not the
   * actual variables the UI consumes.
   */
  useIsomorphicLayoutEffect(() => {
    const rootElement = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (): 'dark' | 'light' | 'base' => {
      if (theme === 'auto') {
        return mediaQuery.matches ? 'dark' : 'light';
      }

      return theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'base';
    };

    // Claims replace bare writes so cleanup can restore the SSR stamp instead
    // of deleting it. Re-applying (an `auto` media change) releases the prior
    // claim first, so exactly one claim is outstanding per attribute.
    let release: ReleaseRootAttribute | null = null;

    const applyThemeToDom = () => {
      const nextResolvedTheme = resolveTheme();

      release?.();

      // `color-scheme` is emitted by the brand compiler into each artifact's
      // base block, and an inline claim outranks every stylesheet. Claiming
      // `light` for the 'base' state would therefore override a dark-by-default
      // vertical's own scheme, so only an explicit mode claims inline — 'base'
      // means "the vertical's default mode" and leaves the channel to the
      // stylesheet that declares it. A DB tenant, whose theme resolves to
      // light/dark (directly or through `auto`), keeps the inline claim because
      // the DB compiler emits no `color-scheme` of its own.
      const claims: ReleaseRootAttribute[] = [
        claimRootAttribute(rootElement, 'data-theme', nextResolvedTheme),
        claimRootClass(rootElement, 'dark', nextResolvedTheme === 'dark'),
      ];
      if (nextResolvedTheme !== 'base') {
        claims.push(claimRootStyleProperty(rootElement, 'color-scheme', nextResolvedTheme));
      }
      release = composeRootAttributeReleases(claims);

      // Dev-only: verbose for debugging tenant/theme issues
      if (process.env.NODE_ENV === 'development') {
        const cs = getComputedStyle(rootElement);
        console.log('[DS:Theme] applied', {
          resolvedTheme: nextResolvedTheme,
          tenant,
          dataTenant: rootElement.getAttribute('data-tenant'),
          dataTheme: rootElement.getAttribute('data-theme'),
          dataEngine: rootElement.getAttribute('data-engine'),
          bgPrimary: cs.getPropertyValue('--ds-color-bg-primary').trim(),
          border: cs.getPropertyValue('--ds-color-border').trim(),
          borderSubtle: cs.getPropertyValue('--ds-color-border-subtle').trim(),
          textPrimary: cs.getPropertyValue('--ds-color-text-primary').trim(),
          surfaceCard: cs.getPropertyValue('--ds-surface-card').trim(),
        });
      }
    };

    applyThemeToDom();

    if (theme !== 'auto') {
      return () => {
        release?.();
      };
    }

    const handleMediaChange = () => {
      applyThemeToDom();
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      release?.();
    };
  }, [theme]);

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
      isLoading: false,
      isFallback: false,
    }),
    [theme, setTheme, config, tenant, setTenant]
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
export type { ThemeConfig, ThemeContextValue } from '../../../../../../foundation/contracts';
