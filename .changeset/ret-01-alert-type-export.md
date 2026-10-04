---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-ALERT-TYPE-EXPORT). The type `AlertType` is no longer exported by the package root, and `AlertTone` is. This is the export `.changeset/ret-01-alert-type-callout-variant.md` named as owed: since `AlertProps.type` retired, no published declaration used `AlertType` (`ALERT_DEFAULTS`, whose `type` key it types, is family-internal and not published by the root), and its vocabulary spells `error`, the value that lot retired. It is the twin of `CalloutVariant`, removed there for the same reason. The census covers `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform (2026-10-04, the codemod kit in dry-run with the entry of this lot).

`AlertType` -- the type is no longer exported. No file of the showroom or of the three apps imports the name from the package: every `AlertType` in the apps is a type the app declares itself (app-bithire `features/insights/model/domain/dashboard`, app-evnto `features/commerce/inventory/model/contracts/stock-control/alerts` and `.../domain/stock-control/presentation/alert-status`, app-platform `server/features/compliance/governance/aml/http/admin/alerts`), and those are not touched. Inside the package the name stays, unpublished, as the colour-token key the three Alert engines paint with; the frozen Classic and Rustic engines import it from the family contracts and are unchanged.

`AlertTone` -- added. It is the declared type of `AlertProps.tone` (`'info' | 'warning' | 'danger' | 'success'`), the name `CalloutTone` already gives the same four values on `Callout`. It existed in the family contracts and was not published, so an application that holds a tone in a variable had to write `AlertProps['tone']`, which also admits `undefined`. Publishing it adds one type name and no value, member or behaviour.

What an application must change. A file that imports `AlertType` from `@rottay/design-system` stops compiling; the census found none.

- Import `AlertTone` instead and type the value passed to `tone` with it. It is not a drop-in rename: `AlertTone` spells `danger` where `AlertType` spelled `error`, so each `'error'` the typed value can hold is rewritten to `'danger'` with its type. The codemod reports the import and does not edit it.
- The sites the earlier lot reported because their `tone` value is not a string literal (app-evnto 5, app-platform 9) can name their variable `AlertTone` instead of `AlertProps['tone']`. Nothing requires it.

No minor was published between the retirement of `AlertProps.type` and 3.0.

```contract-diff
export .#AlertType — removed; no published member used it since `AlertProps.type` retired, zero imports across showroom and the three apps; `AlertTone` types `tone` and spells `danger` for `error` (RET-01-ALERT-TYPE-EXPORT)
export .#AlertTone — added; the declared type of `AlertProps.tone` (`info`, `warning`, `danger`, `success`), the same four values `CalloutTone` publishes for `Callout`; a type only, no runtime change (RET-01-ALERT-TYPE-EXPORT)
```
