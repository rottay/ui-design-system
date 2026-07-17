# WO-SKIN-06 CK-I addendum — OAuth Transition tracked-scope recovery + byte-exact migration

## Adjudication

`surfaces/pages/experience/oauth-transition` was the concrete tracked-scope gap called out, but not
resolved, by `wo-skin-06-ck-i-contract.md`. The normal inline-paint census did not see the component's
main paint source because it was a 53 KB CSS template string injected by the component, rather than
React style-object keys. Its old zero/missing inline-counter row therefore never meant zero paint.

This addendum first established the inert pre-step, then governed the completed byte-exact migration.
The runtime template content moved without reserialization into one unlayered skin; the component no
longer injects a `<style>` element. No declaration, selector, keyframe, media query, palette variable or
provider mark changed.

## Exact scope

Migration scope:

- `packages/core/src/ui/surfaces/presentation/pages/experience/oauth-transition/presentation/screen/index.tsx`
- `packages/core/src/ui/surfaces/presentation/pages/experience/oauth-transition/styles/index.ts` (removed)
- `packages/core/src/foundation/tokens/css/presentation/components/skin/oauth-transition.css` (byte-exact destination)
- `packages/core/src/ui/surfaces/presentation/pages/experience/oauth-transition/presentation/screen/provider-icons/index.tsx`
- `packages/core/src/ui/surfaces/presentation/pages/experience/oauth-transition/runtime/config/index.ts`
- `packages/core/src/ui/surfaces/presentation/pages/experience/oauth-transition/foundation/contracts/index.ts`
- `packages/core/src/foundation/tokens/css/facade/entrypoints/base.css`
- `packages/core/src/foundation/tokens/css/facade/entrypoints/styles.css`
- the focused unit contract, production showroom fixture/spec and this addendum

The accepted CSS census is **287 paint declarations**, formerly inside `oauthTransitionStyles` and now
inside `oauth-transition.css`. It includes visible phase, compact, family, progress, keyframe, mobile
and reduced-motion branches. It remains intentionally separate from the ordinary TS/TSX inline-paint
counter, which could not parse the declarations while they lived inside a template string.

Current byte identity:

| invariant | current value |
|---|---:|
| `oauth-transition.css` file length | 53,076 characters / bytes |
| lines by `fileText.split('\n')` | 2,226 |
| SHA-256 | `9af44d8087a899dc9434b06f6c2970328204b16f55d718c83a86e0d64deea697` |
| named keyframes | 20 |
| media queries | 2 (`max-width: 720px`, `prefers-reduced-motion: reduce`) |
| paint declarations | **287** |

The 287 count does **not** absorb two other mechanisms that must remain explicit in any later
contract:

1. `index.tsx` writes 13 `--rh-*` palette variables from the selected, bounded variant onto the root.
   These are runtime variant values and remain inline; a static skin cannot own the selected palette.
2. `provider-icons/index.tsx` owns 9 literal, brand-authored SVG fills (Google 4, LinkedIn 1,
   Microsoft/Azure artwork 4), plus GitHub's `currentColor`. Those are provider identity artwork, not
   generic DS chrome. The pre-step pins them through rendered SVG assertions; a future paint migration
   must preserve or explicitly exempt them rather than silently replacing them with tenant colors.

## Pre-step protection and migrated contract

### Unit contract

`OAuthTransition.pre-step.contract.test.tsx` now reads the external CSS file directly and pins:

- the full stylesheet length, line count and SHA-256;
- all 20 keyframe names in source order;
- both critical media queries;
- root, compact, exiting, redirect/return, four progress-family and four scene-family selectors;
- one real light redirect render and one real compact dark return render;
- zero component-owned `<style>` tags, root phase/family/tone/variant/compact attributes and selected
  `--rh-*` variables;
- redirect/return copy, scene family, flow label and all three progress states;
- the Google, GitHub, LinkedIn, Azure AD and Microsoft provider SVG paint contracts.

The hash is deliberately strict and is unchanged from the runtime string. A future intentional
production change must first update this addendum's migration decision and visual evidence; changing
the expected hash just to make the test green would delete the only byte-exact guard on the 287
declarations.

### Production visual fixture and spec

The dedicated route `/probe/oauth-transition` renders the real exported `OAuthTransitionScreen`.
It does not use a placeholder, local facsimile or alternate CSS. Query parameters select only public
component inputs:

- `tone=light|dark`
- `phase=redirect|return`
- `compact=1|0`
- optional `provider=google|github|linkedin|azure-ad|microsoft`

The dedicated visual spec runs through the existing production-build Playwright harness and covers:

| tone | phase | viewport / mode |
|---|---|---|
| light | redirect | 1280×900, full page |
| light | return | 1280×900, full page |
| dark | redirect | 1280×900, full page |
| dark | return | 1280×900, full page |
| dark | return | 390×844, `compact=true` + mobile media query |

Before every screenshot the spec asserts fixture identity, root state attributes, exact title and
provider, flow/status copy, scene family, **zero runtime `<style>` descendants**, the inline palette
variable, a real `.rottay-transition-root` rule in the loaded CSSOM, computed gradient/color/card
radius/grid-animation paint, provider SVG path count and the complete/active/pending progress
distribution. The mobile case also proves the public compact attribute, viewport fit, stacked top row
and one-column stage shell. An empty, unstyled, wrong-phase or placeholder fixture therefore cannot
become an accepted baseline.

## Migration result

- `styles/index.ts` was moved to `foundation/tokens/css/presentation/components/skin/oauth-transition.css`; removing only the
  TypeScript template wrapper preserved **53,076 bytes, 2,226 split-lines and SHA-256
  `9af44d8087a899dc9434b06f6c2970328204b16f55d718c83a86e0d64deea697`** exactly.
- `OAuthTransitionScreen` no longer imports the string or renders `<style>`.
- Both public CSS graphs import the skin unlayered: `foundation/base.css` for vertical bundles and
  `entrypoints/styles.css` for the all-tenant bundle.
- The 13 root `--rh-*` runtime variables are unchanged and stay inline.
- `provider-icons/index.tsx`, including all 9 provider-brand literal fills, is byte-identical.
- The five visual cases and screenshot names are unchanged; migration certification compares against
  the existing pre-step baselines without updating them.

## Ongoing byte-exact law

OAuth Transition remains a dedicated unit, not part of the generic thin-tail sweep. Any future change
must preserve or explicitly re-adjudicate all of the following together:

- one self-contained transition surface outside the authenticated DS shell;
- redirect and return directionality;
- light and dark variant palettes through the 13 root variables;
- four visual families and their progress anatomy;
- compact and `max-width: 720px` behavior;
- all 20 animation names and reduced-motion behavior;
- provider brand artwork;
- production screenshots byte-exact unless an owner-approved visual change is separately recorded.

## Orchestrator certification — 2026-07-14

The focused contract passes `8/8`; core and showroom production builds are green; and the five
committed screenshots pass two independent `5/5` Playwright runs without snapshot updates. The core
build regenerated the tracked `packages/core/styles/**` bundles so every published CSS graph carries
the externalized skin. No visual snapshot changed. Registry/status closure remains part of the final
WO-SKIN-06 certification after CK-H1 and CK-E, rather than being claimed by this addendum alone.
