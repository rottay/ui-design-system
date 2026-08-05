/**
 * The Management — a REALISTIC tenant theme row, authored in the DB contract.
 *
 * WHY THIS EXISTS. Every "DB tenant" proof in the tree until now built its
 * payload by projecting a static `BrandTheme` fixture through
 * `brandThemeToTenantAppearance()`. That proves the compiler is deterministic;
 * it does NOT prove a customer can express a distinct product through the
 * document a customer actually writes. The projection starts from a ~140-field
 * code-owned object and narrows; a customer starts from an empty JSONB row and
 * fills in the handful of fields the console exposes. Those are different
 * experiments, and only the second one answers "can a DB tenant look like a
 * different system?".
 *
 * So this fixture is authored FORWARD, in the document's own vocabulary:
 * `TenantThemeAdvancedDocument`, the exact JSONB payload the tenancy row
 * stores, plus the trusted identity columns the read path supplies. Nothing is
 * derived from `themanagementmiami`'s BrandTheme — that file supplied the
 * DESIGN INTENT (Art Deco geometry, warm earth palette, editorial serif), and
 * the values below are its expression through the customer-facing contract.
 *
 * WHAT IT IS NOT. Not a runtime tenant: it is never registered in
 * KNOWN_TENANTS, never compiled into a shipped CSS bundle, and never a second
 * source of truth for identity. It is a test/canary specimen, exactly like the
 * BrandTheme fixture beside it, and it must stay explicit-only.
 *
 * WHAT IT PROVES when compiled through `compileTenantTheme`:
 * 1. The document validates against the closed schema (fail-closed intake).
 * 2. Every axis a customer can reach is reachable from the DOCUMENT, not only
 *    from a BrandTheme.
 * 3. The resulting artifact diverges from bithire's static baseline on the
 *    axes a human perceives first — type, radius, density, elevation, motion,
 *    chrome — while sharing one component tree.
 *
 * DIVERGENCE IS DELIBERATE AND ORTHOGONAL TO BITHIRE. Per the owner decision
 * of 2026-07-09 there is no convergence requirement between tenants in the
 * same vertical. Where bithire is cool, bordered, sans and operational, this
 * row is warm, shadow-led, serif and editorial.
 */

import type {
  TenantThemeAdvancedDocument,
  TenantThemeConfigIdentity,
} from '../..';
import { TENANT_THEME_SCHEMA_VERSION } from '../..';

/**
 * The JSONB payload exactly as it would be persisted in the tenant theme row.
 *
 * `mode: 'advanced'` because the row exercises `recipeProfile` and a chrome
 * section; a `simple` row would carry only `appearance`. Identity and
 * `rowVersion` are deliberately ABSENT — they are trusted row columns, not
 * customer-writable JSON, and the contract keeps them out of the document so a
 * customer can never restate them.
 */
export const THEMANAGEMENT_TENANT_THEME_DOCUMENT: TenantThemeAdvancedDocument =
  {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    mode: 'advanced',
    visualFoundation: {
      general: {
        palette: {
          // R1 Cohort 1: Monochrome Executive Ledger. The teal/sandstone/terracotta
          // trio was a declared MIGRATION INPUT, not a target -- the art-direction
          // contract names it as this tenant's leading contradiction, and its
          // forbiddenOutcomes rule out presenting a warm Art Deco recolor as the
          // new direction. The ledger is black, white and paper: ink carries
          // hierarchy, paper carries the ground, and no hue competes with either.
          //
          // Paper is retained deliberately. The north star is "paper-toned", not
          // pure white, and the warm-neutral ground is what keeps the result a
          // working dossier rather than a bleached SaaS canvas.
          //
          // Semantic status colour is NOT touched here: draining success/warning/
          // error to grey is a named forbiddenOutcome. Status meaning keeps its
          // governed hue and rides the non-colour cue relay on top.
          primary: '#1A1A18',
          secondary: '#4A4843',
          accent: '#2E2C28',
          background: '#F6F3EC',
          foreground: {
            primary: '#141412',
            secondary: '#3D3B36',
            muted: '#6E6B63',
            disabled: '#A6A29A',
          },
          border: {
            primary: '#2A2824',
            secondary: '#C9C3B6',
          },
          backgroundMode: 'light',
        },
        typography: {
          // Editorial serif display is the fastest-perceived divergence from
          // bithire's system sans. `typePairing` is the governed preset; the
          // explicit families win over it and are stated for determinism.
          typePairing: 'editorial',
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          scale: 1.04,
        },
        shape: {
          // Deco-crisp: the tightest radius ramp the envelope allows.
          //
          // FINDING (R1.1, 2026-07-26): numeric axes are clamped TWICE -- by
          // the global schema ([0.75, 1.25] here) and again, more tightly, by
          // the owning vertical envelope. Authored values of 0.72 and then 0.75
          // were both REJECTED; bithire allows only [0.8, 1.2].
          //
          // That second clamp is the real bound on white-label reach. For a
          // bithire tenant the numeric axes move by at most:
          //   typeScale  +/- 8%    radiusScale +/- 20%
          //   density    +/- 15%   effectIntensity 0..0.65
          // Those ranges are subtle by construction, so a "different system"
          // impression cannot come from geometry. It has to come from palette,
          // font family and chrome -- which is precisely why the platform reads
          // today as one product re-skinned rather than two systems.
          buttonStyle: 'sharp',
          radiusScale: 0.8,
        },
        // Motion: 'short, crisp and mechanical; no spring, bounce or
        // shimmer-led personality'. The document authored NO motion at all, so
        // this tenant inherited the vertical's softer cadence and its skeleton
        // kept a sweeping shimmer -- a named contradiction for a ledger, which
        // should STEP rather than glow. Low intensity with a fast duration scale
        // is the snap posture, and both sit inside the bithire envelope
        // (intensity 0..0.8, durationScale 0.75..1.35).
        motion: {
          intensity: 0.15,
          durationScale: 0.8,
        },
        density: 'spacious',
        surfaces: {
          // R1 Cohort 1: separation moves from SHADOW to RULE. The ledger
          // divides space with lines and ground changes, the way a dossier
          // does; an elevated card floating over paper is the SaaS idiom this
          // direction exists to reject, and "round elevated cards" is a named
          // forbiddenOutcome.
          // ABSENT-OR-HARD, and this direction takes HARD. Driving the posture
          // to 'flat' with intensity 0 made this tenant emit nothing on the
          // `--ds-elevation-*` channel -- which collided with BitHire's
          // border-led flatness and collapsed a divergence axis instead of
          // creating one. The canary caught exactly that.
          //
          // The ledger keeps a CONCRETE elevation channel so both tenants speak
          // the same vocabulary, and its hardness comes from the shadow tokens
          // below: offset rules with zero blur, not soft ambient bloom.
          elevation: 'elevated',
          // Low but non-zero. Zero silences the elevation channel entirely;
          // this keeps the channel alive at ledger strength while staying far
          // from BitHire's softer resting lift.
          effectIntensity: 0.2,
        },
        navigation: {
          sidebarTone: 'inverse',
        },
      },
      // Structural chrome is authored through the same finite tenant contract
      // as palette and type. Omitting this block made the product canary prove
      // only a reskin: the compiler had no instruction to project the
      // data-anatomy-* attributes its Modern skins already consume.
      advanced: {
        chrome: {
          cardComponent: { anatomy: 'underline' },
          table: { anatomy: 'open' },
          sidebar: { anatomy: 'panel' },
          layout: { anatomy: 'floating' },
        },
        // R1 Cohort 1: the expressive axes this row never authored.
        //
        // FINDING. Before this, the document authored NO expressive axes at
        // all, which left the EDGE axis measurably SILENT: BitHire emits
        // --ds-edge-{emphasis,hairline,standard}-width from its profile and
        // this tenant emitted none. No --ds-edge-* or --ds-divider-* token is
        // in TENANT_THEME_OVERRIDE_TOKENS, so `advanced.profiles` is the only
        // route to an axis this direction is actually built on -- "visible
        // black or graphite rules", "hairline internal dividers, stronger
        // region keylines".
        //
        // edge: 'ruled' emits standard 1px / hairline 1px / emphasis 2px
        // against BitHire's hairline 1px/1px/1px, so exactly ONE channel
        // becomes comparably different: the region keyline. That is the
        // direction's DEFAULT posture. 'inset-double' was rejected: it promotes
        // the "OCCASIONAL double or offset editorial rule" to a 3px double
        // STANDARD, which misreads "occasional" and turns to geometry noise at
        // 320px. The occasional double rule is composed locally at true
        // editorial moments from the emphasis/divider vocabulary.
        //
        // material: 'paper' is named verbatim by this direction ("flat paper
        // and ink") and moves three more comparable channels against BitHire's
        // 'flat': card-highlight, card-texture and panel-texture. Because the
        // palette is monochrome and effectIntensity is 0.2, the emitted tints
        // land near 0.6-0.8% ink -- paper grain, not colour.
        //
        // NOT AUTHORED, and this is deliberate:
        //   elevation -- 'flat' emits --ds-elevation-lift-strength: 0, and
        //     BitHire's 'hairline-lift' ALSO emits 0. Authoring it would make
        //     the two tenants agree on that channel and COLLAPSE the axis,
        //     which is the exact failure the elevation canary caught once
        //     already. Depth divergence is carried by the hard-offset shadow
        //     overrides below, which measure as seven comparably differing
        //     channels.
        //   type -- 'editorial' emits
        //     --ds-type-numeric-font-variant-numeric: oldstyle-nums. Oldstyle
        //     figures do not align in a column, which contradicts this
        //     direction's own "precise numbers / aligned numbers / tabular
        //     accents" law. The editorial TYPE posture is composed through the
        //     typography fields above instead. Recorded so a later cohort does
        //     not "fix" this by selecting the obvious-looking axis.
        //   motif -- canvas and shell territory; it belongs to the AppShell
        //     canary's cohort, and BitHire emits nothing for motif:'none', so a
        //     one-sided motif is real-but-noncomparable divergence to bank
        //     later rather than claim now.
        profiles: {
          edge: 'ruled',
          material: 'paper',
          icon: 'linear',
        },
        // R1 Cohort 1. These are the EXACT-VALUE route, which the envelope law
        // exempts from the Standard dial clamps -- and they are the only way
        // this tenant reaches square, because `radiusScale` bottoms out at 0.8
        // of the base ramp and never arrives at a ledger corner.
        //
        // Every name here is in TENANT_THEME_OVERRIDE_TOKENS; nothing new is
        // minted, and no compiler change is required.
        tokenOverrides: {
          // Square, with 2px kept at the largest step so overlays read as cut
          // paper rather than as knife-edged boxes at big radii.
          '--ds-radius-sm': '0px',
          '--ds-radius-md': '0px',
          '--ds-radius-lg': '1px',
          '--ds-radius-xl': '2px',
          // Shadows present but HARD: an offset rule, not a soft bloom. This is
          // the dossier's drop-rule, and it survives grayscale, which a blurred
          // ambient shadow does not.
          '--ds-shadow-sm': '1px 1px 0 0 rgba(20, 20, 18, 0.18)',
          '--ds-shadow-md': '2px 2px 0 0 rgba(20, 20, 18, 0.20)',
          '--ds-shadow-lg': '3px 3px 0 0 rgba(20, 20, 18, 0.22)',
          '--ds-shadow-xl': '4px 4px 0 0 rgba(20, 20, 18, 0.24)',
          // Glass is forbidden for this direction. Zero blur plus an opaque
          // paper fill turns every scrim and popover ground into stock.
          // FLAT PAPER. The modern spec's 'surface-tint' role paints a
          // barely-there vertical luminance gradient on hero surfaces, cards and
          // panels via --ds-gradient-surface, scaled by --ds-effect-intensity.
          // At this tenant's 0.2 intensity it still read as a soft wash on the
          // modal panel and the loading card -- 'glossy gradients' and 'soft
          // floating-card soup' are named forbiddenOutcomes for the ledger, whose
          // material law is 'flat paper and ink'. The spec's own resolution is
          // that the engine provides the mechanism and the vertical chooses the
          // form, so this direction chooses none. No code change is required:
          // --ds-gradient-surface is an allowlisted tenant token.
          // Overlay and raised keylines. The skins adopted the edge-axis chain,
          // but a chain only diverges once the tenant AUTHORS its end: without
          // these the drawer, modal, popover and dropdown all fell through to
          // the same subtle default and measured byte-identical across tenants.
          // Re-keying is necessary and never sufficient -- the same lesson the
          // segmented group taught.
          // OVL-PV-01/02: the ledger forbids glossy gradients, and the overlay
          // highlight channel is what the popover sheen and its title sheen now
          // resolve through. Authoring it to none is how this direction turns
          // both off without a component branch or a tenant selector.
          // IMAGE-position channel at this consumption site.
          //
          // A PREVIOUS VERSION OF THIS COMMENT WAS WRONG and is corrected here.
          // It claimed `highlight` and every `shadow*`/`focus-ring` channel are
          // shadow-list-item typed repo-wide, and that `none` is therefore never
          // a valid authored value for them. That is false:
          //   - semantic-surface.css DELIBERATELY declares material-<role>-highlight
          //     DUAL-TYPED — a standalone box-shadow AND an independent
          //     background-image — and documents `none` as the valid flat-material
          //     OFF value. Seven roles read it exactly that way.
          //   - control and card shadow roles are WHOLE box-shadow values, and this
          //     very fixture validly authors five of them to `none`.
          //   - the schema types all of these as generic VISUAL, not by suffix.
          // A suffix-based ban on `none` would therefore break contracts that are
          // correct today.
          //
          // The real unsoundness is USAGE-SITE specific, not token-name specific:
          // Dropdown, Drawer and Modal splice a publicly none-capable
          // overlay-highlight into a COMMA SHADOW LIST, where `none` is only a
          // whole-value keyword and so voids the entire declaration. Enforcement
          // must derive from the declared role and its consumption contract, never
          // from the token's name. Pending adjudication.
          '--ds-material-overlay-texture': 'none',
          '--ds-material-overlay-border': '#2A2824',
          '--ds-material-overlay-border-strong': '#141412',
          '--ds-material-raised-border': '#2A2824',
          '--ds-gradient-surface': 'none',
          '--ds-glass-blur': '0px',
          '--ds-glass-bg': 'rgba(246, 243, 236, 0.97)',
          '--ds-glass-border': 'rgba(42, 40, 36, 0.28)',

          // ---- SEMANTIC SURFACE ROLES (R1 Cohort 1) ----
          //
          // WHY THESE EXIST. Re-keying the skins onto the governed
          // `--ds-material-{role}-*` vocabulary was necessary but not
          // sufficient: those channels are declared on `:root` as derivations of
          // seeds like `--ds-surface-control`, and NO seed of that kind is
          // tenant-writable. So a re-keyed family still resolved to whatever the
          // VERTICAL baseline supplied, which is exactly how a monochrome tenant
          // kept rendering a pale-blue segmented track and blue-washed quiet
          // controls. The role channels ARE in TENANT_THEME_OVERRIDE_TOKENS, so
          // authoring them here is what finally makes the group follow this
          // tenant.
          //
          // Authored to the MINIMUM: only where the derived value contradicts
          // the direction. Rest shadows are already `none` at the role default,
          // so authoring them would be a dead override and pure cap waste.

          // GROUND vs FACET — the split that makes this work.
          //
          // The resting GROUND of a surface role is authored through
          // `--ds-surface-{role}`, which is the canonical ground authority and is
          // in the allowlist for all eight roles. The `--ds-material-{role}-*`
          // family carries STATES and FACETS (hover/active/selected/disabled
          // grounds, borders, shadows, focus ring, highlight, texture) and
          // deliberately excludes a base `-background`: the role channel derives
          // it from the surface seed, so authoring both would be two authorities
          // for one value.
          //
          // Authoring the four seeds below is what finally makes the re-keyed
          // families follow this tenant. Re-keying segmented and the quiet button
          // variants onto `--ds-material-control-*` was necessary but not
          // sufficient, because that channel resolves through
          // `--ds-surface-control` — which, unauthored, leaked from the VERTICAL
          // baseline and kept a monochrome tenant rendering a pale-blue track.
          '--ds-surface-control': '#F6F3EC',
          '--ds-surface-inset': '#FFFFFF',
          '--ds-surface-panel': '#F1EDE4',
          '--ds-surface-card': '#FFFFFF',

          // Control group states and facets.
          '--ds-material-control-background-hover': '#EDE9DF',
          '--ds-material-control-background-active': '#E4DFD2',
          '--ds-material-control-border': '#2A2824',
          // THE INVERSION IS DELIBERATELY NOT AUTHORED, and that is a FINDING.
          // Authoring '--ds-material-control-background-selected': '#141412' does
          // deliver the black fill -- verified in capture. But the role matrix has
          // NO 'foreground-selected' channel, so the selected label still resolves
          // through '--ds-material-control-foreground', which for a monochrome
          // tenant is also ink. The result was black-on-black: the selected
          // segment labels became invisible. Shipping an illegible selected state
          // to gain a divergence axis is strictly worse than missing the axis, so
          // the fill override is withdrawn until the ink half has a home. Per the
          // advisor that half belongs to the emphasis leg, NOT to a newly minted
          // role channel. Recorded as DEF-06.
          // The muted foreground below IS safe: it only moves unselected item text
          // off BitHire's cool grey onto the ledger's warm grey.
          // SELECTED STATE — solved without a foreground-selected channel.
          // The direction wants an unmistakable selected marker; the trap was
          // reaching for an INK fill, which needs a white-ink half the role
          // matrix has no channel for. A light WARM ground plus a graphite rule
          // gets the same 'explicit marker, not hue' result while staying legible
          // against the ink the family already resolves. Paper-active is the
          // ledger's own pressed tone, so the selection reads as a stamped cell.
          '--ds-material-control-background-selected': '#E4DFD2',
          '--ds-material-control-border-selected': '#2A2824',
          '--ds-material-control-foreground-muted': '#6E6B63',
          // No lift on selection: the ledger marks state with fill and rule.
          '--ds-material-control-shadow-selected': 'none',
          '--ds-material-control-border-strong': '#141412',
          // MANDATORY, not optional: the role default for hover is a soft
          // `--ds-shadow-sm` bloom, and soft floating depth is a named
          // forbiddenOutcome for this direction. Hover feedback here is the ink
          // wash above plus the rule, never a lift.
          // CTRL-04. Now that the engine-tier button shadow defaults are deleted
          // and the skin arms carry the role fallback, this channel finally
          // REACHES the control group. A ledger control is flat at rest -- the
          // modern spec's own posture, since it defines hover as +1 elevation
          // step -- and its hover answers with ink wash and rule, never lift.
          '--ds-material-control-shadow': 'none',
          '--ds-material-control-shadow-active': 'none',
          '--ds-material-control-shadow-hover': 'none',
          // Hard ring, zero blur — the ledger's focus marker.
          '--ds-material-control-focus-ring': '0 0 0 2px #141412',

          // Inset group — the field well.
          '--ds-material-inset-border': '#C9C3B6',

          // Panel and card grounds — these carry the lifecycle families. The
          // skeleton shimmer reads them, which is why a blue wash survived on a
          // paper tenant until they were authored.
          '--ds-material-card-shadow': 'none',
          '--ds-material-card-shadow-hover': 'none',
        },
      },
      // A governed SELECTION, not a definition: the compiler validates this id
      // against the closed first-party registry and drops anything unknown.
      // An authored 'editorial' was REJECTED -- ids are versioned and namespaced.
      //
      // FINDING (R1.1, 2026-07-26) said the registry's two profiles both miss
      // this tenant (it wants editorial TYPE with sharp GEOMETRY) and kept the
      // editorial profile on the reasoning that "sharp geometry is already
      // carried by `shape.buttonStyle` + `radiusScale`".
      //
      // CORRECTION (R1 Cohort 1): that reasoning does not survive the profile's
      // own shape default, and the consequence is a forbiddenOutcome.
      //   - the engine reads `buttonProfileDefaults.shape` and stamps it
      //     (`Button/engines/modern/index.tsx`),
      //   - `editorial-round@1` sets `button.shape: 'round'`,
      //   - the modern skin routes `[data-shape='round']` straight to
      //     `border-radius: var(--ds-radius-full)`, bypassing the size radii,
      //   - and `--ds-radius-full` is NOT in TENANT_THEME_OVERRIDE_TOKENS.
      // So while this document selected the editorial profile its buttons were
      // pills that NO allowlisted override could square, and "pill-first recipe"
      // is a named forbiddenOutcome for this direction. `radiusScale` cannot
      // rescue it either: the bithire envelope clamps that axis to [0.8, 1.2].
      //
      // technical-sharp@1 is therefore selected for GEOMETRY (square silhouette,
      // outlined containers, ruled data surfaces -- the ledger posture). The
      // editorial TYPE the earlier finding wanted is not lost with it: it is
      // authored directly above by `typePairing` plus the explicit Fraunces
      // display family, which win over profile type recipes.
      recipeProfile: 'rottay/technical-sharp@1',
    },
  };

/**
 * The trusted row columns the read path supplies alongside the JSONB payload.
 *
 * Kept separate from the document on purpose: joining them is the reader's
 * job, and a test that hands the compiler one object must be seen to have
 * assembled it from the two halves the database actually stores.
 */
export const THEMANAGEMENT_TENANT_THEME_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: '3f1a9c52-7b4e-4d18-9a63-2c8f5e0d7146',
  slug: 'themanagement',
  verticalKey: 'bithire',
  rowVersion: 8,
};

/** Structural selections the compiled artifact must project onto the root. */
export const THEMANAGEMENT_TENANT_THEME_EXPECTED_ANATOMY = {
  'data-anatomy-card': 'underline',
  'data-anatomy-table': 'open',
  'data-anatomy-sidebar': 'panel',
  'data-anatomy-layout': 'floating',
} as const;
