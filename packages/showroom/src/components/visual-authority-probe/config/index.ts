import type { TenantConfig } from '@rottay/design-system';
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@rottay/design-system/server';

export const VISUAL_AUTHORITY_TENANTS = ['themanagement', 'bithire'] as const;
export type VisualAuthorityTenant = (typeof VISUAL_AUTHORITY_TENANTS)[number];

export const VISUAL_AUTHORITY_GROUNDS = ['light', 'dark'] as const;
export type VisualAuthorityGround = (typeof VISUAL_AUTHORITY_GROUNDS)[number];

export const THEMANAGEMENT_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_themanagement',
  slug: 'themanagement',
  verticalKey: 'bithire',
  rowVersion: 12,
};

export const THEMANAGEMENT_DOCUMENT = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#2F6B9A', accent: '#C8842B', backgroundMode: 'dark' },
      typography: { typePairing: 'sober', scale: 0.96 },
      shape: { buttonStyle: 'sharp', radiusScale: 0.85 },
      surfaces: { elevation: 'flat' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
      navigation: { sidebarTone: 'inverse' },
    },
    advanced: {
      chrome: {
        sidebar: { bg: '#101014', text: '#F4F4F5', anatomy: 'panel' },
        table: { headerBg: '#17171B', anatomy: 'ruled' },
        cardComponent: { radius: '8px', anatomy: 'framed' },
      },
      tokenOverrides: { '--ds-radius-md': '8px' },
    },
  },
} as unknown as TenantThemeDocument;

/** Each tenant's own background mode: what the probe paints when no `?ground` forces one. */
export const VISUAL_AUTHORITY_DEFAULT_GROUND: Record<VisualAuthorityTenant, VisualAuthorityGround> = {
  themanagement: 'dark',
  bithire: 'light',
};

/** A `TenantConfig` plus the retired `appearance` echo, stated as a type instead of an assertion. */
type LegacyAppearanceEchoConfig = TenantConfig & {
  readonly appearance: TenantThemeArtifact['normalizedAppearance'];
};

/**
 * Legacy input on purpose: the envelope a DB consumer still sends, echo included.
 * Delete the echo when no consumer sends it any more.
 */
export function dbTenantConfig(artifact: TenantThemeArtifact): TenantConfig {
  const envelope: LegacyAppearanceEchoConfig = {
    slug: artifact.slug,
    name: 'The Management',
    vertical: 'bithire',
    theme: artifact.normalizedAppearance.general?.palette?.backgroundMode ?? 'light',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: 'The Management' },
    appearance: artifact.normalizedAppearance,
  };
  return envelope;
}
