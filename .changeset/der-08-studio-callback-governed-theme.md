---
"@rottay/design-system": major
---

WO-DER-08 — BREAKING. `PatternBrandStudioProps.onChange` emits the governed
`Theme`, not the flat read view.

WHAT BROKE, AND WHY IT IS NOT ADDITIVE. `value` and `onChange` are opposite
directions of the same contract. Widening `value` to `BrandStudioDraft`
(`Theme | DeepPartial<Theme> | FlatTheme | Partial<FlatTheme>`) IS additive:
every draft a caller could already pass is still accepted. Narrowing the
callback is not: a handler declared `(next: FlatTheme) => void` is no longer
assignable to `onChange`, because the studio now hands it a payload whose
governed families are `{ value, disposition }` wrappers and not flat leaves.
The sibling changeset `der-08-studio-draft-governed-theme.md` declared the
ingress half as additive and backward compatible; that sentence was true of
`DraftPreviewThemeIntentInput` and false of this callback, and it has been
corrected there. A consumer typed on the old callback fails to compile with
TS2322 (`Types of parameters 'next' and 'next' are incompatible`), which is the
declaration this release owes.

WHY MAJOR, AND NOT MINOR OR PATCH. The release classification follows the
change, not the intent: a published signature that stops accepting what it
accepted before is a breaking change, and this repository's policy is that
every public-API break of the remediation programme accumulates in the 3.0
major (`major-canonical-tree.md`). Relabelling it as additive would have needed
either a second emission of `FlatTheme` from the studio — which reinstates the
authoring role this work order exists to retire — or a second authority beside
`readThemeDraft`, which is the defect that door already recorded once. Neither
is taken.

MIGRATION, FOR A CALLER TYPED ON THE FLAT CALLBACK. The bridge is published,
and it is the door's own projection — no consumer writes a second lift.

```ts
// BEFORE (2.19.x)
import { PatternBrandStudio } from '@rottay/design-system';
import type { FlatTheme } from '@rottay/design-system';

const legacy = (next: FlatTheme) => save(next);
<PatternBrandStudio vertical="bithire" value={draft} onChange={legacy} />;

// AFTER — the handler keeps its flat type; the wrapper projects once
import { PatternBrandStudio, projectThemeDraft } from '@rottay/design-system';

<PatternBrandStudio
  vertical="bithire"
  value={draft}
  onChange={(next) => legacy(projectThemeDraft(next))}
/>;
```

A handler that should move to the transport takes the payload as
`BrandStudioDraft` or `ComponentProps<typeof PatternBrandStudio>['onChange']`,
both published at the package root; the bare `Theme` type is published from
`@rottay/design-system/server`. A stored flat draft still opens: pass it as
`value` (the superseded arm), or lift it once with `readThemeDraft`. Serialized
files written by `serializeFlatTheme` are read by `deserializeThemeDraft`,
which routes through that same single discriminant.

```contract-diff
signature .#PatternBrandStudioProps — BREAKING: `onChange` narrows from `(next: FlatTheme) => void` to `(next: Theme) => void`, and `value` widens from `FlatTheme` to `BrandStudioDraft`. The widened input is additive; the narrowed callback is not, and a handler typed on the flat payload no longer compiles. Migration: `onChange={(next) => legacy(projectThemeDraft(next))}`, or retype the handler on `BrandStudioDraft` / `ComponentProps<typeof PatternBrandStudio>['onChange']`
signature .#flatThemeToTenantAppearance — the draft input widens from `FlatTheme` to `Theme | FlatTheme`; additive, and a governed draft is projected once through the door's `readThemeDraft`/`projectThemeDraft` before the same bounded projection runs
signature .#flatThemeToTenantAppearanceAdvanced — the draft input widens from `FlatTheme` to `Theme | FlatTheme`; additive, same projection at the same door
signature .#TenantCapabilityDeclaration — no member added, removed or retyped: the fingerprint moved because the member documentation moved. `brandThemePath` keeps its serialized name and type; its rename is this work order's open sub-lot and will be declared by that release, not by this one
export .#BrandStudioDraft — added: the union a studio draft travels as (`Theme | DeepPartial<Theme> | FlatTheme | Partial<FlatTheme>`). It is the name a consumer holds instead of importing `Theme` from the server entry
export .#readThemeDraft — added: the ONE discriminant that lifts a draft to the governed `Theme`, whichever arm it arrived on. Optional second argument carries the dispositions a projection could not state
export .#projectThemeDraft — added: the flat read view of a governed draft. This is the documented bridge for a caller still typed on the flat payload
export .#serializeThemeDraft — added: the canonical JSON of a governed draft. Supersedes `serializeFlatTheme`, which stays published for its registered window
export .#deserializeThemeDraft — added: parses a draft file written by either serializer, through `readThemeDraft`. Supersedes `deserializeFlatTheme`, which stays published for its registered window
```
