/**
 * @fileoverview Surface Storybook helpers -- decorators, tenant configs, and
 * locale fixtures used across all surface stories.
 */

import React, { type ReactNode } from 'react';
import type { Decorator } from '@storybook/react-vite';

import { DesignSystemProvider } from '../../../runtime/bootstrap';
import type { ProductProfileKey, TenantConfig } from '../../../contracts';
import type { LocaleTranslations, SupportedLocale } from '../../../i18n/types';

const BASE_STORY_TENANT: TenantConfig = {
  slug: 'story',
  name: 'Story Tenant',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Story Tenant',
    primaryColor: '#0a66c2',
    accentColor: '#14b8a6',
  },
};

export interface SurfaceStoryProviderProps {
  children: ReactNode;
  locale?: SupportedLocale;
  productProfile?: ProductProfileKey;
  engine?: TenantConfig['engine'];
  tenantOverrides?: Partial<TenantConfig>;
  customTranslations?: Partial<LocaleTranslations>;
}

export function SurfaceStoryProvider({
  children,
  locale = 'en',
  productProfile = 'generic.default',
  engine = 'rustic',
  tenantOverrides,
  customTranslations,
}: SurfaceStoryProviderProps): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={{
        ...BASE_STORY_TENANT,
        engine,
        locale,
      }}
      tenantOverrides={tenantOverrides}
      customTranslations={customTranslations}
      productProfile={productProfile}
      forceEngine={engine}
      skipCssLoading
    >
      <div style={{ padding: 24 }}>{children}</div>
    </DesignSystemProvider>
  );
}

export function createSurfaceStoryDecorator(options?: Omit<SurfaceStoryProviderProps, 'children'>): Decorator {
  return (Story) => (
    <SurfaceStoryProvider {...options}>
      <Story />
    </SurfaceStoryProvider>
  );
}

export function StoryViewport({
  label,
  width,
  children,
}: {
  label: string;
  width: number;
  children: ReactNode;
}): React.ReactElement {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ds-color-text-muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          width,
          maxWidth: '100%',
          border: '1px solid var(--ds-color-border-subtle)',
          borderRadius: 20,
          overflow: 'hidden',
          background: 'var(--ds-color-bg-canvas)',
          boxShadow: 'var(--ds-shadow-sm)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function createPosterDataUri(
  label: string,
  startColor = '#0a66c2',
  endColor = '#14b8a6'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" rx="40" fill="url(#g)" />
      <circle cx="170" cy="160" r="110" fill="rgba(255,255,255,0.14)" />
      <circle cx="980" cy="620" r="180" fill="rgba(255,255,255,0.1)" />
      <text x="80" y="680" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="white">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
