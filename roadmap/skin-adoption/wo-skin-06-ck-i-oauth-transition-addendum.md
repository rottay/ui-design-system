# WO-SKIN-06 CK-I addendum — OAuth Transition tracked-scope recovery

## Adjudication

`surfaces/pages/experience/oauth-transition` is the concrete tracked-scope gap called out, but not
resolved, by `wo-skin-06-ck-i-contract.md`. The normal inline-paint census does not see the component's
main paint source because it is a 53 KB CSS template string injected by the component, rather than
React style-object keys. A zero/missing inline-counter row therefore never meant zero paint.

This addendum establishes the **inert pre-step only**. It does not migrate, rewrite, extract, tokenize,
or reformat any production OAuth Transition source. It creates a byte contract and production visual
baselines before a later migration can move a single declaration.

## Exact scope

Read-only production scope:

- `packages/core/src/components/surfaces/pages/experience/oauth-transition/index.tsx`
- `packages/core/src/components/surfaces/pages/experience/oauth-transition/styles/index.ts`
- `packages/core/src/components/surfaces/pages/experience/oauth-transition/provider-icons/index.tsx`
- `packages/core/src/components/surfaces/pages/experience/oauth-transition/config/index.ts`
- `packages/core/src/components/surfaces/pages/experience/oauth-transition/types/index.ts`

The accepted CSS census is **287 paint declarations** inside `oauthTransitionStyles`. This is the
planning/migration scope count for the self-injected stylesheet, including visible phase, compact,
family, progress, keyframe, mobile and reduced-motion branches. It is intentionally separate from the
ordinary TS/TSX inline-paint counter, which cannot parse declarations inside a template string.

Current byte identity:

| invariant | current value |
|---|---:|
| `oauthTransitionStyles.length` | 53,076 characters |
| lines in the runtime string | 2,226 |
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

## Inert protection delivered

### Unit contract

`OAuthTransition.pre-step.contract.test.tsx` pins:

- the full stylesheet length, line count and SHA-256;
- all 20 keyframe names in source order;
- both critical media queries;
- root, compact, exiting, redirect/return, four progress-family and four scene-family selectors;
- one real light redirect render and one real compact dark return render;
- the injected `<style>` text, root phase/family/tone/variant/compact attributes and selected `--rh-*`
  variables;
- redirect/return copy, scene family, flow label and all three progress states;
- the Google, GitHub, LinkedIn, Azure AD and Microsoft provider SVG paint contracts.

The hash is deliberately strict. A future intentional production change must first update this
addendum's migration decision and visual evidence; changing the expected hash just to make the test
green would delete the only byte-exact guard on the 287 declarations.

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
provider, flow/status copy, scene family, injected CSS/keyframe/media content, palette variable,
provider SVG path count and the complete/active/pending progress distribution. The mobile case also
proves the public compact attribute, viewport fit, stacked top row and one-column stage shell. An empty,
wrong-phase or placeholder fixture therefore cannot become an accepted baseline.

## Later migration law

The eventual migration is a dedicated OAuth Transition unit, not part of the generic thin-tail sweep.
It must preserve all of the following together:

- one self-contained transition surface outside the authenticated DS shell;
- redirect and return directionality;
- light and dark variant palettes through the 13 root variables;
- four visual families and their progress anatomy;
- compact and `max-width: 720px` behavior;
- all 20 animation names and reduced-motion behavior;
- provider brand artwork;
- production screenshots byte-exact unless an owner-approved visual change is separately recorded.

No production file, CSS entrypoint, registry/status document or snapshot belongs to this inert
pre-step. Snapshot generation and production-build execution are reserved for the orchestrator's
singleton gate.
