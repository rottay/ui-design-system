/**
 * @fileoverview VerticalManifest — typed identity contract for each app.
 *
 * Every Rottay vertical app must define a manifest that declares its
 * visual identity, interaction posture, and composition preferences.
 * The DS reads this manifest to select defaults for shell, workspace,
 * dashboard, and page chrome behavior.
 *
 * The manifest is NOT about feature flags or domain logic.
 * It answers: "How should this app FEEL?"
 *
 * @example
 * ```ts
 * // src/vertical/manifest.ts
 * import type { VerticalManifest } from '@rottay/design-system';
 *
 * export const MANIFEST: VerticalManifest = {
 *   id: 'platform',
 *   name: 'Rotate',
 *   tone: 'control-room',
 *   shape: 'sharp',
 *   motion: 'precise',
 *   density: 'compact',
 *   shell: 'ops',
 *   workspace: 'operational',
 *   dashboard: 'signal-board',
 *   settings: 'admin-console',
 *   copy: 'technical',
 *   iconography: 'system-sharp',
 * };
 * ```
 */

// ---------------------------------------------------------------------------
// Core identity
// ---------------------------------------------------------------------------

export type VerticalId = 'platform' | 'evnto' | 'bithire';

/**
 * Registry key accepted by the vertical preset runtime.
 *
 * First-party keys stay discoverable while the open tail permits consumers to
 * register a product vertical without widening the design-system package.
 */
export type VerticalKey = VerticalId | (string & {});

/** Emotional tone of the product surface. */
export type VerticalTone = 'control-room' | 'editorial-network' | 'lively-venue';

// ---------------------------------------------------------------------------
// Visual profiles
// ---------------------------------------------------------------------------

/** Border radius posture. */
export type ShapeProfile = 'sharp' | 'balanced' | 'rounded';

/** Animation intensity and style. */
export type MotionProfile = 'precise' | 'calm' | 'expressive';

/** Information density. */
export type DensityProfile = 'compact' | 'comfortable' | 'airy';

// ---------------------------------------------------------------------------
// Composition modes (how each surface type is presented)
// ---------------------------------------------------------------------------

/** Shell posture: how the sidebar/header/chrome feel. */
export type ShellMode = 'ops' | 'professional' | 'hospitality';

/** How list/workspace screens are composed. */
export type WorkspaceMode = 'operational' | 'profile-first' | 'roster-live';

/** Dashboard composition strategy. */
export type DashboardMode = 'signal-board' | 'talent-intelligence' | 'event-pulse';

/** Settings/admin surface posture. */
export type SettingsMode = 'admin-console' | 'business-panel' | 'operator-panel';

/** Copy tone and language style. */
export type CopyMode = 'technical' | 'professional' | 'lively';

/** Icon style family. */
export type IconographyMode = 'system-sharp' | 'business-clean' | 'playful-rounded';

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

export interface VerticalManifest {
  /** Unique vertical identifier. */
  id: VerticalId;
  /** Display name of the product. */
  name: string;

  // Visual identity
  tone: VerticalTone;
  shape: ShapeProfile;
  motion: MotionProfile;
  density: DensityProfile;

  // Composition modes
  shell: ShellMode;
  workspace: WorkspaceMode;
  dashboard: DashboardMode;
  settings: SettingsMode;
  copy: CopyMode;
  iconography: IconographyMode;
}

// ---------------------------------------------------------------------------
// Feature route metadata (consumed by vertical recipes)
// ---------------------------------------------------------------------------

/** Declares the intent and kind of a feature route so vertical recipes can adapt. */
export interface FeatureRouteMeta {
  /** Navigation section this route belongs to. */
  section: string;
  /** Page intent determines the overall structure. */
  pageIntent: 'workspace' | 'detail' | 'dashboard' | 'settings' | 'auth' | 'form';
  /** Header composition style. */
  headerMode?: 'command' | 'editorial' | 'operator';
  /** Workspace data presentation kind. */
  workspaceKind?: 'table' | 'board' | 'profile-list' | 'calendar' | 'timeline';
  /** Empty state tone. */
  emptyStateKind?: 'technical' | 'professional' | 'lively';
}
