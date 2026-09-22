---
"@rottay/design-system": minor
---

WO-CAT-04: a tenant row may NAME a reviewed DS style, and the decision
document gains the v3 version that carries the name. The style itself is DS
content — reviewed, digested, frozen at module load — so what the published
surface gains is the reference and the version fork, never the authoring.

**The reference, not the style.** `./server` publishes `THEME_STYLE_IDS`,
`ThemeStyleReference`, `assertThemeStyleReference` and
`ThemeStyleReferenceError`: enough for a writer to build the reference a row
persists and refuse a malformed one at the same boundary it writes it, and for
a settings surface to offer the choice. The registry, the authorability
partition and the envelope clearance stay unpublished — they are the DS's own
law over content no caller authors, and a caller that could reach them could
author a style without review.

**v3 is v2 plus a name.** `TenantThemeDocumentV3` adds one optional `style`
field. Every v2 refusal, every decision domain and every projection is
byte-unchanged, which is why `TENANT_THEME_DOCUMENT_VERSIONS` is a set the
doors read rather than a second branch they take:
`assertSupportedDocumentVersion` forks on the version FIRST, so a row claiming
version 4 earns a named refusal (`the supported set is 2 | 3`) instead of a
terminal reporting "expected version 2" about a row that never claimed to be
one. `TenantThemeDocumentV2Error` now extends a new
`TenantThemeDocumentError` base; the v2 prefix and every v2 message text are
unchanged, so an existing `catch` on the v2 class still catches exactly what
it caught.

**Two consequences for a consumer of the migrate door.**
`migrateAndAdmitDocument` returns `migrated: TenantThemeDocumentV3` where it
returned `TenantThemeDocumentV2` — a type-level break for any caller assigning
the result to a `TenantThemeDocumentV2` variable, and the reason this is a
minor and not a patch. And a caller that PERSISTS `migrated` now writes a v3
row for a tenant that names no style: the door is the whole `v1 -> v2 -> v3`
chain, so it reads a row as the version it was stored in and hands it on as
the current one. Persisting the migration is the app's decision, not the
door's; a deployment that wants "every other tenant's row is untouched v2"
must persist only the rows it migrated on purpose.

**The root barrel follows the ingress it already re-exports.** `src/index.ts`
carries `export * from './infrastructure/compilers'`, which is why
`DocumentAdmission` and `migrateAndAdmitDocument` were already public on `.`
and why the ingress's new style members arrive there with them. They are not
published from `./server`.

```contract-diff
signature ./server#migrateAndAdmitDocument — `migrated` narrows from `TenantThemeDocumentV2` to `TenantThemeDocumentV3`; a caller assigning it to a V2 variable no longer type-checks, and a caller persisting it writes a v3 row (same target on `.`)
signature ./server#DocumentAdmission — `version` widens to `1 | 2 | 3`; gains optional `styleRef` and `styleClaim` (same target on `.`)
signature ./server#TenantThemeDocumentAny — widens with the `TenantThemeDocumentV3` member
signature ./server#TenantThemeDocumentV2Error — now extends the new `TenantThemeDocumentError` base; name, `TenantThemeDocument:` prefix and every v2 message text unchanged
signature ./server#CompileTenantThemeDocumentV2Input — `document` widens from `TenantThemeDocumentV2` to `TenantThemeDocumentVersioned`, so the terminal reads a v3 row instead of refusing the tenant that selected a style
signature ./server#activatedDecisionIds — parameter widens from `TenantThemeDocumentV2` to `TenantThemeDocumentVersioned`
signature .#DraftPreviewThemeIntentInput — gains optional `style`; without it a draft opened over a style-bearing tenant measures every style leaf against a baseline that lacks the style and reports the style's ink as the editor's
export ./server#TENANT_THEME_DOCUMENT_VERSION_V3 — added: the `3` literal
export ./server#TENANT_THEME_DOCUMENT_VERSIONS — added: the supported decision-document version set the doors fork on
export ./server#TenantThemeDocumentError — added: the base class `TenantThemeDocumentV2Error` now extends, so a v3 refusal propagates by name exactly as a v2 one does
export ./server#assertSupportedDocumentVersion — added: the version fork, refusing an out-of-set version by name before any shape check
export ./server#assertTenantThemeDocumentV3 — added
export ./server#assertTenantThemeDocumentVersioned — added: asserts the v2-or-v3 decision document
export ./server#isTenantThemeDocumentV3 — added
export ./server#isTenantThemeDocumentVersioned — added
export ./server#assertStyleReferenceShape — added: the document-side shape check for the row's `style` field
export ./server#THEME_STYLE_IDS — added: the published style ids, so a surface offering the choice knows what exists
export ./server#ThemeStyleReferenceError — added: the named refusal for a malformed or unpublished reference
export ./server#assertThemeStyleReference — added: refuses a reference at the boundary that writes it
export ./server#TenantThemeDocumentV3 — added: v2 plus one optional `style` field
export ./server#TenantThemeDocumentVersion — added: the version literal union
export ./server#TenantThemeDocumentVersioned — added: `TenantThemeDocumentV2 | TenantThemeDocumentV3`
export ./server#ThemeStyleId — added (typed `string`; membership is the runtime refusal, not a literal union)
export ./server#ThemeStyleReference — added: the `{ id, version }` a row persists
export .#ThemeStyleValidationError — added: the ingress-side style refusal, via the pre-existing `export * from './infrastructure/compilers'` route
```

`admitStyle`, `styleThemePatch`, `StyleAdmission` and `migrateDocumentV2ToV3` are NOT published: the ingress barrel carries them for internal wiring, and the `runtime/theme` barrel hop was narrowed to `ThemeStyleValidationError` alone (DT ruling 2026-09-21) so the root `.` surface does not gain the style machinery — the adopted contract publishes only the reference, its refusal and the v3 transport on `./server`.
