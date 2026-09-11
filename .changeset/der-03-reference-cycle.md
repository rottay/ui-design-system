---
"@rottay/design-system": patch
---

WO-DER-03. A governed override may point a channel at another channel, but not
at itself. `chrome.controls.buttonGeometry.radius: var(--ds-radius-button)` was
admitted on every door and painted `--ds-radius-button: var(--ds-radius-button)`
plus the five per-size button radii derived from it -- a custom property that
resolves to itself paints nothing, so the tenant's radius silently disappeared
while the ledger reported the override as effective. The admission gains a
sixth station: the AUTHORED reading refuses a chrome value that reads a channel
the same leaf writes, at the override's own path, with the leaf's write set
probed from `chromeToVariables` so it covers the derived fan-out; the EMITTED
reading refuses any reference cycle in the tenant's compiled delta, whatever
authoring route produced it. Legitimate cross-references
(`var(--ds-radius-md)`) and references out of the tenant's own delta are
unchanged.

```contract-diff
signature ./server#compileThemeIntent — refuses a tenant-authored reference cycle: `unsafe_value` at the override path for a chrome value that reads a channel its own leaf writes, and at `$.variables["--ds-*"]` for a cycle in the compiled delta. Previously admitted and painted verbatim
signature ./server#compileTenantThemeDocumentV2 — the same two refusals reach publication under the door's own `ThemeAdmissionError`, so preview and publish answer identically
signature ./server#compileTenantThemeConfig — a v1 `visualFoundation.advanced.tokenOverrides` entry whose value references its own token is now refused as `TenantThemeValidationError`; it previously compiled into a self-referencing channel
```
