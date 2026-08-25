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
      // F4B-11 fix (F4B-7 class, false-green variant -- the census's most
      // dangerous shape): this read `typography.{fontFamilyBase,
      // fontFamilyHeading}`, literally `typography.families`'s own
      // brandThemePath copy-pasted one entry down. Both are real,
      // string-typed BrandTheme fields, so a causal run writing an enum
      // value there (e.g. "sober") would NOT throw -- it would silently set
      // `fontFamilyBase` to the literal string "sober", which reads back as
      // "the stop moved something", a false PASS that never exercises
      // `typePairingToTypography()` at all. The real field is
      // `typography.typePairing` (brand-theme/index.ts:784 --
      // `typePairing: bt.typography?.typePairing`; themes/index.ts:566 --
      // `BrandTypography.typePairing?: "sober"|"editorial"|"geometric"|
      // "technical"`, the same four enum values this control declares).
      // Caught by the F4B census preflight before any causal run wrote the
      // false-green value.
      brandThemePath: 'typography.typePairing',
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
        consumer: 'src/ui/patterns/runtime/adaptive-layout/presentation/react/index.ts',
        symbol: '--ds-type-scale',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Type scale dial',
      valueType: 'scale',
      bounds: { min: 0.9, max: 1.1 },
      defaultBehavior: '1 (vertical envelope may clamp tighter)',
      documentPath: 'appearance.general.typography.scale',
      // The static door is the FIELD the compiler reads, not a description of
      // what it feeds. This once read `typography (ramp channels)`, which is
      // prose: every walker here splits on `.`, so it resolved to
      // `typography["(ramp channels)"]` and landed the stop where nothing reads
      // it. `BrandTheme.typography.scale` is the real field (themes/index.ts:568)
      // and `brand-theme:774-791` hands it to the posture lowering, whose
      // typeScale branch writes `--ds-type-scale` unconditionally. Silent by
      // construction, exactly like `surfaces.density` below: the seed at
      // brand-theme:713 emits `--ds-type-scale: 1` whatever happens, so the arm
      // stayed non-empty and only H-2's stop-discrimination guard caught it.
      brandThemePath: 'typography.scale',
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
      // The static door is the DIAL, not the ramp operands. `surfaces.borderRadius.*`
      // sets `--ds-radius-{step}-base`, and when a scale is live the compiler emits
      // that base as `calc(authored / scale)` precisely so the foundation's
      // `calc(base * scale)` reproduces the authored value — it CANCELS this control
      // rather than carrying it. Measured at every stop on all three verticals:
      // test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/.
      brandThemePath: 'surfaces.radiusScale',
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
      // The static door is the FIELD the compiler reads, not a description of
      // where it paints. This once read `chrome.controls.button* (radius
      // channels)`, which is prose with a parenthetical, not a keypath: every
      // walker here splits on `.`, so it resolved to
      // `chrome["controls"]["button* (radius channels)"]` and landed the stop
      // where nothing reads it. `BrandSurfaces.buttonStyle` is the real field
      // (themes/index.ts:597) and `brand-theme:786` hands it to the posture
      // lowering, whose buttonStyle branch writes `--ds-radius-button` only
      // `if (posture.buttonStyle)` (appearance-posture:145-154) — unlike
      // `typography.scale`/`density.mode`, this channel carries no
      // unconditional seed, so a live run through the broken door would have
      // failed LOUD (the empty-lowering guard, not a silent pass). No stop had
      // been authored yet; the F4B-9 preflight census caught the prose door by
      // reading the walker and registry source directly.
      brandThemePath: 'surfaces.buttonStyle',
      derivedChannels: ['--ds-radius-button'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'density.mode',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/ui/patterns/runtime/adaptive-layout/presentation/react/index.ts',
        symbol: 'useDensity',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Density posture',
      valueType: 'enum',
      enumValues: ['compact', 'normal', 'spacious'],
      defaultBehavior: 'normal (structural density scale is a separate channel)',
      documentPath: 'appearance.general.density',
      // The static door is the ENUM, and only the enum. This field once read
      // `surfaces.density / surfaces.densityScale`, which is not a keypath at all:
      // every walker here splits on `.`, so that string resolves to
      // `surfaces["density / surfaces"].densityScale` and lands the stop where no
      // compiler reads it. `surfaces.densityScale` is a SEPARATE axis — the vertical's
      // structural multiplier, lowered on its own at brand-theme:715 — so naming it
      // beside the enum did not widen the door, it broke it. The failure was silent by
      // construction: `--ds-density-scale` is emitted unconditionally from the vars
      // seed, so the arm stayed non-empty and the empty-lowering guard never fired
      // while no stop was carried. Same anti-door shape as `surfaces.borderRadius`
      // above, different mechanism.
      brandThemePath: 'surfaces.density',
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
      // F4B-13 fix: the prior witness (button.css, symbol 'var(--ds-motion')
      // was imprecise -- button.css reads only DERIVED motion channels
      // (--ds-motion-reveal/-attention/-ease-in-out, all defined two hops
      // downstream in foundation/animations/transitions.css), never either
      // declared channel directly. alert.css consumes --ds-motion-intensity
      // directly (skin/alert.css:16-17) and is the file OTHER skin files'
      // own comments cite as the reference idiom (menu.css:46: "(alert.css
      // idiom)").
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/alert.css',
        symbol: 'var(--ds-motion-intensity',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Motion intensity and duration',
      valueType: 'scale',
      defaultBehavior: 'engine cadence unchanged',
      documentPath: 'appearance.general.motion.{intensity,durationScale,ambient}',
      // F4B-13 fix (false-INERT by PATH, not by compiler, same class as
      // navigation.sidebar-tone/F4B-12): `motion.*` is a wildcard, and the
      // ingress walker (`ingressPathMembers`/`resolveIngressMember`) only
      // understands brace SETS -- a lone `*` resolves to itself as a
      // literal member, writing to the nonsense key `motion['*']`. Fixed to
      // the brace-set `motion.{intensity,durationScale,ambient}`, which
      // discriminates cleanly by last segment; all 3 fields exist on
      // `BrandMotion` (themes/index.ts:694-699). `ambient` intentionally
      // emits no CSS custom property (behaviour, not a channel) and stays
      // out of derivedChannels by design, not omission.
      brandThemePath: 'motion.{intensity,durationScale,ambient}',
      derivedChannels: ['--ds-motion-intensity', '--ds-motion-duration-scale'],
      // DT ruling (F4B-13): `domain.bounds` is one {min,max} pair per
      // control, and this control governs TWO numeric channels with
      // DIFFERENT ranges. Declares `intensity`'s per-vertical envelope range
      // (0..0.8, identical across all 3 first-party verticals,
      // TENANT_THEME_VERTICAL_ENVELOPES) as representative, since it is the
      // first declared channel -- `durationScale`'s own range is 0.75..1.35,
      // named here rather than expressed, because the schema has no per-
      // channel bounds today. Extending `domain.bounds` to carry bounds per
      // member (the same shape profiles.expressive already needs for its
      // own per-member enumValues) is registered as a future schema
      // decision, not this packet's write-set. The REAL authority is the
      // envelope's own HARD gate (`compileTenantThemeConfig`, rejects the
      // whole document outside range, never clamps) -- this bounds pair is
      // documentation, not the enforcement mechanism.
      bounds: { min: 0, max: 0.8 },
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
      // The static door is the POSTURE, not the raw ladder. This once read
      // `surfaces.shadows.*`, which is a REAL field but the WRONG one — worse
      // than F4B-9's prose, because it walks and measures something: `shadows`
      // is the crude per-step override map (`--ds-shadow-{xs,sm,...}`, themes/
      // index.ts:612-625), not the posture. It is also a bare wildcard on top
      // of that, which this walker never expands (see F4B-9's census). The
      // real field is `BrandSurfaces.elevation` (themes/index.ts:601) — a
      // sibling of `shadows`, not a member of it — and `brand-theme:796` hands
      // it to the same posture lowering as every other Standard field. Caught
      // by the F4B-10 preflight census reading the source directly, not by a
      // guard firing: no stop had been authored yet.
      brandThemePath: 'surfaces.elevation',
      derivedChannels: ['--ds-elevation-1', '--ds-elevation-2', '--ds-elevation-3'],
      compat: 'additive, unset-to-rollback',
    },
    {
      id: 'surfaces.effect-intensity',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/overlay-modal.css',
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
      // F4B-12 fix (false-INERT by PATH, not by compiler): `chrome.sidebar.*`
      // is a wildcard, and the ingress walker (runtime/ingress/index.mjs's
      // `ingressPathMembers`/`resolveIngressMember`) only understands brace
      // SETS (`{a,b,c}`) -- a lone `*` resolves to itself as a single literal
      // member, so a causal stop would write to the nonsense key
      // `chrome.sidebar['*']`, which nothing reads. The real field is
      // `chrome.sidebar.tone` -- the single string this control's compiler
      // authority exports as `SIDEBAR_TONE_FIELD`
      // (chrome-variables/index.ts:194), matching what `migrateV1` writes and
      // what `chromeToVariables` reads (`s.tone`, chrome-variables/index.ts's
      // tone-lowering path). Not imported here on purpose (DT ruling,
      // F4B-12): importing the compiler's own constant into this purely
      // declarative registry would be the first infrastructure import here
      // and would cross the foundation<-infrastructure layer direction; the
      // literal is fenced instead by a drill in
      // resolution-probe/runtime/ingress/tests/index.test.mjs that PARSES
      // the compiler source text (never imports it) for `SIDEBAR_TONE_FIELD`
      // and asserts equality against this exact string.
      brandThemePath: 'chrome.sidebar.tone',
      // DT ruling (F4B-12, widen adjudication): the control's authority IS
      // the closed six-channel table `SIDEBAR_TONE_LEAF_FIELDS`
      // (chrome-variables/index.ts:184-191) -- declaring 2 of 6 under-declares
      // the real surface a Standard multi-channel posture control governs.
      // `--ds-sidebar-item-color` (no `-active` suffix) is deliberately
      // EXCLUDED: it is a DIFFERENT leaf's channel -- chrome-variables/index.ts:1351
      // writes it from `s.itemColor` directly, never from the tone -- the
      // exact channel this control's declaredOutputs mistakenly named before
      // this fix.
      derivedChannels: [
        '--ds-sidebar-bg',
        '--ds-sidebar-text',
        '--ds-sidebar-text-muted',
        '--ds-sidebar-item-bg-hover',
        '--ds-sidebar-item-bg-active',
        '--ds-sidebar-item-color-active',
      ],
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
        /*
         * The citation has to prove the ANATOMY selector exists, not that the cited file reads
         * some token. page-shell.css was named here and contains zero `data-anatomy` selectors --
         * its 31 `--ds-page-shell` hits made the pointer look supported while proving nothing
         * about this capability. card.css carries the real thing.
         */
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card.css',
        symbol: "[data-anatomy-card='framed']",
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
          'src/ui/patterns/runtime/adaptive-layout/presentation/react/index.ts',
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
