---
"@rottay/design-system": minor
---

The unpublished wave's contract surface, declared in one place (the 215-commit local
stack over `origin/main` — the publication itself stays the owner's authorization).
Everything here is additive-optional; nothing is removed or narrowed.

**The container law for nested scopes (N1/M2/M3/M4).** `emitThemeCss` and
`emitBaseRule` gain an optional `container` option: a scope below the document root
(a tenant preview panel) restates every root alias its stated channels reach, with
cascade-winning texts, its context rules re-emitted, and its mode rules following the
document's mode. Root doors are byte-identical without the option. `ContainerEmission`
is deliberately NOT exported: the container law serves the package's own preview
surfaces, and callers pass the structural `{ outright }` shape without the named type.

**The normalized radius channel (D2) and the F-1 fix.** The vertical compile emits
`--ds-radius-scale-rest` (the vertical's own resting dial position) and the foundation
computes `--ds-radius-scale-normalized` as dial-over-rest, so skins bind the dial with
byte-identical rest paint in every vertical. `ThemeResolution` gains an optional
`verticalBaseline` (recorded by `resolveTheme`, never merged) and `ResolveThemeOptions`
gains the optional `vertical` half of that plumbing. A bithire tenant re-dialing radius
now divides by bithire's own 0.8 on every door (it used to fall back to the profile's
0.85); a tenant restating the vertical's rest compiles to an empty delta.

**Behavioural note, not a signature change:** a one-argument `emitDeclarations` and
two-argument `emitThemeCss`/`emitBaseRule` now append the radius-chain and root-alias
restatements their own channels reach — same call shape, different CSS bytes by design.
One theoretical type-level note: `arr.map(emitDeclarations)` no longer type-checks
(the index argument is not the new options object); no caller in the programme does this.

**`./styles/frozen-engines`** was published by WO-RET-02 without a changeset; this
changeset declares it: the eslint rule's published-subpath list and the consumer
contract now name it as guaranteed (122 published / 19 guaranteed).

```contract-diff
subpath ./runtime/visual-authority — reachable-module budget 12 -> 14 and source bytes 82632 -> 397600: the resolver now reaches the generated root-alias tables the scope re-resolution law (audit P2) and the container law (N1/M3) emit from
subpath ./runtime/responsive — source-byte budget 59317 -> 59999: the Motion/Responsive providers' post-hydration correction
subpath ./structures/app-shell — source-byte budget 289988 -> 290534: the same provider correction, reached through the shell
signature ./eslint#PUBLISHED_SUBPATHS — gains the `./styles/frozen-engines` row as `guaranteed` (additive; the rule stops refusing an import of the subpath WO-RET-02 already published; mirrors the consumer-contract table, now 122 published / 19 guaranteed)
signature ./server#emitThemeCss — gains an optional third argument `options: { container?: ContainerEmission }`; without it the two-argument call keeps its contract (same target on `.`)
signature .#emitBaseRule — `options` gains optional `container?: ContainerEmission` beside `leadingDeclarations`
signature .#emitDeclarations — gains an optional second argument `options: { alsoStated?: Iterable<string>; alsoOutright?: Iterable<string> }`; the one-argument call now also appends the radius-chain and root-alias restatements its own channels reach
signature ./server#ThemeResolution — gains optional readonly `verticalBaseline?: Theme`, set by `resolveTheme` (same target on `.`)
signature .#ResolveThemeOptions — gains optional `vertical?: Theme`; defaults to `baseline` and is recorded as `verticalBaseline`, never merged
```
