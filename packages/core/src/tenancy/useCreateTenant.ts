'use client';

/**
 * @fileoverview useCreateTenant hook for runtime tenant creation with CSS injection.
 * @description Allows creating, previewing, and activating tenant themes without
 * manual CSS file creation or registry updates. Designed for onboarding flows,
 * admin consoles, and tenant preview tooling.
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
 */

import { useCallback, useRef } from 'react';
import type { TenantConfig } from '../contracts';
import {
  createTenantConfig as createConfig,
  type TenantCreationConfig,
} from './create-tenant';
import {
  generateTenantCss as generateCss,
} from './storage/static/generator';

const STYLE_TAG_PREFIX = 'ds-tenant-css';

function getStyleTagId(slug: string): string {
  return `${STYLE_TAG_PREFIX}-${slug}`;
}

/**
 * Hook for runtime tenant creation with CSS injection.
 *
 * Returns:
 * - `createTenant` - Generates a complete TenantConfig from minimal input
 * - `injectTenantCss` - Injects the generated CSS into the document head
 * - `removeTenantCss` - Removes injected CSS for a given tenant slug
 *
 * This hook is intentionally app-facing. It is the bridge for onboarding flows,
 * tenant preview tooling, and admin consoles that need to materialize a tenant
 * before the platform persists it.
 */
export function useCreateTenant() {
  // Tracks which tenant slugs have been injected into the DOM so the hook
  // can clean up on re-injection and consumers can introspect active previews.
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

    // Replacing instead of appending keeps repeated previews deterministic.
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const css = generateCss(config, {
      includeDarkSelector: true,
      includeSystemDarkSelector: true,
    });

    // The data-tenant-css attribute allows DevTools inspection and automated
    // tests to locate tenant-specific style blocks in the document head.
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
