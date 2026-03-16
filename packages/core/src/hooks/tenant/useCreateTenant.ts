'use client';

/**
 * @fileoverview useCreateTenant Hook - Rottay Design System
 * @description React hook for runtime tenant creation with CSS injection.
 * Allows creating, previewing, and activating tenant themes without
 * manual CSS file creation or registry updates.
 *
 * @example
 * ```tsx
 * function TenantOnboarding() {
 *   const { createTenant, injectTenantCss, removeTenantCss } = useCreateTenant();
 *
 *   const handleCreate = () => {
 *     const config = createTenant({
 *       slug: 'acme',
 *       name: 'ACME Corp',
 *       primaryColor: '#3B82F6',
 *       personality: 'formal',
 *     });
 *     injectTenantCss(config);
 *   };
 *
 *   return <button onClick={handleCreate}>Create Tenant</button>;
 * }
 * ```
 *
 * @module System/Hooks/Tenant/UseCreateTenant
 * @category System
 * @package @rottay/design-system
 */

import { useCallback, useRef } from 'react';
import type { TenantConfig } from '../../contracts';
import {
  createTenantConfig as createConfig,
  type TenantCreationConfig,
} from './create-tenant';
import {
  generateTenantCss as generateCss,
} from '../../tenancy/storage/static/generator';

const STYLE_TAG_PREFIX = 'ds-tenant-css';

function getStyleTagId(slug: string): string {
  return `${STYLE_TAG_PREFIX}-${slug}`;
}

/**
 * Hook for runtime tenant creation with CSS injection.
 *
 * Provides three functions:
 * - `createTenant` - Generates a complete `TenantConfig` from minimal input
 * - `injectTenantCss` - Injects the generated CSS into the `<head>` as a `<style>` tag
 * - `removeTenantCss` - Removes the injected `<style>` for a given tenant slug
 *
 * All DOM operations are SSR-safe (guarded by `typeof document` check).
 *
 * @returns Object with `createTenant`, `injectTenantCss`, and `removeTenantCss`
 */
export function useCreateTenant() {
  // Tracks which tenant slugs currently have injected style tags so we can
  // avoid duplicate injection and properly clean up on removal.
  const injectedSlugs = useRef<Set<string>>(new Set());

  const createTenant = useCallback(
    (config: TenantCreationConfig): TenantConfig => {
      return createConfig(config);
    },
    []
  );

  const injectTenantCss = useCallback((config: TenantConfig): void => {
    if (typeof document === 'undefined') {
      return;
    }

    const id = getStyleTagId(config.slug);

    // Remove existing style tag for this tenant if present
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const css = generateCss(config, {
      includeDarkSelector: true,
      includeSystemDarkSelector: true,
    });

    const style = document.createElement('style');
    style.id = id;
    style.setAttribute('data-tenant-css', config.slug);
    style.textContent = css;
    document.head.appendChild(style);

    injectedSlugs.current.add(config.slug);
  }, []);

  const removeTenantCss = useCallback((slug: string): void => {
    if (typeof document === 'undefined') {
      return;
    }

    const id = getStyleTagId(slug);
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    injectedSlugs.current.delete(slug);
  }, []);

  return {
    createTenant,
    injectTenantCss,
    removeTenantCss,
  };
}
