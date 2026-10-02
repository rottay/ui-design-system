---
"@rottay/design-system": minor
---

WO-EVI-02, owner ruling 1. The ten accent ramp steps
`--ds-color-accent-{50,100,200,300,400,500,600,700,800,900}` leave the tenant
reference allowlist. The compiler already emitted none of them and nothing in
the package or the showroom reads them, so an authored `var()` citing one was
admitted and resolved to nothing. It is now refused by name instead: an
`unsafe_value` issue at the authored path whose message reads `Retired
reference: var(--ds-color-accent-<step>) is no longer a tenant-referenceable
channel`, on the compile door (preview, document, draft) and on the schema
judge every publication and v1 `tokenOverrides` value passes through. A
fallback position is read too. The accent seed `--ds-color-accent`, its
authoring and every live consumer are unchanged.

This is a narrowing of what the package admits, which is why it is a minor:
a stored tenant row that cites a retired step now fails admission where it
used to publish a dead reference. It says nothing about third-party
stylesheets outside the tenant document.

```contract-diff
signature ./server#TENANT_THEME_REFERENCE_TOKENS — narrows by the ten `--ds-color-accent-{50..900}` steps; the accent seed `--ds-color-accent` stays (same target on `.`)
signature ./server#compileThemeIntent — refuses an authored value citing a retired accent step: `unsafe_value` at the override path naming the channel as retired. Previously admitted and painted a reference that resolved to nothing
signature ./server#compileTenantThemeDocumentV2 — the same refusal reaches publication under the door's own `ThemeAdmissionError`
signature ./server#compileTenantThemeConfig — a v1 `visualFoundation.advanced.tokenOverrides` value citing a retired accent step is refused as `TenantThemeValidationError` with the retirement message, not the generic unsafe-value one
export .#TENANT_THEME_RETIRED_REFERENCE_TOKENS — added: the retired reference roster the admission refuses by name
```
