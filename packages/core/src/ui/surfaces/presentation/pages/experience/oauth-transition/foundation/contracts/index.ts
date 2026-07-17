/**
 * @fileoverview OAuth transition screen types.
 *
 * OAuthProvider is defined here (not imported from @rottay/auth-client) so the
 * design system stays independent of the auth package.
 */

export type OAuthProvider = 'google' | 'github' | 'linkedin' | 'azure-ad' | 'microsoft';

export type OAuthTransitionTone = 'light' | 'dark';
export type OAuthTransitionPhase = 'redirect' | 'return';
export type OAuthTransitionState = 'idle' | 'exiting';

export type OAuthTransitionVariantId =
  | 'quiet-beam-light'
  | 'watchtower-sweep-dark'
  | 'signal-line-light'
  | 'signal-line-dark'
  | 'halo-orbit-light'
  | 'halo-orbit-dark';

export type OAuthTransitionFamily = 'quiet-beam' | 'watchtower-sweep' | 'signal-line' | 'halo-orbit';

export type OAuthTransitionAppId = 'bithire' | 'evnto' | 'platform' | 'auth';

export interface OAuthTransitionPalette {
  bg: string;
  bgAlt: string;
  panel: string;
  panelSoft: string;
  ink: string;
  muted: string;
  line: string;
  lineStrong: string;
  glow: string;
  glowSoft: string;
  accent: string;
  accentSoft: string;
  shadow: string;
}

export interface OAuthTransitionVariantDefinition {
  id: OAuthTransitionVariantId;
  name: string;
  family: OAuthTransitionFamily;
  tone: OAuthTransitionTone;
  badge: string;
  note: string;
  palette: OAuthTransitionPalette;
}

export interface OAuthTransitionAppDefinition {
  id: OAuthTransitionAppId;
  name: string;
  mark: string;
  label: string;
  routeLabel: string;
}

export interface OAuthTransitionProviderDefinition {
  id: OAuthProvider;
  name: string;
  badge: string;
}

export interface OAuthTransitionScreenProps {
  appId: OAuthTransitionAppId;
  provider: OAuthProvider;
  variantId: OAuthTransitionVariantId;
  appName?: string;
  appLabel?: string;
  phase?: OAuthTransitionPhase;
  statusLabel?: string;
  stepLabels?: string[];
  activeStep?: number;
  transitionState?: OAuthTransitionState;
  compact?: boolean;
  showPoweredBy?: boolean;
  rottayUrl?: string;
}
