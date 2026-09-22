---
"@rottay/design-system": minor
---

WO-EMI-03: a compile can now be read as resolved, typed, numeric token leaves
instead of channel text. `./server` gains `emitThemeTokens`, its intent-shaped
facade `emitThemeTokensForIntent`, and the contract they answer with.

**Why a third projection, and why it duplicates neither of the other two.** A
compile already has two readers: the artifact, which carries channel TEXT with
its references intact and lets the browser resolve them, and
`ThemeCompilation.runtime`, which carries personality, overrides and profile
names and no channels at all. A renderer with no CSS engine can use neither.
The token document carries the channels, resolved and evaluated — so it is
disjoint in content from `.runtime`, not a different encoding of it.

**It is a projection OF a compile, never a field ON one.** The document's
contract lives at `contracts/theme/runtime/compilation`, which ranks above the
`foundation/` owner that declares `ThemeCompilation` and therefore cannot be
referenced from it. `ThemeCompilation` is unchanged.

**One compilation.** `emitThemeTokens` takes a `ThemeCompilation`, never a
`ThemeIntent` and never a `ThemeResolution`, so a second compile is not
expressible in its signature. `emitThemeTokensForIntent` is the facade the work
order's acceptance sentence names; it calls `compileThemeIntent` exactly once
and decides nothing.

**The environment is declared, never guessed.** A root document resolves on the
two axes that actually move a root: `mode` and `rootFontSizePx`. Density is
deliberately absent — the effective density scale is determined by compiled
channels at `:root` (the artifact is written unlayered and outranks the layered
static block that declares the mode factor), so a per-density root document
would report values the browser never paints. The dial stays a runtime factor
the consumer applies, exactly as a resolved motion recipe hands the renderer
numbers and lets it apply the dials.

**The closure is declared too, and it is the caller's.** A compilation resolved
against itself leaves roughly two channels in five unresolvable, because the
properties they read are declared by the static token layer, which is not
compiled per tenant. Both functions take that layer's `:root` projection as an
explicit `ResolvedBaseEnvironment` parameter. Neither reads a file, so what a
document was resolved against is auditable at every call site. The build emits
the snapshot per `(vertical, mode)` under
`artifacts/generated/tokens/base-environment/`, and a new blocking gate keeps
it fresh.

**What it refuses, and why refusing is the point.** A channel that cannot be
reduced to a typed leaf is recorded in `unresolved` with a reason and a cause;
it is never passed off as a literal. Arithmetic that mixes two units refuses as
`unit-mix` rather than inventing a root font size for a root that is fluid, and
a range function whose arguments are not all same-unit literals refuses as
`unevaluable` rather than reporting a midpoint no viewport produces.
`CSS_TYPED_LEAF_REASONS` is a closed roster of six, so `{ kind: 'css' }` is a
declared outcome rather than an escape hatch, and `TOKEN_EMISSION_BOUNDS`
bounds how much of a document may take it.

**The emission owner finished its declared grammar.** `emission/index.ts` is
now a barrel; the declaration/rule assembler and the value admission live in
`emission/css/`, the tenant artifact format in `emission/artifact/`, and the
token document in `emission/tokens/`. Every public import path is unchanged —
the barrel re-exports every symbol it used to export — and no signature moved.

```contract-diff
export ./server#emitThemeTokens — added: projects a `ThemeCompilation` onto typed numeric leaves against a declared environment and base (same target on `.`)
export ./server#emitThemeTokensForIntent — added: the intent-shaped facade over that emitter; compiles exactly once (same target on `.`)
export .#ResolvedBaseEnvironment — added: the static token layer's `:root` projection at one (vertical, mode), which both emitters take as an explicit parameter; it reaches `.` through the pre-existing `export * from './infrastructure/compilers'` route
export ./server#TOKEN_EMISSION_BOUNDS — added: the frozen bounds the emitter resolves and refuses under (resolution ceiling, CSS-typed ratio, the two colour tolerances)
export ./server#CSS_TYPED_LEAF_REASONS — added: the closed roster of six reasons a leaf may stay CSS-typed
export ./server#ThemeTokenDocument — added (type): what `emitThemeTokens` and its facade answer with
export ./server#ThemeTokenLeaf — added (type): the typed leaf union the document carries
export ./server#TokenEmissionEnvironment — added (type): the declared `(mode, rootFontSizePx)` axes a root document resolves on
export ./server#UnresolvedToken — added (type): a recorded refusal, with its reason and the channel that sank it
export ./server#ThemeTokenProvenance — added (type): the `{ compilerVersion, digest }` the facade stamps
```

Nothing is removed and no existing signature changes. `ThemeCompilation`,
`ThemeIntent`, `ThemeResolution`, `FlatTheme` and every ingress, admission and
provenance type are untouched, and the ~200 family derivers are not read by
this work at all: resolution is a stage above the lowering, which is the
alternative the work order's own text permits.
