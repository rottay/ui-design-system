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
 *   id: 'rottay',
 *   name: 'Rottay',
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

/**
 * The three code-owned vertical identities.
 *
 * This union is the LOWEST statement of the fact. It lives in `contracts`
 * rather than beside the roster because contracts is the bottom of the local
 * dependency order: tokens, infrastructure, tooling and scripts may all read
 * down to it, and nothing here may read back up. Putting the union next to the
 * roster would force every consumer of the mere TYPE to depend on the token
 * tree that carries the themes, palettes and font packs.
 *
 * The tuple is also the canonical runtime order for coverage arrays, bundle
 * manifests and artifact digests. Keeping it in this dependency-floor module
 * lets runtimes consume identity without retaining authored theme objects.
 *
 * There is no `platform` member and no alias for one. `platform` was never a
 * fourth product; it was a second spelling of `rottay` that let the theme
 * folder, the artifact directory and the registry key disagree with each
 * other. An app still stamping `platform` is an external caller to cut over,
 * not a case for a compatibility member here.
 */
export const FIRST_PARTY_VERTICAL_SLUGS = Object.freeze([
  'rottay',
  'bithire',
  'evnto',
] as const);

export type FirstPartyVerticalId = (typeof FIRST_PARTY_VERTICAL_SLUGS)[number];

/**
 * A code-owned vertical. Equal to `FirstPartyVerticalId` by construction —
 * the alias exists so the many call sites that read "which vertical is this"
 * keep their familiar name while there remains exactly ONE union behind it.
 */
export type VerticalId = FirstPartyVerticalId;

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
