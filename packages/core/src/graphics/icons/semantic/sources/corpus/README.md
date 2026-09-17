# Semantic icon corpus — directional mirroring

`autoMirror: true` makes the facade stamp `data-icon-mirrored="auto"`, which the
icon skin turns into `transform: scaleX(-1)` under `:dir(rtl)`. The flag is a
statement about the glyph's axis: mirror only when the drawing encodes the
reading direction. Rotational (`ArrowClockwise`, `Repeat`), vertical
(`ArrowUp`, `ArrowsDownUp`) and doubly symmetric (`ArrowsOutSimple`) glyphs
never mirror.

The gate is `tests/directional-mirroring.test.ts`: every row whose pinned
supplier glyph matches a directional family must either carry `autoMirror:
true` or appear in one of its adjudicated bands with a reason. Per-row
decisions live in the row's own `review` field wherever the generator allows
one to be added.

## Supplier metadata

Phosphor 2.1.10 ships no per-glyph mirroring metadata. `mirrored` is a
per-call prop on `IconBase`/`SSRBase` (`dist/lib/types.d.ts`), not a property
of the glyph, so the corpus cannot inherit the decision from the supplier. The
adjudications below follow Material's bidirectionality guidance and Apple's
RTL guidance for the equivalent symbols.

## Adjudicated rows (2026-09-17, WO-INV-01 clause 4)

| Row | Glyph | Decision | Reason |
|---|---|---|---|
| `communication.reply` | `ArrowBendUpLeft` | mirror | The arrow bends back toward the start of the reading direction. |
| `data.pipeline` | `ArrowsSplit` | mirror | The split runs along the reading axis. |
| `billing.subscription` | `Repeat` | no mirror | A closed cycle; rotation is not reading direction. |
| `workflow.loop` | `RepeatOnce` | no mirror | A closed cycle; rotation is not reading direction. |
| `communication.send` | `PaperPlaneTilt` | no mirror (dissent recorded) | A vehicle in flight rather than a reading-direction arrow. Material does mirror its own send glyph, so this is contested; the row is frozen (below) and a reversal is an owner ruling. |
| `action.open-external` | `ArrowSquareOut` | mirror OWED | Material mirrors `launch`/`open_in_new` and Apple ships RTL variants of `arrow.up.forward.square`. Blocked: frozen row (below). |
| `system.workflow` | `FlowArrow` | mirror OWED | The flow runs along the reading axis. Blocked: frozen row (below). |

## Frozen prefix

`scripts/generate/semantic-icons/index.mjs` fingerprints the first 126 entries
of this manifest (`V4_CORPUS_PREFIX_FINGERPRINT`). Rows 0-125 cannot change
`autoMirror` or gain a `review` field without failing corpus validation, so
the three rows marked above (`action.open-external` 54, `communication.send`
82, `system.workflow` 99) carry their decision in the gate's
`FROZEN_PREFIX_DEBT` / `ADJUDICATED_NON_FAMILY` bands instead. Draining that
debt requires an owner ruling on re-anchoring the v4 fingerprint.

## Legacy compatibility catalog

The second facade — the named catalog under
`glyphs/presentation/catalog/` — has no corpus row. Its decision is derived by
`glyphs/foundation/directionality` from the **supplier** glyph, never from the
published export name: the catalog renames freely (`Undo2Icon` is drawn by
`ArrowUUpLeft`, `LogOutIcon` by `SignOut`, `ReplyIcon` by `ArrowBendUpLeft`),
so an export-name rule leaves those glyphs flat while their semantic twins
mirror. The gate is `glyphs/presentation/catalog/tests/directional-stamping.test.ts`:
it parses every catalog `index.ts`, rebuilds the export -> supplier mapping and
fails on any export whose supplier is directional and is neither stamped nor
adjudicated with a reason.

Fifteen exports stamp `data-icon-mirrored="auto"`: `ArrowDownLeftIcon`,
`ArrowDownRightIcon`, `ArrowLeftIcon`, `ArrowRightIcon`, `ArrowUpRightIcon`,
`ChevronLeftIcon`, `ChevronRightIcon`, `LogOutIcon`, `PanelLeftCloseIcon`,
`PanelLeftOpenIcon`, `PanelRightCloseIcon`, `ReplyIcon`, `ToggleLeftIcon`,
`ToggleRightIcon`, `Undo2Icon`.

`ExternalLinkIcon` (`ArrowSquareOut`) and `WorkflowIcon` (`FlowArrow`) owe a
mirror and are deliberately held back by
`FROZEN_CORPUS_PREFIX_EXPORTS`: their semantic twins are frozen-prefix rows
that cannot carry `autoMirror`, and the two facades must not disagree about the
same glyph. They drain with the fingerprint, in one move, not before.
`SendIcon` (`PaperPlaneTilt`) needs no entry: the no-mirror decision recorded
for `communication.send` is what the name rule already produces.
