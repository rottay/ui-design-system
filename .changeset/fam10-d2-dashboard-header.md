---
"@rottay/design-system": minor
---

WO-FAM-10 sub-lot D2: the dashboard-header family cut — chrome deriver, drained
Modern skin and runtime adoption of the shared interaction kernel, at the same
resting paint.

ONE NEW CHROME DERIVER. `derivation/chrome/dashboard-header` (rank `derived`)
produces 23 `--ds-dashboard-header-*` channels at exactly the fallbacks the
Modern skin already read: the root card's room axis (the fluid clamp on the
density dial), hairline rule and border ink, the quiet top-down wash, its
highlight and elevation, the one-sweep sheen's opacity and duration, the
identity tile's size, inks and frame, the page-title tracking, the four metric
chip-frame channels (respelled from `--ds-dashboard-metric-*` into the family
namespace at byte-identical fallbacks — the kanban-board precedent), the
inter-cell rule ink and the action cluster's opt-in glass. Sixteen of the
names were read by the skin and written by nobody — a channel that looked
customizable and was not; they are tenant-movable now, at no pixel change. The
seven rhythm aliases the skin mounted as family-private `--_ds-*` names moved
into the namespace at the same values, and the eighth (`--_ds-...-rule-color`)
was a pure alias of the border chain and is read as that chain directly. The
deriver lands unregistered; the DT adds the `FAMILY_DERIVERS` line at
integration, and its contract test is adapted to prove precedence without
registry membership.

STATE DECIDED ONCE (F-37). The skin's five painted `data-state` arms keyed on
the OPERATIONAL status (live/connected/syncing/offline/warning) — a domain
value stamped on the kernel's interaction-state attribute, while the
interactive arms nothing stamped painted. The operational state moves onto its
own `data-status` stamp (the root already carried it; the status marker's
three parts now stamp it too) and the tone/pulse selectors follow. The metrics
readout — a real tab stop (`tabIndex=0`, `role='group'`, the i18n
`key_metrics` label) — becomes the family's one kernel-governed part:
`useInteractionState` + `partAttributes` decide its focus ring and serialize it
as `data-state`, and both painted `:focus-visible` rules (resting and
forced-colors) now pair the pseudo with its `[data-state~='focus-visible']`
twin. The composed action Buttons run their own kernel; the family
double-stamps nothing on them. `statesConsumedNotStamped` 5 -> 0,
`unpairedStatePseudoSelectors` 2 -> 0, `stateGoverned` resolved.

CONSUMER-VISIBLE DOM CHANGES. `data-state="live|connected|syncing|offline|warning"`
on `status-dot`, `status-dot-glyph` and `status-dot-text` becomes
`data-status="<same value>"` (matching the root's existing `data-status`);
`metrics-row` gains a kernel-serialized `data-state` while focused
(`focused focus-visible`) and pointer handlers. No prop shape moved; the
metric chip-frame channels are renamed `--ds-dashboard-header-metric-*`
(formerly `--ds-dashboard-metric-*`, unproduced and therefore unreachable by
any tenant). Every behavioural invariant holds: no `role="banner"`, the h1
names the region via `aria-labelledby`, the readout's tab stop and group label,
the bdi wrappers, the status label floors and the full-label `aria-label` on
actions.

CONTRACT EVIDENCE. `DashboardHeader.cut.test.tsx` pins the 23-part anatomy
stamp<->rule contract, the state contract, the zero-inline-paint law and the
family's own accessibility assertions (region naming, the readout's group
label and tab stop, the status text as the colour-blindness carrier, and the
trend readout in text under dir=rtl).
`DashboardHeader.causality.integration.test.tsx` probes every `consumes`
keypath the deriver declares — palette (seeds and neutral temperature),
typography, spacing/density, shape, elevation, focus style and motion — as
computed-style movements through the skin's shared-root fallback chains while
the deriver is unregistered, against the hairline's literal width as the
negative control, plus the kernel-token ring probe, the rtl reading of the
inter-cell rule and axe over the four gated scopes with node-identified debt.
