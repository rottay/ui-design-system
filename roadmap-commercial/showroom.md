---
title: "Design System Showroom Lane — Commercial Monochrome Signature"
date: 2026-07-07
status: canonical
audience: ai-agent
sources:
  - docs-engineering/engineering/design-system/commercial-surfaces/README.md (NORMATIVE LAW — Monochrome Signature spec, sections 1-9 the shared law; section 8 the commercial kit this lane BUILDS; section 10.3 the Showroom-is-the-blueprint target experience)
  - docs-engineering/archive/audits/2026-07-07-showroom-commercial-audit-davila.md (evidence base — commercial score 4/10; the landing is the only on-brand page; brand break at the first click; index pages render zero live components; runtime-readout redundancy + title triplication; buried vertical proof; motion/ASCII/texture gaps)
  - ui-design-system/CLAUDE.md (architecture contract: 4-tier taxonomy, subpath-export mechanics, marketing/Tailwind exception, BrandTheme white-label chain, ownership rules)
---

# Design System Showroom Lane

This lane makes `showroom.rottay.com` (`packages/showroom`) a commercial artifact that SELLS the
design system, and BUILDS the shared commercial kit it and the two app-platform surfaces (Overview,
Docs) all consume. The audit rates the showroom **4/10 as a sales artifact**: it has one genuinely
excellent surface — the monochrome editorial **landing** (`/`), an 8/10 on its own — and then abandons
that brand at the first click into a dark, glassy, eight-accent documentation console. This lane carries
the landing's one brand from the front door inward, builds the Monochrome Signature vocabulary as a
reusable kit, turns the browse indexes from taxonomy essays into live galleries, rebuilds component pages
as technical blueprint spec-sheets, and promotes the buried product proof — everything the audit's
"What 10/10 Needs" (section 4) and spec section 10.3 (the Showroom = the blueprint) demand.

The normative law is the **Commercial Surfaces — Monochrome Signature Specification** at
`../../docs-engineering/engineering/design-system/commercial-surfaces/README.md` (read it FULLY before
any WO — sections 1-9 are the shared law every WO obeys; section 8 defines the commercial kit WO-SHW-01
builds; section 10.3 is the target experience WO-SHW-03/04/05 realize). The file:line evidence in each
Why line comes from the audit at
`../../docs-engineering/archive/audits/2026-07-07-showroom-commercial-audit-davila.md`.

**The core law (spec sections 1-2).** The commercial surfaces are **black, white, and gray. Nothing
else.** Rottay's brand colors ARE the monochrome ramp; emphasis comes from inversion, scale, weight,
texture, framing, and motion — never hue. The ONE sanctioned color exception is a **product window**: an
embedded live demo/screenshot of the real product/DS, visibly framed and labeled so the color reads as
content, not chrome. The monochrome chrome makes those windows pop. This is engineering-chic: a company
confident enough to show its architecture in ASCII because the architecture is the product.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). All paths below are relative to
  the repo root unless prefixed. The commercial kit source lives in `packages/core/src/`; the showroom
  is `packages/showroom` (its landing pages are the marketing/Tailwind exception).
- **Gates are truth.** A WO is done when its acceptance gate passes AND the relevant build/tests are
  green (`pnpm --filter @rottay/design-system run build` + `pnpm test` for kit work in `packages/core`;
  `pnpm --filter @rottay/showroom run typecheck` + `run build` for showroom work). Executors are
  **edit-only**; the orchestrator certifies and commits. No WO commits.
- **The DS is a published package.** Editing `packages/core/src` does NOT change what any consuming app
  renders until a release + repin. No WO in this lane publishes or repins. **WO-SHW-01's release is the
  cross-repo unblock** for `app-platform` WO-COM-01 (kit adoption): when the release train ships the kit,
  the orchestrator records the released version in `roadmap/README.md` and notifies the app-platform
  orchestrator so it can mark its BLOCKED-ON-EXTERNAL dependency released (see Downstream waiters in the
  README). The showroom consumes the kit via `workspace:*` (hot-reload) and needs no release.
- **Sighted check is mandatory for every visual WO.** Run the showroom
  (`pnpm --filter @rottay/showroom run dev` — webpack, http://localhost:7001), capture the affected
  surfaces before/after under **both tenant palettes — a dark-surface tenant (rottay,
  `--ds-color-bg-primary: #0A0A0C`) AND a light-surface tenant (bithire or evnto)** — to
  `test-artifacts/showroom/<wo>/` at **1280 and 360**, then actually LOOK at the PNGs and score them
  against the spec (sections 1 + 10.3). There is **NO user-facing light/dark toggle** (owner law
  2026-07-07): the tenant palette decides the surface, so both captures come from switching tenant, not a
  scheme switch. The owner approves signature moments on WO-SHW-02, WO-SHW-04, and WO-SHW-05 — never
  self-approve visuals. Playwright is not installed in this repo; drive captures from app-bithire's
  bundled Playwright (the documented reference-harness exception; app-bithire stays READ-ONLY).
- **Monochrome is absolute in the chrome (spec sections 1-2).** Zero non-grayscale color literals in
  commercial chrome — the ONLY exception is a `ProductWindow` (framed live demo / real D3 chart / color-
  token inventory), which MUST be visibly framed. Grays come from the shared ramp tokens (WO-SHW-01);
  states express through luminance and inversion, never hue.
- **Anti-sprawl.** New work = a new `### WO-SHW-NN` block in this file + a `registry.json` entry
  (`pnpm roadmap:check` forces the pairing). No new plan documents.
- No emojis anywhere — the ASCII vocabulary IS the icon language of these surfaces. Repo docs in English.
  Never `git checkout/restore/reset` on directories. `app-bithire`, `app-platform`, and `docs-engineering`
  are READ-ONLY references in this lane; the showroom dev server is allowed.
- **Files-overlap ordering law with WO-ENG-02.** WO-SHW-03 and the engine lane's WO-ENG-02 both edit
  `packages/showroom` (the browse/preview surfaces and the component registries). They must **never
  execute concurrently** in the same working tree; whichever lands second re-verifies the other's galleries
  still render. WO-SHW-03 takes a HARD dependency on WO-ENG-02 (its real variant+state galleries are the
  raw material the index galleries render).

Ordering is by leverage: WO-SHW-01 first (it mints the shared vocabulary every later WO renders with, and
its release is the app-platform cross-repo unblock); WO-SHW-02 next (one brand from the front door inward);
WO-SHW-03 after WO-ENG-02 (galleries need the engine lane's real component galleries); WO-SHW-04 and
WO-SHW-05 close (blueprint spec-sheets, the lenses, and the tour/promotion/doors).

---

## WORK ORDERS

### WO-SHW-01 The commercial kit: @rottay/design-system/commercial
- **Outcome** — A domain-agnostic, monochrome-only commercial kit exported at
  `@rottay/design-system/commercial` (a new subpath, wired exactly like the existing `./server` / `./icons`
  subpaths), implementing spec section 8 exactly: the grayscale ramp tokens plus `AsciiFrame`,
  `AsciiDiagram` (data-driven, one-shot typewriter/decode reveal), `Typewriter`, `TerminalBlock`,
  `TreeView`, `SectionFrame` (numbered mono labels + rules), `InvertSection`, `TextureBackdrop`
  (grain / dot-grid / hatch / graph-paper at whisper contrast), `MonoStat` (count-up, tabular-nums),
  `CropMarks`, and `ProductWindow` (the framed color exception). The kit knows NOTHING about
  tenants/candidates/roles/companies/interviews/events (domain-agnostic law, spec section 8); every
  component is grayscale-only except `ProductWindow`, which frames real product color as content. The
  accessibility law is built in (decorative ASCII is `aria-hidden` with a text alternative; diagram ASCII
  carries a real description; ASCII is never the sole carrier of information), and every motion component is
  `prefers-reduced-motion`-aware (reveals collapse to instant-and-visible). The showroom is the first
  consumer, but the kit lives in `packages/core`.
- **Why** — Spec section 8 (Implementation law): the commercial vocabulary must be built ONCE in the DS
  and consumed by all three surfaces (showroom + app-platform Overview + Docs), not re-hand-rolled per
  surface. Audit section 3.1/4: the landing already proves the monochrome editorial language works (8/10)
  but expresses it in bespoke page-local CSS (`src/app/page.tsx`, 1255 lines of inline `<style>`); audit
  "ASCII-art detailing — absent", "textures — one faint grid on the landing, nothing elsewhere", "motion —
  effectively absent (37 CSS transitions total; framer-motion a dependency used in 0 files)". There is no
  reusable primitive for any of it. Verified export mechanics: `packages/core/package.json` `exports` maps
  each subpath to `./dist/<name>.{d.ts,js,cjs}` (`./server`, `./icons`, `./eslint`), fed by
  `packages/core/vite.config.ts` `build.lib.entry` (`server: resolve(__dirname,'src/server.ts')`,
  `icons: …/src/icons.ts`, `eslint: …/src/eslint.ts`) with `tsc` emitting the `.d.ts`; CSS artifacts ship as
  their own style exports (`./styles/modern` → `dist/modern-engine.css`, built by the `build:modern-css`
  postcss step). The kit follows exactly this pattern.
- **Depends on** — none. Unlocks WO-SHW-02, WO-SHW-03, WO-SHW-04, WO-SHW-05, and (cross-repo, via release)
  app-platform WO-COM-01.
- **Steps** —
  1. Grayscale ramp tokens (spec section 2): define the commercial ramp ONCE — ~12 perceptually-even steps
     anchored at `#000000`, `#0A0A0C` (the flagship dark), … `#FFFFFF` — as `--ds-commercial-gray-*` CSS
     variables in a dedicated `packages/core/src/commercial/tokens/commercial-ramp.css`, and mirror atomic
     references in a TS token file (`packages/core/src/commercial/tokens/index.ts`) so styled/TS consumers use
     tokens, not string literals. Ship the CSS through a `./commercial.css` style export wired exactly like
     `./styles/modern` (a build step + a `package.json` `exports` entry) so a consumer imports the kit's tokens
     alongside its components.
  2. Build the kit components under `packages/core/src/commercial/` (one folder per component with an
     `index.tsx` entrypoint + co-located CSS/types, per the DS folder law): `AsciiFrame` (box-drawing corner-
     and-rule framing, `┌─┐│└┘├┤┬┴┼`, double-line `╔═╗` for highest emphasis); `AsciiDiagram` (data-driven —
     takes a node/edge model and renders a box-drawing + arrow diagram, with a one-shot typewriter/decode
     reveal on first scroll into view via CSS scroll timeline / IntersectionObserver); `Typewriter` (one-shot
     typed/decoded text); `TerminalBlock` (`$`-prompt framed panel with streamed output + scanline accent);
     `TreeView` (`├── └──` repo/module tree as real content); `SectionFrame` (numbered mono label `[01] — …`
     + hairline/box-drawing rules; no section may float unframed, spec section 5); `InvertSection` (full-black
     ↔ full-white inversion boundary, the section language of spec section 1); `TextureBackdrop`
     (grain 2-4% / dot-grid / diagonal hatch / graph-paper / halftone `░▒▓` at whisper contrast); `MonoStat`
     (count-up on scroll, tabular-nums, mono label); `CropMarks` (`+`-style corner ticks for premium frames);
     `ProductWindow` (the sanctioned color exception — a visibly framed, labeled window around a live
     product/DS demo whose real tenant colors are allowed through; the frame is grayscale).
  3. A11y + motion law (spec sections 3 + 6), enforced per component: decorative ASCII renders `aria-hidden`
     with a real text alternative on the parent; `AsciiDiagram`/`TreeView` carry a described-by summary so the
     structure is available to a screenreader; ALL reveals (`AsciiDiagram`, `Typewriter`, `MonoStat`,
     `InvertSection`, `TerminalBlock` stream) collapse to instant-and-visible under
     `@media (prefers-reduced-motion: reduce)` and never loop.
  4. Wire the subpath export: create `packages/core/src/commercial.ts` re-exporting the public kit surface;
     add `commercial: resolve(__dirname, 'src/commercial.ts')` to `vite.config.ts` `build.lib.entry`; add the
     `"./commercial": { "types": "./dist/commercial.d.ts", "import": "./dist/commercial.js", "require":
     "./dist/commercial.cjs" }` entry (and the `./commercial.css` style entry from step 1) to
     `packages/core/package.json` `exports`; confirm `tsc` emits `dist/commercial.d.ts`. Keep the kit OUT of
     the root `.` barrel unless the DS convention requires it — it is a distinct commercial subpath.
  5. Docs: update the design-system catalog docs for the new kit per the CLAUDE.md Documentation Update Rule
     (a `commercial/` reference under `docs-engineering/engineering/design-system/` — a doc UPDATE, not a new
     roadmap plan file).
  6. Cross-repo note: record in the WO's progress log and in `roadmap/README.md` (Downstream waiters) that
     app-platform WO-COM-01 is BLOCKED-ON-EXTERNAL on this WO's RELEASE (not its merge) — the notify-the-
     platform-orchestrator step fires when the release train ships the kit version.
- **Files** — `packages/core/src/commercial/**` (component folders + `tokens/`), `packages/core/src/commercial.ts`
  (new subpath entry), `packages/core/vite.config.ts` (lib entry), `packages/core/package.json` (`exports` +
  the `./commercial.css` style export + any build script mirroring `build:modern-css`),
  `docs-engineering/engineering/design-system/` (catalog doc UPDATE — the ONLY docs-engineering write this
  lane makes).
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` emits `dist/commercial.js`,
  `dist/commercial.cjs`, `dist/commercial.d.ts`, and the `./commercial.css` artifact; `pnpm test` green
  (add a unit test that every kit component renders, that decorative ASCII is `aria-hidden` with a text
  alternative, and that a reveal collapses to visible under a mocked reduced-motion preference); a temporary
  showroom import of `@rottay/design-system/commercial` typechecks and renders each component; a grep over
  `packages/core/src/commercial/**` proves ZERO non-grayscale color literals except inside `ProductWindow`
  (which frames content color) and zero domain nouns (tenant/candidate/role/company/interview/event); sighted
  capture of a kit inventory page in `test-artifacts/showroom/shw-01/` under both tenant palettes.
- **Do NOT** — Do not add ANY product/domain semantics to the kit (no tenant/candidate/role/company/
  interview/event knowledge — spec section 8). Do not introduce non-grayscale color anywhere but inside
  `ProductWindow`. Do not ship ASCII as the sole carrier of information (text alternative always). Do not
  loop any animation or skip the `prefers-reduced-motion` collapse. Do not publish or repin. Never
  `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the shared commercial
  kit at `@rottay/design-system/commercial` per spec section 8 of
  `../../docs-engineering/engineering/design-system/commercial-surfaces/README.md` (read sections 1-9 + 8
  first). Under `packages/core/src/commercial/` build monochrome-only, domain-agnostic components (one folder
  each, `index.tsx` + co-located CSS/types): grayscale ramp tokens (~12 perceptually-even steps anchored at
  `#000000`/`#0A0A0C`/`#FFFFFF` as `--ds-commercial-gray-*` in `tokens/commercial-ramp.css` + a TS mirror),
  `AsciiFrame`, `AsciiDiagram` (data-driven node/edge model, one-shot typewriter/decode reveal on scroll),
  `Typewriter`, `TerminalBlock` (streamed `$`-prompt panel), `TreeView`, `SectionFrame` (numbered `[01] — …`
  mono label + rules), `InvertSection`, `TextureBackdrop` (grain/dot-grid/hatch/graph-paper/halftone at
  whisper contrast), `MonoStat` (count-up, tabular-nums), `CropMarks`, `ProductWindow` (the ONLY sanctioned
  color exception — a grayscale-framed, labeled window that lets real product color through). A11y law:
  decorative ASCII `aria-hidden` + text alternative, diagram/tree described for screenreaders, ASCII never the
  sole information carrier; motion law: every reveal collapses to instant-and-visible under
  `prefers-reduced-motion` and never loops. Wire the subpath EXACTLY like `./server`/`./icons`: create
  `packages/core/src/commercial.ts`, add `commercial: resolve(__dirname,'src/commercial.ts')` to
  `vite.config.ts` `build.lib.entry`, add `"./commercial": { types/import/require -> ./dist/commercial.{d.ts,
  js,cjs} }` to `packages/core/package.json` `exports`, and ship the ramp CSS as a `./commercial.css` style
  export mirroring `./styles/modern` (`build:modern-css`). Update the design-system catalog docs
  (`docs-engineering/engineering/design-system/`) per the Documentation Update Rule. Record that app-platform
  WO-COM-01 is BLOCKED-ON-EXTERNAL on this WO's RELEASE — notify the platform orchestrator when the release
  train ships. Gate: `pnpm --filter @rottay/design-system run build` emits `dist/commercial.{js,cjs,d.ts}` +
  the CSS artifact; `pnpm test` green (unit tests: renders, aria-hidden + text alternative, reduced-motion
  collapse); a temporary showroom import typechecks and renders; grep proves zero non-grayscale literals
  outside `ProductWindow` and zero domain nouns; sighted kit inventory capture in
  `test-artifacts/showroom/shw-01/` under both tenant palettes. Fences: domain-agnostic + monochrome-only,
  no publish/repin, edit-only, no commits, never git-restore directories, app-bithire/app-platform read-only,
  showroom dev server allowed.

### WO-SHW-02 Monochrome chrome: one brand from the front door inward
- **Outcome** — The docs chrome carries the landing's monochrome editorial language: the eight rotating
  section accents and the radial primary/secondary/info glows and the glass panels are GONE; the browse
  chrome (shell, header, sidebar) reads as a continuation of the cover, built from the WO-SHW-01 kit + the
  grayscale ramp; the runtime readout appears in exactly ONE deliberate placement (down from up to four); the
  title triplication is gone (each page name appears once); and the framer-motion dependency decision is
  recorded (recommend DROP — the spec motion law rides CSS + View Transitions, and it is used in 0 files).
  The prospect never feels they left the cover at the first click.
- **Why** — Audit top offenders #1/#2/#4 and section 3.2 (the largest gap). "The single most damaging fact
  is that the front door and the rooms behind it look like they were designed by two different companies."
  Verified: `packages/showroom/src/components/layout/config.ts` carries nine accent hex literals — the eight
  audited section accents (`foundations #0f766e`, `primitives #2563eb`, `patterns #7c3aed`,
  `structures #ea580c`, `surfaces #0891b2`, `verticals #4f46e5`, `playground #d97706`, `developers #475569`)
  plus a base `#0f172a` (config.ts:26-74). `packages/showroom/src/components/layout/shell/index.tsx` layers a
  three-glow `shellBackdrop` (`radial-gradient` primary @90% 2%, secondary @8% 0%, info @50% 100%, L877-885),
  a sidebar radial glow (L445), section-accent gradient panels (L203/739/805/973), and a `backdropFilter:
  blur(18px)` glass canvas (L1012) — directly against the monochrome brief. The runtime readout
  (`packages/showroom/src/components/runtime/runtime-fingerprint.tsx`) is printed up to four times per page
  (sidebar launchpad + header pill row + sidebar footer + the primitive live-preview card — audit 3.2), and
  the header (`packages/showroom/src/components/layout/header/index.tsx`) renders breadcrumb → H1 →
  "runtime editorial reference" title, printing the page name two-to-three times ("Foundations Foundations").
  `framer-motion ^12.38.0` is in `packages/showroom/package.json` and imported in 0 files (verified).
- **Depends on** — WO-SHW-01 (the chrome is rebuilt on the kit + the grayscale ramp).
- **Steps** —
  1. Kill the accents: in `packages/showroom/src/components/layout/config.ts`, remove the per-section accent
     hex; section identity comes from weight, type, mono numbering (`[01]`…), and a single ink tone — never a
     rotating hue (spec section 2). Sweep every consumer of the removed `accent` field (shell/header/sidebar)
     so nothing references a deleted color.
  2. Kill the glows + glass in `packages/showroom/src/components/layout/shell/index.tsx`: delete the
     three-glow `shellBackdrop` (L877-885) and the sidebar radial (L445); replace the glass canvas
     (`backdropFilter: blur(18px)`, L1012) and the stacked accent gradient panels (L203/739/805/973) with the
     landing's language — paper/ink neutrals from the ramp, hairline borders (WO-SHW-01 `AsciiFrame`/
     `SectionFrame`), and `TextureBackdrop` (the engraved graph-paper grid at whisper contrast) as the shell
     backdrop. Border segmentation does the compartmentalizing that gradients do today.
  3. Extend the landing's editorial rhythm into the whole browse chrome: the serif display for page titles,
     the masthead/eyebrow treatment, the dot/numbered section labels — reusing the landing's proven look
     (`src/app/page.tsx` + `src/components/landing/*`) via the kit so it is no longer page-local CSS.
  4. Dedupe the runtime readout to ONE placement: pick a single deliberate home (a compact header slot or an
     on-demand disclosure) and delete the other three usages of
     `packages/showroom/src/components/runtime/runtime-fingerprint.tsx` (sidebar launchpad, sidebar footer,
     live-preview card).
  5. Kill title triplication in `packages/showroom/src/components/layout/header/index.tsx`: the page name
     appears once (keep one of breadcrumb-tail / H1 / editorial-title, not all three). Reclaim the first
     viewport for content — the header band is genuinely thin.
  6. Record the framer-motion decision: remove `framer-motion` from `packages/showroom/package.json`
     `dependencies` (recommended — the spec motion law rides CSS transitions/animations + View Transitions,
     WO-SHW-01 kit reveals, and WO-CRA-08's View-Transitions work; the dep is used in 0 files), OR, if
     deliberately adopted, wire it to a specific sanctioned motion and document why. Write the decision into
     the WO progress log either way.
- **Files** — `packages/showroom/src/components/layout/config.ts`,
  `packages/showroom/src/components/layout/shell/index.tsx`,
  `packages/showroom/src/components/layout/header/index.tsx`,
  `packages/showroom/src/components/layout/sidebar/**`,
  `packages/showroom/src/components/runtime/runtime-fingerprint.tsx` (single-home + remove redundant callers),
  `packages/showroom/src/components/landing/**` (extract the editorial language into shared use via the kit),
  `packages/showroom/package.json` (framer-motion decision).
- **Acceptance gate** — A grep over the showroom chrome (`src/components/layout/**`, `src/components/runtime/**`)
  proves zero non-grayscale color literals in chrome (product windows / the color-token page / D3 charts
  allowlisted); the runtime readout renders exactly once per page; each page name renders once (no
  "Foundations Foundations"); `packages/showroom/package.json` has no `framer-motion` unless a documented
  adoption exists; `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted before/after in
  `test-artifacts/showroom/shw-02/` at 1280 + 360 under both tenant palettes showing the landing→browse
  hand-off with NO brand break (paper/ink neutrals, hairline segmentation, one readout, one title) —
  **owner-approved**.
- **Do NOT** — Do not keep any of the eight section accents or the radial/secondary/info glows or the glass
  canvas in chrome. Do not leave the runtime readout in more than one place. Do not leave the page name
  printed more than once. Do not touch the color-token inventory page or the D3 charts (those are sanctioned
  color). Do not silently keep framer-motion undecided. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, carry the landing's monochrome
  editorial brand into the docs chrome per audit offenders #1/#2/#4 + spec sections 1-2/5. Depends on
  WO-SHW-01 (build on the kit + `--ds-commercial-gray-*` ramp). (1) In
  `packages/showroom/src/components/layout/config.ts` delete the eight section accent hex (config.ts:26-74) +
  the base `#0f172a`; section identity from weight/type/mono-numbering/one ink tone; fix every consumer of the
  removed `accent`. (2) In `packages/showroom/src/components/layout/shell/index.tsx` delete the three-glow
  `shellBackdrop` (L877-885), the sidebar radial (L445), the glass canvas `backdropFilter: blur(18px)`
  (L1012), and the accent gradient panels (L203/739/805/973); replace with paper/ink neutrals, hairline
  borders (WO-SHW-01 `AsciiFrame`/`SectionFrame`), and a whisper-contrast graph-paper `TextureBackdrop`.
  (3) Extend the landing's editorial rhythm (serif titles, masthead/eyebrow, numbered labels — from
  `src/app/page.tsx` + `src/components/landing/*`) across the whole chrome via the kit. (4) Dedupe the runtime
  readout (`src/components/runtime/runtime-fingerprint.tsx`) to ONE placement; delete the other three callers.
  (5) In `src/components/layout/header/index.tsx` kill the breadcrumb→H1→editorial-title triplication (name
  once). (6) Decide framer-motion: DROP it from `packages/showroom/package.json` (0 files use it; spec motion
  is CSS + View Transitions) or document a deliberate adoption — log the decision. Gate: grep proves zero
  non-grayscale chrome literals (product windows / color-token page / D3 allowlisted); one readout + one title
  per page; no undecided framer-motion; `pnpm --filter @rottay/showroom run typecheck` + `run build` green;
  sighted before/after in `test-artifacts/showroom/shw-02/` at 1280 + 360 under both tenant palettes with NO
  brand break — owner approves. Run the showroom (`pnpm --filter @rottay/showroom run dev`,
  http://localhost:7001) and LOOK at the PNGs. Fences: monochrome chrome only, one readout/one title,
  edit-only, no commits, never git-restore directories, app-bithire/app-platform/docs-engineering read-only,
  showroom dev server allowed.

### WO-SHW-03 Index pages become galleries
- **Outcome** — Every browse index page (foundations / primitives / patterns / structures / surfaces) leads
  with LIVE rendered components in a monochrome blueprint grid — a prospect SEES the system within one screen
  of arriving — and the taxonomy essay (metrics snapshot, "how to read this layer", "browse by job" cards,
  escalation guide) collapses into a secondary "architecture notes" disclosure. Browse-first IA: pictures
  first, essay on demand.
- **Why** — Audit top offender #3 + section 3.3 (critical): "Index pages render no live components." All five
  index pages use one verbose taxonomy-essay template and expose components only as text name-chips
  (`Avatar`, `Badge`…) — nothing is rendered until you drill into a detail page. "A prospect sees paragraphs
  and chip lists, never a rendered Button/Table/Card." The essay is thoughtful architecture documentation; it
  does not sell (audit IA problem #1: one middle-ground template serves neither prospect nor developer). The
  raw material already exists: `packages/showroom/src/components/live-component-showcase/index.tsx`
  (`LiveComponentShowcase`) renders real components, and WO-ENG-02 delivers the real per-component variant +
  state galleries this WO arranges into the blueprint grid. Index entrypoints verified at
  `packages/showroom/src/app/(docs)/{foundations,primitives,patterns,structures,surfaces}/page.tsx`, driven by
  `packages/showroom/src/data/registry/`.
- **Depends on** — WO-SHW-01 (the blueprint grid frames render with the kit). **BLOCKED-ON-EXTERNAL: WO-ENG-02 in the MAIN ui-design-system roadmap (`roadmap/engine-modern.md`)** — the real component galleries are its deliverable and the Files overlap in `packages/showroom` (preview/registry surfaces); never execute concurrently; whichever is second re-verifies the other's galleries still render. The two roadmaps are now separate graphs (owner isolation decision 2026-07-07), so this cross-roadmap edge is external prose, not a registry dependency: the registry `dependsOn` is `["WO-SHW-01"]` and `coordinatesWith: ["WO-ENG-02"]` records the ordering law.
- **Steps** —
  1. Replace the essay-first template on each index (`packages/showroom/src/app/(docs)/foundations/page.tsx`,
     `…/primitives/page.tsx`, `…/patterns/page.tsx`, `…/structures/page.tsx`, `…/surfaces/page.tsx`) with a
     gallery-first layout: a dense, monochrome blueprint grid of LIVE components (reusing `LiveComponentShowcase`
     and the WO-ENG-02 galleries, framed with WO-SHW-01 `AsciiFrame`/`SectionFrame`/`CropMarks`), driven from
     `packages/showroom/src/data/registry/`.
  2. Demote the essay: collapse the metrics snapshot / "how to read this layer" / "browse by job" cards /
     escalation guide into a secondary "architecture notes" disclosure (a details/summary or a below-the-fold
     panel), not the lead content.
  3. Kill the remaining per-category / per-group chromatic tints in the browse layer (audit 3.3: primitive
     live-preview `CATEGORY_ACCENTS` in `packages/showroom/src/app/(docs)/primitives/[category]/[component]/
     live-preview.tsx`, and the pattern/surface/structure "browse by job" card tints — `#60a5fa` alone appears
     77× in showroom source): the gallery grid is monochrome; the live components themselves keep their real
     tenant colors as framed product windows.
  4. Re-verify (per the Files-overlap law) that the WO-ENG-02 galleries still render after this WO's layout
     change, under both tenant palettes.
- **Files** — `packages/showroom/src/app/(docs)/foundations/page.tsx`,
  `packages/showroom/src/app/(docs)/primitives/page.tsx`,
  `packages/showroom/src/app/(docs)/patterns/page.tsx`,
  `packages/showroom/src/app/(docs)/structures/page.tsx`,
  `packages/showroom/src/app/(docs)/surfaces/page.tsx`,
  `packages/showroom/src/components/live-component-showcase/**`,
  `packages/showroom/src/app/(docs)/primitives/[category]/[component]/live-preview.tsx` (drop `CATEGORY_ACCENTS`),
  `packages/showroom/src/data/registry/**` (read).
- **Acceptance gate** — All five index pages render LIVE components above the fold (zero index pages showing
  name-chips only — the audit's "5 index pages with zero live components" counter goes to 0); the essay is a
  secondary disclosure, not the lead; a grep proves the browse-layer chromatic tints (`CATEGORY_ACCENTS`, the
  `#60a5fa`-family card tints) are gone from the gallery chrome; the WO-ENG-02 galleries still render;
  `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted before/after in
  `test-artifacts/showroom/shw-03/` at 1280 + 360 under both tenant palettes.
- **Do NOT** — Do not execute concurrently with WO-ENG-02 in the same working tree. Do not leave any index
  leading with the essay. Do not reintroduce per-category/per-group hue tints in the gallery chrome. Do not
  delete the architecture-notes content (demote it, don't destroy it). Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, turn the browse index pages
  into live galleries per audit offender #3 + section 3.3 (spec section 10.3 browse-first IA). Depends on
  WO-SHW-01 (blueprint frames) + WO-ENG-02 (HARD — its real variant+state galleries are the raw material).
  ORDERING LAW: never run concurrently with WO-ENG-02 in the same tree; whichever lands second re-verifies the
  galleries. (1) On each of `packages/showroom/src/app/(docs)/{foundations,primitives,patterns,structures,
  surfaces}/page.tsx`, lead with a dense monochrome blueprint grid of LIVE components (reuse
  `src/components/live-component-showcase/index.tsx` + the WO-ENG-02 galleries, framed with WO-SHW-01
  `AsciiFrame`/`SectionFrame`/`CropMarks`, driven from `src/data/registry/`). (2) Collapse the essay (metrics
  snapshot / "how to read" / "browse by job" / escalation guide) into a secondary "architecture notes"
  disclosure. (3) Remove the browse-layer chromatic tints (`CATEGORY_ACCENTS` in
  `primitives/[category]/[component]/live-preview.tsx`; the `#60a5fa`-family card tints, 77× in source) — the
  grid is monochrome; live components keep real color only inside framed product windows. (4) Re-verify the
  WO-ENG-02 galleries render under both tenant palettes. Gate: all five indexes render live components above
  the fold (zero-live-component index count → 0); essay demoted; browse-layer tints gone; ENG-02 galleries
  intact; `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted before/after in
  `test-artifacts/showroom/shw-03/` at 1280 + 360 under both tenant palettes. Run the showroom
  (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: not
  concurrent with WO-ENG-02, no essay-first index, no hue tints in gallery chrome, demote (don't delete) the
  essay, edit-only, no commits, never git-restore directories, app-bithire/app-platform read-only, showroom
  dev server allowed.

### WO-SHW-04 Blueprint sheets + the three lenses
- **Outcome** — Component detail pages become collectible technical spec-sheets per spec section 10.3: graph-
  paper ground, crop marks, a part number (`RT-XXX-NNN`), and anatomy callouts drawn as hairlines from labels
  to the LIVE component — an engineering drawing that happens to be alive. Three lenses ride each sheet: the
  ENGINE LENS (the SAME live component morphing classic/modern/rustic in place), the TENANT LENS (live brand
  swap across rottay/bithire/evnto — plus the torture tenant once it exists — with BrandTheme dials), and a
  TOKEN X-RAY v1 (a per-component `--ds-*` token list panel). The variant matrix gains forced-state controls
  (show me focus / disabled / hover). The flagship "one API, three engines" demo looks finished (the audit's
  cramped/clipped engine previews are repaired).
- **Why** — Spec section 10.3 (Showroom = the blueprint): "component pages become collectible technical spec-
  sheets… blueprint sheets on graph paper with crop marks, a part number, and anatomy callouts drawn from
  labels to the live component's data-parts"; "the engine lens… the signature wow of the whole surface"; "the
  tenant lens… the whitelabel story in one click"; "token x-ray… the token system made visible". Audit 3.3:
  the detail pages are "the best content in the browse layer" (real Classic/Modern/Rustic comparison, copy-
  paste code, props tables) but "buried and text-heavy", and the engine-comparison previews render
  "cramped/clipped… the flagship demo looks unfinished". The material exists to build on:
  `packages/showroom/src/app/(docs)/primitives/[category]/[component]/page.tsx` +
  `live-preview.tsx`, the pattern/structure/surface detail pages, the engine comparison at
  `packages/showroom/src/app/(docs)/foundations/engines/`, and the tenant machinery at
  `packages/showroom/src/app/(docs)/playground/theme-builder/` (nested `DesignSystemProvider` columns).
- **Depends on** — WO-SHW-02 (the monochrome chrome + kit are the sheet's ground) and WO-SHW-03 (the gallery
  IA the sheets sit under). Staged scope, written honestly: the TENANT LENS adds the **torture tenant** only
  once WO-GAT-03 (hostile-tenant whitelabel proof) ships it — until then rottay/bithire/evnto + BrandTheme
  dials; the TOKEN X-RAY is v1 (a static per-component token list) and its **live hover inspector deepens once
  WO-ARC-02's `data-part`s exist** — neither is a hard dependency of this WO.
- **Steps** —
  1. Blueprint sheet chrome: rebuild each detail page (`packages/showroom/src/app/(docs)/primitives/
     [category]/[component]/page.tsx` and the pattern/structure/surface detail pages) on a WO-SHW-01
     `TextureBackdrop` graph-paper ground with `CropMarks`, a generated part number `RT-XXX-NNN` (a stable
     scheme keyed off tier + component, documented), and anatomy callouts: hairlines from mono labels to parts
     of the LIVE component (keyed to the component's rendered parts — a `data-part` hook where present today,
     deepening after WO-ARC-02).
  2. Engine lens: a control that morphs the SAME live component between classic/modern/rustic IN PLACE (View
     Transition morph where supported, instant swap under reduced motion), reusing the engine machinery at
     `packages/showroom/src/app/(docs)/foundations/engines/`. Repair the cramped/clipped engine-comparison
     previews (audit 3.3) so the flagship demo looks finished.
  3. Tenant lens: a live brand swap across rottay/bithire/evnto (nested `DesignSystemProvider` columns, the
     theme-builder pattern) plus BrandTheme dials (motion personality, density, radius) responding in real
     time; include the torture tenant when WO-GAT-03 has shipped it (feature-detect its presence, do not hard-
     depend).
  4. Token X-ray v1: a per-component panel listing the exact `--ds-*` tokens the component consumes (a static,
     honest list now); leave a documented seam for the live hover inspector that maps a hovered `data-part` to
     its tokens once WO-ARC-02's `data-part`s exist.
  5. Forced-state controls on the variant matrix: buttons to force focus / disabled / hover on the rendered
     variants (building on the WO-ENG-02 gallery states), so a prospect can inspect each state deliberately.
- **Files** — `packages/showroom/src/app/(docs)/primitives/[category]/[component]/page.tsx` +
  `live-preview.tsx`, `packages/showroom/src/app/(docs)/patterns/[group]/[pattern]/page.tsx`,
  `packages/showroom/src/app/(docs)/structures/[group]/[structure]/page.tsx`,
  `packages/showroom/src/app/(docs)/surfaces/[group]/[surface]/page.tsx`,
  `packages/showroom/src/app/(docs)/foundations/engines/**` (engine-lens machinery),
  `packages/showroom/src/app/(docs)/playground/theme-builder/**` (tenant-lens machinery, read/reuse),
  `packages/showroom/src/data/registry/**` (read — part numbers, token lists).
- **Acceptance gate** — `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted
  before/after in `test-artifacts/showroom/shw-04/` at 1280 + 360 under both tenant palettes showing (a) the
  graph-paper blueprint sheet with crop marks, part number, and anatomy hairline callouts; (b) the engine lens
  morphing one live component classic→modern→rustic in place (no clipped previews); (c) the tenant lens
  swapping rottay/bithire/evnto with BrandTheme dials live; (d) the token x-ray panel; (e) forced focus/
  disabled/hover on the variant matrix — **owner-approved**.
- **Do NOT** — Do not hard-depend on the torture tenant or WO-ARC-02 `data-part`s (feature-detect / stage the
  scope). Do not reintroduce chromatic chrome on the sheet (the LIVE component is the framed color; the sheet
  is monochrome). Do not leave the engine previews cramped/clipped. Do not add product/domain semantics to the
  sheet chrome. Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, rebuild component detail pages
  as blueprint spec-sheets with three lenses per spec section 10.3 + audit 3.3. Depends on WO-SHW-02
  (monochrome chrome + kit) + WO-SHW-03 (gallery IA). (1) On each detail page
  (`packages/showroom/src/app/(docs)/primitives/[category]/[component]/page.tsx` + `live-preview.tsx`, and the
  pattern/structure/surface detail pages) build a WO-SHW-01 `TextureBackdrop` graph-paper ground with
  `CropMarks`, a generated part number `RT-XXX-NNN` (stable, documented scheme), and anatomy callouts as
  hairlines from mono labels to the LIVE component's parts. (2) Engine lens: morph the SAME live component
  classic→modern→rustic IN PLACE (View Transition morph; instant under reduced motion) reusing
  `src/app/(docs)/foundations/engines/`, and REPAIR the cramped/clipped engine previews so the flagship demo
  looks finished. (3) Tenant lens: live brand swap rottay/bithire/evnto (nested `DesignSystemProvider`
  columns, the `playground/theme-builder/` pattern) + BrandTheme dials (motion/density/radius) live; add the
  torture tenant ONLY if WO-GAT-03 has shipped it (feature-detect, no hard dep). (4) Token X-ray v1: a static
  per-component `--ds-*` token list panel with a documented seam for the live `data-part` hover inspector that
  deepens after WO-ARC-02 (no hard dep). (5) Forced-state controls (focus/disabled/hover) on the variant
  matrix, building on WO-ENG-02 states. Gate: `pnpm --filter @rottay/showroom run typecheck` + `run build`
  green; sighted before/after in `test-artifacts/showroom/shw-04/` at 1280 + 360 under both tenant palettes
  showing the blueprint sheet, the in-place engine morph (no clipping), the live tenant swap + dials, the
  token x-ray, and forced states — owner approves. Run the showroom (`pnpm --filter @rottay/showroom run dev`,
  http://localhost:7001) and LOOK at the PNGs. Fences: stage the torture-tenant / data-part scope (no hard
  dep), monochrome sheet (component is the framed color), no cramped previews, no domain semantics, edit-only,
  no commits, never git-restore directories, app-bithire/app-platform read-only, showroom dev server allowed.

### WO-SHW-05 The tour, the promotion, the doors
- **Outcome** — Two audience paths exist, distinct at last (audit IA problem #1): a cinematic prospect TOUR
  mode (six stops — engines, tenants, surfaces, charts, AI kit, accessibility — auto-scrolled, skippable)
  versus the developer path (Cmd+K + prop playgrounds). The buried vertical product proof is PROMOTED (landing
  hooks + a top-level "In production" entry, un-buried from the essay/registry sandwich). The three-doors
  footer (overview / docs / showroom cross-links, spec section 7) closes every surface. Per-component honest
  gauges (bundle size, axe a11y badge, engine coverage) render on the sheets. The final owner gallery is
  captured at 1280 + 360.
- **Why** — Spec section 10.3 ("Two paths: a cinematic guided TOUR mode for prospects… vs the developer
  registry path") + section 7 (the three doors). Audit top offender #5 + section 3.4 + IA problems #1/#3:
  "The strongest commercial proof is the least discoverable" — the real product screens
  (`packages/showroom/src/components/demos/{platform,bithire,evnto}/`: a live Operations dashboard 128 /
  3,842 / 14 flags / 99.97%, recruiter cockpit, pipeline kanban, interview scorecard) live only at
  `/verticals/*`, "sandwiched between a heavy essay header and a long 'Category routes' registry tail"
  (`packages/showroom/src/app/(docs)/verticals/vertical-category-appendix.tsx`,
  `…/verticals/vertical-showcase-shell.tsx`, `…/verticals/page.tsx`), with nothing on the landing pointing a
  buyer at "see it running in a real product". Audit "honest gauges… the transparency itself sells". Cmd+K is
  already excellent (audit 3.2 strength — keep it as the developer path's spine).
- **Depends on** — WO-SHW-03 (the gallery IA the tour walks) and WO-SHW-04 (the blueprint sheets + lenses the
  tour stops land on, and where the gauges render).
- **Steps** —
  1. Tour mode: a cinematic, skippable, auto-scrolled prospect tour with six stops (engines, tenants,
     surfaces, charts, AI kit, accessibility), built from the WO-SHW-01 kit (`SectionFrame` chapter markers,
     `InvertSection` boundaries between stops, `AsciiDiagram` where a stop explains architecture), with
     View-Transition or scroll choreography between stops and a keyboard skip; `prefers-reduced-motion`
     collapses the auto-scroll to a static, navigable chapter list.
  2. Developer path: keep Cmd+K (the audited strength) as the lookup spine and wire the prop playgrounds /
     instant-copy TSX on the blueprint sheets; the two paths are explicitly separate entrances, not one
     middle-ground template.
  3. Promote the proof: un-bury `packages/showroom/src/components/demos/{platform,bithire,evnto}/` — strip the
     essay header + the "Category routes" registry tail
     (`packages/showroom/src/app/(docs)/verticals/vertical-category-appendix.tsx`,
     `vertical-showcase-shell.tsx`, `page.tsx`) so each vertical opens directly on the product moments; add a
     landing hook and a top-level "In production" entry so a prospect is routed to "see it running in a real
     product". The product screens render inside WO-SHW-01 `ProductWindow` frames (the sanctioned color).
  4. Three-doors footer (spec section 7): a consistent cross-surface footer/side rail linking overview
     (app-platform sales landing) / docs (app-platform `/docs`) / showroom, present on every showroom surface.
     Use stable, documented cross-links (the app-platform routes are external targets; do not hard-depend on
     their build).
  5. Honest gauges (spec section 10.3): per-component bundle size, an axe-verified a11y badge, and engine
     coverage rendered on the blueprint sheets (WO-SHW-04) — the transparency sells.
  6. Final owner gallery: capture the full relaunched showroom (landing → chrome → galleries → blueprint
     sheets → tour → verticals → three doors) at 1280 + 360 under both tenant palettes for owner sign-off; the
     owner scores it against the spec (target 10/10).
- **Files** — `packages/showroom/src/app/(docs)/verticals/page.tsx`,
  `packages/showroom/src/app/(docs)/verticals/vertical-showcase-shell.tsx`,
  `packages/showroom/src/app/(docs)/verticals/vertical-category-appendix.tsx`,
  `packages/showroom/src/app/(docs)/verticals/{platform,bithire,evnto}/[category]/page.tsx`,
  `packages/showroom/src/components/demos/**` (promote, frame in `ProductWindow`),
  `packages/showroom/src/app/page.tsx` + `packages/showroom/src/components/landing/**` (landing proof hook +
  "In production" entry), a tour-mode component/route under `packages/showroom/src/app/(docs)/**`, a shared
  three-doors footer under `packages/showroom/src/components/layout/**`,
  `packages/showroom/src/components/layout/{search,header}/**` (keep Cmd+K as the developer spine).
- **Acceptance gate** — `pnpm --filter @rottay/showroom run typecheck` + `run build` green; the tour runs
  through six skippable stops (and collapses to a static chapter list under reduced motion); the vertical
  product moments open directly (no essay header / no registry-tail sandwich) and are reachable from the
  landing + a top-level "In production" entry; the three-doors footer links overview/docs/showroom on every
  surface; per-component honest gauges render on the sheets; sighted final owner gallery in
  `test-artifacts/showroom/shw-05/` at 1280 + 360 under both tenant palettes — **owner-approved at the target
  10/10**.
- **Do NOT** — Do not collapse the prospect and developer paths back into one template. Do not leave the
  vertical proof behind an essay header or registry tail. Do not hard-depend on the app-platform surfaces'
  build for the three-doors links (stable route targets). Do not render product screens outside a
  `ProductWindow` frame. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the two audience paths,
  promote the proof, and close the three doors per spec sections 7 + 10.3 + audit offender #5. Depends on
  WO-SHW-03 (gallery IA) + WO-SHW-04 (blueprint sheets + lenses + gauges). (1) Tour mode: a cinematic,
  skippable, auto-scrolled six-stop prospect tour (engines, tenants, surfaces, charts, AI kit, accessibility)
  from the WO-SHW-01 kit (`SectionFrame` chapter markers, `InvertSection` boundaries, `AsciiDiagram` for
  architecture stops), View-Transition/scroll choreography between stops, keyboard skip, collapsing to a
  static chapter list under `prefers-reduced-motion`. (2) Developer path: keep Cmd+K as the lookup spine +
  wire prop playgrounds/instant-copy TSX on the sheets — two explicitly separate entrances. (3) Promote the
  proof: un-bury `packages/showroom/src/components/demos/{platform,bithire,evnto}/`; strip the essay header +
  "Category routes" tail (`src/app/(docs)/verticals/vertical-category-appendix.tsx`, `vertical-showcase-shell.
  tsx`, `page.tsx`) so each vertical opens on the product moments; add a landing hook + a top-level
  "In production" entry; render the screens inside WO-SHW-01 `ProductWindow` frames. (4) Three-doors footer
  (spec section 7): overview/docs/showroom cross-links on every surface (stable route targets; no hard dep on
  app-platform's build). (5) Honest gauges (bundle size, axe a11y badge, engine coverage) on the blueprint
  sheets. (6) Capture the final owner gallery of the whole relaunched showroom at 1280 + 360 under both tenant
  palettes for sign-off. Gate: `pnpm --filter @rottay/showroom run typecheck` + `run build` green; tour runs
  six skippable stops (static under reduced motion); vertical proof opens directly + reachable from landing +
  "In production"; three-doors footer everywhere; gauges on sheets; sighted final gallery in
  `test-artifacts/showroom/shw-05/` at 1280 + 360 under both tenant palettes — owner approves at 10/10. Run
  the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences:
  two distinct paths, proof un-buried + framed, stable three-doors targets, edit-only, no commits, never
  git-restore directories, app-bithire/app-platform/docs-engineering read-only, showroom dev server allowed.

---

### WO-SHW-06 Showroom excellence pass
- **Outcome** — The relaunched showroom gains its second-pass, top-of-the-line layer (spec section 11.3 + the
  showroom-scoped 11.0 baseline): a "blueprint mode" toggle draws real dimension lines on any demo — spacing,
  radii, hit areas — each labeled with the actual `--ds-*` token and its resolved value (the flagship); each
  blueprint sheet carries an ASCII keyboard-map diagram generated from the component's real
  tab/enter/escape/arrow behavior; prop configurations serialize into shareable playground URLs and part
  numbers (`RT-XXX-NNN`) typed in Cmd+K jump to their sheet; a compare drawer pins two or three
  components/variants side by side; showroom-wide personality dials make the ENTIRE showroom respond to
  BrandTheme motion/density personalities; a coverage wall renders the honest engines x components matrix with
  per-cell test count, a11y badge, and bundle size; the theme builder exports BrandTheme TS / DTCG JSON; gallery
  cards hover-cycle their component through its states; DS releases stream as a terminal changelog; and the
  landing's spotlight component narrates its own interactions (the teaching hero). The showroom also earns the
  shared baseline: in-brand monochrome OG cards, an ASCII-art 404, print stylesheets for the blueprint sheets,
  an LCP < 1.5s / CLS = 0 performance budget, and privacy-friendly analytics.
- **Why** — Spec section 11.3 is the "best practices + top-of-the-line, second pass" brief for the showroom,
  and it deepens exactly the objects WO-SHW-04/05 built: the blueprint sheets and the token x-ray become real
  dimension lines with resolved `--ds-*` values — "a true engineering drawing of the live component", the
  flagship of the surface; the engine/tenant/personality lenses become showroom-wide personality dials — "the
  personality system as a ride, not a doc"; the honest gauges become a full coverage wall — "transparency as
  the closer". The audit rated the showroom 4/10 with one 8/10 surface (the landing); 11.3's teaching hero
  makes that landing narrate the token system teaching itself, and the terminal changelog + shareable URLs +
  part-number Cmd+K jumps (Cmd+K is the audit's named strength — audit 3.2) finish the developer path. The
  theme builder already exists (`playground/theme-builder/`); exporting BrandTheme TS / DTCG JSON lets a
  prospect "walk out with your brand in a file". The 11.0 baseline — in-brand OG cards, an ASCII 404, print for
  the blueprint sheets (mono is born for paper), an LCP < 1.5s / CLS = 0 budget, and privacy-friendly analytics
  — makes every edge of the surface on-brand.
- **Depends on** — WO-SHW-04 (the blueprint sheets, the engine/tenant lenses, the token x-ray v1 this pass
  deepens into dimension lines) and WO-SHW-05 (the tour, the promoted proof, the honest gauges this pass grows
  into the coverage wall). Renders with the WO-SHW-01 kit (`AsciiDiagram`, `TerminalBlock`, `MonoStat`,
  `SectionFrame`, `TextureBackdrop`, `CropMarks`, `ProductWindow`) via `workspace:*` (no release needed).
  Ordering: it edits `packages/showroom` broadly, so — like WO-SHW-03 — it must never run concurrently with
  WO-ENG-02 in the same working tree; by dependency ordering (WO-SHW-04/05 -> WO-SHW-03 -> WO-ENG-02) ENG-02 is
  long past when this runs; re-verify the engine galleries + lenses still render.
- **Steps** —
  1. Dimension lines (the flagship): a "blueprint mode" toggle on any demo that overlays real measurement lines
     — spacing, radii, hit areas — drawn from the LIVE component and labeled with the actual `--ds-*` token name
     and its resolved value (read via `getComputedStyle`), deepening the WO-SHW-04 token x-ray; a showroom
     overlay component under `packages/showroom/src/components/blueprint/dimension-lines/**`, monochrome,
     `prefers-reduced-motion`-aware.
  2. Keyboard-map diagrams: each blueprint sheet includes an ASCII keyboard-flow diagram
     (tab/enter/escape/arrows) generated from the component's real behavior, on the kit `AsciiDiagram`, with a
     real text description (`packages/showroom/src/components/blueprint/keyboard-map/**`).
  3. Shareable playground state + part-number jumps: serialize prop configurations into the URL (send a
     configured component to a colleague) in the playground/prop-table surfaces; teach Cmd+K to jump to a sheet
     by part number (`RT-XXX-NNN`) — `packages/showroom/src/components/layout/search/**` + the playground
     components.
  4. Compare drawer: pin two or three components/variants side by side
     (`packages/showroom/src/components/compare-drawer/**`), monochrome chrome, the live components as framed
     product windows.
  5. Personality dials, showroom-wide: promote the WO-SHW-04 tenant-lens BrandTheme dials (motion/density
     personality) to a showroom-wide control in the showroom context
     (`packages/showroom/src/components/showroom-context/**`) so the WHOLE showroom responds in real time.
  6. Coverage wall: the honest engines x components matrix with per-cell test count, an axe-verified a11y badge,
     and bundle size (`packages/showroom/src/components/coverage-wall/**`), fed by a generated data file
     (`scripts/generate-coverage-wall.mjs` writing a checked-in JSON) — no faked cells.
  7. Theme export: the theme builder (`packages/showroom/src/app/(docs)/playground/theme-builder/**`) exports
     the current BrandTheme as TS and as DTCG JSON — walk out with your brand in a file.
  8. Hover state-cycles: gallery cards (the WO-SHW-03 galleries via `live-component-showcase/**`) animate their
     component through its states in sequence on hover (one cycle, then rest); instant/static under
     `prefers-reduced-motion`.
  9. Terminal changelog: DS releases as a typed terminal feed on the kit `TerminalBlock`
     (`packages/showroom/src/components/terminal-changelog/**`), fed by a real changelog source.
  10. Teaching hero: the landing's spotlight component (`packages/showroom/src/app/page.tsx` +
     `src/components/landing/**`) narrates its own interactions ("you just triggered `--ds-motion-fast` /
     ease-out") — the token system teaching itself.
  11. 11.0 baseline: in-brand monochrome ASCII-framed OG cards (`packages/showroom/src/app/opengraph-image.tsx`
     + per-route), an ASCII-art 404 (`packages/showroom/src/app/not-found.tsx`), print stylesheets for the
     blueprint sheets (mono for paper), an LCP < 1.5s / CLS = 0 performance budget (reserve space,
     static-generate, subset fonts, lazy-mount), and privacy-friendly section-engagement + tour analytics (no
     PII, no third-party beacon).
  12. Re-verify (Files-overlap law) that the WO-ENG-02 engine galleries and the WO-SHW-04 lenses still render
     after this pass, under both tenant palettes.
  13. Sighted before/after gallery at 1280 + 360 under both tenant palettes (a dark-surface tenant + a
     light-surface tenant); owner approves the signature moments (blueprint dimension lines, showroom-wide
     personality dials, the coverage wall, the teaching hero) at the target 10/10.
- **Files** — `packages/showroom/src/components/blueprint/{dimension-lines,keyboard-map}/**` (new),
  `packages/showroom/src/components/compare-drawer/**` (new),
  `packages/showroom/src/components/coverage-wall/**` (new),
  `packages/showroom/src/components/terminal-changelog/**` (new),
  `packages/showroom/src/components/showroom-context/**` (showroom-wide personality dials),
  `packages/showroom/src/components/live-component-showcase/**` (hover state-cycles),
  `packages/showroom/src/components/layout/search/**` (part-number Cmd+K jumps),
  `packages/showroom/src/app/(docs)/primitives/[category]/[component]/**` + the pattern/structure/surface detail
  pages (blueprint-mode + keyboard-map on the sheets),
  `packages/showroom/src/app/(docs)/playground/theme-builder/**` (TS + DTCG export),
  `packages/showroom/src/app/page.tsx` + `src/components/landing/**` (teaching hero),
  `packages/showroom/src/app/{opengraph-image.tsx,not-found.tsx}` + the blueprint print CSS, a privacy-friendly
  analytics seam under `packages/showroom/src/**`, `scripts/generate-coverage-wall.mjs` (+ its checked-in JSON),
  `packages/showroom/src/data/registry/**` (read — part numbers, token lists, coverage data).
- **Acceptance gate** — `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted before/after
  in `test-artifacts/showroom/shw-06/` at 1280 + 360 under both tenant palettes showing (a) blueprint mode
  drawing real dimension lines labeled with the actual `--ds-*` token + resolved value; (b) an ASCII
  keyboard-map diagram on a sheet; (c) a shareable playground URL that restores prop state + a part-number Cmd+K
  jump; (d) the compare drawer pinning 2-3 components; (e) a showroom-wide personality dial changing the whole
  showroom live; (f) the coverage wall (engines x components with per-cell test/a11y/bundle from the generated
  JSON, no faked cells); (g) the theme builder exporting BrandTheme TS + DTCG JSON; (h) gallery hover
  state-cycles; (i) the terminal changelog; (j) the teaching hero narrating interactions — owner-approved at the
  target 10/10. Plus: `curl` of the showroom OG route returns a monochrome image; `not-found.tsx` renders ASCII
  404; a `@media print` blueprint stylesheet exists; an LCP < 1.5s / CLS = 0 measurement is recorded;
  `prefers-reduced-motion` collapses dimension-line/hover-cycle/terminal motion to instant; the WO-ENG-02
  galleries + WO-SHW-04 lenses still render.
- **Do NOT** — Do not run concurrently with WO-ENG-02 in the same working tree (Files-overlap law); re-verify
  its galleries. Do not fake coverage-wall cells or health data (real generated data only). Do not add hue to
  the showroom chrome (dimension lines, keyboard maps, compare drawer, coverage wall are all monochrome; the
  LIVE component is the framed color). Do not render product/live demos outside a `ProductWindow` frame. Do not
  emit analytics with PII or a third-party beacon. Do not add domain semantics to the kit or the sheets. Never
  `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, run the SHOWROOM EXCELLENCE PASS
  per `docs-engineering/engineering/design-system/commercial-surfaces/README.md` section 11.3 + the
  showroom-scoped 11.0 baseline, on top of WO-SHW-04 (blueprint sheets + lenses + token x-ray) and WO-SHW-05
  (tour + promoted proof + honest gauges), rendering with the WO-SHW-01 kit via `workspace:*`. ORDERING: it
  edits `packages/showroom` broadly — never run concurrently with WO-ENG-02 in the same tree; re-verify its
  galleries + the WO-SHW-04 lenses still render. (1) Blueprint mode (the flagship): a toggle drawing real
  dimension lines on any demo — spacing, radii, hit areas — labeled with the actual `--ds-*` token + resolved
  value (`getComputedStyle`), deepening the token x-ray (`src/components/blueprint/dimension-lines/**`). (2)
  ASCII keyboard-map diagrams per sheet from real tab/enter/escape/arrow behavior on the kit `AsciiDiagram`
  (`src/components/blueprint/keyboard-map/**`). (3) Serialize prop config into shareable playground URLs +
  part-number (`RT-XXX-NNN`) Cmd+K jumps (`src/components/layout/search/**` + playground). (4) A compare drawer
  pinning 2-3 components/variants (`src/components/compare-drawer/**`). (5) Showroom-wide BrandTheme personality
  dials (motion/density) in `src/components/showroom-context/**` — the WHOLE showroom responds. (6) A coverage
  wall (engines x components; per-cell test count, axe a11y badge, bundle size) from a generated checked-in JSON
  (`scripts/generate-coverage-wall.mjs`) — no faked cells (`src/components/coverage-wall/**`). (7) Theme builder
  exports BrandTheme TS + DTCG JSON (`src/app/(docs)/playground/theme-builder/**`). (8) Gallery hover
  state-cycles (one cycle then rest; static under reduced motion) via `live-component-showcase/**`. (9) A
  terminal changelog of DS releases on `TerminalBlock` (`src/components/terminal-changelog/**`). (10) A teaching
  hero: the landing spotlight narrates its own interactions ("you just triggered `--ds-motion-fast`") —
  `src/app/page.tsx` + `src/components/landing/**`. (11) 11.0 baseline: in-brand mono OG
  (`src/app/opengraph-image.tsx`), ASCII 404 (`src/app/not-found.tsx`), print stylesheets for the blueprint
  sheets, LCP < 1.5s / CLS = 0 (reserve space, static-generate, subset fonts, lazy-mount), privacy-friendly
  analytics (no PII, no third-party beacon). Gate: `pnpm --filter @rottay/showroom run typecheck` + `run build`
  green; sighted before/after in `test-artifacts/showroom/shw-06/` at 1280 + 360 under both tenant palettes
  showing dimension lines (token + resolved value), keyboard-map, shareable URL + part-number jump, compare
  drawer, showroom-wide personality dial, coverage wall (generated data), TS + DTCG export, hover state-cycles,
  terminal changelog, teaching hero — owner-approved at 10/10; plus `curl` OG returns a mono image, ASCII 404
  renders, `@media print` blueprint stylesheet present, LCP < 1.5s / CLS = 0 recorded, reduced-motion collapses
  motion, ENG-02 galleries + SHW-04 lenses still render. Run the showroom (`pnpm --filter @rottay/showroom run
  dev`, http://localhost:7001) and LOOK at the PNGs; drive captures from app-bithire's bundled Playwright
  (app-bithire READ-ONLY). Fences: not concurrent with WO-ENG-02; monochrome chrome (the live component is the
  framed color); no faked coverage cells; no product screen outside a `ProductWindow`; no PII analytics; no
  domain semantics; edit-only, no commits; never git-restore directories;
  app-bithire/app-platform/docs-engineering read-only; showroom dev server allowed; no emojis; English.

---

## Dependency summary

- **WO-SHW-01** — no deps. Unlocks WO-SHW-02, WO-SHW-03, WO-SHW-04, WO-SHW-05; its RELEASE unblocks
  app-platform WO-COM-01 (cross-repo BLOCKED-ON-EXTERNAL — notify the platform orchestrator on release).
- **WO-SHW-02** — WO-SHW-01.
- **WO-SHW-03** — WO-SHW-01 + **WO-ENG-02 (HARD)**. Files overlap in `packages/showroom` — never execute
  concurrently with WO-ENG-02; whichever lands second re-verifies the other's galleries.
- **WO-SHW-04** — WO-SHW-02 + WO-SHW-03. Staged scope: torture tenant (WO-GAT-03) and the live token-x-ray
  hover inspector (WO-ARC-02 `data-part`s) deepen the WO when they exist — neither is a hard dependency.
- **WO-SHW-05** — WO-SHW-03 + WO-SHW-04.
- **WO-SHW-06** — WO-SHW-04 + WO-SHW-05. The excellence pass (spec 11.3 + 11.0) over the whole relaunched
  showroom; runs last. Touches `packages/showroom` broadly — never concurrent with WO-ENG-02 (Files-overlap
  law); by dependency ordering ENG-02 is long past when this runs; re-verify its galleries + the WO-SHW-04
  lenses still render.

WO-SHW-01 and WO-ENG-02 are the two independent starts that unblock the rest of this lane; WO-SHW-01 has no
dependencies and can begin immediately.
