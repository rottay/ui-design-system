# Sweep 3 — dual-authority audit: root attributes, i18n defaults, surface/anatomy/material/chrome layers

Scope: app-bithire (primary), ui-design-system (provider/compiler code). Read-only.
Pattern under audit: "one declared authority, two effective writers" — same runtime channel written/resolved from two places while a single owner is claimed.

---

## 1. Root attributes: SSR layout vs client providers

### Architecture as designed (and mostly followed)

`ui-design-system/packages/core/src/infrastructure/runtime/foundation/root-attributes/index.ts` is a purpose-built claim-stack registry (`claimRootAttribute`/`claimRootStyleProperty`/`claimRootClass`) whose fileoverview (lines 1-33) explicitly documents the bug class this sweep is looking for: "Root attributes have three writers in sequence — the server render, the pre-paint script, and a client provider effect — and the provider effect used to clean up with a bare `removeAttribute`. That deletes a value it never created." It fixes this with per-element/per-channel ownership stacks keyed by identity, not value, restoring the SSR baseline (not deleting) when the last claim releases.

Consumers that correctly use this registry:
- `data-theme`, `class:dark`, `style:color-scheme` — DS theming provider, `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx:1126-1134` (`claimRootAttribute`/`claimRootClass`/`claimRootStyleProperty`).
- `data-engine` — DS engines provider, `ui-design-system/packages/core/src/infrastructure/runtime/engines/composition/react/provider/index.tsx:86` (`claimRootAttribute`).

SSR source for both: `ui-design-system/packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts` — `resolveDocumentRootAttributes()` (lines 72-94) is the single pure projection consumed by `app-bithire/src/app/layout.tsx:179-186`, plus `buildThemePrepaintScript()` (lines 108-120), which the layout inlines as a `<script>` (`layout.tsx:217-219`) and which self-limits to refining `auto` only (`if(r.getAttribute("data-tenant-theme-mode")!=="auto")return;`).

**Verdict for `data-theme`/`class="dark"`/`color-scheme`/`data-engine`: SINGLE with explicit coverage.** Three writers exist (SSR, pre-paint script, client provider) but the claim-stack registry makes the client provider subordinate to the SSR baseline by identity, and the pre-paint script writes only the exact same three surfaces the provider later claims (its own comment: "no others: a script that introduced its own attribute would be the fourth writer this whole design exists to remove," `ssr/index.ts:104-106`). `suppressHydrationWarning` on `<html>` (`layout.tsx:208`) is present and consistent with this design (client mutates before hydration by design).

### CONFIRMED dual-writing: `data-account-tenant` / `data-brand-artifact` / `data-css-tenant`

`app-bithire/src/app/layout.tsx:202-207` spreads these three attributes onto `<html>` server-side, with an explicit comment: "App-owned channels, deliberately distinct from the DS projection."

`app-bithire/src/core/providers/index.tsx:162-172` (`InnerProviders`, client `"use client"` component) then writes the SAME three attributes with raw `setAttribute`, and — critically — the `useEffect` cleanup unconditionally `removeAttribute`s all three on **every** dependency change and on unmount:

```
useEffect(() => {
    document.documentElement.setAttribute("data-account-tenant", accountTenantSlug);
    document.documentElement.setAttribute("data-brand-artifact", brandArtifactSlug);
    document.documentElement.setAttribute("data-css-tenant", cssTenantSlug);
    return () => {
      document.documentElement.removeAttribute("data-account-tenant");
      document.documentElement.removeAttribute("data-brand-artifact");
      document.documentElement.removeAttribute("data-css-tenant");
    };
  }, [accountTenantSlug, brandArtifactSlug, cssTenantSlug]);
```

This is a byte-for-byte reproduction of the exact anti-pattern that `root-attributes/index.ts`'s fileoverview was written to eliminate ("the provider's cleanup strips it entirely... The document goes light [i.e., loses the SSR value]"), except these three channels do not use that registry at all — they bypass it with a hand-rolled effect. On unmount (provider tree remount, e.g. session/tenant switch flows that unmount `InnerProviders`), the SSR-stamped values are deleted and never restored, because there is no baseline capture here the way the claim registry provides.

**Verdict: CONFIRMED dual-writing**, file:line — `app-bithire/src/app/layout.tsx:205-207` (SSR writer) vs `app-bithire/src/core/providers/index.tsx:163-165` (client writer) + `:167-170` (destructive cleanup, no baseline restore).

### SINGLE-but-parallel-mechanism: `data-tenant-theme-mode` and `data-anatomy-*`

SSR writes `data-tenant-theme-mode` via `resolveDocumentRootAttributes` (`ui-design-system/.../root-attributes/ssr/index.ts:81`) and `data-anatomy-*` via `layout.tsx:200-201` spread (`bundledAnatomyAttributes` / `anatomyAttributes`).

Client-side, `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts` re-writes both, but **not** through the DS claim-stack registry — through its own bespoke ownership tracker:
- `data-tenant-theme-mode`: raw `root.setAttribute(...)` at line 95, guarded by an equality check and an explicit comment ("The DS remains responsible for resolving and stamping `data-theme`. This app-owned attribute records only the compiled artifact's configured light/dark/auto mode so a hot refresh cannot leave the SSR value stale," lines 92-94).
- `data-anatomy-*`: `syncRuntimeAnatomyAttributes()` (lines 116-142) tracks which anatomy keys the current `<style>` element "owns" via `style.dataset.anatomy`, diffs against the next artifact's keys, and only adds/removes the delta — a parallel, independently-invented claim-like mechanism, not the DS registry.

This only activates client-side for DB-backed custom tenants (`activeResolution` is null for bundled tenants such as first-party BitHire, since `branding` is null and no `runtimeTheme` is passed — confirmed by tracing `resolveCustomTenantBranding` → `Providers` → `useRuntimeTenantTheme`), so bundled BitHire itself never exercises this path.

**Verdict: SINGLE with explicit (self-built) coverage**, but architecturally split-brained: two independent, non-interoperating ownership mechanisms exist for the same category of problem — the DS's `foundation/root-attributes` claim-stack, and app-bithire's own `ownedAnatomyKeys`/`dataset.anatomy` tracker — in two different repos, guarding two different attribute sets on the same root element.

### `lang`/`dir`

Single app-level resolution (`resolveAppLocale`/`resolveHtmlLangDir`, `app-bithire/src/core/lib/i18n/index.ts`) feeds both the SSR `<html lang dir>` spread (`layout.tsx:178,192-193,197-198`) and the `DesignSystemProvider`'s `locale` prop (`core/providers/index.tsx:225`). See §2 for the second writer inside `I18nProvider`.

---

## 2. i18n default/fallback locale and lang/dir writers

### DEFAULT_LOCALE: consolidated in the DS, independently re-declared by the app (by design, currently agreeing)

DS: `ui-design-system/packages/core/src/foundation/i18n/kernel/contracts/index.ts:39` — `export const DEFAULT_LOCALE: SupportedLocale = 'en';` The file's own comment (lines 16-37) documents a **past** incident matching the "DEFAULT_LOCALE='es'" P0 noted in prior audit memory: "Before this existed, locale normalization defaulted to `'en'` while translation fell back to `'es'`, so two different implicit languages were in force at once." `DEFAULT_FALLBACK_LOCALE` (line 57) and `toSupportedLocale`'s default parameter (`runtime/resolution/locale/index.ts:22`) both derive from this one constant now. **This specific defect appears resolved** as of this read — single declared authority inside the DS.

App: `app-bithire/src/core/lib/i18n/index.ts:52` — `const FALLBACK_LOCALE: AppLocale = "en";`, independently hardcoded (not imported from/pinned to the DS's `DEFAULT_LOCALE`). The module's own header comment acknowledges this is deliberate: the DS's `DEFAULT_LOCALE` comment even names this file as the sanctioned reason a vertical restates its own default ("`app-bithire` declares its own `FALLBACK_LOCALE = 'en'`... for exactly that reason," DS `kernel/contracts/index.ts:32-33`).

**Verdict: SINGLE with explicit coverage, but a silent-drift risk.** Two independently-typed `"en"` string literals in two repos, currently equal, with no reference/test tying them together — if either changes without the other, nothing catches it. This is architecturally intentional (vertical owns its own locale policy per `app-bithire/src/core/lib/i18n/index.ts` header), not a bug today, but it is exactly the "one declared authority, two effective writers" shape if the two ever diverge.

### No second `I18nProvider` mount in app-bithire — CLEAN

`app-bithire/src/core/providers/index.tsx:247-262` documents and enforces "`DesignSystemProvider` is the app's ONLY i18n root... Nesting a second `I18nProvider` under it shadows that context with the DS's own defaults." Confirmed no other `I18nProvider` import/mount exists under `app-bithire/src` (only comments referencing it in `browser-locale`/`core/i18n` hooks, which read state, not write it). `locale` is resolved exactly once (`resolveAppLocale(sessionLocale ?? runtimeTenantConfig?.locale)`, `core/providers/index.tsx:187`) and passed into `DesignSystemProvider`, which normalizes it via `toSupportedLocale(forcedLocale ?? normalizedConfig.locale)` (`ui-design-system/.../bootstrap/facade/react/provider/index.tsx:656`) before wiring the single `I18nProvider` (lines 687-689). **CLEAN single writer** for locale resolution/selection.

### `lang`/`dir` DOM writers: SSR + a second, unregistered client writer

SSR: `layout.tsx:196-198` (`<html lang={documentLang} dir={documentDir}>`), sourced from the same `resolveHtmlLangDir`/`resolveDocumentRootAttributes` chain as §1.

Client: DS `I18nProvider`'s `useEffect` (`ui-design-system/packages/core/src/infrastructure/runtime/i18n/runtime/context/provider/index.tsx:163-168`):
```
useEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = config.code;
    document.documentElement.dir = config.direction;
  }
}, [config]);
```
This is a **second, raw** writer of `lang`/`dir` — it does **not** go through the `foundation/root-attributes` claim-stack registry that governs `data-theme`/`data-engine` (that registry has no `lang`/`dir` channel at all). It has no cleanup function, so unmounting leaves the last-written value in place (unlike the theme provider's careful restore-to-baseline). The provider's own comment calls this "a no-op on first paint" because the app feeds the identical resolved locale into both SSR and `DesignSystemProvider`.

**Verdict: SINGLE with explicit coverage** — converges today because both writers are fed from the one `resolveAppLocale` call, and the mismatch would only surface on a client-side locale switch (intended behavior). Still a second, structurally inconsistent write mechanism (bare property assignment, no ownership stack, no cleanup) sitting beside the more disciplined claim-based system used for theme/engine — worth flagging as a pattern gap, not a live bug.

---

## 3. Surface / anatomy / material / chrome layer ownership

### No literal `@layer` named surfaces/anatomy/material/chrome

The actual CSS cascade in `ui-design-system/packages/core/src/foundation/tokens/css/facade/entrypoints/styles.css:25` declares:
`@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-personality, rottay-responsive, components, utilities;`
None of these are named `surfaces`/`anatomy`/`material`/`chrome`. Those four terms name **architectural tiers** (TS contract/compiler owners), not CSS `@layer` names. Directory census: `foundation/behavior/kernel/anatomy`, `foundation/contracts/kernel/tokens/materials`, `infrastructure/compilers/kernel/foundation/css/chrome-variables`, `ui/primitives/layout/MaterialSurface` (dead — see below), `ui/surfaces`.

### Anatomy tier — CLEAN, non-overlapping by construction

`ui-design-system/packages/core/src/foundation/behavior/kernel/anatomy/index.ts` (89 lines) is purely a `data-part`/`data-state` DOM-attribute serializer. Its header explicitly states its reason for existing: "The rule this exists to enforce: a state that one engine honours and its twin silently drops is the defect this design system has found nine times" (lines 11-17, citing the modern-vs-rustic Button press-state divergence as the historical example this replaces). It owns **zero** CSS custom properties — only `data-part`/`data-state` attribute values. No overlap possible with material/chrome by design.

### Materials (surface roles) — single compiler, single channel family

Contract: `foundation/contracts/kernel/tokens/materials/index.ts` defines `SEMANTIC_SURFACE_ROLES` (`canvas, shell, panel, card, inset, control, raised, overlay`) and `SemanticSurfaceRoleTokens`. Compiler: `infrastructure/compilers/kernel/runtime/brand-theme/index.ts:346-402` (`semanticSurfaceRolesToCssVariables`) is the **sole** emitter of `--ds-surface-{role}` and `--ds-material-{role}-*` variables, from `BrandTheme.surfaceRoles` (or its `.materials` compat alias, line 562). Consuming primitive: `ui/primitives/layout/SemanticSurface/index.tsx` — the component itself "owns no visual values" (its own header comment) and only stamps `data-surface-role`/`data-interactive`/`data-selected`/etc.; all paint lives in one file, `presentation/components/semantic-surface.css`.

### Chrome — separate compiler, separate BrandTheme field tree, separate channel family

`infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` (1800+ lines) is a second, independent compiler that maps `BrandChrome`/`TenantAppearanceAdvanced.chrome` (sidebar, layout, shell, toolbar, filterPill, badge, breadcrumb, search, controls, table, cardComponent, tooltip, popover, ...) to `--ds-{component}-*` variables. Distinct input field tree from materials (`chrome.cardComponent` vs `surfaceRoles.card`), distinct compiler function, distinct output namespace in the common case.

### CONFIRMED overlap: card surface color has two independent authorities

- Chrome path: `chrome.cardComponent.bg` → `vars["--ds-card-bg"] = cc.bg` — `chrome-variables/index.ts:1286`.
- Material path: `surfaceRoles.card.background` → `vars["--ds-surface-card"] = surfaceRoleTokens.background` — `brand-theme/index.ts:358` (plus a compat alias `--ds-material-card-background: var(--ds-surface-card)`, line 362).

Both are **independently authored, literal** values in the generated first-party tenant artifacts, not always aliased to each other:
- `facade/artifacts/evnto/index.css:36,441,629` — `--ds-card-bg: #ffffff` / `#1C1A16` set as literal hex, with no visible alias to `--ds-surface-card` in the same declarations.
- `facade/artifacts/rottay/index.css:71-72,956-957,2502-2503` — same pattern, literal hex for `--ds-card-bg`/`--ds-card-bg-hover`.
- `facade/artifacts/bithire/index.css:4512` — by contrast, BitHire's artifact explicitly **aliases** them: `--ds-card-bg: var(--ds-surface-card);`. This proves the codebase knows the correct fix (alias, single source) but has not applied it uniformly — evnto and rottay do not.

Consuming skin CSS uses **inconsistent precedence** between the two channels for what is conceptually the same "card background" concern, inside the same file family:
- Base `Card` + most components read chrome-first: `var(--ds-card-bg, var(--ds-surface-card))` — e.g. `runtime/engines/modern/skin/card.css:99,105`, `steps.css:134,146`, `pagination.css:138,148`, `menu.css:65,166,175,...`, `breadcrumb.css:20,95,109`.
- The "premium card foundation" family (shared by `metric-card`, `signal-card`, `workspace-card`, `compact-card`, `tall-card`, `collection-card`) reads material-first, the **opposite** order: `presentation/components/card.css:299` — `--ds-premium-card-bg: var(--ds-material-card-background, var(--ds-card-bg));` (also lines 300-331 for hover/active/selected/disabled variants).

**Verdict: CONFIRMED dual-writing**, scoped precisely to the card-surface-background concern: two BrandTheme input fields (`chrome.cardComponent.bg`, `surfaceRoles.card.background`), two compiler functions in two different files, non-uniform aliasing across first-party tenant artifacts (bithire aliases, evnto/rottay do not appear to), and literally reversed CSS-variable fallback precedence between the base Card family and the "premium card" family consuming the same two channels.

### Positive control: `shell` role shows the correct pattern

`--ds-material-shell-background` is explicitly aliased to `--ds-surface-card`'s sibling, `--ds-surface-shell`, in both the base theme and the BitHire artifact: `foundation/themes/default.css:262` and `facade/artifacts/bithire/index.css:590` both declare `--ds-material-shell-background: var(--ds-surface-shell);`. This is single-writer-by-alias done correctly, and it is direct evidence the codebase has the discipline to avoid the card-style split when it chooses to apply it. `presentation/components/semantic-surface.css:41` consumes exactly that alias chain (`var(--ds-material-shell-background, var(--ds-surface-shell, transparent))`).

### Dead scaffold: `MaterialSurface` (not itself a dual-writer, but naming-drift residue)

`ui/primitives/layout/MaterialSurface/` contains only two empty subfolders (`contracts/`, `tests/`) — **no `index.tsx`, no implementation exists**. The live, real primitive is `SemanticSurface` (`ui/primitives/layout/SemanticSurface/index.tsx`, described above). `materials/index.ts`'s own header (lines 9-11) documents this as an in-flight rename ("The source directory keeps its former `materials` segment for one compatibility cycle. New code must use the `SemanticSurfaceRole*` names") with `@deprecated` aliases (`SEMANTIC_MATERIAL_ROLES`, `SemanticMaterialRole`, etc., lines 84-91) still exported. Not itself a dual-writer defect, but confirms the "material" vocabulary is mid-migration and the `MaterialSurface` primitive name is now an empty shell that could mislead a reader into thinking it's the live component.

---

## Summary table

| Subsystem | Channel | Verdict | Key evidence |
|---|---|---|---|
| Root attrs | `data-theme`, `class="dark"`, `color-scheme`, `data-engine` | SINGLE, explicit coverage | claim-stack registry: `root-attributes/index.ts`; consumers `theming/.../provider/index.tsx:1126-1134`, `engines/.../provider/index.tsx:86` |
| Root attrs | `data-account-tenant`, `data-brand-artifact`, `data-css-tenant` | **CONFIRMED dual-writing** | `layout.tsx:205-207` vs `core/providers/index.tsx:162-172` (destructive cleanup, no baseline) |
| Root attrs | `data-tenant-theme-mode`, `data-anatomy-*` | SINGLE, parallel bespoke mechanism | `runtime-tenant-theme/index.ts:95,116-142` (own tracker, not DS registry) |
| i18n | `DEFAULT_LOCALE`/fallback | SINGLE, explicit coverage (drift risk) | DS `kernel/contracts/index.ts:39,52-57` vs app `core/lib/i18n/index.ts:52` |
| i18n | `I18nProvider` mount count | CLEAN | `core/providers/index.tsx:247-262`, no second mount found |
| i18n | `lang`/`dir` DOM write | SINGLE, explicit coverage, unregistered 2nd writer | `layout.tsx:196-198` vs DS `i18n/.../provider/index.tsx:163-168` (no claim-stack, no cleanup) |
| CSS layers | anatomy (`data-part`/`data-state`) | CLEAN | `foundation/behavior/kernel/anatomy/index.ts` — no CSS vars owned |
| CSS layers | `--ds-surface-shell` / `--ds-material-shell-background` | CLEAN (aliased) | `foundation/themes/default.css:262`, `facade/artifacts/bithire/index.css:590` |
| CSS layers | `--ds-card-bg` (chrome) vs `--ds-surface-card`/`--ds-material-card-background` (material) | **CONFIRMED dual-writing** | `chrome-variables/index.ts:1286` vs `brand-theme/index.ts:358`; non-uniform aliasing across `facade/artifacts/{bithire,evnto,rottay}`; reversed precedence `card.css:99` vs `card.css:299` |
| CSS layers | `MaterialSurface` primitive | Dead scaffold, not a writer | `ui/primitives/layout/MaterialSurface/` has no `index.tsx` |

Report file: `/private/tmp/rottay-design-platform-independent-audit-round-3/sweep-3-root-attrs-i18n-layers.md`
