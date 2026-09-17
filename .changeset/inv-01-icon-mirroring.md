---
"@rottay/design-system": patch
---

WO-INV-01 L5: directional icons mirror under RTL on both icon facades. Two
corpus rows flip `autoMirror` to true (`communication.reply` and
`data.pipeline`, arrows that run along the reading axis), four closed-cycle or
contested rows carry a recorded `review` note instead of a flip, and a corpus
gate refuses a new directional glyph that is neither flagged nor adjudicated.
The compatibility glyph catalog now stamps `data-icon-mirrored="auto"` on
fifteen exports, decided from the SUPPLIER glyph rather than the published
export name: renamed exports such as `Undo2Icon` (`ArrowUUpLeft`), `LogOutIcon`
(`SignOut`) and `ReplyIcon` (`ArrowBendUpLeft`) spell no side, so the earlier
export-name rule left them flat while their semantic twins mirrored. A second
gate parses the catalog, rebuilds the export -> supplier mapping and refuses a
directional export that is neither stamped nor adjudicated. The semantic-icon
skin mirrors the attribute on the legacy element too. No export is retired and
no prop is added. Three rows inside the fingerprinted v4 corpus prefix
(`action.open-external`, `system.workflow`, `communication.send`) are pinned as
named debt until the owner re-anchors that fingerprint; the legacy twins of the
first two (`ExternalLinkIcon`, `WorkflowIcon`) are deliberately held unstamped
so the two facades never disagree about the same glyph.

Migration: this is a behavior change for call sites that already compensated by
hand. A consumer that swaps a directional icon on `dir === 'rtl'` (for example
rendering a forward glyph in place of a back glyph) now mirrors twice and points
the arrow the wrong way. Drop the swap and render the logical glyph, or, where
the physical direction is genuinely intended, opt the element out with
`data-icon-mirrored="false"` — the override path is covered by
`glyphs/runtime/factory/phosphor-compat/tests` and by the semantic runtime's
explicit `mirrored` prop. One in-tree consumer was corrected in this lot: the
modern kanban board's coarse-pointer move rail no longer swaps
`NavigationBackIcon`/`NavigationForwardIcon` under RTL.

```contract-diff
signature ./icons/foundation#CommunicationReplyIcon — `autoMirror` flips false -> true: the facade now stamps data-icon-mirrored="auto" and the skin mirrors it under dir=rtl; no prop or export changes
signature ./icons/intelligence#DataPipelineIcon — `autoMirror` flips false -> true: the facade now stamps data-icon-mirrored="auto" and the skin mirrors it under dir=rtl; no prop or export changes
signature ./icons/corpus#GENERATED_ICON_METADATA — two rows change `autoMirror` and four rows gain the optional `review` field; the name set, roles and suppliers are unchanged
```
