---
"@rottay/design-system": patch
---

WO-RET-07 registration lot (owner decision 20 and owner answer 34, 2026-10-14).
Nothing is removed from the public types in this release. Twelve deprecated
public symbols gain a ledger row naming WO-RET-07, class `debt`, removal in the
4.0 major line; that line is not released and carries no date.

Caller props, inert in every engine since ARC-12 step 3 (P-88); use `className`:

- `AvatarProps.data-part`, `AvatarProps.data-state`
- `BadgeBaseProps.data-part`, `BadgeBaseProps.data-state`
- `TagProps.data-part`, `TagProps.data-state`
- `SpinnerProps.data-part`
- `LoadingIndicatorProps.data-part`
- `ButtonPublicProps.data-part`, `ButtonPublicProps.data-state`
- `InputProps.data-part`

The `@deprecated` sentences of `ButtonPublicProps.data-part`,
`ButtonPublicProps.data-state`, `TagProps.data-part` and `TagProps.data-state`
no longer say the classic engine honors the caller value: classic strips it
since ARC-12 step 3. Comment only; the declarations are unchanged.

Consumer note for the later 4.0 removal: app-bithire passes
`ButtonPublicProps.data-state` to the DS Button at three production sites
(`ui/details/inline-editor/index.tsx:611`, `ui/upgrade/modal/index.tsx:297`
and `:334`). The value is not rendered today; the removal will turn those sites
into a TypeScript excess-property error. The design system edits no application.

Tenant-theme field `chrome.shell.commandHomePanelBgStrong`
(`BrandShellChrome.commandHomePanelBgStrong`, published through `./server`):

- The DS default writer of `--ds-command-home-panel-bg-strong` and the compiler
  emission of the field are retired. No DS or application part ever read the
  variable, so no computed style changes.
- The field stays in the contract, in the tenant-theme schema admission and in
  the iso shape, so stored theme documents that author it keep validating. It is
  marked `@deprecated`; use `--ds-command-home-surface-bg`.
- Its removal waits for the 4.0 major line and for a planned safe migration of
  the one stored tenant document that authors it (owner/ops, outside the design
  system).

```contract-diff
signature .#TagProps — the `@deprecated` text of `data-part` and `data-state` is corrected (classic strips them since ARC-12 step 3); types unchanged
signature .#ButtonProps — the `@deprecated` text of `ButtonPublicProps.data-part` and `.data-state` is corrected (classic strips them since ARC-12 step 3); types unchanged
signature .#BrandShellChrome — `commandHomePanelBgStrong` gains the `@deprecated` tag (admitted and inert; removal in 4.0 with a planned stored-document migration); type unchanged
```
