---
"@rottay/design-system": patch
---

The assistant patterns and `RecordWorkbenchSurface` gain owner class doors on
their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, family lot 6 of the
Box and Flex cohort). In the assistant kit, nine elements that the assistant
skin reaches by a caller `data-part` now also carry a class beside that part:
the `StreamingText`, `TypingIndicator`, `AssistantStatusIndicator` and
`MessageBubble` roots gain `ds-assistant-message-bubble__root`, and the
`PreviewDiffCard` spacer, arrow and cell-wrap boxes gain
`ds-assistant-preview-diff-card__diff-spacer`, `__diff-arrow` and
`__diff-cell-wrap`. The four record workbench elements (tab list, content,
tab panel and sidebar) already carried `ds-record-workbench__<part>`, so their
markup does not change. In the assistant skin 5 selectors, and in the record
workbench skin 6 selectors, that reach these elements by `[data-part]` now
also reach them by class, as a second selector next to the part one, at the
same specificity. The `[data-part]` side stays. `DetailSurface` is unchanged.
Rendered markup changes only by the new class tokens, and every rule matches
the same elements at the same specificity as before. The four vertical CSS
bundles carry the same selectors. This prepares the Modern `Box` and `Flex` to
stamp their own part (a later strip).
