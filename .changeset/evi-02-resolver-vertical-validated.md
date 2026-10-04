---
"@rottay/design-system": patch
---

The theme resolver validates the vertical baseline it is handed.

`ResolveThemeOptions.vertical` is the vertical's original baseline, recorded on
the resolution as `verticalBaseline` and read by the lowering for one fact, the
radius dial position authored corners are normalized against. It was recorded
as it arrived. It is now checked by `assertThemeBaseline` under the label
`resolveTheme: options.vertical`, after the intent, and recorded as a private
copy labelled with the intent's slug, the same treatment `baseline` gets.

The members and their types are unchanged; the documentation of `vertical`
now states that only the compile door passes it, and only as
`baselineFor(intent.vertical, intent.slug)`. `compileThemeIntent` is the only
caller and already passed that value, so every compile is byte-identical.
`null` is no longer read as "absent": it is refused by name.

```contract-diff
signature .#ResolveThemeOptions — members and types unchanged; `vertical` is now validated by `assertThemeBaseline` as `resolveTheme: options.vertical` and cloned, and its documentation states the closed derivation
```
