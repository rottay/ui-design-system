# WO-SKIN-02 checkpoint C (pickers) — kit ADDENDUM

Read `skin02-migration-kit.md` FIRST (the full method: counter, skin homes, (0,4,0) law,
state/handler mapping, keyframe rename, byte-exact, comment rules, hard limits, verify+report).
This addendum layers the checkpoint-C specifics on top. In-repo precedents to copy the idiom
from: the 31 fields skins just landed under `foundation/tokens/css/runtime/engines/{modern,rustic}/skin/` +
`foundation/tokens/css/presentation/components/skin/` (esp. `tag-input.css`, `input-number.css` `:has()` idiom,
`radio.css` fresh per-part, `password-input.css` variant `:not()` chain, `slider.css`
data-orientation/data-axis, `input-residual.css` compose-without-collision).

## Ground-truth-over-inventory
The COMPONENT CODE is authoritative. The inventory/contract have been wrong before this batch
(Toggle/rustic had no keyframe; Radio/Checkbox had no prior skin). Re-locate every line and
re-read the actual JSX before transcribing.

## Portal panels are STANDALONE-scoped
DatePicker/TimePicker/ColorPicker-rustic panels `createPortal(..., document.body)` — they are NOT
DOM descendants of the trigger root, so you CANNOT scope their rules under the trigger's class.
The pre-step stamped each portaled panel with its OWN self-sufficient class + `data-part='panel'`
(read the file for the exact class it stamped). Scope panel rules on that panel class, standalone.
The trigger stays root-scoped as usual. (ColorPicker modern's dropdown is IN-TREE — root-scoped;
rustic's is portaled — standalone. Preserve that asymmetry, do not unify.)

## data-state unification for drag/imperative
Upload Dragger: the split active-class + inactive-inline mechanism unifies on the existing
`data-state='dragging'|'idle'` attribute (the DnD handlers KEEP their state logic; delete ONLY the
paint writes / the inactive inline `borderColor`). Transcribe BOTH states' values verbatim into
CSS keyed on `[data-state='dragging']` vs the base/idle rule.

## Runtime-must-stay-inline
Upload per-file progress `width: ${percent}%` STAYS inline (DOM-measured). ColorPicker swatch
`backgroundColor: currentValue` and preset `backgroundColor: color` are state/author-driven, NOT
DOM-measured → custom-property hatch: `style={{ '--ds-colorpicker-swatch-color': currentValue }}`
(quoted key, uncounted) consumed by a static skin rule. Native `input[type=color]`/`input[type=time]`
UA chrome is untouched.

## Hardcoded literals — transcribe VERBATIM, then LIST + FIX where noted
Transfer/rustic concentrates the hardcodes: search-focus boxShadow `0 0 0 3px rgba(22,119,255,0.15),
0 0 8px rgba(22,119,255,0.08)`; item-hover `borderLeft: 3px solid var(--ds-color-primary, #1677ff)`;
move-button hover/mousedown boxShadows `0 2px 6px rgba(0,0,0,0.1)` etc. Transcribe byte-exact into
CSS. Two real DEFECTS to fix structurally (per decision 5): the search `onBlur` sets
`borderColor=''` (empty) — deleting the handler + a CSS rest border rule restores a real default
(the '' bug disappears). List every literal for the P-70 proposal.

## Two ReactDOM/box-model traps (learned from checkpoint B this cycle)
1. If a style object MIXES paint and LAYOUT keys, the layout keys STAY inline (only counted paint
   moves). Do not strip width/height/padding/position/display/gap/flex/etc.
2. `<shorthand> + <longhand>: undefined` pairs: when the original code sets e.g. `border: X` then
   conditionally `borderColor: cond ? c : undefined`, reproduce the removal with an EXPLICIT
   `none`/`0` in the else-branch rule (not `undefined`) and a one-line constraint comment, so the
   CSS cascade matches ReactDOM's undefined-key-removal behavior.

## Hard limits (checkpoint C)
- Touch ONLY your assigned component files + new skin CSS + (orchestrator wires base.css/styles.css
  and the PickersBatch test — you do NEITHER). NEVER `git stash`/checkout/restore/reset in the
  shared tree (a concurrent agent's stash was a near-miss). No build/record/commit/install.
- Keep DnD/state LOGIC intact — delete only PAINT writes.
- If full-dir vitest times out on concurrent edits, scope to your component test files and say so.

## Verify (your files) + report
`cd packages/core && node scripts/engine-token-audit.mjs | grep -E "<your files>"` → each 0.
`pnpm vitest run <your component dirs>` → green (report which; if a pre-existing test asserts a
moved-out inline value via toHaveStyle, DON'T edit it — report the file+line for the orchestrator).
Report: per-component one-line (sites→0, skin file, states/handlers converted, portal posture);
verify tails; hardcoded-literal list; the swatch/data-state decisions; deviations; contradictions.
