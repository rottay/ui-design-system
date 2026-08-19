# Rottay Design System Architecture

This document defines the **target architecture** of `@rottay/design-system`:
what exists, what each folder is for, and how every part relates to the others.
It is the normative reference — the law the tree is held to — not a snapshot of
whatever happens to be on disk today.

How to read it:

- **The tree in §2 is the destination.** Every owner listed there has exactly
  one stated purpose and one reason to exist. Anything on disk that has no
  place in this tree is debt scheduled for removal; §3 summarizes the delta
  and points to the adjudication evidence.
- **§1.11 lists target law not yet materialized.** Everything outside that
  subsection already holds today or is a pure reorganization.
- **Counts are stated only where a gate or manifest enforces them**
  (18 chart families, 282 icon roles). Prose counts rot; mechanical counts do
  not.
- Component counts per tier and family names are generated in
  [`packages/core/docs/TAXONOMY.generated.md`](../packages/core/docs/TAXONOMY.generated.md);
  the operative work queue lives in [`roadmap/`](../roadmap/). Historical
  audits are snapshots preserved under [`docs/history/`](history/) and are not
  current source-path references.

---

## 1. Doctrine

### 1.1 Source ownership

`packages/core/src` is a dependency and ownership tree, not a flat catalog.

```text
src/
  foundation/       Contracts, kernels, presets, i18n and tokens
  infrastructure/   Compilers and browser/React runtime orchestration
  graphics/         Icons, brand marks, pictograms and motion
  ui/               Primitives -> patterns -> structures -> surfaces
  tooling/          ESLint, testing, declarations and program machinery
  entrypoints/      Classified package-subpath boundaries
  index.ts          Package-root facade; the only loose source-root file
```

The first five directories are the canonical architectural roots.
`entrypoints/` is package-boundary support, not a sixth tier. Each subpath is a
`folder/index.ts` owner that forwards to canonical implementation code.

At the macro level, dependencies flow toward the product edge:

```text
foundation -> infrastructure/compilers -> infrastructure/runtime
foundation + infrastructure + graphics -> ui
primitives -> patterns -> structures -> surfaces -> consuming app
```

Within a capability, lower branches precede higher branches:

```text
foundation|kernel|contracts|policy|quality|spec|validation
  -> runtime
  -> composition|react
  -> presentation
  -> facade|public
```

### 1.2 Physical tree rules

**The universal law: everything is `folder/index`, everywhere.** Not only
`src/`: scripts, tooling, docs, data and evidence follow the same rule. A
loose file tells you nothing; a declarative chain of folders tells you what
the thing is before you open it. The target reader is a non-technical person:
**the path is the documentation.**

- Authored units use `folder/index.ts[x]` (source), `folder/index.mjs`
  (scripts), or `folder/` with exactly one self-evident artifact (data/docs).
- No loose authored files at any root: not the repo root, not a package root,
  not the scripts root, not a group directory. Toolchain files a tool resolves
  by convention (`package.json`, `tsconfig.json`, `*.config.ts`, `.gitignore`…)
  are the only exception, and they stay at the root that tool requires.
- `packages/core/src/index.ts` is the only loose file at the source root.
- Two or more related units gain a named family directory; a family name never
  repeats inside its children (`tokens/channel-parity/`, not
  `tokens/tokens-channel-parity/`).
- A barrel may aggregate child owners but does not share its level with loose
  authored peers.
- Tests live in the owning unit's `tests/` branch; cross-owner tests live under
  explicit `integration/` or `architecture/` owners.
- A gate's baselines, allowlists and sealed evidence live **inside the gate's
  own folder** (`<capability>/baseline.json`), never loose in a shared root.
- Generated files, declarations, fixtures, examples, stories and registered
  package entrypoints are classified exceptions, not patterns for product code.
- Generic ownership segments such as `_internal`, `internal`, `misc`, `shared`,
  `utils` and `hooks` are forbidden. Name the capability instead.
- Physical moves preserve public exports and package subpaths; private
  compatibility shims are not left behind.
- **The label does not retire.** `@deprecated`, "canonical", "historical" and
  "legacy" in a docstring are debt dressed as decision unless a command fails
  when the declared-dead artifact stays reachable. Every such declaration
  carries a removal lot or a mechanical check.

The executable law is:

```bash
pnpm --filter @rottay/design-system structure:check
```

The structure baseline is decrease-only. Never absorb a new finding merely to
make the gate pass.

### 1.3 UI composition stack

The four `ui/` tiers have one dependency direction:

1. `primitives/` — engine-switched leaf components.
2. `patterns/` — reusable task compositions; engine-backed only when rendering
   genuinely differs by engine.
3. `structures/` — page chrome and structural families that wrap or accompany
   patterns.
4. `surfaces/` — declarative, page-level recipes consumed by applications.

Each tier also has classified support owners — `foundation/`, `runtime/`,
`facade/`, `tests/`, and (in `patterns/`) `tooling/` — which hold the tier's
shared contracts, headless kernels, declared cross-group composition surfaces,
stories and contract tests. They are not component families and never create
inventory rows.

Tier decision rules:

| If the piece... | it belongs in... |
|---|---|
| Is a leaf component with an engine switch | **primitives** |
| Solves a generic reusable task (table, form, chart) | **patterns** |
| Wraps or accompanies a pattern as page chrome | **structures** |
| Describes a whole page as a config object | **surfaces** |
| Depends on a business domain, route, API or copy | **the consuming app** |

One capability, one owner. Where the same job exists twice (a pattern and a
structure, two primitives), one is canonical and the other is retired or
migrated; the delta in §3 names each case. A pattern that shares a name with a
primitive must compose it — today only `tree-view` (→ `Tree`) and
`step-wizard` (→ `Steps`) satisfy this; `calendar-view` and `timeline` are
target law, tracked in §1.11/§3.

If a piece requires candidate, company, role, tenant, event or other product
semantics, it belongs to the consuming application. The DS owns reusable,
domain-agnostic behavior and presentation contracts.

### 1.4 Engine model

There are three physical engines:

| Engine | Physical implementation |
|---|---|
| `modern` | Rottay-native token/skin presentation — the product engine |
| `classic` | Ant Design-backed enterprise presentation — compatibility |
| `rustic` | Vanilla React/CSS fallback — compatibility |

`modern` is the engine under active uplift; `classic` and `rustic` are kept for
compatibility coverage. New visual capability lands on `modern` first.

`custom` is a pack-scoped registry identity, not a fourth implementation tree.
It renders a registered component when available and otherwise delegates to a
configured physical fallback.

An engine-backed component keeps its stable facade at the component owner and
may add only the branches it needs:

```text
Component/
  index.tsx
  contracts/index.ts
  runtime/<capability>/index.ts
  engines/{classic,modern,rustic}/index.tsx
  compound/<Part>/index.tsx
  tests/*.test.tsx
```

### 1.5 Tenant and white-label authority

There are two authority classes:

- Code-owned vertical baselines (`rottay`, `bithire`, `evnto`) are static-first.
  Their TypeScript `BrandTheme` sources compile into generated CSS artifacts.
  The three baselines are **mirror themes**: identical channel surface,
  identical names, different values. Mirror parity is a blocking assertion,
  not an aspiration.
- Published customer tenants are DB-owned. A hostname chooses tenant identity,
  never a checked-in CSS file or component branch.

`Theme` is the single theme contract (`BrandTheme` survives only as a
deprecated compatibility alias). Both static and DB transports resolve to the
same complete Theme and enter **one lowering**:
`infrastructure/compilers/kernel/runtime/brand-theme/`. There is no second
compiler.

The productive customer path is:

```text
hostname -> canonical tenant identity -> published TenantThemeDocument in DB
  -> schema/envelope validation -> server compiler/cache
  -> exact artifact embedded by SSR
  -> hydration with visualAuthority="compiled-artifact"
```

Browser components never query the DB. The provider supplies tenant, locale,
features, motion and component context but emits no competing visual layer in
`compiled-artifact` mode. The six-stage
`registry -> memory -> localStorage -> static -> API -> generic config`
resolver remains a compatibility and development config chain; it is not the
productive visual-authority chain.

The full contract and failure rules live in
[`packages/core/docs/TENANT_MODEL.md`](../packages/core/docs/TENANT_MODEL.md).

### 1.6 The visual cascade

The visual system has **few named cascade roots with a closed vocabulary of
named variants**, governed by the Modern Rescue manifest
(`manifest/controls/`, `manifest/cascade/`). Component channels never hardcode
decisions and never dangle: every component-level channel resolves through the
chained-fallback pattern

```css
var(--ds-<component>-<channel>, var(--ds-<root>))
```

so a single root decision reaches every component that does not override it.
A per-component channel with no path to any root is debt, and the orphan count
is a decrease-only ratchet. A theme assigns each root a named variant; a closed
enum without values is a hole, not an open type.

The canonical custom-property prefix is `--ds-`. The `--ds_` prefix is the free
experimentation space and must never reach a published artifact. Component-local
private variables use the `--_ds-*` prefix (today 388 declarations over 184
unique names, spanning engine skins and component presentation CSS); they are
internal wiring, never a customization surface.

### 1.6.1 Where customization lives (and what "improving a primitive" means)

Nobody edits a primitive to change how it looks — not the consumer, and not the
DS when theming. The division of labor inside every modern component:

- The **TSX** owns structure and anatomy only: it stamps `data-part`,
  `data-state`, `data-variant` and interaction state. It holds no visual
  values.
- The **skin** (`tokens/css/runtime/engines/modern/skin/<component>.css`) owns
  all paint and geometry, reading channels with chained fallbacks against the
  anatomy selectors. Skins are DS-owned; tenants never edit them.
- The **tokens** own the values. A tenant moves a dial or a seed; the single
  lowering compiles the artifact; the skins read it. Re-theming is an artifact
  swap, not a code change.

Improving the modern engine is therefore three mechanical work classes, none of
which is a rewrite:

1. Wire every bare channel to its root (skin-side fallback work, per family).
2. Move residual inline `var(--ds-*)` reads out of engine TSX into the
   component's skin (measured debt; the census is decrease-only).
3. The per-family craft pass (motion, elevation, interaction states), written
   against roots — never against literals — once the cascade is live.

Touching an engine TSX is legitimate only to add an anatomical part or a
variant axis; channels created that way enter under the fan-out brake.

### 1.7 Icons and brand assets

Functional icons are supplier-independent. Product code uses semantic role
names through the stable `Icon` facade; the generated corpus contains **282
governed roles** (the count is enforced by the corpus manifest). Phosphor is
the pinned default supplier behind the adapter/generator boundary; Lucide is
not the default and vendor-shaped exports are compatibility-only. Applications
must not import Phosphor, Lucide or Ant icon packages directly — the ESLint
boundary enforces it.

Brand and cloud-provider identity uses the separate `marks` API: a closed
catalog rendered through `@thesvg/react`, confined to
`graphics/brand-marks/runtime/adapters/`. Pictograms are a distinct asset
class: a fixed corpus of explanatory artwork with domain-agnostic names.
Tenants may provide an approved company logo, but cannot replace functional
glyph semantics or select an arbitrary supplier.

### 1.8 Charts and responsive behavior

The chart catalog contains 18 D3-backed families. They are token-aware,
personality-driven and accessible; chart semantics, renderer choice and
provenance remain code-owned. Customer tenants may change the bounded category
palette but not the renderer or data meaning.

Responsive behavior is adaptive, not a request to squeeze the desktop view
onto a small screen. CSS handles continuous layout changes; responsive runtime
contracts select a reduced mobile information hierarchy when content or
interaction must change.

### 1.9 Public boundaries

**The package root barrel is the primary public way.** Applications import
components, hooks, contracts and runtime API from `@rottay/design-system`;
the root barrel carries an explicit API list — an owner exporting a symbol
does not mean the package publishes it.

Classified subpaths expose cross-cutting capability boundaries, each backed by
an owner under `src/entrypoints/`:

```text
./server            Server-safe tenant resolution and validation (no React)
./styles/*          CSS bundles per vertical and engine
./icons (+corpus, ./icons/roles/*, presets)  Governed icon packs
./marks (+brand, ./marks/cloud)              Brand/cloud identity marks
./pictograms        Fixed explanatory artwork corpus
./charts (+spec, access, renderers)          Chart kernel and contracts
./motion  ./effects ./spatial (+spec)        Motion, effect and spatial contracts
./eslint            The governance ESLint plugin
./fonts/*           Opt-in self-hosted font packs
./supplier-contract  ./supplier-honesty-cli  App-side distribution gates
```

Granular per-tier subpaths (`./primitives/*`, `./patterns/*`,
`./structures/*`, `./surfaces/*`, `./contracts/*`, `./runtime/*`) are not the
way and are retired. There is no `./commercial` subpath: "commercial" is a
marketing adjective, not an architectural role; any capability behind such a
name is reclassified by what it does.

Every declared `exports` target must exist as a build artifact. The boundary is
honest or the build fails — never pointed at files the build does not produce.

### 1.10 Governance

- `packages/core/scripts/` holds the mechanical governance: gates, censuses,
  generators and evidence. Every gate is wired or it does not exist; the
  legitimate wiring channels are `ci-gates.manifest.mjs`, the npm lifecycle
  hooks (`prebuild`/`postbuild`/`prepack`) and `.github/workflows/ci.yml`, and
  the wiring gate counts all three. Every test is reachable by a runner glob
  or it does not exist.
- `roadmap/registry.json` is the operative backlog with mechanical state;
  statuses change only via `scripts/roadmap-status.mjs`.
- Codemods are single-use and declare their expiry; a codemod whose target path
  no longer exists is deleted on sight.
- A document that describes something that no longer exists is corrected the
  same day or removed.

### 1.11 Target law not yet materialized

Everything below is decided direction with the build-out tracked in
[`docs/ROADMAP-DE-REMEDIACION.md`](ROADMAP-DE-REMEDIACION.md) while it remains
operative:

- Cascade roots exist as real variables in the `modern` base layer and orphan
  channels are wired to them (§1.6 today holds only for governed families).
- Mirror-theme parity is a blocking gate (§1.5).
- The closed control vocabulary is complete (no empty enums) and phase-1
  adjudications live in the governed manifest field (§1.6).
- The exports→artifact gate enforces §1.9 mechanically.
- The explicit root-barrel API list (§1.9) replaces `export *` aggregation.
- The `--ds_` experimentation-space gate (§1.6) exists.

---

## 2. The target tree

Altitude rule: the tree stops at the **capability owner** — the folder with one
stated purpose. Standard dependency branches (`contracts/`, `runtime/`,
`composition/`, `presentation/`, `facade/`, `foundation/`, `tests/`,
`engines/`, `compound/`) are the grammar of §1.2 and are not listed unless the
branch itself is the capability. `->` marks a non-obvious relation.

### 2.1 Repository

The repo root holds exactly four kinds of things: toolchain manifests the
tools require at root, the entry documents, and first-level folders whose
names say what they contain. Nothing else.

```text
ui-design-system/
  packages/            The two workspace packages: core (the DS) and showroom
  scripts/             Repo-root machinery that is alive and wired:
    roadmap/status/             Only legal way to change a WO state
    roadmap/commercial-status/  Frozen copy for the isolated commercial lane
    boundaries/dependency-honesty/   CI gate: apps resolve declared DS paths
    provenance/effect-registry-audit/  CI gate: effect provenance registry
  roadmap/             Canonical backlog (6 lanes + registry.json + STATUS.md)
  roadmap-commercial/  Isolated commercial program, frozen by owner decision
  docs/                This document, the execution roadmap, history/
  .github/workflows/   The single CI pipeline
  .changeset/          Versioning machinery
  package.json  pnpm-workspace.yaml  pnpm-lock.yaml  .npmrc  .gitignore
  CLAUDE.md  AGENTS.md  README.md  LICENSE
```

Everything else that once lived at root is gone or moved: historical `.md`
files to `docs/history/` (they are evidence, not authority), dead codemods and
audit leftovers removed, `coverage*/` and stray tarballs deleted,
`test-artifacts/` unified into the package tree (§3), `.claude/` local config
untracked.

### 2.2 `packages/core/` — the package

```text
packages/core/
  src/                 The design system itself (§2.3–§2.8)
  scripts/             Mechanical governance of the DS (§2.9)
  manifest/            THE customization constitution: the 20 tenant dials
                       (controls/), the 63 cascade roots (cascade/), recipe
                       groups, family inventory cells, schema and index —
                       graduated out of the program directory (§3); kept fresh
                       by blocking gates, never hand-edited outside its generator
  contracts/           Published data contracts, one file per contract:
                       supplier-contract, hooks-manifest,
                       public-entrypoints.manifest, tenant-theme-canary-fixtures
  styles/              Generated committed CSS artifacts (not published;
                       exports point at dist/): index, rottay, bithire, evnto,
                       modern
  docs/                Package docs: TENANT_MODEL.md (tenant authority law),
                       TAXONOMY.generated.md (generated inventory),
                       GETTING_STARTED, ENGINE_SPLITTING, PERFORMANCE_BUDGET,
                       reference/ (API), runtime/ (engine mechanics annexes),
                       history/ (closed audit snapshots)
  tokens/controls/     Generated customization-controls catalog (do not hand-edit)
  provenance/          Third-party sources and licenses (effects, graphics)
  consumer/            ds-supplier-honesty gate, distributed to apps byte-exact
  test-artifacts/      The single versioned evidence tree for gates
  dist/                Build output; every exports target must exist here
  README.md  CHANGELOG.md  THIRD_PARTY_NOTICES.md  package.json  configs
```

The program-scoped worklists (`KIMI-*` manifests) live with their program
under `scripts/quality-evidence/programs/modern-rescue/`; the live census
outputs live at their producing capability under `scripts/tokens/`.

### 2.3 `src/foundation/` — vocabulary without upward dependencies

```text
foundation/
  behavior/            Headless component behavior, decided once, read off the DOM
    kernel/anatomy/              The data-part/data-state contract
    runtime/interaction-state/   Single hover/press/focus-ring hook by modality
                                 (-> consumed by engine skins across ui/)
  contracts/           Supplier-neutral type contracts; no rendered code
    kernel/common/               Shared prop mixins and base types
    kernel/engine-identity/      Canonical EngineName union
    kernel/product-profile-identity/  Closed ProductProfileKey union, fail-closed
    kernel/responsive/           Single breakpoint scale and responsive values
    kernel/spatial/              WebGL2-only spatial scene contracts
    kernel/tokens/               Resolved DesignTokens graph types
      personality/  materials/  typography/   Semantic token dimensions
    kernel/verticals/            VerticalManifest: typed vertical identity
    composition/tenants/         The white-label boundary
      capabilities/              Typed registry of every white-label axis
      product-profiles/          Profile contracts between DS defaults and tenants
      themes/                    Runtime loaded-theme state contracts
      themes/iso/                The one total Theme + ingestion-only ThemePatch
      themes/tenant-theme/       Versioned TenantThemeDocument persistence contract
    runtime/engine/  runtime/errors/  runtime/motion/  runtime/effects/
                                 Engine metadata, error taxonomy, motion law,
                                 closed effect catalog governance
    runtime/components/patterns/ Dependency-free data shapes for patterns
  i18n/                React-free internationalization foundation
    kernel/contracts/            Locale set (es/en/pt/fr/ar), provider types
    runtime/catalog/             Locale metadata + translation dictionaries
    runtime/formatting/intl/     Intl formatters: date, number, currency, list
    runtime/resolution/          Normalization, 4-tier translation chain, SSR
                                 lang/dir (-> consumed via leaf subpaths only)
  kernel/              Pure, dependency-free utilities
    accessibility/branding-contrast/  WCAG 2.2 + APCA branding validator
      text-contrast-autocorrect/      APCA auto-correct over compiled variables
    color/contrast/              The single home of luminance/contrast colorimetry
                                 (-> branding-contrast, chart-series, compilers)
    color/oklch/                 OKLCH<->sRGB conversion and gamut mapping
      ramp/                      10-step perceptual tenant ramp from one seed
      chart-series/              Ten categorical chart colors from one seed
    collections/                 ES2020-safe array index helpers
    cryptography/sha-256/        Portable SHA-256 (-> artifact digests)
    geometry/radius-dial/        The one law keeping authored radii on the dial
    math/                        The single clamp/lerp/normalize/remap owner
    performance/                 Shallow props comparison for React.memo
    serialization/               Realm-safe canonical JSON for equal digests
    typography/                  Arabic-safe font-stack policy
  presets/             First-party bundled preset registries
    policy/experience-baselines/ Frozen canonical surface/motion axes per vertical
    product-profiles/            Registry of the five first-party product profiles
    verticals/                   Registry of the three first-party vertical presets
    density/                     DENSITY_PRESETS + DensityMode resolver
    typography-pairings/         Governed font-pairing registry
  tokens/              Single source of truth for visual values
    css/
      facade/entrypoints/        Public CSS bundles and the canonical @layer order
      facade/artifacts/          GENERATED per-vertical tenant CSS (never edited)
      foundation/base/           Core :root token declarations
      foundation/themes/         Default theme: root authority over foundation
                                 channels
      foundation/monochrome/     Perceptually-even 11-step grayscale ramp
      foundation/animations/     Transition, keyframe and stagger motion tokens
      foundation/responsive/     Viewport/language adjustments; the last layer
      foundation/typography/font-packs/  Opt-in self-hosted OFL font packs
      presentation/components/   Per-family token defaults and aliases
        skin/                    Paint for composed pattern/surface families
      runtime/engines/classic/   Token->AntD mapping theme
      runtime/engines/modern/    Token mapping + the modern skin set
      runtime/engines/rustic/    Vanilla engine theme + rustic skin set
      runtime/personality.css    Personality tokens -> component channels
    ts/
      presentation/brand-themes/ Authored BrandTheme sources + identity roster
                                 (rottay, bithire, evnto — mirror themes, §1.5)
      presentation/recipe-profiles/     Closed recipe-profile registry
      presentation/expressive-profiles/ Closed expressive-axis registry
      presentation/responsive-postures/ Three posture profiles, shifted onsets
      runtime/personality/       Personality tokens -> CSS variables resolvers
```

Relations that matter: `contracts/composition/tenants/themes/iso/` is the
single Theme authority consumed by both the static `brand-themes/` sources and
the DB `tenant-theme/` document; `kernel/color/contrast/` is the only place
luminance math exists; `tokens/css/facade/artifacts/` is build output whose
source of truth is `tokens/ts/presentation/brand-themes/`.

### 2.4 `src/infrastructure/` — executes what foundation declares

```text
infrastructure/
  compilers/           Theme/appearance data -> deterministic CSS artifacts
    kernel/foundation/css/appearance-posture/  Semantic-posture -> --ds-* lowering
    kernel/foundation/css/chrome-variables/    BrandChrome -> chrome variables;
                                               the single chrome producer
    kernel/foundation/css/color-math/          Shared CSS color validation
      interaction-floor/  palette-derivations/  readable-ink/
    kernel/foundation/css/scope-projection/    Selector-scope projection
                                               (-> tenant-css renderer)
    kernel/foundation/motion/spring-easing/    Spring -> linear() easing curve
    kernel/foundation/schemas/tenant-theme/    Closed TenantThemeConfig schema,
                                               limits and digests
    kernel/runtime/brand-theme/                THE single Theme->CSS lowering
                                               (§1.5; appearance absorbed here)
    composition/tenant-theme/                  Server-safe document validator +
                                               compiler with vertical envelopes
      migrate-v1/  version/                    Total v1 migration; compiler stamp
    runtime/tenant-css/artifact-renderer/      Deterministic first-party CSS
                                               artifact renderer (-> build script)
    facade/                Curated public compiler surface (-> package root)
  runtime/
    adapters/presentation/react/
      compound-components/     createSubComponent/createCompoundComponent helpers
      focus-mode/              Injects app-managed focus mode into DS patterns
      navigation/              Injects the app's Link into DS patterns
    application/               Headless application hooks
      accessibility/           Keyboard navigation, roving tabindex, aria-live
      automation/assistant/    Provider-agnostic AI chat + streaming text hooks
      automation/voice/        useVoiceInput (Web Speech API)
      commands/registry/       Global command registry (-> CommandPalette)
      data/                    deferred-pending, optimistic, pdf-export, query
        runtime/table-export/  The canonical CSV/JSON/clipboard export owner
                               (RFC 4180; feeds structures/workspace/export-button)
      forms/                   auto-save, draft-save, form-diff, unsaved-changes-guard
      interaction/             drag-and-drop, shortcuts
      navigation/              routing (Surface<->URL sync), search
      notifications/           Preference matrix (categories x channels)
      state/                   cross-tab-sync, layout-preference, undo-redo
    bootstrap/
      facade/react/provider/   DesignSystemProvider: composes every provider;
                               READS compiled appearance, compiles nothing
      presentation/boundaries/system-error/  DSErrorBoundary around the tree
    dom/
      foundation/data-part/    Imperative data-part stamp for non-JSX renderers
      runtime/css-color-resolution/  Provider-aware computed color resolution
    effects/                   EffectRuntimeProvider, governed registry,
                               context-aware resolution, public facade
    engines/
      composition/react/provider/  EngineProvider + useEngineContext
      foundation/registry/         Engine metadata, discovery, defaults
      presentation/adapters/antd/  Bridges DS tokens into AntD ConfigProvider
      presentation/component-factory/  createEngineComponent + error boundary
      runtime/customization/component-registry/  Pack-scoped custom overrides
      runtime/resolution/          The single place that decides which engine renders
    error-handling/            Singleton categorized error bus + use-error-handler
    facade/react-hooks/        The curated public hook surface
    features/                  FeatureProvider, FeatureGate, public facade
    foundation/
      change-key/              Injective change-detection keys
      density/                 Scoped data-density posture runtime
      diagnostics/             Dev-only deduplicated logging
      graphics/continuous-runtime-governor/  Document-wide budget/leases for
                               continuous graphics (-> spatial, particles)
      icons/active-profile/    RSC/SSR-safe icon expressive-profile seam
      motion/                  Motion policy, canonical recipes, environment and
                               reduced-motion stores, React preference hooks
      recipes/                 tailwind-variants engine, family definitions,
                               slot/axis manifest, emphasis hook
      root-attributes/         Identity-tracked root attribute claims + SSR
                               projection (pairs with ThemeProvider claims)
    graphics/asset-governance/ Asset registry + operational kill switch
    i18n/                      I18nProvider, direction/locale/translation hooks
    motion/                    MotionProvider bridging policy into MotionConfig
    personality/               DEFAULT_PERSONALITY, chart-personality resolution
    product-profiles/          ProductProfileProvider + hooks
    responsive/                ResponsiveProvider, breakpoints, media queries,
                               responsive style projection
    spatial/                   WebGL2 spatial host: quality ceilings, capability
                               probe, context lease, experience component, gates
    tenant/
      composition/react/       TenantProvider, branding hook, use-create-tenant
      foundation/              Configuration defaults/registry, TenantContext,
                               personality presets, payload validation
      runtime/                 authoring, preview-scope, remote/static stores
      runtime/resolution/
        request/               THE canonical hostname->slug resolver
                               (-> public via /server)
        header/                x-tenant-id server resolver (pairs with request)
    theming/
      composition/react/provider/    ThemeProvider + useThemeContext; owns
                                     data-theme/color-scheme claims, no paint
      composition/react/tokens/      useTokens and granular sub-hooks
      foundation/cascade-layers/     Canonical @layer order contract
      foundation/engine-tokens/      Per-engine token overrides
      foundation/visual-authority/   The official artifact admission + retention
                                     facade (-> /server, tenant authoring,
                                     preview patterns)
      presentation/adapters/react/css-variables-bridge/  Personality -> :root vars
    verticals/facade/          Public vertical-presets entry
```

Relations that matter: `bootstrap` composes but never compiles; all
Theme→CSS compilation lives in `compilers/` and reaches the browser only as a
verified artifact through `theming/foundation/visual-authority/`.
`tenant/runtime/resolution/request/` is the only resolver the public boundary
exposes. `application/data/runtime/table-export/` is the single export
implementation; UI owners consume it downward, never the reverse.

### 2.5 `src/graphics/` — supplier-boundary asset classes

```text
graphics/
  icons/               Supplier-independent semantic icon system
    foundation/        Tokens, contracts, registry/policy, governed corpus
                       (pinned phosphor-2.1.10 adapter + editable manifest),
                       generator
    presentation/
      catalog/         Hand-curated category catalog
      semantic-icon/   The stable Icon facade component
      semantic/generated/  282 generated roles, packs, presets, facade map
  brand-marks/         Closed third-party brand/cloud mark catalog
                       (-> rendered only through runtime/adapters/thesvg-react)
  pictograms/          Fixed corpus of 8 explanatory artworks, domain-agnostic
                       names, registered provenance
  motion/              React motion vocabulary
    foundation/        Contracts, particle config/eligibility, timing, transform
    react/presentation/    10 decorative effects + 13 motion primitives
    react/runtime/       Hooks: in-view, presence, reduced-motion, reveal,
                         scroll-progress, view-transition, ...
```

Relations that matter: `icons/` is the only place a supplier package is
imported; everything else consumes semantic roles. `brand-marks/` and
`pictograms/` are closed corpora — admission is a governance act, not a code
shortcut. `motion/` is the only graphics owner re-exported by the package
root. `CountUp` (component) is the canonical counting display;
`useSmoothCounter` is its hook form for composed cases.

### 2.6 `src/ui/`

Support owners per tier (`foundation/`, `runtime/`, `facade/`, `tests/`) follow
§1.3 and are listed only where their content is not obvious.

#### `ui/primitives/` — engine-switched leaves

```text
display/
  Avatar/              User profile display: image, initials, status compounds
  Badge/               Notification count/dot overlaying child elements
  Calendar/            Date/month selection panel (target: composed by calendar-view)
  Callout/             [retires into Alert — §3]
  Card/                Content container with Header/Body/Footer/Image compounds
  Carousel/            Responsive slideshow: dots, arrows, autoplay
  CodeBlock/           Code display via app-registered highlight adapter (mono)
  CropMarks/           Print-style corner registration ticks (mono, aria-hidden)
  Descriptions/        Key-value display in responsive multi-column grid
  Empty/               Empty-data placeholder with illustration and CTA
                       (-> the canonical empty anatomy every tier delegates to)
  Image/               Image with skeleton, fallback, lazy loading, zoom
  Kbd/                 Keyboard key in styled monospace
  List/                Collection display with Item.Meta, dataSource, pagination
  MarkdownView/        Bounded escaped-CommonMark renderer (mono)
  QRCode/              QR generator: canvas/SVG, error levels, expiry states
  Statistic/           Formatted numerical display + Countdown compound
  Table/               Embedded tabular document: selection, expansion, virtual
  Tag/                 Categorization label; closable; Tag.Group compound
  TextureBackdrop/     Whisper-contrast CSS texture layer (mono, aria-hidden)
  Timeline/            Chronological event sequence (target: composed by timeline)
  Tooltip/             Plain-text contextual overlay, hover/click/focus/manual
  Tree/                Hierarchical data: selection, checkbox, drag-drop
                       (-> composed by tree-view)
  Typewriter/          Token-governed typing/decode text effect (mono)
  Typography/          Heading/Text/Paragraph/TextLink text primitives
inputs/
  AutoComplete/        Free-text input with suggestion dropdown
                       (boundary: Select owns closed lists, §3 note)
  Button/              Primary interactive element
  Cascader/            Hierarchical multi-level selection via cascading panels
  Checkbox/  ColorPicker/  DatePicker/  Form/  FormField/  Input/  InputNumber/
  Mentions/  OTPInput/  PasswordInput/  Radio/  Select/  Slider/  TagInput/
  Textarea/  TimePicker/  Transfer/  TreeSelect/  Upload/  VoiceInputButton/
                       Standard input leaves, one capability each
  Switch/              THE binary toggle control (absorbs Toggle)
feedback/
  Alert/               Contextual inline feedback messages (absorbs Callout slots)
  Drawer/              Edge-sliding panel with Header/Body/Footer
                       (boundary: Sheet owns touch/bottom interactions)
  Message/             [retires into Toast — §3]
  Modal/               Overlay dialog: focus trap, scroll lock, layout slots
  Notification/        Imperative corner alerts with actions
  Progress/            Task completion indicator (≠ Meter: not a scalar gauge)
  Rate/                Star rating input
  Result/              Full-page outcome feedback (success/error/404/...)
  Skeleton/            Loading placeholder shapes
  Spinner/             Loading indicator (on the shared loading-indicator substrate)
  Toast/               THE declarative toast system: provider, positions, undo
layout/
  AsciiFrame/          Box-drawing monochrome section framing (mono)
  AspectRatio/  Box/  Container/  Divider/  Flex/  Grid/  ScrollArea/
  Splitter/            Standard layout containers, one capability each
  Collapse/            Expandable panels (its token helpers live in its own
                       runtime/tokens owner)
  InvertSection/       Full-bleed ink/paper inversion boundary (mono)
  Layout/              Page-shell compound: Header, Sider, Content, Footer
  responsive/          CSS-first Show/Hide/ResponsiveSlot visibility primitives
  SemanticSurface/     Engine-agnostic governed surface-role renderer
  Stack/               THE spacing-between-children primitive (absorbs Space)
navigation/
  Affix/  Anchor/  Breadcrumb/  FloatButton/  Menu/  Pagination/  Segmented/
  Tabs/                Standard navigation leaves
  BackTop/             THE back-to-top control (FloatButton keeps its Group only)
  Link/                THE public Link: styled anchor, semantic types, external
                       handling (target: published as Link — two-phase rename,
                       silent-swap risk; today the navigation one is NavLink
                       and Link is Typography's)
  Steps/               Sequential progress with clickable navigation type
overlay/
  AlertDialog/         THE destructive-action confirmation (absorbs ConfirmDialog)
  ContextMenu/  Dropdown/  Tour/  Watermark/
  Popconfirm/          Compact inline confirmation (light counterpart of dialogs)
  Popover/             Rich floating panel: click/hover/focus, 12 placements
  Sheet/               Mobile-first sliding panel: drag handle, snap points
foundation/            Tier support (not product components):
  calendar/  compose-refs/  loading-indicator/  scroll-reveal/
  IconFrame/           Canonical framed-icon medallion
  Meter/               Canonical scalar-reading gauge (≠ Progress)
  ResizeHandle/        Canonical drag-to-resize edge
  VisuallyHidden/      Screen-reader-only content primitive
runtime/               Headless shared kernels:
  collection/          combobox, roving-focus, typeahead state machines
  overlay/             portal, layer-stack, positioning, focus-management,
                       backdrop, top-layer-host, portal-scope/theme
facade/                Declared cross-category composition surface (one primitive
                       never imports another category directly)
```

#### `ui/patterns/` — reusable task compositions

```text
data/
  bulk-select-toggle/  Bulk-selection mode toggle with count badge
  data-table/          The fully-featured table: slots, selection, sorting,
                       filtering, pagination, density
  decision-comparison/ Dense aligned anatomy for human decision tables
  decision-panorama/   Balanced context/identity/active-decision composition
  detail-panel/        Record detail sidebar (-> composed by DetailSurface)
  file-manager/        File browser: grid/list, selection, upload, rename
  gallery-view/        Image/media grid with selection and pagination
  grid-view/           Responsive card grid with selection and skeletons
  mono-stat/           Monospace stat counting up once on scroll-into-view
  record-facts/        Canonical read-only anatomy for dense business records
  stats-grid/          THE metric-strip pattern (-> composed by dashboard chrome)
  status-filter-pills/ Status filtering pill bar
  virtual-list/        Windowed list with variable heights, infinite loading
  widget-board/        User-owned widget board with adaptive placement solver
forms/
  filter-builder/      Airtable-style composable nested filter tree
  form-builder/        THE schema-driven form renderer (-> composed by form
                       surfaces)
  invoice-template/    Printable invoice anatomy
  step-wizard/         Multi-step wizard with async validation
visualization/
  ascii-diagram/       Monospace grid diagram with typed reveal
  calendar-view/       Month/week/day calendar (composes primitives Calendar)
  charts/              The 18 D3 families + chart-engine (renderer-agnostic
                       projections by device class) + exporting/theming/
                       interaction/responsive/streaming runtime
  kanban-board/        Drag-and-drop kanban with WIP limits
  timeline/            Chronological timeline (composes primitives Timeline)
  tree-view/           Interactive tree (composes primitives Tree)
communication/
  activity-log/        Activity record list with filters and diffs
  assistant/           Composable AI chat kit: streaming, tools, diffs
  comment-thread/      Recursive comments with reactions
  live-feed/           Auto-refreshing feed with new-items banner
  notification-center/ Notification dropdown with read/dismiss
  presence/            Real-time collaboration: PresenceBar, TypingIndicator,
                       LiveCursor
workflow/
  approval-workflow/   Five-state approval chain layout
  moderation-gallery/  Media moderation grid with triage
  operational-ledger/  Dense transactional ledger with reason codes
  shift-matrix/        Role x time coverage grid
navigation/
  command-palette/     Cmd+K action overlay on the command registry
  environment-toggle/  Environment switcher with production confirmation
  locale-switcher/     Locale selector
  shortcuts-overlay/   Keyboard shortcuts reference overlay
  workspace-switcher/  Workspace switcher with logos and unread counts
customization/
  brand-studio/        THE bounded BrandTheme editor with dual-ground preview
                       and WCAG validation
  tenant-preview/      THE tenant preview: config, palette, personality and
                       real-primitive gallery modes (absorbs branding-preview-sandbox)
  branding-preview-sandbox/  Real-primitive gallery under proposed appearance
                       (converges into tenant-preview, §3; today the only UI
                       consumer of the legacy appearance compiler)
  token-inspector/     Dev-only overlay of resolved --ds-* variables per element
feedback/
  adaptive-overlay/    Responsive overlay: modal/drawer/bottom-sheet by posture
  empty-state/         PatternEmptyState: empty-list task widget
                       (-> delegates its anatomy to primitives Empty, §3)
  terminal-block/      Streaming terminal text with typed cadence
shell/
  cockpit-header/      Detail/workbench header: back, breadcrumbs, sticky compact
  feature-workspace-frame/  Feature-level placement frame
  page-shell/          PatternPageShell: standard page chrome
                       (-> adapted by structures PageShellSurface)
  workbench-header/    Role-home header: briefing, exception badge, actions
identity/
  user-profile-card/   Profile card: avatar, role, status, actions
commerce/
  pricing-table/       Plan comparison grid with billing toggle
foundation/            Tier support: engine-styles, header-actions vocabulary,
                       collection stagger motion, ColumnDef builders
runtime/               Tier support: THE adaptive placement engine
                       (adaptive-layout), cell-renderers, useFilterPanel,
                       useFormBuilder, useKanban, usePulseOnChange,
                       createRecipeVariant, virtualization primitives
```

#### `ui/structures/` — page chrome (tier 2.5)

```text
dashboard/
  insights/            Engine-free insight strips: 4 metric + 4 activity variants
                       (its local StatItem/ActivityItem retire: the grammar owners
                       are StatDef in foundation/contracts and Activity in the
                       activity-log pattern, §3)
  data-terminal-card/  Animated metric card with four visual themes
feedback/
  surface-lifecycle/   THE canonical family for non-content surface states:
                       states (loading/empty/error/stale/offline),
                       use-surface-state machine, error boundary
                       (SurfaceEmptyState -> PatternEmptyState -> Empty)
  loading-overlay/     Semi-transparent fetch overlay with brand slot
  capability-anatomy/  Inventory of a failed/degraded surface's capabilities
headers/
  collection/          CollectionHeader: workspace-landing hero header
  dashboard/           DashboardHeader: overview header with metrics/status
  detail/              DetailHeader: detail-page chrome with action rail
  edit/                EditHeader: edit chrome with dirty indicator, save/cancel
  form/                FormHeader: create-form chrome with mode switch
  header-surface/      HeaderSurface: light page chrome composing PageShellSurface
  mobile-header/       Compact mobile header with safe-area
  section-frame/       Numbered monochrome framed section with real heading
record/
  summary-strip/       Top-of-record label/value strip
  field/  field-grid/  RecordField cards + their grid
  action-bar/          Closing action rail of a record page
  panel/               Deliberately behavior-empty grouping card
  form-sections/       Accordion themed form sections (organization model)
  edit-fields/         Slot-based record-edit chrome (consumer brings controls)
shell/                 Application/page chrome — layers, not duplicates:
  app-shell/           AppShell: THE application frame (sidebar+header+content)
  navigation/sidebar-surface/  Standalone split-pane sidebar shell
  page-shell-surface/  PageShellSurface: THE page-chrome adapter over
                       PatternPageShell (-> chrome foundation of the surfaces)
  workspace-shell/     Atmospheric interior frame mounted by
                       CollectionWorkspaceSurface
  surface-chrome/      Shared SurfaceActionBar/TabbedLabel/SectionCard trio
  bottom-tab-bar/      Fixed-bottom mobile tab navigation
workspace/             Collection chrome — the canonical side of every pair:
  table-toolbar/       Lightweight one-row slot-driven toolbar
  column-menu/         Column visibility/ordering with draft+apply
  saved-views-menu/    Saved-views trigger + dropdown (system/persona/custom)
  field-filters-panel/ Flat per-field filter card grid
  search-command-bar/  Command/search bar with voice input and chips
  active-filters-bar/  Applied-filter chips bar
  connected-command-palette/  Registry-backed wrapper over command-palette
  export-button/       Export dropdown (-> generators live in infrastructure
                       table-export)
  scope-switcher/      Data-scope pill strip (≠ environment-toggle)
  view-mode-switcher/  Collection render-mode toggle
  selection-preview-rail/  Sticky list-side preview rail (≠ detail-panel page)
  action-dock/         Floating mobile action bar
foundation/chrome/     Page-chrome contracts/runtime lowered from surfaces
                       (structures must never depend on surfaces; surfaces
                       re-export this vocabulary for the published API)
```

Shell decision tree (which frame for what):

1. Whole application frame → `AppShell` (or `SidebarSurface` for split-pane
   admin layouts).
2. Page chrome (title, breadcrumbs, actions, max-width) → `PageShellSurface`;
   a surface mounts it for you in the standard recipes.
3. Continuous atmospheric interior for a collection workspace →
   `WorkspaceShell` (mounted by `CollectionWorkspaceSurface`).
4. Pieces, not frames: `surface-chrome`, `bottom-tab-bar`, `header-surface`.

#### `ui/surfaces/` — declarative page recipes

```text
foundation/
  contracts/           Config interfaces for every surface (presentation/
                       behavior/visual + access) + adaptive postures
  common/              Cross-surface test-utils and story helpers
runtime/
  adaptive-posture/    useAdaptivePosture: AdaptiveConfig -> SurfacePosture
  builders/            Typed config construction boundaries
  collection-workspace/  useCollectionWorkspace: the shared state spine
  helpers/             Access filtering, adapters, data normalization
presentation/pages/
  data/
    dashboard/         KPI-grid/section-cards/charts overview shell
    detail/            DetailSurface: THE canonical detail recipe
                       (-> composes PatternDetailPanel + PageShellSurface)
    compare/           Side-by-side comparison table chrome
    report/            Report builder: templates, filters, chart slot, export
    search/            Dedicated search page
    visualization/     Chart/map/timeline page shell with tabbed views
  workspace/
    collection-workspace/  THE canonical collection/list/table recipe
    command-center/    Manager entry dashboard (-> consumes dashboard
                       contracts; no local StatItem/ActivityItem)
    decision-inbox/    THE approval/review queue workspace
  admin/
    audit/  billing/  file-browser/  import-export/  integration/  profile/
    settings/  team/   One recipe per admin screen
  experience/
    auth/              Branded auth canvas (the app owns the form)
    oauth-transition/  Animated OAuth redirect/return screen
    marketing/         Public editorial page shell
    chat/              Conversation surface delegating to the assistant kit
    notification/      Notification center page + delivery preferences
    pricing/           Pricing page delegating to PatternPricingTable
    empty-state/       Route-level empty page
                       (EmptyStateSurface -> SurfaceEmptyState -> ...)
    media/             Media browser: gallery, selection, preview rail
    editor/            Editing surface: canvas, toolbar, save/publish
  forms/
    form/              FormSurface: page form delegating to PatternFormBuilder
    detail-form/       Split edit page: builder + summary aside
    wizard/            Multi-step flow: PatternStepWizard + PatternFormBuilder
    guided-draft-form/ Draft-heavy flows (must compose the builder or be a
                       documented exception — §3)
  operations/          Thin page wrappers over their pattern:
    activity/  kanban/  scheduler/  operational/
```

### 2.7 `src/entrypoints/` — the package boundary

```text
entrypoints/
  public/              Wiring for the classified public subpaths (§1.9)
  server/              ./server: resolveRequestTenant, Edge Config, font manifest
  icons/               ./icons* focused entries (facade, corpus, roles, presets)
  graphics/            ./marks*, ./pictograms, ./motion, ./effects, ./spatial*
  charts/              ./charts* entries -> ui/patterns/visualization/charts
  eslint/              ./eslint thin re-export of tooling/eslint
```

Entrypoints only forward; implementation lives at its canonical owner.

### 2.8 `src/tooling/`

```text
tooling/
  eslint/              The six-rule governance plugin (no-raw-html,
                       no-hardcoded-colors, no-db-in-components,
                       no-direct-lucide, no-motion-literals,
                       no-size-type-outside-classic)
  testing/             Internal test helpers, a11y checkers, tenant/brand
                       fixtures, integration and public-API contract suites
  declarations/css/    Ambient declarations for side-effect CSS imports
  quality/             Shipped-bundle proof harnesses (no-loss var() resolver,
                       touch-target authority)
  lane-control/        Modern Rescue coordinator machinery (manual program tool)
  resolution-probe/    Headless-Chromium probe of computed CSS (manual program
                       tool)
```

### 2.9 `packages/core/scripts/` — mechanical governance

One family, one purpose; every gate wired or deleted; every test reachable.
Every script is a `<family>/<capability>/index.mjs` owner with its tests and
baselines inside its own folder (§1.2). The family name says the domain; the
capability name finishes the sentence.

```text
scripts/
  ci/                  How CI runs: runner, gates manifest, workflow wiring,
                       typecheck ratchet, budgets, bundle analysis
  structure/           Guardians of this tree's own law: folder-index,
                       structure audit, owner boundaries, vertical compliance
  boundaries/          The app/DS frontier and public API: app-ds boundary,
                       hook contract, root writer, public entrypoints,
                       portal substrate, pattern/surface ownership, size-axis
  tokens/              The --ds-* surface: catalogs, channel parity/consumers/
                       liveness, customization census, adjudications
  i18n/                Locale key parity
  engine/              The modern engine: token audit (ratchets), engine freeze,
                       skins, paint counters, anatomy variants, container
                       queries, bundle framework
  verticals/           The vertical CSS pipeline end to end: artifacts, CSS
                       build, staleness, single author
  builders/            font-packs, build stamp, dev orchestrator
  packaging/           What gets published: pack inventory, icon embeds,
                       licenses, public declarations, public barrel,
                       dist freshness, supplier contract, canary fixtures
  evidence/            GAT/CRA certification: exact proof, claim integrity,
                       adaptive census, motion governance, runtime hardening
  taxonomy/            Tier/layer parity and projections
  generators/          semantic icons, taxonomy, capability census
  codemods/            App-side migrations, run by hand in consumers
  lib/                 Shared measurement, one metric once, in subfamilies:
                       paint/, engine/, taxonomy/, evidence/, hooks/, tokens/,
                       build/ — plus repo-root/ (the single ascending
                       root-finder every path resolution uses)
  quality-evidence/
    v2/                The active evidence generation
    programs/modern-rescue/  The WO-CRA-23 program: contracts, cascade chain,
                             probe, program-check (its manifest graduated to
                             packages/core/manifest/, §2.2)
```

### 2.10 `packages/showroom/`

```text
showroom/
  src/app/(docs)/      The navigable documentation routes per tier
  src/app/probe/       Gate laboratories: capture routes feeding evidence gates
                       (a probe exists only while its gate needs it)
  src/components/      Showroom chrome, torture sections, demos, playground
  src/data/registry/   The showroom-side component registry (kept in sync with
                       core; sync is contractual, tested)
  e2e/                 Visual/whitelabel/responsive/a11y/diagnostics suites
                       with versioned reference captures
```

---

## 3. Delta with the current tree

Everything listed here is debt between today's disk and §2. Each item is
adjudicated in [`docs/QUE-SE-QUEDA-Y-QUE-SE-BORRA.md`](QUE-SE-QUEDA-Y-QUE-SE-BORRA.md)
and sequenced in [`docs/ROADMAP-DE-REMEDIACION.md`](ROADMAP-DE-REMEDIACION.md);
the columns below state the target, not the method.

**Retires — repo level:** the 17 February codemods in root `scripts/` (their
target path no longer exists); `audit-presets.mjs` + `audit-report.json`;
`coverage/` and `coverage-final/`; root `test-artifacts/` after repointing its
gates (the core tree is the single evidence tree); `.claude/agents/` definitions
describing another design system; `packages/showroom/.tmp/`; the
`probe/kit-inventory` page once its work order closes; quality-evidence v1 with
its gate test; root `BACKLOG.md`, `DESIGN_SYSTEM_FINAL_REVIEW.md`,
`DOCUMENTATION_ENHANCEMENT.md`, `WAVE_4_PRIMITIVES.md` (archived to
`docs/history/`, not deleted).

**Retires — foundation/infrastructure:** the 19 `tokens/ts/runtime/components/*`
mirrors (the Collapse token helpers move into the Collapse owner first);
`tokens/ts/foundation/base/*` **minus `density/`** (density moves to
`foundation/presets/` before the batch, with `typography/pairings`) and
`tokens/ts/runtime/mirrors/*`; `tokens/ts/facade/` (its deprecated
typography-scale compat goes with it);
`contracts/composition/components/` (pure re-export of `kernel/common`);
`kernel/accessibility/wcag/` (absorbed by `color/contrast`); the
`runtime/presentation-profiles/`, `runtime/graphics/continuous-runtime-governor/`,
`theming/foundation/color/` empty shells and the
`engines/foundation/contracts/binding/` reserved module; the
`foundation/tokens/__tests__/` directory (the only `__tests__` in `src/`;
its 33 contract files move to a `tests/` owner per §1.2);
`theming/composition/react/provider/theme/` (single provider);
`tenant/runtime/resolution/{subdomain,domain}/` (absorbed by `request/`);
`compilers/kernel/runtime/appearance/` — **in this order**: its functions move
into the single lowering first, the preview consolidates into
`tenant-preview`, then the folder goes;
`tokens/css/runtime/bridges/collapse-paint.css` (a completed tombstone) and
`tokens/css/presentation/components/patterns-paint.css` (its paint has no
owner — it is assigned or drained first, then the file goes).
`contracts/kernel/tokens/extensions/` **stays**: it is wired into the public
engine contract (`ComponentExtensions`) and the Card engines destructure it.

**Retires — graphics/entrypoints:** `icons/presentation/legacy/` — the 13
non-re-exported icons go now (catalog covers them); `AlertIcon`/`LoaderIcon`
go only after their two live consumers migrate to the semantic facade
(`app-platform` readiness screen, `Tag` rustic engine); the empty
`icons/runtime/adapters/` shell; the 8 empty
`entrypoints/public/**/{contracts,runtime}` directories; the 77 granular
per-tier subpaths with zero importers across the three apps (two of them —
`./runtime/root-attributes`, `./runtime/visual-authority` — have one showroom
importer each: migrate those pages first).

**Retires — ui/:** `Toggle` (into `Switch`); `Stepper` (covered by `Steps`);
`HoverCard` (covered by `Popover`/`Tooltip`); `Message` (into `Toast`);
`Callout` (into `Alert` — clean absorption; the two Callout mentions in
Alert's contracts are docstrings only); `Space` (into `Stack`); `ConfirmDialog` (into
`AlertDialog`); standalone `BackTop` is the canonical control and the
`FloatButton.BackTop` compound retires — one capability, one public name; the
duplicated side of the four collection-chrome pairs, **canonical per pair with
no tier-law violation** (a pattern never imports a structure):
`field-filters-panel` retires (canonical: `patterns/forms/filter-panel` —
`data-table` composes it), `table-toolbar` retires (canonical:
`patterns/data/list-toolbar`), `saved-views-menu` retires (canonical:
`patterns/data/saved-views`), `column-settings` retires (canonical:
`structures/workspace/column-menu` — the draft+apply model, already used by
`collection-workspace`); `workflow/approval-inbox` (successor: `decision-inbox`
surface); `dashboard/stats-header` (canonical: `patterns/data/stats-grid`);
`visualization/map-view` (an integration placeholder with no map provider is
not a capability — it retires unless a real provider integration lands);
`pages/data/list` (canonical: `collection-workspace`);
`pages/workspace/record-workbench` (its deltas — related-records slot, per-tab
empty state, tab badge — become DetailSurface contract additions; note its
direct icon-role import does not migrate with them); the residual
`WorkspaceFilterRail` alias. Retirements with app consumers (`Space` 34,
`ConfirmDialog` 17, `Toggle` 8) execute only after the app-side codemods land
(F8 coordination rule).

**Renames/moves:** Typography's `Link` → `TextLink` in **two phases** — first
`TextLink` is introduced and the 3 app files migrate, then the navigation
`Link` takes the public name in a major release (a direct swap is a silent
component change, not a breakage — worse); pictograms `candidate-evidence` and
`event-moment` get domain-agnostic names (and the corpus `family` field drops
product literals); `density` and `typography-pairings` move to
`foundation/presets/`; `patterns-paint`/bridge leftovers already covered above.

**Converges, not deletes:** `command-center` consumes the dashboard owners'
contracts instead of redefining them; `PatternEmptyState` delegates its anatomy
to `Empty`; `calendar-view`/`timeline` compose their primitives (the law
already holds for `tree-view`→`Tree`, `step-wizard`→`Steps`,
`surface-lifecycle`→`Skeleton`); `mono-stat` stops hand-rolling its count and
consumes the canonical counter (`useSmoothCounter`/`CountUp`);
`terminal-block` stops reimplementing the typing engine and consumes the
`Typewriter` substrate (its own docstring admits the reuse); `grid-view` and
`gallery-view` share one item-identity owner (today two near-verbatim copies);
`guided-draft-form` composes `PatternFormBuilder` or becomes a documented
exception; `DataTerminalCard`'s self-declared debts (dead quick actions,
non-deterministic variant fallback) are settled; the customization preview
capability consolidates into `tenant-preview`.

**Platform identity is extirpated, not completed:** `styles/platform.css`
(byte-identical to `rottay.css`), the stale `dist/platform.css`, the
performance budget line and the `dependency-honesty` alias requirement all
disappear once nothing references them.

---

## 4. Documentation workflow

After a physical UI move, regenerate the inventory only after paths stabilize:

```bash
pnpm --filter @rottay/design-system docs:taxonomy
```

Historical audits remain snapshots. Reconcile their findings in current
roadmaps or canonical docs; do not rewrite the evidence as if it had always
described the latest tree. This document is the only architecture authority
for this repository; `packages/core/ARCHITECTURE.md` folds into it (its
runtime-mechanics annexes move to `packages/core/docs/`) so that architecture
is written in exactly one place.
