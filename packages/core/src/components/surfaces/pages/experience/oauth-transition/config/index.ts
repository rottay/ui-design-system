import type {
  OAuthProvider,
  OAuthTransitionAppDefinition,
  OAuthTransitionAppId,
  OAuthTransitionProviderDefinition,
  OAuthTransitionVariantDefinition,
  OAuthTransitionVariantId,
} from '../types';

export const OAUTH_TRANSITION_APPS: Record<OAuthTransitionAppId, OAuthTransitionAppDefinition> = {
  bithire: {
    id: 'bithire',
    name: 'Bithire',
    mark: 'B',
    label: 'Hiring vertical',
    routeLabel: 'Default light transition',
  },
  evnto: {
    id: 'evnto',
    name: 'Evnto',
    mark: 'E',
    label: 'Events vertical',
    routeLabel: 'Default dark transition',
  },
  platform: {
    id: 'platform',
    name: 'Rottay Platform',
    mark: 'R',
    label: 'Platform vertical',
    routeLabel: 'Default dark transition',
  },
  auth: {
    id: 'auth',
    name: 'Rottay Auth',
    mark: 'R',
    label: 'Identity vertical',
    routeLabel: 'Default dark transition',
  },
};

export const OAUTH_TRANSITION_PROVIDERS: Record<OAuthProvider, OAuthTransitionProviderDefinition> = {
  google: {
    id: 'google',
    name: 'Google',
    badge: 'Sign-in provider',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    badge: 'Sign-in provider',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'Sign-in provider',
  },
  'azure-ad': {
    id: 'azure-ad',
    name: 'Azure AD',
    badge: 'Sign-in provider',
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    badge: 'Sign-in provider',
  },
};

export const OAUTH_TRANSITION_VARIANTS: Record<OAuthTransitionVariantId, OAuthTransitionVariantDefinition> = {
  'quiet-beam-light': {
    id: 'quiet-beam-light',
    name: 'Quiet Beam / Light',
    family: 'quiet-beam',
    tone: 'light',
    badge: 'Saved light direction',
    note: 'Warm beige surface with a calmer guided beam. This stays in production for Bithire.',
    palette: {
      bg: '#ece6dc',
      bgAlt: '#f8f4ec',
      panel: 'rgba(255, 252, 245, 0.92)',
      panelSoft: 'rgba(255, 255, 255, 0.68)',
      ink: '#12100d',
      muted: 'rgba(18, 16, 13, 0.58)',
      line: 'rgba(18, 16, 13, 0.1)',
      lineStrong: 'rgba(18, 16, 13, 0.22)',
      glow: 'rgba(255, 255, 255, 0.9)',
      glowSoft: 'rgba(255, 255, 255, 0.54)',
      accent: '#181612',
      accentSoft: 'rgba(24, 22, 18, 0.16)',
      shadow: '0 40px 90px rgba(28, 24, 18, 0.18)',
    },
  },
  'watchtower-sweep-dark': {
    id: 'watchtower-sweep-dark',
    name: 'Watchtower Sweep / Dark',
    family: 'watchtower-sweep',
    tone: 'dark',
    badge: 'Saved dark direction',
    note: 'Cinematic dark surface with a radar-like sweep. This stays in production for the dark apps.',
    palette: {
      bg: '#040404',
      bgAlt: '#11110f',
      panel: 'rgba(15, 15, 14, 0.84)',
      panelSoft: 'rgba(255, 255, 255, 0.04)',
      ink: '#f4efe8',
      muted: 'rgba(244, 239, 232, 0.58)',
      line: 'rgba(244, 239, 232, 0.09)',
      lineStrong: 'rgba(244, 239, 232, 0.24)',
      glow: 'rgba(255, 255, 255, 0.15)',
      glowSoft: 'rgba(255, 255, 255, 0.07)',
      accent: '#f4efe8',
      accentSoft: 'rgba(244, 239, 232, 0.16)',
      shadow: '0 40px 100px rgba(0, 0, 0, 0.58)',
    },
  },
  'signal-line-light': {
    id: 'signal-line-light',
    name: 'Signal Line / Light',
    family: 'signal-line',
    tone: 'light',
    badge: 'New minimal direction',
    note: 'A minimal straight-through route with hard motion and very little chrome.',
    palette: {
      bg: '#f1ece3',
      bgAlt: '#fbf7f1',
      panel: 'rgba(255, 253, 248, 0.72)',
      panelSoft: 'rgba(255, 255, 255, 0.42)',
      ink: '#12110f',
      muted: 'rgba(18, 17, 15, 0.52)',
      line: 'rgba(18, 17, 15, 0.1)',
      lineStrong: 'rgba(18, 17, 15, 0.22)',
      glow: 'rgba(255, 255, 255, 0.92)',
      glowSoft: 'rgba(255, 255, 255, 0.66)',
      accent: '#1d1a16',
      accentSoft: 'rgba(29, 26, 22, 0.14)',
      shadow: '0 36px 88px rgba(30, 24, 18, 0.14)',
    },
  },
  'signal-line-dark': {
    id: 'signal-line-dark',
    name: 'Signal Line / Dark',
    family: 'signal-line',
    tone: 'dark',
    badge: 'New minimal direction',
    note: 'A spare dark route with a live tracer, strong contrast, and almost no surface.',
    palette: {
      bg: '#040507',
      bgAlt: '#0e1014',
      panel: 'rgba(10, 11, 14, 0.74)',
      panelSoft: 'rgba(255, 255, 255, 0.03)',
      ink: '#f5f1eb',
      muted: 'rgba(245, 241, 235, 0.56)',
      line: 'rgba(245, 241, 235, 0.09)',
      lineStrong: 'rgba(245, 241, 235, 0.26)',
      glow: 'rgba(255, 255, 255, 0.15)',
      glowSoft: 'rgba(255, 255, 255, 0.08)',
      accent: '#f5f1eb',
      accentSoft: 'rgba(245, 241, 235, 0.16)',
      shadow: '0 42px 100px rgba(0, 0, 0, 0.62)',
    },
  },
  'halo-orbit-light': {
    id: 'halo-orbit-light',
    name: 'Halo Stack / Light',
    family: 'halo-orbit',
    tone: 'light',
    badge: 'New minimal direction',
    note: 'A layered portal stack with a moving scan band and a steadier premium feel.',
    palette: {
      bg: '#f5f1e8',
      bgAlt: '#fcfaf5',
      panel: 'rgba(255, 255, 255, 0.58)',
      panelSoft: 'rgba(255, 255, 255, 0.3)',
      ink: '#13110e',
      muted: 'rgba(19, 17, 14, 0.54)',
      line: 'rgba(19, 17, 14, 0.11)',
      lineStrong: 'rgba(19, 17, 14, 0.24)',
      glow: 'rgba(255, 255, 255, 0.94)',
      glowSoft: 'rgba(255, 255, 255, 0.72)',
      accent: '#171512',
      accentSoft: 'rgba(23, 21, 18, 0.14)',
      shadow: '0 34px 82px rgba(29, 25, 20, 0.12)',
    },
  },
  'halo-orbit-dark': {
    id: 'halo-orbit-dark',
    name: 'Halo Stack / Dark',
    family: 'halo-orbit',
    tone: 'dark',
    badge: 'New minimal direction',
    note: 'A dark portal stack with moving scan light and a slower, more premium rhythm.',
    palette: {
      bg: '#030405',
      bgAlt: '#0c0f12',
      panel: 'rgba(10, 12, 14, 0.62)',
      panelSoft: 'rgba(255, 255, 255, 0.03)',
      ink: '#f3efe8',
      muted: 'rgba(243, 239, 232, 0.56)',
      line: 'rgba(243, 239, 232, 0.1)',
      lineStrong: 'rgba(243, 239, 232, 0.25)',
      glow: 'rgba(255, 255, 255, 0.16)',
      glowSoft: 'rgba(255, 255, 255, 0.08)',
      accent: '#f3efe8',
      accentSoft: 'rgba(243, 239, 232, 0.16)',
      shadow: '0 44px 104px rgba(0, 0, 0, 0.6)',
    },
  },
};

export const OAUTH_TRANSITION_POOLS: Record<OAuthTransitionAppId, OAuthTransitionVariantId[]> = {
  bithire: ['quiet-beam-light', 'signal-line-light', 'halo-orbit-light'],
  evnto: ['watchtower-sweep-dark', 'signal-line-dark', 'halo-orbit-dark'],
  platform: ['watchtower-sweep-dark', 'signal-line-dark', 'halo-orbit-dark'],
  auth: ['watchtower-sweep-dark', 'signal-line-dark', 'halo-orbit-dark'],
};

export const OAUTH_TRANSITION_DEFAULT_VARIANTS: Record<OAuthTransitionAppId, OAuthTransitionVariantId> = {
  bithire: 'quiet-beam-light',
  evnto: 'watchtower-sweep-dark',
  platform: 'watchtower-sweep-dark',
  auth: 'watchtower-sweep-dark',
};

export const OAUTH_TRANSITION_VARIANT_ORDER: OAuthTransitionVariantId[] = [
  'quiet-beam-light',
  'watchtower-sweep-dark',
  'signal-line-light',
  'signal-line-dark',
  'halo-orbit-light',
  'halo-orbit-dark',
];

export function getOAuthTransitionApp(appId: OAuthTransitionAppId): OAuthTransitionAppDefinition {
  return OAUTH_TRANSITION_APPS[appId];
}

export function getOAuthTransitionProvider(provider: OAuthProvider): OAuthTransitionProviderDefinition {
  return OAUTH_TRANSITION_PROVIDERS[provider];
}

export function getOAuthTransitionVariant(variantId: OAuthTransitionVariantId): OAuthTransitionVariantDefinition {
  return OAUTH_TRANSITION_VARIANTS[variantId];
}

export function isOAuthTransitionVariantId(value: string | null | undefined): value is OAuthTransitionVariantId {
  if (!value) return false;
  return value in OAUTH_TRANSITION_VARIANTS;
}

export function getOAuthTransitionPool(appId: OAuthTransitionAppId): OAuthTransitionVariantId[] {
  return OAUTH_TRANSITION_POOLS[appId];
}

export function getOAuthTransitionDefaultVariant(appId: OAuthTransitionAppId): OAuthTransitionVariantId {
  return OAUTH_TRANSITION_DEFAULT_VARIANTS[appId];
}

export function pickOAuthTransitionVariant(
  appId: OAuthTransitionAppId,
  excludeId?: OAuthTransitionVariantId,
): OAuthTransitionVariantId {
  const pool = getOAuthTransitionPool(appId);
  const filtered = excludeId && pool.length > 1 ? pool.filter(id => id !== excludeId) : pool;
  const source = filtered.length ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function isOAuthProvider(value: string | null | undefined): value is OAuthProvider {
  if (!value) return false;
  return value in OAUTH_TRANSITION_PROVIDERS;
}
