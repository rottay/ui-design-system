---
"@rottay/design-system": patch
---

WO-EVI-02, owner ruling 6. A v2/v3 theme document whose `decisions` names a
control the catalog retires (`token-overrides`, `chrome.families`) is now
refused with the retirement text instead of the generic unknown-id error. The
message reads `unsupported decision "<id>": retired; <replacedBy>`, so
`token-overrides` now says that raw `--ds-*` authorship is retired by D-03 and
points to `overrides.chrome.<family>.<channel>`. Preview, document and
publication give the same answer, because all three parse the document through
`assertTenantThemeDocumentV2`.

Nothing that was admitted before is refused now, and nothing that was refused
is admitted. Only the refusal text for those two ids changes, so this is a
patch. An id the catalog never had keeps the existing `the catalog is closed
at N ids` message. The v1 `visualFoundation.advanced.tokenOverrides` transport
is untouched.

```contract-diff
signature ./server#assertTenantThemeDocumentV2 — a retired decision id is refused with `unsupported decision "<id>": retired; <replacedBy>` taken from the catalog's retired entries, before the closed-catalog check; previously it got the generic `the catalog is closed at N ids` refusal
signature ./server#compileTenantThemeDocumentV2 — publication refuses a retired decision id with the same retirement text, as `TenantThemeDocumentV2Error`
signature ./server#compileThemeIntent — preview and document intents refuse a retired decision id with the same retirement text
```
