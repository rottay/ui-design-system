/**
 * @fileoverview Tenant capability registry — the typed manifest of every
 * white-label axis, partitioned into access tiers.
 *
 * One architecture, four access surfaces: internal vertical authoring
 * (BrandTheme, full depth), tenant STANDARD (few high-impact dials), tenant
 * PRO (bounded advanced surface), and app customization (public hooks and
 * `--rt-*`, governed elsewhere by the hooks manifest). Every capability here
 * compiles through the SAME two emitters into the same channel canon — the
 * registry declares access, it never adds a second theme system.
 *
 * Laws:
 * - an ACTIVE tenant-scoped capability must be expressible by BOTH paths
 *   (its `documentPath` accepted by the TenantThemeDocument schema and its
 *   `brandThemePath` by the BrandTheme contract); the reachability test in
 *   `infrastructure/compilers/composition/tenant-theme/tests` compiles a
 *   document exercising every one of them;
 * - a FRONTIER capability is a declared contract boundary that the schema
 *   must still REJECT: it documents where the surface grows next without
 *   pretending it exists;
 * - foundation authorities (`FOUNDATION_AUTHORITIES`) are deliberately NOT
 *   tenant capabilities: tenants move seeds; derivations follow.
 */

export type CapabilityTier = 'standard' | 'pro' | 'internal';
export type CapabilityStatus = 'active' | 'frontier';
export type CapabilityValueType =
  | 'color'
  | 'color-set'
  | 'enum'
  | 'scale'
  | 'font-stack'
  | 'token-map'
  | 'profile-id'
  | 'chrome-map';

export interface TenantCapabilityDeclaration {
  /** Stable dot-namespaced identifier; never recycled. */
  readonly id: string;
  readonly version: 1;
  readonly tier: CapabilityTier;
  readonly status: CapabilityStatus;
  readonly scope: 'tenant' | 'vertical';
  readonly owner: 'design-system';
  readonly title: string;
  readonly valueType: CapabilityValueType;
  readonly enumValues?: readonly string[];
  /** Clamped numeric range where the value type is a scale. */
  readonly bounds?: { readonly min: number; readonly max: number };
  /** What an absent value means (the rollback story is always "unset it"). */
  readonly defaultBehavior: string;
  /** Path inside the resolved TenantThemeDocument (DB authoring surface). */
  readonly documentPath: string;
  /** Path inside BrandTheme (static vertical authoring surface). */
  readonly brandThemePath: string;
  /** Representative derived channels, never an exhaustive list. */
  readonly derivedChannels: readonly string[];
  /** Representative provider-owned root attributes, for non-CSS outputs. */
  readonly derivedRootAttributes?: readonly string[];
  readonly dependsOn?: readonly string[];
  /**
   * Compatibility posture: how the capability retires or migrates. Every
   * entry must state one; "additive, unset-to-rollback" is the norm.
   */
  readonly compat: string;
  /**
   * D0 productive-consumer proof: a PRODUCTION file (never a test) that
   * consumes this capability's output, plus a literal the census gate
   * verifies inside it. Required for every `active` row — a capability
   * without a productive consumer is frontier by definition.
   */
  readonly evidence?: {
    readonly consumer: string;
    readonly symbol: string;
  };
}

export const TENANT_CAPABILITY_REGISTRY = Object.freeze([
    // ── STANDARD: few dials, large surface ─────────────────────────────────
    {
      id: 'palette.seeds',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/button.css',
        symbol: 'var(--ds-button-primary-bg',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Brand palette seeds',
      valueType: 'color-set',
      defaultBehavior: 'vertical baseline palette',
      documentPath: 'appearance.general.palette.{primary,secondary,accent,background}',
      brandThemePath: 'palette.{primaryColor,secondaryColor,accentColor,backgroundColor}',
      derivedChannels: [
        '--ds-color-primary',
        '--ds-color-primary-500',
        '--ds-button-primary-bg',
        '--ds-chart-series-1',
        '--ds-color-text-on-primary',
      ],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'palette.dark-mode',
      version: 1,
      tier: 'internal',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/foundation/themes/default.css',
        symbol: 'data-theme=\'dark\'',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Mode compatibility',
      valueType: 'color-set',
      enumValues: ['light', 'dark', 'auto'],
      defaultBehavior:
        'the tenant palette remains authoritative; optional mode data stays an internal compatibility surface',
      documentPath: 'appearance.general.palette.{backgroundMode,dark.*}',
      brandThemePath: 'modes.dark.palette.*',
      derivedChannels: ['--ds-color-scheme', '--ds-color-primary-500'],
      compat:
        'compatibility-only; not rendered in Standard or Pro tenant editors unless product explicitly enables a mode feature',
    },
    {
      id: 'typography.pairing',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/typography.css',
        symbol: 'var(--ds-font-family',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Type pairing personality',
      valueType: 'enum',
      enumValues: ['sober', 'editorial', 'geometric', 'technical'],
      defaultBehavior: 'vertical baseline families',
      documentPath: 'appearance.general.typography.typePairing',
      brandThemePath: 'typography.{fontFamilyBase,fontFamilyHeading}',
      derivedChannels: ['--ds-font-family-base', '--ds-font-family-heading'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'typography.families',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/foundation/themes/default.css',
        symbol: '--ds-font-family-mono',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Explicit font stacks',
      valueType: 'font-stack',
      defaultBehavior: 'pairing (or vertical baseline) decides',
      documentPath: 'appearance.general.typography.{fontFamilyBase,fontFamilyHeading}',
      brandThemePath: 'typography.{fontFamilyBase,fontFamilyHeading,fontFamilyMono,fontFamilyDisplay}',
      derivedChannels: ['--ds-font-family-base', '--ds-font-family-heading'],
      compat: 'additive; Arabic-safe tail is a compiler invariant either way',
    },
    {
      id: 'typography.scale',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/ui/patterns/data/widget-board/runtime/solver/react/index.ts',
        symbol: '--ds-type-scale',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Type scale dial',
      valueType: 'scale',
      bounds: { min: 0.9, max: 1.1 },
      defaultBehavior: '1 (vertical envelope may clamp tighter)',
      documentPath: 'appearance.general.typography.scale',
      brandThemePath: 'typography (ramp channels)',
      derivedChannels: ['--ds-type-scale'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'shape.radius-scale',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card.css',
        symbol: 'var(--ds-radius',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Radius scale dial',
      valueType: 'scale',
      bounds: { min: 0.75, max: 1.25 },
      defaultBehavior: '1 (vertical envelope may clamp tighter)',
      documentPath: 'appearance.general.shape.radiusScale',
      brandThemePath: 'surfaces.borderRadius.*',
      derivedChannels: ['--ds-radius-scale', '--ds-radius-md'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'shape.button-style',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/button.css',
        symbol: 'var(--ds-button-md-radius',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Button silhouette',
      valueType: 'enum',
      enumValues: ['sharp', 'soft', 'pill'],
      defaultBehavior: 'vertical baseline silhouette',
      documentPath: 'appearance.general.shape.buttonStyle',
      brandThemePath: 'chrome.controls.button* (radius channels)',
      derivedChannels: ['--ds-radius-button'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'density.mode',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/ui/patterns/data/widget-board/runtime/solver/react/index.ts',
        symbol: 'useDensity',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Density posture',
      valueType: 'enum',
      enumValues: ['compact', 'normal', 'spacious'],
      defaultBehavior: 'normal (structural density scale is a separate channel)',
      documentPath: 'appearance.general.density',
      brandThemePath: 'surfaces.density / surfaces.densityScale',
      derivedChannels: ['--ds-density-mode-factor', '--ds-density-scale'],
      compat:
        'additive; the three density vocabularies (contracts/tokens/schema) are recorded debt — unification is a breaking alignment owned by a future wave',
    },
    {
      id: 'spacing.rhythm',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer:
          'src/foundation/tokens/css/presentation/components/skin/layout-primitives.css',
        symbol: 'var(--ds-rhythm-effective-scale',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Layout rhythm',
      valueType: 'enum',
      enumValues: ['tight', 'normal', 'airy'],
      bounds: { min: 0.8, max: 1.25 },
      defaultBehavior:
        'normal (factor 1) — byte-identical to the pre-rhythm cascade in every vertical, because the DS floor already resolves --ds-rhythm-effective-scale to 1',
      documentPath: 'appearance.general.rhythm',
      brandThemePath: 'surfaces.rhythm',
      derivedChannels: ['--ds-rhythm-scale', '--ds-rhythm-effective-scale'],
      dependsOn: [],
      compat:
        'additive, unset-to-rollback. ORTHOGONAL to density.mode by construction and never a second spelling of it: density scales control SIZES through --ds-density-effective-scale, rhythm scales the LAYOUT RELATIONSHIPS between controls (gap, layout padding) through --ds-rhythm-effective-scale. A chain carrying both factors is correct rather than double-scaled — the control keeps its density size while the room around it breathes. Rhythm is applied at the PRESET rungs, never at a consume site, so a consumer numeric gap stays exact geometry exactly as it does under density; and it never reaches a control height, touch target or icon box, which is what keeps the coarse-pointer touch floors intact by construction rather than by clamping. The 0.8-1.25 envelope is enforced in the derived channel, so it binds the compiler artifact, the BrandTheme lowering and a raw tokenOverride alike.',
    },
    {
      id: 'motion.dial',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/button.css',
        symbol: 'var(--ds-motion',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Motion intensity and duration',
      valueType: 'scale',
      defaultBehavior: 'engine cadence unchanged',
      documentPath: 'appearance.general.motion.{intensity,durationScale,ambient}',
      brandThemePath: 'motion.*',
      derivedChannels: ['--ds-motion-intensity', '--ds-motion-duration-scale'],
      compat: 'additive, unset-to-rollback; never authors keyframes',
    },
    {
      id: 'surfaces.elevation-posture',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card.css',
        symbol: 'var(--ds-elevation',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Elevation posture',
      valueType: 'enum',
      enumValues: ['flat', 'soft', 'elevated'],
      defaultBehavior: 'soft (DS shadow ramp untouched)',
      documentPath: 'appearance.general.surfaces.elevation',
      brandThemePath: 'surfaces.shadows.*',
      derivedChannels: ['--ds-elevation-1', '--ds-elevation-2', '--ds-elevation-3'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'surfaces.effect-intensity',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/command-palette.css',
        symbol: 'var(--ds-glass',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Decoration intensity',
      valueType: 'scale',
      bounds: { min: 0, max: 1 },
      defaultBehavior: '1 for the DS default; verticals author their own floor',
      documentPath: 'appearance.general.surfaces.effectIntensity',
      brandThemePath: 'surfaces.effectIntensity',
      derivedChannels: ['--ds-effect-intensity'],
      compat: 'additive; 0 removes decoration, never hierarchy',
    },
    {
      id: 'navigation.sidebar-tone',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/menu.css',
        symbol: 'var(--ds-sidebar',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Sidebar tone',
      valueType: 'enum',
      enumValues: ['subtle', 'strong', 'inverse'],
      defaultBehavior: 'subtle',
      documentPath: 'appearance.general.navigation.sidebarTone',
      brandThemePath: 'chrome.sidebar.*',
      derivedChannels: ['--ds-sidebar-bg', '--ds-sidebar-item-color'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'experience.profile',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx',
        symbol: 'resolveExpressiveAxes',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Experience profile',
      valueType: 'profile-id',
      defaultBehavior:
        'baseline identity; a selection composes closed per-axis postures whose expansion always loses to any authored field or channel',
      documentPath: 'appearance.general.experienceProfile',
      brandThemePath: 'expressive.experienceProfile',
      derivedChannels: [
        '--ds-experience-profile',
        '--ds-letter-spacing-heading',
        '--ds-edge-standard-width',
        '--ds-material-canvas-texture',
        '--ds-elevation-lift-strength',
      ],
      compat:
        'closed versioned registry (expressive-profiles); ids permanent, superseded by @N+1; unset-to-rollback',
    },
    // ── PRO: bounded advanced surface ──────────────────────────────────────
    {
      id: 'chrome.families',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/table.css',
        symbol: 'var(--ds-table-header',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Per-family chrome',
      valueType: 'chrome-map',
      defaultBehavior: 'family derivations over semantic channels decide',
      documentPath: 'visualFoundation.advanced.chrome.*',
      brandThemePath: 'chrome.*',
      derivedChannels: ['--ds-button-primary-bg', '--ds-table-header-bg', '--ds-modal-bg'],
      compat:
        'additive; chromeToVariables is the single shared emitter for both paths',
    },
    {
      id: 'chrome.anatomy',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/page-shell.css',
        symbol: 'var(--ds-page-shell',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Anatomy variants',
      valueType: 'enum',
      defaultBehavior: 'default anatomy; fails closed unless the vertical envelope opts in',
      documentPath: 'visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy',
      brandThemePath: 'chrome.{cardComponent,table,sidebar,layout}.anatomy',
      derivedChannels: [],
      derivedRootAttributes: [
        'data-anatomy-card',
        'data-anatomy-table',
        'data-anatomy-sidebar',
        'data-anatomy-layout',
      ],
      dependsOn: ['chrome.families'],
      compat: 'additive; envelope-gated (allowAnatomyVariants)',
    },
    {
      id: 'token-overrides',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/infrastructure/compilers/composition/tenant-theme/index.ts',
        symbol: 'tokenOverrides',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Bounded raw channel overrides',
      valueType: 'token-map',
      defaultBehavior: 'none; closed allowlist, max 200 entries, fails closed',
      documentPath: 'visualFoundation.advanced.tokenOverrides',
      brandThemePath: 'tokenOverrides',
      derivedChannels: ['--ds-color-error', '--ds-surface-card', '--ds-color-bg-overlay'],
      compat:
        'escape hatch, not the model: every recurring override is a candidate for a real capability',
    },
    {
      id: 'recipe-profile',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx',
        symbol: 'RecipeProfileProvider',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Family recipe profile',
      valueType: 'profile-id',
      defaultBehavior: 'no profile: family recipe defaults apply',
      documentPath: 'visualFoundation.recipeProfile',
      brandThemePath: 'recipeProfile',
      derivedChannels: ['--ds-recipe-profile'],
      compat:
        'closed registry of typed per-family axes (recipe-profiles); caller props always win',
    },
    {
      id: 'profiles.expressive',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx',
        symbol: 'sanitizeExpressiveOverrides',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Explicit expressive axes',
      valueType: 'enum',
      defaultBehavior:
        'each axis independently overrides the experience composition; an unset axis falls back to it, then to baseline',
      documentPath:
        'visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif}',
      brandThemePath: 'expressive.profiles.*',
      derivedChannels: [
        '--ds-type-label-text-transform',
        '--ds-edge-emphasis-width',
        '--ds-material-card-highlight',
        '--ds-table-header-text-transform',
      ],
      dependsOn: ['experience.profile'],
      compat:
        'closed per-axis vocabularies; both compilers sanitize fail-closed; unset-to-rollback per axis',
    },
    // ── LATER WAVES: rows declared as frontier, opened in place ────────────
    // Rows below were authored as frontier boundaries and are opened by the
    // wave that lands their runtime, keeping each id at its original index
    // rather than migrating it up into the tier blocks. Read `status`, never
    // the position: `profiles.icon` (C2) and `responsive.posture` (E2) are
    // ACTIVE here; `palette.status-seeds` is still a boundary the schema
    // rejects.
    {
      id: 'palette.status-seeds',
      version: 1,
      tier: 'standard',
      status: 'frontier',
      scope: 'tenant',
      owner: 'design-system',
      title: 'Status tone seeds (success/warning/error/info) in General',
      valueType: 'color-set',
      defaultBehavior:
        'DB General cannot author status tones today; Advanced tokenOverrides is the only DB route, while BrandTheme authors them directly — the recorded static/DB asymmetry this frontier closes',
      documentPath: 'appearance.general.palette.{success,warning,error,info} (REJECTED today)',
      brandThemePath: 'palette.{successColor,warningColor,errorColor,infoColor}',
      derivedChannels: [
        '--ds-color-success',
        '--ds-color-success-500',
        '--ds-color-on-success',
      ],
      compat: 'opening it is additive; requires schema + envelope + editor rows',
    },
    {
      id: 'profiles.icon',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/graphics/icons/runtime/semantic/create-icon/index.tsx',
        symbol: 'useActiveIconExpressiveProfile',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Icon posture profile',
      valueType: 'enum',
      enumValues: ['linear', 'strong-outline', 'duotone', 'solid-active'],
      defaultBehavior:
        'baseline role/state weight tables. A posture only selects among the governed PROFILE_ROLE_WEIGHT tables in the icon policy — never a supplier, glyph or local SVG; state weights stay supreme (feedback over decoration). Literal two-hue duotone stays out: the pinned supplier is single-hue/two-opacity by design.',
      documentPath: 'visualFoundation.advanced.profiles.icon',
      brandThemePath: 'expressive.profiles.icon',
      derivedChannels: [],
      dependsOn: ['profiles.expressive'],
      compat:
        'additive, unset-to-rollback; the posture travels as DATA (document → schema → artifact normalizedAppearance) and selects governed weight tables. RENDER application is LIVE (C2c): generated icons call useActiveIconExpressiveProfile() unconditionally — a real context hook in the client/SSR worlds, a plain per-request React.cache box read under RSC; the world is picked by capability detection (react-server exports no createContext). Servers provide the profile via provideServerIconExpressiveProfile at the same seam that mounts the compiled CSS (app-bithire: src/app/layout.tsx). Absent profile → the pre-profile role/state weight tables apply unchanged.',
    },
    {
      id: 'responsive.posture',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer:
          'src/ui/patterns/data/widget-board/runtime/solver/react/index.ts',
        symbol: 'resolveActiveResponsivePosture',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Responsive posture profile',
      valueType: 'profile-id',
      enumValues: ['compact', 'balanced', 'expansive'],
      defaultBehavior:
        'the balanced ladder, whose container thresholds (compact ≤639px, standard ≤839px) and `preferred` span resolution ARE the constants the adaptive runtime and pure solver used before this axis opened — so an absent selection is byte-for-byte the pre-capability layout, and "unset it" is a true rollback rather than an approximate one',
      documentPath: 'visualFoundation.advanced.responsivePosture',
      brandThemePath: 'responsive.posture',
      derivedChannels: [],
      compat:
        'additive, unset-to-rollback; the ladder travels as DATA (document → schema → artifact normalizedAppearance) and selects a published threshold pair plus a span bias — never authored thresholds, never a viewport read, never a CSS channel. It reaches geometry ONLY through solver door 2 (`AdaptiveLayoutEnv.spanBias`) and through container-posture bucketing, both bounded by each item\'s own min/max contract and by the tier capacity, so no selection can overflow, reorder DOM/focus, or open an avoidable hole — drilled by the property sweep under all three profiles. WidgetBoard\'s collapse TIER is deliberately NOT tenant-driven: widget-board.css mirrors 639/839 as container queries that repoint the grid tracks, so the tier is CSS-co-authored and a JS-only move would manufacture implicit columns. A live swap invalidates measurements and saved layouts for free, because the environment epoch already folds artifactRevision.',
    },
  ] as const satisfies readonly TenantCapabilityDeclaration[]);

export type TenantCapabilityEntry = (typeof TENANT_CAPABILITY_REGISTRY)[number];
export type TenantCapabilityId = TenantCapabilityEntry['id'];
export type ActiveTenantCapabilityId = Extract<
  TenantCapabilityEntry,
  { readonly status: 'active' }
>['id'];

/** Foundation derivation authorities: NOT tenant dials by design. */
export interface FoundationAuthorityDeclaration {
  readonly id: string;
  readonly sinceWave: 'C1' | 'P1';
  readonly channels: readonly string[];
  readonly derivation: string;
  readonly consumers: readonly string[];
}

export const FOUNDATION_AUTHORITIES: readonly FoundationAuthorityDeclaration[] =
  Object.freeze([
    {
      id: 'on-tone-ink',
      sinceWave: 'C1',
      channels: [
        '--ds-color-on-success',
        '--ds-color-on-warning',
        '--ds-color-on-error',
        '--ds-color-on-info',
        '--ds-color-on-primary',
      ],
      derivation:
        'shared WCAG readable-ink over each status seed; static emits from BrandTheme palette, DB derives post-merge from the final tone channels',
      consumers: ['icon-frame.css filled', 'meter.css threshold stripes'],
    },
    {
      id: 'tinted-well-tone-ink',
      sinceWave: 'P1',
      channels: [
        '--ds-color-info-ink',
        '--ds-color-warning-ink',
        '--ds-color-error-ink',
        '--ds-color-success-ink',
      ],
      derivation:
        "AA-measured ink over a tone-TINTED WELL, the sibling of on-tone-ink rather than a duplicate of it: that axis is ink on a SOLID fill and stays a flat dark neutral in both themes, while this one sits on a well that flips, so each tinted value mixes toward --ds-color-neutral-900 and inherits the dark flip by construction (info keeps the raw hue, which already clears the contrast floor). Absorbed the two AUT-1 prototokens in P1",
      consumers: ['callout.css tone icon ink', 'tag-input.css rejection frame'],
    },
    {
      id: 'interaction-wash',
      sinceWave: 'C1',
      channels: ['--ds-wash-band', '--ds-wash-band-preview'],
      derivation: 'color-mix ramp over --ds-color-primary; feedback, so not effect-gated',
      consumers: ['date-picker.css range band/preview'],
    },
    {
      id: 'overlay-panel-scrim-split',
      sinceWave: 'C1',
      channels: ['--ds-surface-overlay', '--ds-overlay-scrim', '--ds-material-overlay-opaque'],
      derivation:
        'overlay ROLE is a floating panel derived from the elevated ground; the veil is --ds-overlay-scrim over --ds-color-bg-overlay; reduced-transparency collapses to the opaque pair',
      consumers: ['popover.css', 'tooltip.css', 'semantic-surface.css', 'slider.css'],
    },
    {
      id: 'icon-size-roles',
      sinceWave: 'C1',
      channels: ['--ds-icon-size-status', '--ds-icon-size-well', '--ds-icon-size-feature'],
      derivation: 'optical roles for recurring icon wells; a future icon profile modulates them',
      consumers: ['form-field.css', 'form.css', 'confirm-dialog.css', 'context-menu.css'],
    },
    {
      id: 'nested-radius',
      sinceWave: 'C1',
      channels: ['--ds-radius-nest-inset'],
      derivation: 'inner radius = max(0, outer - inset); one inset for every nested surface',
      consumers: ['card.css', 'semantic-surface.css'],
    },
  ]);

/** Tier manifests: the id lists an editor renders per access level. */
export const TENANT_STANDARD_MANIFEST: readonly string[] = Object.freeze(
  TENANT_CAPABILITY_REGISTRY.filter(
    (capability) => capability.tier === 'standard' && capability.status === 'active'
  ).map((capability) => capability.id)
);

export const TENANT_PRO_MANIFEST: readonly string[] = Object.freeze(
  TENANT_CAPABILITY_REGISTRY.filter(
    (capability) => capability.tier === 'pro' && capability.status === 'active'
  ).map((capability) => capability.id)
);

/** Internal compatibility controls never rendered in tenant-facing editors. */
export const TENANT_INTERNAL_MANIFEST: readonly string[] = Object.freeze(
  TENANT_CAPABILITY_REGISTRY.filter(
    (capability) => capability.tier === 'internal' && capability.status === 'active'
  ).map((capability) => capability.id)
);
