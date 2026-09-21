# file-manager's danger ink — arm 3a, the family half

Writer packet opened on `e20059e65` (`git rev-parse HEAD` at start), which is
the arm-3b danger mode regrade itself. The working tree also carried another
writer's uncommitted `roadmap/{README,proposals,retire}.md` and an
`evidence/style-history-roadmap-review/` folder — none of that is mine.

Harness: `tests/support/family-causality` — the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`), the resolved
source stylesheet plus one compiled arm in real Chromium, computed style read
back. Colours resolve through a 1x1 canvas, because `color-mix()` serializes as
`color(srgb ...)` and a regex reports near-black for near-white.

Six scopes everywhere: the four gated `AXE_SCOPES` plus `rottay light` and
`evnto dark`, because a previous lot found a defect hiding in `evnto dark`
precisely because no gate looks at it.

---

## Headline

| | |
| --- | --- |
| **Regressions (passing -> failing)** | **0** |
| Delete pairings below 4.5:1 before | 8 of 30 (6 scopes x 5 delete readings) |
| Delete pairings below 4.5:1 after | **0** |
| Control readings byte-identical | **36 of 36** (6 controls x 6 scopes) |
| `AXE_DEBT` nodes drained | **6 of 7** — every `*-delete` node in both scopes |
| `AXE_DEBT` nodes left | **1** (`f1-name`, the link channel, not this arm) |

---

## 1. What landed

Two statements, both this family's.

### 1.1 `components/patterns/data/file-manager/engines/modern/index.tsx`

```diff
   <ModernButton
     variant="ghost"
+    danger
     size="xs"
     data-part="item-action"
     data-action="delete"
```

`variant="ghost"` is kept deliberately: `danger` on a solid variant resolves to
the solid destructive recipe, while `danger` on a quiet variant keeps the
variant and stamps `data-tone='danger'`. Measured: `data-tone` is `null` on
every delete button in all six scopes before, `danger` in all six after.

### 1.2 `foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css`

```diff
 .ds-pattern-file-manager.ds-engine-modern [data-part='item-action'][data-action='rename'] {
   color: var(--ds-color-text-primary);
 }
-.ds-pattern-file-manager.ds-engine-modern [data-part='item-action'][data-action='delete'] {
-  color: var(--ds-color-error);
-}
```

`--ds-color-error` is the FILL role, used here as an ink. The composed ghost
Button's rest wash is `color-mix(in srgb, currentColor 7%, transparent)`, so
this one statement also tinted the ground its own ink was measured against —
both legs of the pairing were the family's, which is why they move together
and why no ink-only candidate could ever have repaired it.

---

## 2. Why it could not land before 3b, and what 3b changed

The earlier lot (`evidence/fam-fm-contrast-close/`) wrote exactly this repair,
measured it in six scopes and STOPPED: it drained `bithire dark` (2.74 -> 4.94)
but left `evnto light` at 4.35 and pushed `rottay`/`evnto dark` from 5.24 to
**3.18**. The arithmetic was exact rather than a judgement call — to clear
4.5:1 on the dark ghost ground `#262334` an ink needs L >= 0.257, on the light
ghost ground `#fdf0f0` it needs L <= 0.160, and `--ds-button-error-border` was
`--ds-color-error-600` `#dc2626` in BOTH modes of the DS default.

Arm 3b repaired that at the channel level: it inverted the DS default's dark
error ramp, moved `--ds-color-error` to step 600 and took the quiet-danger ink
to steps 700/800/900. The channel census, read at the root in each scope
(`probe/channels.txt`):

| scope | `--ds-color-error` | `--ds-button-error-border` (= error-700) |
| --- | --- | --- |
| rottay / evnto light | `#dc2626` | `#b91c1c` |
| rottay / evnto dark | `#f87171` | `#fca5a5` |
| bithire light | `#C62828` | `#710008` |
| bithire dark | `#C62828` | `#FF998E` |

That table is also the whole defect in one line: bithire's `--ds-color-error`
is **mode-blind** (`#C62828` in both modes, its artifact states the literal),
while its `--ds-button-error-border` grades per mode. The family was reading
the one channel in the package that does not follow the mode for that tenant.

---

## 3. The six-scope table

Before = HEAD (`e20059e65`, with all of 3b's legs). After = this lot.
Raw readings `probe/{before,after}.json`, flattened `probe/table.txt`.
`a1` is the SELECTED row, so its ghost wash sits on the selection tint and
reads lower than `a2`/`f1` in every scope — it is the worst cell, and it is the
one the floor has to clear.

### The delete label at rest

| scope | before | after | verdict |
| --- | --- | --- | --- |
| **bithire dark** (gated) | `#c62828` on `#262741` **2.59** / `#242334` **2.74** | `#ff998e` on `#2a2f48` **6.40** / `#282b3b` **6.82** | repaired |
| **evnto light** (gated) | `#dc2626` on `#ecdfdf` **3.73** / `#fdf0f0` **4.35** | `#b91c1c` on `#e9dede` **4.93** / `#faefef` **5.75** | repaired |
| rottay light | `#dc2626` on `#ecdfdf` **3.73** / `#fdf0f0` **4.35** | `#b91c1c` on `#e9dede` **4.93** / `#faefef` **5.75** | repaired (ungated, was failing) |
| rottay dark (gated) | `#f87171` on `#282737` 5.28 / `#282839` 5.24 | `#fca5a5` on `#282b3b` 7.37 / `#282c3d` 7.31 | improved |
| bithire light (gated) | `#c62828` on `#ece4ee` 4.52 / `#fbf0f0` 5.04 | `#710008` on `#e6e1ec` 9.58 / `#f5edee` 10.69 | improved |
| evnto dark | `#f87171` on `#282737` 5.28 / `#282839` 5.24 | `#fca5a5` on `#282b3b` 7.37 / `#282c3d` 7.31 | improved |

Every cell clears 4.5:1 after. Nothing that passed before fails after.

### The stateful arms (the kernel's own `data-state`, `transition: none` pinned)

Both arms carry a non-vacuity flag — `applied` is true in all six scopes, so
neither reading is a silent no-op.

| scope | hover before -> after | pressed before -> after |
| --- | --- | --- |
| bithire dark | 3.32 -> **9.56** | 3.19 -> **12.28** |
| evnto light | 4.47 -> **6.45** | 4.20 -> **7.24** |
| rottay light | 4.47 -> **6.45** | 4.20 -> **7.24** |
| rottay / evnto dark | 6.92 -> 10.41 | 6.87 -> 11.46 |
| bithire light | 5.02 -> 13.02 | 4.68 -> 13.98 |

Both transient states were also below the floor in three scopes before, for
the same cause; they are repaired by the same two statements.

### The controls — byte-identical in all six scopes

`rename` label, `folder-link` label, the `data-current` crumb, the bulk
`delete-selected` label, the name cell and the size cell: same ink, same
ground, same ratio before and after, in every one of the six scopes. That is
the proof the deleted statement carried nothing but the delete action.

The bulk `delete-selected` button is the SOLID danger recipe and is untouched
here; it fails in five of six scopes — white on `#ef4444` at 3.76:1 in
rottay/evnto (both modes) and 4.27:1 in bithire dark, with only bithire light
clearing at 5.86:1 (Fable's independent readings) — and axe does not
report it in any gated scope at HEAD or after. Not this arm's row, and moving
it would be a Button-level decision — registered as a follow-up, not silently
absorbed.

---

## 4. `AXE_DEBT`, measured

Run through the pin itself (`auditAxe` over the four gated `AXE_SCOPES`):

```
measured = { 'bithire dark': { 'color-contrast': ['#_R_2_-f1-name > ...'] } }
```

- `bithire dark`: the three `*-delete` nodes are **gone**; `f1-name` remains.
- `evnto light`: **gone entirely** — all three of its nodes were delete nodes.

The packet's acceptance asked for `{}`. The measurement says **one node
survives**, and it is the node the packet itself excludes: `f1-name` is the
folder link, `variant="link"`, reading `--ds-color-link`, which bithire's own
artifact states as `#3f6ffd` — 3.72:1 on its dark card, byte-identical before
and after this lot. It is the link channel, registered separately, and repairing
it is neither in this write set nor reachable from it. `AXE_DEBT` is therefore
pinned at exactly that one node rather than emptied; **no third mechanism was
invented to force the map to `{}`**.

---

## 5. Captures

`captures/{head,after-danger-stamp}/{bithire-dark,evnto-light}.png`, 2x DPR,
the toolbar and the first row's actions, in the two scopes that were failing.
`head` is the tree with neither statement changed (produced by reverting both
source files via a `cp` backup and restoring them byte-identically afterwards;
`git diff` over `packages/core/src` confirmed only the pin file differed during
that window).

**Looked at, both folders. Verdict: the pixels and the measurements agree.**
In `bithire-dark`, "DELETE" goes from a dark red that reads as a disabled label
on the dark card to a legible coral; the crumb pill, "RENAME", the "CONTRACTS"
link, the folder icon and the solid "DELETE (1)" pill are unchanged in the
frame. In `evnto-light`, "Delete" deepens by one ramp step — a small but
visible move, consistent with 4.35 -> 5.75 on the ghost wash — and nothing else
in the frame changes. The capture pipeline is not pixel-deterministic
(established in an earlier lot), so no PNG diff is claimed; every ratio above
comes from the computed-style path, which is exact.

---

## 6. Validation

| command | result |
| --- | --- |
| `vitest run --project integration src/components/patterns/data/file-manager src/components/primitives/inputs/button` | **6 files / 57 tests passed** (incl. the axe pin) |
| `vitest run --project unit` over the same two families | **15 files / 182 tests passed** |
| `pnpm exec tsc --noEmit` | **exit 0** |
| `vitest run` over the three suites that name `file-manager` (`theme-contract-freeze`, `modern-skin-edge-vocabulary`, `retired-sortable-list`) | 2 files passed; `theme-contract-freeze` fails **identically with my two source files reverted to HEAD** (117 vs 108 lowering owners, all `lowering/` derivation owners I do not touch) — pre-existing, not mine |
| `scripts/check/engine/css/paint/layers` | FAIL at HEAD for three findings (`--radius-field` projection, two retired-entrypoint writers); none names this family — delta zero |

## 7. Probe

`probe/_probe-fm-danger.test.tsx` and `probe/_probe-fm-danger-capture.test.tsx`
are the scratch suites that produced the readings (run from
`packages/core/tests/integration/`, moved here afterwards).
`probe/{before,after}.json` are raw, `probe/table.txt` is the flattened
before/after and `probe/channels.txt` the per-scope channel census.

## 8. Left to the DT

1. `f1-name` — bithire's `--ds-color-link` `#3f6ffd` at 3.72:1 on its own dark
   card. Registered, untouched, and the only node left in this family's map.
2. The bulk `delete-selected` solid danger button, failing in five of six
   scopes (3.76:1 in rottay/evnto, 4.27:1 in bithire dark; only bithire light
   clears at 5.86:1). Unreported by axe in every gated scope, failing on the
   measurement, and a Button-level decision rather than a family one.
3. Generated artifacts and the tokens catalog are the DT window as usual; this
   lot adds no channel, so no regeneration is owed by it.
