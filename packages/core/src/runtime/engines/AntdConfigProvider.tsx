'use client';

/**
 * @fileoverview AntdConfigProvider - Rottay Design System
 * @description Bridges the DS token/tenant graph into Ant Design's ConfigProvider
 * when the active engine is 'classic'. For non-classic engines this component
 * is a transparent passthrough (renders children only).
 *
 * @remarks
 * Key design decisions:
 * - **hashPriority: 'low'** makes antd CSS-in-JS emit `:where()` selectors,
 *   giving them 0 specificity so DS CSS layers always win.
 * - **Dark algorithm** is activated when the tenant's theme includes 'dark'
 *   (e.g. 'dark', 'dark-contrast').
 * - **Seed tokens** are mapped from the tenant's branding/semantic colors.
 *   When a tenant provides branding.primaryColor (or other branding fields),
 *   those values take precedence. Fallback values are read from the resolved
 *   CSS custom properties (--ds-color-*) so they automatically reflect the
 *   active tenant's CSS layer -- no hardcoded hex values.
 *
 * @see {@link useEngineContext} - Engine context hook
 * @see {@link useTenantContext} - Tenant context hook
 * @module System/Providers/AntdConfig
 * @category System
 * @package @rottay/design-system
 */

import React, { useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useEngineContext } from './EngineProvider';
import { useTenantContext } from '../tenant/context/TenantProvider';

/* ---------------------------------------------------------------------------
 * CSS variable -> antd seed token mapping
 *
 * Maps DS CSS custom properties to the antd seed tokens they correspond to.
 * The keys are antd token names, the values are DS CSS variable names.
 * These are read at runtime via getComputedStyle so they automatically reflect
 * the active tenant's CSS overrides.
 * ------------------------------------------------------------------------ */
const CSS_VAR_MAP = {
  colorPrimary: '--ds-color-primary',
  colorSuccess: '--ds-color-success',
  colorWarning: '--ds-color-warning',
  colorError: '--ds-color-error',
  colorInfo: '--ds-color-info',
  colorBgBase: '--ds-color-bg-primary',
  colorTextBase: '--ds-color-text-primary',
  colorLink: '--ds-color-primary',
  borderRadius: '--ds-radius-md',
} as const;

/**
 * Hardcoded fallback values used only during SSR or before the first paint
 * when getComputedStyle is unavailable. These match the DS default theme
 * (themes/default.css) and are replaced on hydration by the real CSS values.
 */
const SSR_DEFAULTS = {
  colorPrimary: '#F7F7F2',
  colorSuccess: '#31C48D',
  colorWarning: '#D6A04B',
  colorError: '#E06A6A',
  colorInfo: '#7E97AD',
  colorBgBase: '#0A0B0D',
  colorTextBase: '#F5F5F2',
  colorLink: '#F5F5F2',
  borderRadius: 10,
} as const;

/** Widened version of SSR_DEFAULTS: literal types relaxed to string/number. */
interface ResolvedDefaults {
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  colorBgBase: string;
  colorTextBase: string;
  colorLink: string;
  borderRadius: number;
}

/**
 * Reads resolved CSS custom property values from the document element.
 * Returns a defaults object that mirrors SSR_DEFAULTS but with tenant-specific
 * values from the live cascade.
 */
function readCssTokenDefaults(): ResolvedDefaults {
  if (typeof document === 'undefined') return SSR_DEFAULTS;

  const style = getComputedStyle(document.documentElement);

  function read(varName: string, fallback: string): string {
    const value = style.getPropertyValue(varName).trim();
    return value || fallback;
  }

  function readPx(varName: string, fallback: number): number {
    const value = style.getPropertyValue(varName).trim();
    if (!value) return fallback;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return {
    colorPrimary: read(CSS_VAR_MAP.colorPrimary, SSR_DEFAULTS.colorPrimary),
    colorSuccess: read(CSS_VAR_MAP.colorSuccess, SSR_DEFAULTS.colorSuccess),
    colorWarning: read(CSS_VAR_MAP.colorWarning, SSR_DEFAULTS.colorWarning),
    colorError: read(CSS_VAR_MAP.colorError, SSR_DEFAULTS.colorError),
    colorInfo: read(CSS_VAR_MAP.colorInfo, SSR_DEFAULTS.colorInfo),
    colorBgBase: read(CSS_VAR_MAP.colorBgBase, SSR_DEFAULTS.colorBgBase),
    colorTextBase: read(CSS_VAR_MAP.colorTextBase, SSR_DEFAULTS.colorTextBase),
    colorLink: read(CSS_VAR_MAP.colorLink, SSR_DEFAULTS.colorLink),
    borderRadius: readPx(CSS_VAR_MAP.borderRadius, SSR_DEFAULTS.borderRadius),
  };
}

export interface AntdConfigProviderProps {
  children: ReactNode;
}

export function AntdConfigProvider({
  children,
}: AntdConfigProviderProps): React.ReactElement {
  const { engine } = useEngineContext();
  const { config } = useTenantContext();

  // Read resolved CSS custom properties after mount. This bridges the gap
  // between the CSS variable-based token system and antd's requirement for
  // concrete hex values. The read happens once on mount and again whenever
  // the tenant slug changes (which triggers new CSS variable values).
  const [cssDefaults, setCssDefaults] = useState<ResolvedDefaults>(SSR_DEFAULTS);
  const prevSlugRef = useRef(config.slug);

  useEffect(() => {
    // Read on initial mount
    setCssDefaults(readCssTokenDefaults());
  }, []);

  useEffect(() => {
    // Re-read when the tenant changes (CSS variables update via tenant layer)
    if (prevSlugRef.current !== config.slug) {
      prevSlugRef.current = config.slug;
      // RAF ensures the new tenant CSS has been applied before we read
      requestAnimationFrame(() => {
        setCssDefaults(readCssTokenDefaults());
      });
    }
  }, [config.slug]);

  const antdThemeConfig = useMemo(() => {
    if (engine !== 'classic') return undefined;

    const { branding, theme: tenantTheme } = config;

    // Determine if the tenant is using a dark color scheme.
    const isDark =
      typeof tenantTheme === 'string' &&
      tenantTheme.toLowerCase().includes('dark');

    return {
      // :where() selectors -> 0 specificity -> DS CSS layers always win
      hashPriority: 'low' as const,
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: branding.primaryColor ?? cssDefaults.colorPrimary,
        colorSuccess: branding.successColor ?? cssDefaults.colorSuccess,
        colorWarning: branding.warningColor ?? cssDefaults.colorWarning,
        colorError: branding.errorColor ?? cssDefaults.colorError,
        colorInfo: branding.infoColor ?? cssDefaults.colorInfo,
        colorBgBase: (isDark ? branding.darkBackgroundColor : undefined) ?? cssDefaults.colorBgBase,
        colorTextBase: cssDefaults.colorTextBase,
        colorLink: cssDefaults.colorLink,
        borderRadius: cssDefaults.borderRadius,
      },
    };
  }, [engine, config, cssDefaults]);

  // Non-classic engines: transparent passthrough
  if (engine !== 'classic' || !antdThemeConfig) {
    return <>{children}</>;
  }

  return (
    <ConfigProvider theme={antdThemeConfig}>
      {children}
    </ConfigProvider>
  );
}
