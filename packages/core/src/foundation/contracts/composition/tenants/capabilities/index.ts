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

/**
 * The access vocabulary: Standard, Pro, Internal. There is no fourth level. The
 * name the raw `tokenOverrides` allowlist used to carry is retired with the
 * allowlist itself (D-03); it is not a tier, and it never was.
 *
 * The AUTHORITY over this vocabulary is `ThemePlan` in the theme-intent
 * contract, which `contracts/theme` aliases. This array is this registry's own
 * copy because `tenants/capabilities` and `tenants/themes` are sibling owners
 * and may not import each other until WO-RET-04 unifies the tree; the equality
 * of the two is asserted, not assumed.
 */
export const CAPABILITY_TIERS = Object.freeze([
  'standard',
  'pro',
  'internal',
] as const);

export type CapabilityTier = (typeof CAPABILITY_TIERS)[number];
export type CapabilityStatus = 'active' | 'declared';
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
  /**
   * The subset of `derivedChannels` the resolution probe CALIBRATES.
   *
   * Two different questions were sharing one field, and C5 separates them.
   * `derivedChannels` answers "what does authoring this capability move?" — the
   * impact radius, read by the impact map, the controls catalogue, the tokens
   * catalogue and the surface census. This field answers the narrower one the
   * harness asks: "which channels may a stop be held to?" — K in the H-2 law,
   * "and nothing wider", where `directControlFixtureIds` requires EVERY declared
   * channel to be readable on one fixture target so a stop can never attribute a
   * channel it did not write.
   *
   * They coincide for every capability whose stops exercise its whole radius,
   * which is why this is OPTIONAL: absent, the calibration surface IS
   * `derivedChannels`, and nothing changes for the capabilities that never
   * needed the distinction. Declare it only where a real seed is deliberately
   * outside the calibrated set, and state why at the entry.
   *
   * Fenced: `calibrationChannels` must be a SUBSET of `derivedChannels` — a
   * surface cannot calibrate a channel the capability does not even claim to
   * move.
   */
  readonly calibrationChannels?: readonly string[];
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
   * without a productive consumer is `declared`, never `active`.
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css',
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
        consumer: 'src/foundation/tokens/css/foundation/themes/default/index.css',
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
      derivedChannels: ['--ds-color-primary-500'],
      compat:
        'compatibility-only; not rendered in Standard or Pro tenant editors unless product explicitly enables a mode feature',
    },
    {
      id: 'typography.pairing',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css',
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
      // `typography.typePairing` (lowering/runtime/variables/index.ts --
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
        consumer: 'src/foundation/tokens/css/foundation/themes/default/index.css',
        symbol: '--ds-font-family-mono',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Explicit font stacks',
      valueType: 'font-stack',
      defaultBehavior: 'pairing (or vertical baseline) decides',
      documentPath: 'appearance.general.typography.{fontFamilyBase,fontFamilyHeading}',
      // F4B-14 fix: derivedChannels under-declared the real surface. The
      // static ingress path already names 4 members
      // (fontFamilyBase/Heading/Mono/Display), and the compiler emits all 4
      // as real CSS channels (lowering/runtime/variables/index.ts) -- mono/display
      // simply have NO DB door (documentPath only carries base/heading), so
      // they are static-only, same class as an identity-only stop. Widened
      // to the full 4-channel real surface the control governs, matching
      // the F4B-12 DT ruling for navigation.sidebar-tone (declare the real
      // table, not a subset).
      brandThemePath: 'typography.{fontFamilyBase,fontFamilyHeading,fontFamilyMono,fontFamilyDisplay}',
      derivedChannels: [
        '--ds-font-family-base',
        '--ds-font-family-heading',
        '--ds-font-family-mono',
        '--ds-font-family-display',
      ],
      compat: 'additive; Arabic-safe tail is a compiler invariant either way',
    },
    {
      id: 'typography.scale',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer: 'src/components/patterns/runtime/adaptive-layout/presentation/react/index.ts',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css',
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
      // artifacts/quality/programs/modern-rescue/cascade-proofs/controls/shape-radius-scale/computed-static-db/.
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css',
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
        consumer: 'src/components/patterns/runtime/adaptive-layout/presentation/react/index.ts',
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
          'src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css',
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
      // downstream in foundation/animations/transitions/index.css), never either
      // declared channel directly. alert.css consumes --ds-motion-intensity
      // directly (skin/alert.css:16-17) and is the file OTHER skin files'
      // own comments cite as the reference idiom (menu.css:46: "(alert.css
      // idiom)").
      evidence: {
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/overlay-modal/index.css',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css',
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
        consumer: 'src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css',
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
      /* PACKET K — the brace names the harness's CALIBRATION SURFACE, not the
       * domain. This control's domain is the whole 290-name allowlist; what the
       * resolution probe calibrates is 2 of them, and a door it can select a
       * member of is the only shape it can attribute a stop to
       * (`resolveIngressMember` picks a member by its LAST segment, and these two
       * are complete `--ds-*` keys, so they are unique by construction).
       *
       * The narrowing is deliberate and is paid for in the manifest rather than
       * hidden: `calibration.entryCatalog` carries the full characterisation of
       * the domain (290 published, 275 admitted by the schema, 15 refused on
       * VALUE type, 8 more refused at the governed APCA floor, 267 through both;
       * no key rejections among them). The PUBLIC domain stays described by
       * `valueType: 'token-map'` and by the document schema, neither of which
       * this line touches. Precedent: `palette` names 4 of its members (:94).
       */
      documentPath:
        'visualFoundation.advanced.tokenOverrides.{--ds-color-error,--ds-color-bg-overlay}',
      brandThemePath: 'tokenOverrides',
      // Impact radius includes every channel this control changes; calibration
      // stays limited to the two channels that its fixture writes directly.
      derivedChannels: ['--ds-color-error', '--ds-surface-card', '--ds-color-bg-overlay'],
      calibrationChannels: ['--ds-color-error', '--ds-color-bg-overlay'],
      compat:
        'escape hatch, not the model: every recurring override is a candidate for a real capability',
    },
    {
      id: 'recipe-profile',
      version: 1,
      tier: 'pro',
      status: 'active',
      // F4B-15 fix (false-INERT by PATH, same class as F4B-7/F4B-12/F4B-13):
      // `brandThemePath: 'recipeProfile'` named a field that does not exist
      // on BrandTheme -- every 'recipeProfile' in the theme contracts is an
      // OUTPUT shape (TenantAppearance.recipeProfile in themes/index.ts,
      // ThemeCompilationRuntime.recipeProfile in themes/compiled/index.ts),
      // never the INPUT a stop writes. The real field is nested:
      // `recipes.profile` (BrandRecipeSelection.profile, themes/index.ts:72).
      // A stop written to `patch.recipeProfile` landed on a key nothing
      // reads.
      //
      // Witness fix (DT ruling, F4B-15): the prior witness
      // (RecipeProfileProvider, symbol 'RecipeProfileProvider') implied the
      // declared channel --ds-recipe-profile reaches production. Measured:
      // it does not, on EITHER surface. (a) --ds-recipe-profile (CSS) has
      // NO production reader -- grep-confirmed, no `var(--ds-recipe-profile)`
      // exists in source; the lowering writes it once and nothing reads it
      // back, so it is provenance of the selection, not paint
      // (compilers/runtime/theme/runtime/lowering writes the channel from the
      // validated selection and no CSS consumes it). (b) RecipeProfileProvider IS a
      // real consumer, but of `resolvedRuntimeConfig.appearance?.recipeProfile`
      // (the DB-normalized shape), never of the CSS channel -- and for the 3
      // code-owned verticals (today's production, no tenant DB) it NEVER
      // receives a value at all: `getCodeOwnedRuntimeConfig`
      // (tenant/foundation/configuration/registry/index.ts:155-162)
      // destructures `appearance` OUT and never restores it, and
      // `governedBehavior` (the one alternate channel motion/expressive ride)
      // does not carry `recipes` either. The two surfaces are architecturally
      // decoupled, not a bug this control can fix. Kept RecipeProfileProvider
      // as the witness (the only real functional consumer that exists) and
      // corrected `symbol` to what it actually reads -- the calibration's own
      // notes carry the full two-surface truth with citations.
      evidence: {
        consumer: 'src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx',
        symbol: 'resolvedRuntimeConfig.appearance?.recipeProfile',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Family recipe profile',
      valueType: 'profile-id',
      defaultBehavior: 'no profile: family recipe defaults apply',
      documentPath: 'visualFoundation.recipeProfile',
      brandThemePath: 'recipes.profile',
      derivedChannels: ['--ds-recipe-profile'],
      compat:
        'closed registry of typed per-family axes (recipe-profiles); caller props always win',
    },
    {
      id: 'profiles.expressive',
      version: 1,
      tier: 'pro',
      status: 'active',
      // The flat union classifies the public control as a closed enum. The
      // compiler still validates each value against its own expressive axis.
      evidence: {
        consumer: 'src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx',
        symbol: 'sanitizeExpressiveOverrides',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Explicit expressive axes',
      valueType: 'enum',
      enumValues: [
        'technical', 'editorial', 'humanist', 'geometric',
        'sharp', 'soft', 'rounded', 'pill-accented',
        'borderless-shadow', 'hairline', 'outlined', 'ruled', 'inset-double',
        'flat', 'paper', 'soft-depth', 'frosted', 'luminous',
        'hairline-lift', 'dramatic', 'luminous-glow',
        'none', 'micro-grid', 'dots', 'pinstripe', 'deco-fan', 'ambient-orbs', 'contour',
      ],
      defaultBehavior:
        'each axis independently overrides the experience composition; an unset axis falls back to it, then to baseline',
      documentPath:
        'visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif}',
      // F4B-16 fix (false-INERT by PATH, same class as F4B-7/F4B-12/F4B-13):
      // `expressive.profiles.*` is a wildcard, and the ingress walker
      // (`ingressPathMembers`/`resolveIngressMember`) only understands brace
      // SETS -- a lone `*` resolves to itself as a literal member, writing to
      // the nonsense key `expressive.profiles['*']`. Fixed to the 6-member
      // brace-set, all last segments distinct (Fase B's brace law only bites
      // on a SHARED last segment; none here), matching the DB path's own
      // already-correct 6-member set one level down.
      brandThemePath:
        'expressive.profiles.{type,geometry,edge,material,elevation,motif}',
      // F4B-16 fix: `--ds-type-label-text-transform` was never measured --
      // it does not move (direct compile sweep, all 3 verticals, all 4
      // type values: the static path's role-level channels are written by
      // setSemanticTypographyVariables's OWN overlay, not by this expansion's
      // direct `variables`, which only reaches the DB path for role facets).
      // `--ds-select-group-text-transform` replaces `--ds-table-header-text-
      // transform` as the type representative: BOTH are real (typeProfileVariables
      // writes both unconditionally), but table-header specifically is a
      // measured, bithire-only DB-arm non-mover (baseline and every tested
      // value alike resolve `undefined` there; select-group moves cleanly on
      // both arms, all 3 verticals -- see calibration.measuredChannelUnion).
      // One representative channel PER AXIS, each independently measured
      // moving (compileTheme + compileTenantThemeConfig sweep, this
      // packet): the FULL real union is far larger (type alone has 8,
      // geometry cascades through the shared --ds-radius-*/--ds-*-radius
      // surface at 35 -- see the control's own calibration.measuredChannelUnion)
      // but declaring all of it here would require token-readout to track
      // 60+ channels for one control; `representativeOnly` already states
      // these are not exhaustive.
      derivedChannels: [
        '--ds-select-group-text-transform',
        '--ds-radius-scale',
        '--ds-edge-emphasis-width',
        '--ds-material-card-highlight',
        '--ds-elevation-lift-strength',
        '--ds-material-canvas-texture',
      ],
      dependsOn: ['experience.profile'],
      compat:
        'closed per-axis vocabularies; both compilers sanitize fail-closed; unset-to-rollback per axis',
    },
    // ── LATER WAVES: rows authored as declared boundaries, opened in place ─
    // Rows below were authored as declared-but-closed boundaries and are opened by the
    // wave that lands their runtime, keeping each id at its original index
    // rather than migrating it up into the tier blocks. Read `status`, never
    // the position: `profiles.icon` (C2), `responsive.posture` (E2) and
    // `palette.status-seeds` (P0, 2026-08-28) are all ACTIVE here. None of the
    // three is still a boundary the schema rejects.
    {
      id: 'palette.status-seeds',
      version: 1,
      tier: 'standard',
      status: 'active',
      evidence: {
        consumer:
          'src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/variables/index.ts',
        symbol: 'vars["--ds-color-success"]',
      },
      scope: 'tenant',
      owner: 'design-system',
      title: 'Status tone seeds (success/warning/error/info) in General',
      valueType: 'color-set',
      defaultBehavior:
        'vertical baseline status tones. The DB General path authors them at `palette.status.{…}` and confluences into BrandPalette BEFORE the single lowering, so both transports reach `deriveTenantColorRamps` through the same door — no parallel emitter. Absent => the vertical baseline, unchanged.',
      documentPath: 'appearance.general.palette.status.{success,warning,error,info}',
      brandThemePath: 'palette.{successColor,warningColor,errorColor,infoColor}',
      // Under-declared the real surface: three channels of ONE tone, for a
      // control whose value type is `color-set` and whose documentPath names
      // FOUR. The radius is not a sample here — it is mechanically closed and
      // enumerable from source, exactly like `navigation.sidebar-tone`'s
      // six-channel table above, because each of the four seeds reaches the
      // same four emitters in the single lowering
      // (`compilers/runtime/theme/runtime/lowering/index.ts`):
      //   1. the seed passthrough per tone (:846-851, `if (seed)`);
      //   2. the perceptual ramp, `deriveTenantColorRamps` (:340-366) over
      //      `rampRoleSpecs` (:316-326) × the ten `RAMP_STEPS`, reached from
      //      the lowering at :1033 — the `-500` this row already named is one
      //      of ten, not the family;
      //   3. the readable ink `--ds-color-on-{tone}` over `ON_TONE_ROLES`
      //      (:856-861); and
      //   4. the five-step tint ramp `--ds-tint-{tone}-{4,8,12,16,24}`
      //      (:1443-1450), whose value is seed-independent but whose EMISSION
      //      is gated on the seed being authored.
      // COH-1 (2026-08-30): `--ds-color-{tone}-bg` / `-border` and seven
      // `--ds-color-alpha-{tone}-*` channels (5./6. below) are NO LONGER
      // excluded. `deriveStatusTintFloor` (`lowering/foundation/palette`) merges a
      // FLOOR for these fifteen channels per tone, guarded by the same
      // `if (seed)` presence check every other emission in this family uses,
      // merged BEFORE `setExtendedPaletteVariables` so an authored
      // `successBgColor`/`alphaSuccess10`/etc. (`EXTENDED_PALETTE_CHANNELS`,
      // `lowering/foundation/palette`) still overrides its own channel, per
      // channel. A DB tenant's
      // own status seed re-derives the same fifteen over a vertical baseline
      // that bakes them as literals, via the sibling
      // `applyTenantStatusSeedDerivations`/`STATUS_SEED_SHADOWING_FIELDS`.
      // `--ds-color-info-ink` stays EXCLUDED: its authority is the
      // `tinted-well-tone-ink` capability below (readable ink over the seed),
      // unrelated to this control's status-seed family.
      derivedChannels: [
        // 1. seed passthrough
        '--ds-color-success',
        '--ds-color-warning',
        '--ds-color-error',
        '--ds-color-info',
        // 2. derived perceptual ramps
        '--ds-color-success-50',
        '--ds-color-success-100',
        '--ds-color-success-200',
        '--ds-color-success-300',
        '--ds-color-success-400',
        '--ds-color-success-500',
        '--ds-color-success-600',
        '--ds-color-success-700',
        '--ds-color-success-800',
        '--ds-color-success-900',
        '--ds-color-warning-50',
        '--ds-color-warning-100',
        '--ds-color-warning-200',
        '--ds-color-warning-300',
        '--ds-color-warning-400',
        '--ds-color-warning-500',
        '--ds-color-warning-600',
        '--ds-color-warning-700',
        '--ds-color-warning-800',
        '--ds-color-warning-900',
        '--ds-color-error-50',
        '--ds-color-error-100',
        '--ds-color-error-200',
        '--ds-color-error-300',
        '--ds-color-error-400',
        '--ds-color-error-500',
        '--ds-color-error-600',
        '--ds-color-error-700',
        '--ds-color-error-800',
        '--ds-color-error-900',
        '--ds-color-info-50',
        '--ds-color-info-100',
        '--ds-color-info-200',
        '--ds-color-info-300',
        '--ds-color-info-400',
        '--ds-color-info-500',
        '--ds-color-info-600',
        '--ds-color-info-700',
        '--ds-color-info-800',
        '--ds-color-info-900',
        // 3. readable ink per tone
        '--ds-color-on-success',
        '--ds-color-on-warning',
        '--ds-color-on-error',
        '--ds-color-on-info',
        // 4. tint ramps per tone
        '--ds-tint-success-4',
        '--ds-tint-success-8',
        '--ds-tint-success-12',
        '--ds-tint-success-16',
        '--ds-tint-success-24',
        '--ds-tint-warning-4',
        '--ds-tint-warning-8',
        '--ds-tint-warning-12',
        '--ds-tint-warning-16',
        '--ds-tint-warning-24',
        '--ds-tint-error-4',
        '--ds-tint-error-8',
        '--ds-tint-error-12',
        '--ds-tint-error-16',
        '--ds-tint-error-24',
        '--ds-tint-info-4',
        '--ds-tint-info-8',
        '--ds-tint-info-12',
        '--ds-tint-info-16',
        '--ds-tint-info-24',
        // 5. bg/border floor per tone (`deriveStatusTintFloor`, guarded per
        //    tone by the same `if (seed)` presence check as 1.-4. above)
        '--ds-color-success-bg',
        '--ds-color-success-border',
        '--ds-color-warning-bg',
        '--ds-color-warning-border',
        '--ds-color-error-bg',
        '--ds-color-error-border',
        '--ds-color-info-bg',
        '--ds-color-info-border',
        // 6. alpha wells per tone (7, not 8: `--ds-color-alpha-info-20` is a
        //    RETIRED channel -- `governance/tokens/decisions/writers/unused/system/index.json`, "executed":
        //    true -- and is never re-emitted from the floor)
        '--ds-color-alpha-success-10',
        '--ds-color-alpha-success-20',
        '--ds-color-alpha-warning-10',
        '--ds-color-alpha-warning-20',
        '--ds-color-alpha-error-10',
        '--ds-color-alpha-error-20',
        '--ds-color-alpha-info-10',
      ],
      compat:
        'opened in place (P0, 2026-08-28): schema + envelope + normalizer with a literal closed vocabulary. Additive and zero-delta — no authored override exists, and every emitter is guarded by `if (seed)`. No `dark` twin and no per-step root: the ramp steps derive from the seed. The sibling path `palette.{success,…}` stays REJECTED, so opening the axis widened nothing by accident. The declared radius was WIDENED (W-SOURCE) from 3 channels of one tone to 68, and again (COH-1, 2026-08-30) from 68 to 83: +8 bg/border and +7 alphas, once `deriveStatusTintFloor` made the four seeds reach them too. Each widening is a correction of the declaration, not a widening of the capability — no emitter, path or vocabulary moved, and an unauthored seed still emits none of the 83.',
    },
    {
      id: 'profiles.icon',
      version: 1,
      tier: 'pro',
      status: 'active',
      evidence: {
        consumer: 'src/graphics/icons/semantic/runtime/create-icon/index.tsx',
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
          'src/components/patterns/runtime/adaptive-layout/presentation/react/index.ts',
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
