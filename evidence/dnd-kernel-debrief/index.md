# Shared DnD kernel — contract debrief (WO-FAM-08 / F-69)

Design packet. No product code was written. Every number below is a measurement
over the tree at the base commit, and each claim carries its `file:line`.

Reviewers: Codex, Kimi, Fable (shared-core review, `roadmap/README.md` execution
policy). Record ACCEPT or HOLD with evidence.

---

## 1. WO / base

| | |
|---|---|
| Work order | WO-FAM-08 — Family cut: data-table, toolbars, column settings, saved views, widget-board, kanban, calendar-view, file-manager and shared DnD/export kernels |
| Finding | F-69 — DnD re-implemented per pattern |
| WO step | `roadmap/family-cuts.md:207` step 4 — "one DnD kernel and one export" |
| Base HEAD | `75ce56bfdef64388d7c32b3c36bfef116c3367b4`, branch `main` |
| Checkout | `/Users/daniel/Developer/Rottay/r4-recon-opus` |
| Phase | DESIGN. Implementation is a separate dispatch AFTER this debrief resolves. |

**Circularity resolution.** The FAM-08 registry note of 2026-09-17 04:18 routed the
DnD kernel to WO-FAM-13 ("pertenece a WO-FAM-13"); the closure inventory of
2026-09-17 08:00 recorded the FAM-08/FAM-13 fiches as circular (D15). The handoff
law of 2026-09-17 resolves it by the newer authority: **the base kernel is
FAM-08's scope; FAM-13 (widget-board) adopts it later.** D15's older
recommendation is superseded and registered for owner ratification; this packet
does not close that question, it executes under the handoff.

**Tree state at base.** The worktree carries 18 modified and 4 untracked paths
belonging to other in-flight writers (overlay positioning, table-toolbar
direction, export runtime). None of them is in this packet's write set and none
was touched. `column-menu/index.tsx` is modified by another writer and was read
only.

---

## 0. Census — verified, corrected, extended

_Numbered 0 on purpose: the debrief owes exactly seven sections and they keep
the numbers 1-7. This is the measured evidence base every one of them rests on,
and section 2's contract is derived from it line by line._

The starting census said: kernel with zero consumers, and **eight owners
re-implement HTML5 DnD by hand**. The first claim is confirmed exactly. The
second is confirmed as a count of files but is **wrong as a statement of one
problem**: the eight owners implement **three different problems on three
different transports**, and one of the eight implements nothing at all.

### 0.1 The existing kernel — confirmed, zero consumers

`packages/core/src/infrastructure/runtime/application/interaction/drag-and-drop/index.ts`
exports `useSortableList` (single list, index-based, HTML5 transport, its own
two-phase grab/drop keyboard protocol at lines 258-314, `role="list"` container
and hardcoded English `aria-label: 'Sortable list'` at lines 321-322).

Every reference to the symbol in the repository:

| Reference | Kind |
|---|---|
| `infrastructure/runtime/facade/react-hooks/index.ts:351-356` | barrel re-export |
| `.../drag-and-drop/tests/sortable-list.test.ts` | its own test |
| `artifacts/generated/manifest/cascade/{producers,fanout}`, `artifacts/quality/certification/claims/**`, `contracts/runtime/suppliers`, `scripts/check/family-cut/baseline`, `scripts/package/artifacts/inventory/baseline`, `dist/**` | generated/baseline |

**Production consumers: 0.** Confirmed.

Extension the inventory did not record: the facade is re-exported by
`infrastructure/runtime/facade/index.ts:2`, which `src/index.ts:256` re-exports
with `export *`. **`useSortableList` and its four types are on the ROOT public
entrypoint `@rottay/design-system`.** Retiring or narrowing it is a published-API
change and needs a contract-changeset. This is a cost of alternative (c) in §5.

### 0.2 The eight named owners — confirm / correct

Measured with three independent metrics so the "19 handlers" and "39" figures of
the starting census can be reconciled: `defs` = named `handle*Drag*|handle*Drop*`
definitions, `jsx` = JSX handler attachments, `tok` = occurrences of the HTML5 DnD
vocabulary (`onDrag*`, `onDrop`, `dataTransfer`, `draggable`), including type
declarations and prose.

| # | Owner | Modern file | defs | jsx | tok | Verdict |
|---|---|---|---|---|---|---|
| 1 | kanban-board | `components/patterns/visualization/kanban-board/engines/modern/index.tsx` | 4 | 7 | 20 | CONFIRMED re-implementer. The starting census's "19 handlers" is the token count minus one; there are 4 handler definitions. |
| 2 | saved-views | `components/patterns/data/saved-views/engines/modern/index.tsx` | 4 | 4 | 8 | CONFIRMED re-implementer. |
| 3 | column-menu | `components/structures/workspace/column-menu/index.tsx` | 4 | 4 | 9 | CONFIRMED re-implementer. "0 keyboard handlers, 0 announcements" confirmed exactly. |
| 4 | primitives/tree | `components/primitives/display/tree/engines/modern/index.tsx` | 4 | 4 | 49 | CONFIRMED re-implementer. The starting census's "39" is not reproducible by any of my three metrics; the token count is 49 and the handler count is 4. |
| 5 | tree-view | `components/patterns/visualization/tree-view/engines/modern/index.tsx` | 1 | 1 | 10 | **CORRECTED — not a re-implementer.** It renders `ModernTree` (line 318) and its single `handleDrop` (lines 227-235) only reshapes `TreeDropInfo` into `{dragKey, dropKey, position}`. It is an ADAPTER over owner 4. |
| 6 | file-manager | `components/patterns/data/file-manager/engines/modern/index.tsx` | 2 | 3 | 5 | **CORRECTED — different problem.** No drag source exists. It is an external-file drop zone: `handleDrop` reads `e.dataTransfer.files` (line 248) and calls `onUpload`. No item model, no reorder. |
| 7 | upload | `components/primitives/inputs/upload/engines/modern/index.tsx` | 1 | 3 | 6 | **CORRECTED — different problem.** Same shape as owner 6: `e.dataTransfer.files` at line 928, dropzone at 962-974. |
| 8 | widget-board | `components/patterns/data/widget-board/engines/foundation/index.tsx` | 0 | 0 | 1 | **CORRECTED — different transport.** It sets `draggable={false}` (line 1371) and implements Pointer Events: `setPointerCapture` at 782 and 964, window `pointermove`/`pointerup`/`pointercancel`/`keydown` at 760-770, an activation threshold and an origin snapshot for cancel at 783-794. HTML5 DnD is not used and cannot express this. |

### 0.3 Re-implementers the inventory missed

| Owner | Evidence | Disposition |
|---|---|---|
| `data-table` classic engine | `engines/classic/index.tsx:272-292, 390-413` — the same four-handler quartet for column reorder | **Frozen engine. Out of scope**, recorded so a later reader does not count it as un-migrated Modern debt. |
| `data-table` rustic engine | `engines/rustic/index.tsx:331-349, 492-496` — idem | Frozen. Out of scope. |

Three grep hits are prose only and are NOT DnD implementations:
`primitives/layout/splitter/index.ts:5` (docblock), `primitives/inputs/button/compound/icon/index.tsx:88`
(comment), `foundation/contracts/runtime/components/patterns/core/index.ts:376` (doc).
`charts/network-graph` and `charts/runtime/interaction/brush` use D3 pointer drag, a
fourth transport, outside F-69.

### 0.4 The real cohort: four sortable owners, one identical quartet

Of the eight, exactly **four** implement item reordering on the HTML5 transport,
and all four define the identical handler quartet:

| Owner | Handler names |
|---|---|
| kanban-board | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| saved-views | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| primitives/tree | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| column-menu | `handleColumnDragStart` `handleColumnDragOver` `handleColumnDrop` `handleColumnDragEnd` |

This is the kernel's evidence base. Everything below distinguishes what those four
share from what they genuinely do not.

### 0.5 Feature surface, measured per owner

`—` means the owner does not have the concept; `0` means it has it and it is empty.

| Capability | kanban | saved-views | column-menu | tree | tree-view | file-manager | upload | widget-board |
|---|---|---|---|---|---|---|---|---|
| Transport | HTML5 | HTML5 | HTML5 | HTML5 | (owner 4) | HTML5 files | HTML5 files | Pointer |
| Drag source | whole card | whole item | **handle** (`Button`, `index.tsx:674-686`) | whole row | — | — (none) | — (none) | handle + edges |
| Cross-container | **yes** (column → column) | no | no | yes (reparent `inside`) | — | — | — | yes (grid cells) |
| Collision rule | container + index | target key, splice | target key, splice | **3-zone geometry** 25/50/25 by cursor Y (`tree/engines/modern:803-820`) | — | — | — | grid solver |
| Commit model | **controlled** (`onItemMove` fires on drop) | **controlled** (`onViewReorder(string[])`) | **DRAFT** — drop mutates local `draftOrder`, `onColumnsChange` fires on Apply (`index.tsx:489-491`) | **controlled** (`onDrop(TreeDropInfo)`) | controlled | — | — | controlled `commit()` |
| Keyboard operable | **yes** — immediate arrow-move, no grab phase (`:312-335`) | **no** | **no** | arrows are owned by tree NAVIGATION (WAI-ARIA TreeView), not by move | no | n/a | n/a | yes (window keydown) |
| aria-live announcements | **yes** — `data-part="move-announcer"` `aria-live="polite"` `role="status"` (`:643-644`), 5 message keys | **0** | **0** | **0** | 1 region, loading only | **0** | 3 regions, file-list only | **0** |
| Touch operable | **yes** — explicit move rail gated on `(hover: none) and (pointer: coarse)` (`:135, 210`) | no | no | no | no | picker fallback | picker fallback | yes (pointer) |
| Auto-scroll | **0** | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Drag preview (`setDragImage`) | **0** | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Press-cancel on dragend | **yes** (`:93-125`) | n/a | **missing** (see §7, R2) | n/a | — | — | — | n/a |

**Auto-scroll and drag preview are 0/8.** The browser default ghost is what every
owner ships. Neither is in the intersection and the kernel must not invent them
in this WO.

### 0.6 Three keyboard models already exist, and they contradict

1. `useSortableList` — two-phase grab/drop: Space grabs, arrows choose, Space
   drops, Escape cancels (`drag-and-drop/index.ts:258-314`). **Zero consumers.**
2. kanban — one-phase immediate move: an arrow moves the card now and announces
   the result; there is no grabbed state (`kanban/engines/modern:312-335`).
   **Shipped, and consumed by app-bithire.**
3. tree — arrows are the WAI-ARIA TreeView navigation contract
   (`tree/engines/modern:849`). A move protocol cannot take bare arrows there
   without destroying navigation.

A kernel that forces one of these breaks the other two. §2.4 says so instead.

### 0.7 A second orphan kernel in the same problem space

`useAriaAnnounce` (`infrastructure/runtime/application/accessibility/index.ts:500`)
exists, is exported by the same facade (`react-hooks/index.ts:190`), and has
**zero production consumers** — kanban hand-rolled its own live region instead.
Its `announce` is `requestAnimationFrame`-deferred with a 7 s auto-clear (lines
516-545); kanban's inline region is synchronous. Whether the DnD kernel consumes
it or keeps the synchronous region is question Q4 in Appendix A; it is not a free choice,
because the rAF deferral changes how every announcement drill must be written.

### 0.8 Shared vocabulary the kernel would also converge

| Duplicate | Sites |
|---|---|
| The order normalizer (`splice` out, `splice` in, by key) | saved-views `:208-224` inline; column-menu `moveItem`/`moveDraftColumn` (the closure inventory already recorded it twice inside column-menu); data-table classic and rustic (frozen) |
| The `dragleave` containment idiom (`relatedTarget` inside `currentTarget` → not an exit) | file-manager `:255-259` and upload `:963-972`, byte-equivalent logic with different comments |
| `resolveNavigationIntent` — the reading-direction law | already the single owner, 14+ consumers (`components/primitives/runtime/collection/roving-focus`). The kernel must consume it, never re-derive RTL. |

### 0.9 Live external consumers (constrains "no behavior change")

| Family | External consumer |
|---|---|
| kanban-board | `app-bithire/src/features/applications/surface/components/pipeline/kanban/**` — the production recruiting pipeline |
| widget-board | `app-bithire/src/ui/details/overview-grid/widget-board-preference/index.ts` — server-backed layout persistence |
| column reorder | `app-bithire/src/ui/tables/data-table/index.tsx:302, 1085, 1172` — `onColumnReorder(order: string[])` |
| `useSortableList` | none in any app |

`app-evnto` has none. This is why kanban is last in the adoption order (§3.2).

---

## 2. Proposed contract

### 2.0 The shape of the proposal, in one paragraph

The four sortable owners share the **transport and the session**, not the
**semantics of a move**. So the kernel is two layers: a mandatory session core
that owns the four handlers, the drag state and the DOM stamps; and opt-in pure
resolvers a consumer composes when its semantics need them. The kernel decides
*when* something happened; the consumer decides *what it means* and *what it is
called*. Nothing in the kernel knows what a column, a view, a candidate or a
node is.

### 2.1 Placement

```
packages/core/src/components/primitives/runtime/collection/sortable/
  index.ts            pure resolvers + useDragSession
  tests/
```

Beside `roving-focus/` and `listbox/`. Justification, both directions measured:

- `foundation/behavior/` is **import-pure**: `grep` for `@/` across the whole
  owner returns nothing. The RTL law requires `useReadingDirectionIsRtl` from
  `@/infrastructure/runtime/i18n`; placing the kernel in `foundation/behavior`
  would open a `foundation → infrastructure` edge against the declared dependency
  order. This is exactly why `roving-focus` is not there either.
- `components/primitives/runtime/collection/` is reachable from every tier that
  needs it, by precedent: the Tree primitive's siblings
  (`primitives/navigation/menu`, `segmented`, `tabs`, `rate`, `tour`, `dropdown`,
  `tree-select`, `time-picker`, `cascader`) and two structures
  (`table-toolbar`, `active-filters-bar`) already import from it. A primitive
  importing a peer `runtime/` layer is established; a primitive importing a peer
  component family is not (`sibling-owner-dependency`).

The existing `infrastructure/runtime/application/interaction/drag-and-drop/` owner
is retired by the last adoption lot, not before (§3.2 lot 9, §5).

### 2.2 Layer 1 — `useDragSession`, the intersection

```ts
/** What the consumer is dragging. The kernel never inspects it. */
type DragPayload = { readonly key: string };

/** Where the consumer says the pointer currently is. The kernel never computes it. */
type DropTarget<TTarget> = TTarget | null;

interface UseDragSessionOptions<TPayload extends DragPayload, TTarget> {
  /** Off switch. A disabled session stamps nothing and starts nothing. */
  disabled?: boolean;

  /**
   * dragover only. The kernel has already called preventDefault() and set
   * dropEffect; this decides WHERE, in the consumer's own vocabulary.
   * Returning null means "not a target": no stamp, and drop is a no-op.
   */
  resolveTarget: (event: React.DragEvent, payload: TPayload) => DropTarget<TTarget>;

  /**
   * drop. The single commit point. The kernel does not mutate any array and
   * does not know whether the consumer commits now or stages a draft.
   */
  onDrop: (payload: TPayload, target: TTarget) => void;

  /** Optional. Fires on dragend WITHOUT a drop, and on Escape during a keyboard move. */
  onCancel?: () => void;
}

interface UseDragSessionResult<TPayload extends DragPayload, TTarget> {
  /** Null between drags. Never a partial session. */
  session: { payload: TPayload; target: DropTarget<TTarget> } | null;

  /** Spread on the drag SOURCE. Always includes draggable and the press-cancel route. */
  getSourceProps: (payload: TPayload) => SortableSourceProps;

  /** Spread on the drop TARGET. Source and target may be the same element. */
  getTargetProps: () => SortableTargetProps;
}
```

Laws the session core owns, each one a thing a consumer gets wrong today:

- **PREVENT-DEFAULT LAW.** `dragover` calls `preventDefault()` unconditionally.
  Without it the browser never fires `drop`. All four owners do this by hand and
  none of them has a test that would catch its removal.
- **CLEANUP LAW.** `dragend` clears the session unconditionally, drop or no drop.
- **PRESS-CANCEL LAW.** An HTML5 drag swallows the `pointerup` that ends the
  press, so `getSourceProps` routes `dragend` and `pointercancel` into
  `useInteractionState`'s press-cancel. Today only kanban knows this
  (`kanban/engines/modern:93-125`, pinned by
  `PatternKanbanBoard.press-cancel.test.tsx`). §7 (R2) records column-menu as the
  suspected same defect.
- **COMPOSITION LAW.** The returned bags do NOT chain with a caller's handlers;
  a JSX spread replaces a colliding prop. A consumer composes explicitly with
  `composeHandlers` (`foundation/behavior/runtime/compose-handlers`), per the
  FAM-00 contract landed in `350e5f16b`.
- **PAYLOAD LAW.** `dragstart` sets `effectAllowed='move'` and
  `setData('text/plain', payload.key)` — the one line that makes the drag legible
  to assistive tech and to `getData` fallbacks. Reading `dataTransfer` during
  `dragover` is forbidden by the platform, which is why `session.payload` exists.

### 2.3 Layer 2 — pure resolvers, opt-in

```ts
/** The 3-zone (or 2-zone) edge rule, stated once, testable without a DOM. */
function resolveEdgeZone(
  rect: { top: number; height: number },
  clientY: number,
  options: { zones: 'before-after' | 'before-inside-after'; edgeRatio?: number }
): 'before' | 'inside' | 'after';

/** The one order normalizer: move sourceKey to targetKey's position. Never mutates. */
function reorderByKey(order: readonly string[], sourceKey: string, targetKey: string): string[];

/** A key becomes a MOVE intent on the logical axes. Delegates the RTL law. */
function resolveMoveIntent(
  key: string,
  options: { orientation: CollectionOrientation; rtl: boolean; crossAxis?: CollectionOrientation }
): MoveIntent | null;  // 'prev-item' | 'next-item' | 'prev-container' | 'next-container'
```

`resolveMoveIntent` is built ON `resolveNavigationIntent`; it does not restate the
reading-direction law and does not flip a key name, a step sign or an index delta.
`edgeRatio` defaults to `0.25` — the value tree ships today, so tree's adoption is
a no-op by construction.

### 2.4 Keyboard model — the contract states the divergence

The kernel does not choose among §0.6's three models. It exposes a declared mode:

| Mode | Protocol | Who |
|---|---|---|
| `'immediate'` | An arrow moves the item now and announces the result. No grabbed state. | kanban (its shipped behavior, unchanged) |
| `'grab'` | Space/Enter grabs, arrows choose, Space/Enter drops, Escape cancels and restores. | saved-views, column-menu (new operability) |
| `'delegated'` | The kernel owns NO key. The family's own key contract stands and must provide the move path itself. | tree (arrows belong to WAI-ARIA TreeView navigation) |

`'delegated'` is not an escape hatch for "no keyboard": a family declaring it must
name its alternative operable path in its adoption lot. Tree's is question Q3 (Appendix A)
and is the one genuinely open accessibility design problem in this cohort.

`'none'` does not exist as a mode. Per invariant 4 (§4) a non-operable sortable is
not an acceptable end state.

### 2.5 Announcement contract

The kernel owns the **when** and the **politeness**; the consumer owns the
**text**.

```ts
interface SortableAnnouncements {
  /** Fires on keyboard grab, on each keyboard move, on drop, on cancel, on a blocked edge. */
  onAnnounce: (event: SortableAnnounceEvent) => void;
}

type SortableAnnounceEvent =
  | { kind: 'grabbed';   payload: DragPayload }
  | { kind: 'moved';     payload: DragPayload; target: unknown; crossedContainer: boolean }
  | { kind: 'dropped';   payload: DragPayload; target: unknown }
  | { kind: 'cancelled'; payload: DragPayload }
  | { kind: 'blocked';   payload: DragPayload; reason: 'edge' | 'not-a-target' };
```

- Politeness is `polite` for every kind. Nothing in a reorder interrupts.
  `assertive` is reserved and unused; a consumer wanting it must argue for it.
- **The kernel ships no strings and no i18n keys.** It cannot: the message
  vocabulary is product vocabulary ("column", "position", "stage"), and the key
  prefix belongs to the family (`kanbanBoard.move_column`). The consumer builds
  the string with its own `tOr` and hands back a rendered message.
- **i18n-aware by construction**: because the kernel never formats, there is no
  concatenation to mis-order under RTL and no interpolation the kernel could get
  wrong. `interpolateTranslation` stays with the family.
- Which live region carries it — a kernel-owned one, `useAriaAnnounce`, or the
  consumer's own — is Q4 (Appendix A).

### 2.6 What stays with the consumer

Rendering; the drop indicator and every visual value (the current kernel writes
`style.borderTop = '2px solid var(--ds-color-primary, #1677ff)'` at
`drag-and-drop/index.ts:356-358` — a hardcoded literal that the family-cut law
forbids and that the new kernel must not carry); the data mutation; the commit
model (controlled vs draft); the message text; the domain vocabulary; whether a
move is legal; the container/item roles and labels (the current kernel hardcodes
`role="list"` and an English `aria-label`, which is wrong for kanban's columns and
for tree's `role="tree"`).

### 2.7 Second kernel in the same owner: `useFileDropZone`

Not a sortable. `file-manager` and `upload` share one duplicated idiom and nothing
else with the four:

```ts
function useFileDropZone(options: {
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}): { isDragOver: boolean; dropZoneProps: FileDropZoneProps };
```

It owns the `dragleave` containment rule (`relatedTarget` inside `currentTarget`
is not an exit; `null` relatedTarget is an exit — leaving the window) and the
`preventDefault` on `dragover`. It does NOT own the accept/multiple filter, which
upload already owns as `filterDroppedFiles`.

I propose it lands in the same WO because step 4 says "one DnD kernel" and
because it is ~30 lines with two adopters and no accessibility surface of its own.
If the reviewers prefer, it splits out cleanly (Q5, Appendix A).

### 2.8 What the kernel does NOT model (SCOPE clause)

Stated in the kernel's own docblock, in the style of `roving-focus`:

- **External file drops** → `useFileDropZone` (§2.7).
- **Pointer-transport move/resize** → widget-board. The session core is generic
  over its event type so FAM-13 can add a pointer adapter beside the HTML5 one,
  but FAM-08 writes no pointer code. See Q2 (Appendix A): this is how the handoff law
  ("FAM-13 adopts it later") is satisfiable without inventing a transport no
  FAM-08 consumer needs.
- **Auto-scroll** — 0/8 today. Not in the intersection.
- **Drag preview / `setDragImage`** — 0/8 today. Not in the intersection.
- **Cross-window and cross-document drags** — no owner does this.
- **D3 pointer drag** (`network-graph`, chart `brush`) — a fourth transport,
  outside F-69.

---

## 3. Owners / write set for the implementation phase

### 3.1 The kernel lot (FAM-08, singleton owner)

```
packages/core/src/components/primitives/runtime/collection/sortable/index.ts     NEW
packages/core/src/components/primitives/runtime/collection/sortable/tests/**     NEW
```

No consumer is touched. Lands green, adopted by nobody. This is deliberate: it
makes every adoption below a separable, revertible lot.

### 3.2 Adoption lots, in recommended order

Each row is one lot, one commit, independently revertible. "Pin" = a PRE-lot that
adds pinning tests and touches no product code.

| # | Lot | Owner WO | Why here | Pin needed first |
|---|---|---|---|---|
| 0 | kernel + `useFileDropZone` | **FAM-08** | — | — |
| 1 | **saved-views** transport | FAM-08 | Smallest surface. Single-list, controlled, whole-item source, id-order callback. 8 drag events already fired across 2 test files. Proves the session core against a real consumer with the least that can go wrong. | no — existing coverage suffices |
| 2 | **column-menu** transport | FAM-08 | Proves the **draft** commit model and the **handle** source — the two structural divergences. | **YES** — 0 drag tests today |
| 3 | **tree (primitive)** transport | FAM-08 | Proves `resolveEdgeZone` and a hierarchical target. `tree-view` rides along at zero cost: it is an adapter (§0.2). | no — 6 drag events exist; extend for the zone boundaries |
| 4 | **file-manager** + **upload** drop zones | FAM-08 | Independent of 1-3. Can run in parallel with them (disjoint files). | no — 9 drag events exist |
| 5 | **kanban-board** transport | FAM-08 | Last. Richest behavior, only live app-bithire pipeline consumer, FLIP coupling, 11 drag events. Adopting it FIRST would shape the kernel to one family. | no |
| 6 | **saved-views / column-menu** operability | FAM-08 | Keyboard `'grab'` + announcements. A declared behavior ADDITION, separate from its transport lot (§3.3). | — |
| 7 | **tree** operability | FAM-08 | Blocked on Q3 (Appendix A): tree needs a move affordance that is not a bare arrow. | — |
| 8 | **widget-board** pointer adapter | **FAM-13** | Not this WO. Needs the pointer transport the session core is generic over. | — |
| 9 | retire `useSortableList` | FAM-08 | After lot 5. Root-entrypoint removal → contract-changeset. | — |

`column-menu/` is currently reserved by another writer; lot 2 must be scheduled
after that writer lands or be re-scoped by the DT.

### 3.3 Why transport and operability are separate lots

Invariant 4 (§4 below) demands byte-identical interaction on adoption day.
Invariant 7 demands announcements as a hard requirement. For saved-views,
column-menu and tree those two collide head-on: today they have no keyboard and no
announcements, so adding them IS a behavior change.

Splitting resolves it without weakening either: the **transport lot** is provably
behavior-preserving and pinned by the family's own unchanged tests; the
**operability lot** is a declared, reviewed addition with its own drill and its own
`cutNote`. Merging them would force a reviewer to certify "no behavior change" on
a diff that changes behavior on purpose.

---

## 4. Invariants

1. **No behavior change on adoption day.** A transport lot leaves the family's
   interaction contract byte-identical: same callbacks, same argument shapes,
   same order of side effects, same DOM stamps. The family's existing drag tests
   run unchanged and green before and after; where none exist, they are written
   in a PRE-lot against the CURRENT implementation and must stay green byte-for-byte
   through the adoption. A test that has to be edited to pass is a behavior change,
   not a test fix.
2. **Modern only.** The frozen classic/rustic engines are not touched — including
   `data-table`'s two frozen re-implementations (§0.3) and `tree`'s and
   `saved-views`'s and `upload`'s frozen siblings. The kernel is not imported into
   any frozen file.
3. **No new dependencies.** No `dnd-kit`, no `react-dnd`, no `@atlaskit/pragmatic-*`.
   The kernel is HTML5 + React, like everything it replaces.
4. **Accessibility is a requirement, not an option.** No family finishes its
   adoption pair non-operable by keyboard and silent to a screen reader. `'none'`
   is not a keyboard mode (§2.4). A family that cannot take arrows (tree) must
   name its alternative path, not skip the clause.
5. **No visual values in the kernel.** The kernel stamps `data-*` and returns
   state; it writes no `style`, no color, no border, no transition. The drop
   indicator is painted by the family's skin from its own channels. This is the
   family-cut law and it is the single clearest defect of the kernel being
   replaced (`drag-and-drop/index.ts:340-360`).
6. **No product semantics.** No string, no i18n key, no role name, no
   `aria-label` in the kernel. A `grep` for a quoted English word in the kernel
   source must return nothing outside comments.
7. **One authority per law.** The kernel consumes `resolveNavigationIntent`
   (RTL), `useInteractionState` + `composeHandlers` (F-37), `partAttributes`
   (anatomy). It re-derives none of them.
8. **Every lot leaves a deployable state.** The kernel lands with zero consumers;
   each adoption is revertible alone; `useSortableList` stays exported until the
   last adoption lands.

---

## 5. Alternatives considered

### (a) Adopt a third-party library (dnd-kit, react-dnd, pragmatic-drag-and-drop)

Gets: a mature keyboard model, a sensor abstraction, auto-scroll, collision
strategies — several of which nothing in this cohort has today.

Costs, measured: violates invariant 3 outright. The library owns the DOM it
drags, which collides with the family-cut law that the skin paints from derived
channels and the TSX carries no visual values; every one of these owners would
need its anatomy re-stamped around the library's nodes, and the paint censuses,
`data-part` reachability suites and causality selectors would all move. It also
buys capability that measures 0/8 in demand (auto-scroll, drag preview).

**Reject.**

### (b) Keep the per-owner implementations

Gets: zero risk today.

Costs, measured: four copies of the identical quartet (§0.4); three mutually
contradictory keyboard models (§0.6); one suspected latching defect class already
fixed in exactly one of the four (§7, R2); 1 of 4 owners operable by keyboard, 1 of
4 announcing, 1 of 4 usable on touch; the order normalizer written at least four
times; and F-69 stays open, so WO-FAM-08 cannot close.

**Reject.**

### (c) Extend `useSortableList` in place

Gets: no new owner, no new public symbol, the existing test file carries over.

Costs, measured: it is on the **ROOT public entrypoint** with four exported types
(§0.1), so every widen is a published-API change; it is single-list and
index-based, and cross-container + draft-commit + 3-zone collision cannot be
retrofitted without breaking both the option and the return shapes; it carries a
grab/drop keyboard model that **contradicts kanban's shipped immediate-move
behavior**, so the one family with a live external consumer could not adopt it
without a user-visible regression; and it carries a hardcoded color literal,
`role="list"` and an English `aria-label` that must be deleted, not extended.
Extending it means shipping breaking changes to a public symbol with zero
consumers in order to serve four internal ones.

**Reject.**

### (d) New kernel beside it; retire `useSortableList` after the last adoption — RECOMMENDED

Gets: the new owner is written to the measured intersection of four real
consumers instead of to one hypothetical list; the public symbol stays exported
and untouched until nothing needs it, so every lot in between is deployable
(invariant 8); the retirement is one honest contract-changeset at the end rather
than a sequence of breaking widens.

Costs: two sortable owners coexist for the length of the adoption (lots 1-5) —
mitigated because the old one has zero consumers and cannot drift; and one
contract-changeset at lot 9.

**Recommend (d).**

---

## 6. Executable acceptance

### 6.1 Per adoption lot — the three legs

**Leg 1 — the family's own tests, unchanged.** Run the family's full suite
INCLUDING its `skin-reachability` and `causality` files (the writers' rule added
on 2026-09-16 09:38 after a misreport), on the pre-lot tree and on the candidate,
and show both. Files per family, at base:

| Family | Test files carrying drag | Drag events fired |
|---|---|---|
| kanban-board | `PatternKanbanBoard.engine-advanced` (9), `.press-cancel` (2) | 11 |
| saved-views | `.engine-advanced` (4), `.integration` (4) | 8 |
| tree | `Tree.modern-engine-advanced` | 6 |
| upload | `.engine-advanced` (5), `.modern-drop-constraints` (1), `.test` (1), plus `PickersBatch.contract` (2) | 9 |
| file-manager | `FileManager.test` | 2 |
| **column-menu** | **none** | **0** |
| **tree-view** | **none** | **0** |

**Leg 2 — the pin, where leg 1 is empty.** column-menu and tree-view get a PRE-lot
test written against the CURRENT implementation, landed and green, before the
adoption lot is written. For column-menu that test must assert, at minimum: the
handle is the drag source and the row is the drop target; a drop stages the draft
and does NOT call `onColumnsChange`; Apply calls it once with the staged order;
`data-dragging`/`data-drag-target` stamp and clear.

**Leg 3 — the kernel's own unit suite,** with the planted negatives of §6.3.

### 6.2 The operability drill (lots 6-7, and kanban's regression in lot 5)

One drill per operable family, in the family's own package, asserting the full
keyboard round trip and the live region:

- grab (or first arrow, in `'immediate'` mode) → a `polite` region receives a
  non-empty message;
- each move → the region content CHANGES (a repeated identical string is not an
  announcement);
- a blocked edge → a message, and the item does not move;
- Escape (`'grab'` mode) → the order is the pre-grab order and a cancel message
  is announced;
- drop → focus is on the moved item, not on `document.body` (kanban's
  `pendingFocusId` effect at `:341-348` is the reference);
- RTL: with `dir="rtl"` and a horizontal axis, ArrowLeft moves in the opposite
  logical direction from LTR.

Axe per family is OWED to WO-GAT-04 and is not this WO's instrument; the drill is.

### 6.3 Planted negatives — the kernel's own suite

Each mutation must redden **exactly one named test**, and the suite must be green
on revert. A mutation that reddens nothing is an instrument failure and blocks the
lot.

| # | Mutation | Must redden |
|---|---|---|
| N1 | Delete `preventDefault()` in the `dragover` handler | `drop never fires without preventDefault` |
| N2 | Delete the `dragend` cleanup | `an aborted drag leaves no session and no stamp` |
| N3 | Remove the press-cancel route from `getSourceProps` | `a drag that starts and ends on the source leaves no pressed state` (the `PatternKanbanBoard.press-cancel` template) |
| N4 | Change `edgeRatio` from `0.25` to `0.5` in `resolveEdgeZone` | `the before/inside boundary sits at a quarter of the row` |
| N5 | Replace `resolveMoveIntent`'s delegation with a physical key map | `ArrowLeft moves next under rtl on a horizontal axis` |
| N6 | Make `resolveTarget` returning `null` still commit a drop | `a drop on a non-target is a no-op` |
| N7 | Suppress the `onAnnounce` call on `moved` | `every keyboard move announces` |
| N8 | Make `reorderByKey` mutate its input | `reorderByKey returns a new array and leaves the input intact` |

N3 and N5 are the two that no existing test in the repository would catch today
outside kanban; they are the reason the planted-negative list is part of
acceptance rather than a nicety.

### 6.4 Gates

`structure:check` (new owner under `primitives/runtime/collection/` — the
placement argued in §2.1 is exactly what this gate adjudicates); `tsc` and
`typecheck:tests`; `family-cut` for each adopted family (the gate has **no DnD
arm** today — `grep` for `drag|dnd|sortable` in
`scripts/check/family-cut/index.mjs` returns nothing — so F-69's closure is a
closure criterion, not a gate arm; if the reviewers want it mechanized, that is a
separate instrument lot); `contract-changeset` at lot 9 with `--base=main`.

---

## 7. Migration risk register

| ID | Consumer | What adoption can break | The test that sees it |
|---|---|---|---|
| R1 | **saved-views** | The drop currently splices by **index derived from id order** (`:208-224`). A kernel `reorderByKey` that inserts *after* instead of *before* the target silently reverses every backward drag. | `PatternSavedViewsBar.engine-advanced` + `.integration` assert the emitted `string[]`; add one case that drags backward AND forward across the same pair. |
| R2 | **column-menu** | **Suspected pre-existing defect, not caused by adoption.** The row carries `useInteractionState` (`:1121-1130`) and the handle is the drag source (`:674-686`); the drag swallows the row's `pointerup`, so `pressed` can latch exactly as kanban's did before `32b2da644`. Adoption will either fix it (press-cancel law) or make it visible. Either way the DIFF must say which. | Port `PatternKanbanBoard.press-cancel.test.tsx` to column-menu in the lot-2 PRE-pin. Its current value must be recorded BEFORE the adoption so the change is attributed honestly. |
| R3 | **column-menu** | `ColumnMenu.causality.integration.test.tsx:157-167` pins the **exact ancestor chain including `[data-drag-target="false"][data-dragging="false"]`**. Any change to where those attributes are stamped reddens four long selectors that look unrelated to DnD. | That file. Run it; do not re-pin it to make the lot pass — a re-pin is a DOM change and needs its own justification. |
| R4 | **column-menu** | The **draft** model: if the kernel's `onDrop` is wired to `onColumnsChange` instead of to `setDraftOrder`, every drag commits immediately and Apply/Cancel stop meaning anything. This is the single most likely wiring mistake in the whole program. | The lot-2 PRE-pin assertion "a drop does NOT call `onColumnsChange`; Apply calls it once". |
| R5 | **tree** | The 25/50/25 boundary is behavioral. `resolveEdgeZone` with any other default silently re-targets drops from `before`/`after` into `inside` — a reparent instead of a reorder, i.e. data loss in a consumer's tree. | Extend `Tree.modern-engine-advanced` with three `clientY` cases per row (0.1h, 0.5h, 0.9h) before the lot. N4 covers the kernel side. |
| R6 | **tree** | Arrows are the WAI-ARIA TreeView navigation contract. If the kernel's keyboard mode leaks into tree, expand/collapse/navigate break. Mode must be `'delegated'`. | `Tree.filtered-keyboard-reach` and `Tree.typeahead` are the canaries; both are pre-existing and must stay green untouched. |
| R7 | **tree-view** | Zero risk of its own — it is an adapter (§0.2) — but it has **zero drag tests**, so a regression in owner 4 surfaces at the pattern tier with nothing watching. | Add one `PatternTreeView` case asserting the `{dragKey, dropKey, position}` reshape, including the `-1/0/1 → before/inside/after` mapping. |
| R8 | **kanban-board** | FLIP coupling: `measure()` must be called BEFORE the parent's reorder (`:250-251` and again at `:295` for the keyboard path). A kernel that commits before the consumer can snapshot makes every cross-column move teleport. | A visual/motion regression is not caught by the existing suite. This needs an explicit ordering assertion (`measure` called before `onItemMove`) — to be written in lot 5. |
| R9 | **kanban-board** | Live consumer: `app-bithire` pipeline. `onItemMove(itemId, fromColumn, toColumn, position)` is a four-argument contract; any reshape is an app-breaking change in a repository this WO does not touch. | `WidgetBoardPublicApi`-style contract test for the kanban props, plus `contract-changeset` at the lot. |
| R10 | **kanban-board** | Its keyboard model is `'immediate'`. If the kernel's `'grab'` mode becomes the default, a recruiter's ArrowRight starts grabbing instead of moving — a silent, user-visible regression with no test today outside the move assertions. | `PatternKanbanBoard.engine-advanced` keyboard cases; add an explicit "no grabbed state is ever stamped" assertion in lot 5. |
| R11 | **upload** | `onDrop?.(e)` is a **public prop** called before the internal processing (`:925`). A kernel that owns `onDrop` must still call the caller's first, and must not swallow it. | `Upload.engine-advanced` + `Upload.modern-drop-constraints`; add a case asserting the caller's `onDrop` receives the raw event. |
| R12 | **upload / file-manager** | The `dragleave` containment rule. Getting `relatedTarget === null` wrong (it means "left the window", an exit) makes the drop tint latch forever after the user drags out of the browser. | One kernel unit test per branch: inside → not an exit; outside → exit; `null` → exit. |
| R13 | **all four sortable** | `dist/` staleness. Several gates read `dist` (`gates-de-registry-leen-dist`), and the hooks manifest drives the dead-writers census. A kernel added without republishing the hooks manifest leaves censuses measuring the old surface. | The DT's serialized regeneration after the kernel lot, before any adoption is measured. |
| R14 | **all** | The 18 modified + 4 untracked foreign paths in this worktree (§1). An adoption lot measured against a dirty tree attributes another writer's reds to itself. | Every leg-1 A/B runs against a clean pre-lot tree, not the worktree. |

---

## Appendix A — Questions for the reviewers

**Q1 — Placement.** `components/primitives/runtime/collection/sortable/`, beside
`roving-focus` and `listbox` (§2.1). The alternative, `foundation/behavior/`, is
import-pure and cannot reach `useReadingDirectionIsRtl` without opening a
`foundation → infrastructure` edge. Confirm, or name the placement you want
`structure:check` to admit.

**Q2 — What "FAM-13 adopts it later" means.** widget-board is Pointer Events and
sets `draggable={false}` (§0.2). Option A: the session core is generic over its
event type, FAM-08 ships only the HTML5 adapter, FAM-13 adds the pointer adapter.
Option B: FAM-13's widget-board is explicitly OUT of the kernel's scope and the
handoff sentence means only "FAM-13 may consume the resolvers". I recommend A and
have scoped §2.2 for it, but A is a design commitment made now on behalf of a WO I
do not own.

**Q3 — Tree's keyboard move path.** Tree is the only owner whose arrows are
already spoken for by WAI-ARIA TreeView navigation, so invariant 4 has no obvious
satisfier there. Candidates: a modifier chord (Alt+Arrow, the Windows Explorer
idiom); an explicit grab via a dedicated key; or a per-row move affordance like
kanban's touch rail. This is the one open accessibility design problem in the
cohort and it blocks lot 7, not lots 1-5.

**Q4 — The live region.** `useAriaAnnounce` already exists with zero consumers
(§0.7) but defers through `requestAnimationFrame` with a 7 s auto-clear, while
kanban's inline region is synchronous. Adopting it makes every announcement drill
async and changes kanban's shipped timing (a behavior change under invariant 1);
not adopting it leaves a second orphan kernel in the same problem space. My
recommendation: the DnD kernel emits `onAnnounce` events and owns no region
(§2.5), and `useAriaAnnounce`'s fate is adjudicated separately. Confirm.

**Q5 — `useFileDropZone` in this WO or not.** ~30 lines, two adopters, no
accessibility surface, and step 4 says "one DnD kernel" (§2.7). I propose it here
because splitting it costs more coordination than writing it. Confirm or split.

**Q6 — The transport/operability split.** §3.3 splits each adoption into a
provably behavior-preserving lot and a declared-addition lot, because invariants 1
and 4 collide for three of the four families. If a reviewer prefers a single lot
per family, then invariant 1 must be restated as "no UNDECLARED behavior change"
and each lot's `cutNote` carries the addition. I recommend the split.

**Q7 — Mechanization of F-69.** The `family-cut` gate has no DnD arm (§6.4), so
"one DnD kernel" closes as a criterion, not as a measurement. Do the reviewers
want an instrument lot (a check that no Modern file outside the kernel defines the
handler quartet), or is the closure criterion plus the adoption evidence
sufficient? An instrument would make the census self-maintaining and would have
caught the frozen-engine copies of §0.3 as a named exception list.

---

## Appendix B — Measurement reproduction

```
git rev-parse HEAD                                  # 75ce56bfdef64388d7c32b3c36bfef116c3367b4

# every file touching the HTML5 DnD vocabulary
grep -rln "onDragStart\|onDragOver\|onDrop\b\|draggable\|dataTransfer" \
  --include=*.tsx --include=*.ts packages/core/src

# the identical quartet in the four sortable owners
grep -oE "const handle[A-Za-z]*(Drag|Drop)[A-Za-z]* *=" <owner file> | sort -u

# handler definitions / JSX attachments / vocabulary tokens, per owner
grep -cE "^\s+onDrag(Start|Over|End|Enter|Leave)=|^\s+onDrop=" <owner file>
grep -oE "onDrag(Start|Over|End|Enter|Leave)|onDrop|dataTransfer|draggable" <owner file> | wc -l

# zero consumers of the existing kernel
grep -rn "useSortableList" packages/ --include=*.ts --include=*.tsx

# zero auto-scroll, zero drag previews
grep -rn "autoScroll\|auto-scroll" <the eight owners>
grep -rn "setDragImage" packages/core/src

# announcements per owner
grep -c "aria-live" <owner file>

# existing drag coverage
grep -oE "fireEvent\.(dragStart|dragOver|dragEnd|dragLeave|drop)" <test file> | wc -l

# foundation/behavior is import-pure
grep -rhn "from '@/" packages/core/src/foundation/behavior --include=*.ts --include=*.tsx

# the root public entrypoint reaches the kernel
#   src/index.ts:256 -> infrastructure/runtime/facade/index.ts:2 -> react-hooks/index.ts:351
```
