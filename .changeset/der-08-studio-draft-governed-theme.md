---
"@rottay/design-system": minor
---

WO-DER-08. The studio draft transport leaves the flat shape: an unsaved draft is
now the governed `Theme`, so the flat projection stops being an authoring surface
as well as the lowering's read view. `draftPreviewThemeIntent` takes the governed
draft, flattens it once at the door with the canonical `readGovernedTheme`, and
hands the same patch, ledger and baseline it always did — measured leaf by leaf
against the flat route, zero differences in either direction. The lowering's own
reads are NOT retyped; that is a separate later lot.

Additive and backward compatible. The door still accepts a flat draft through a
named migration that lifts it, so every existing caller compiles the same intent.
The `tenant-preview` source union renames its tag `brand-theme` to `theme-draft`
and its payload `flatTheme` to `theme`, with `readPreviewSource` carrying the
superseded shape forward.

```contract-diff
signature .#DraftPreviewThemeIntentInput — `draft` widens from `FlatTheme` to `Theme | FlatTheme`: the governed Theme is the transport, and the flat shape is accepted through a named migration that lifts it at the door. Additive; every existing caller keeps compiling the same intent, proven by a canonical leaf-by-leaf comparison of the emitted patch on both routes
export .#draftTenantTheme — added: builds the governed `Theme` an authoring draft compiles as, from the four fields the studio collects. It lives in the ingress because `tests/architecture/theme-lowering-single-door` confines the wrap-only lift to `src/infrastructure/compilers/` and `src/entrypoints/` by name, and a draft constructor is ingress rather than authoring configuration
export .#governedTenantTheme — added: lifts an already-flat authored draft into the governed `Theme` the compile door takes, so a consumer holding the flat shape reaches the new transport without naming the lowering's lift itself
```
