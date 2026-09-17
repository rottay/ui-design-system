# Shared DnD kernel — contract debrief (WO-FAM-08 / F-69)

Design packet, **revision 2**. No product code was written. Every number below is
a measurement over the tree, and each claim carries its `file:line`.

Reviewers: Codex, Kimi, Fable (shared-core review, `roadmap/README.md` execution
policy). Record ACCEPT or HOLD with evidence.

> **Revision 2 (2026-09-17).** Round 1 was reviewed by Kimi (ACCEPT with one
> rider) and by Codex (**HOLD** —
> `evidence/dnd-kernel-debrief/codex-HOLD-contract-gaps.txt`). This revision
> resolves the HOLD. Codex's five blocking findings are resolved inside the
> contract text, not in prose: §2.2 now binds target identity and shows the four
> typed adapters (§2.2.4); the keyboard contract is inside
> `UseDragSessionOptions` with candidate movement separated from committed
> movement (§2.4); press-cancel names the owning `useInteractionState` instance
> and the composition law is replaced by a measured one (§2.3); the
> `structure:check` admission is in the write set (§3.1); and §6 is corrected
> throughout. Every Codex finding, its resolution and the commit it is bound to
> is listed in `revision-notes.md`. Nine round-1 claims were corrected because
> Codex's review or this revision's own measurement contradicted them; each is
> marked **CORRECTED (R2)** where it appears.

---

## 1. WO / base

| | |
|---|---|
| Work order | WO-FAM-08 — Family cut: data-table, toolbars, column settings, saved views, widget-board, kanban, calendar-view, file-manager and shared DnD/export kernels |
| Finding | F-69 — DnD re-implemented per pattern |
| WO step | `roadmap/family-cuts.md:207` step 4 — "one DnD kernel and one export" |
| Round-1 base | `75ce56bfdef64388d7c32b3c36bfef116c3367b4`, branch `main` |
| Revision-2 base | `785771a30e584bba784f258bf9a6471bf9fed45e`, branch `main` |
| Checkout | `/Users/daniel/Developer/Rottay/r4-recon-opus` |
| Phase | DESIGN. Implementation is a separate dispatch AFTER this debrief resolves. |

**Base movement between the two rounds, measured.** Of the eleven files this
packet reasons about — the eight census owners plus `compose-handlers`,
`interaction-state` and `roving-focus` — ten are byte-identical between
`75ce56bfd` and `785771a30`, and **all eleven are byte-identical between
`785771a30` and this worktree**, so no measurement below is taken against
another writer's uncommitted edit. The single file that moved is
`column-menu/index.tsx`, through `8c96f4197` (it extracted `normalizeDraftOrder`;
its `defs/jsx/tok` counts are unchanged). Reproduction: Appendix B, leg 0.

**Circularity resolution.** The FAM-08 registry note of 2026-09-17 04:18 routed the
DnD kernel to WO-FAM-13 ("pertenece a WO-FAM-13"); the closure inventory of
2026-09-17 08:00 recorded the FAM-08/FAM-13 fiches as circular (D15). The handoff
law of 2026-09-17 resolves it by the newer authority: **the base kernel is
FAM-08's scope; FAM-13 (widget-board) adopts it later.** D15's older
recommendation is superseded and registered for owner ratification; this packet
does not close that question, it executes under the handoff. §2.9 and Appendix A
A2 now state exactly how much of the kernel FAM-13 is committed to, which round 1
overstated.

**Tree state.** The worktree carries modified and untracked paths belonging to
other in-flight writers (overlay positioning, table-toolbar direction, export
runtime). None of them is in this packet's write set, none was touched, and none
of them is one of the eleven files above.

---

## 0. Census — verified, corrected, extended

_Numbered 0 on purpose: the debrief owes exactly seven sections and they keep
the numbers 1-7. This is the measured evidence base every one of them rests on,
and section 2's contract is derived from it line by line._

The starting census said: kernel with zero consumers, and **eight owners
re-implement HTML5 DnD by hand**. The first claim is confirmed exactly. The
second is confirmed as a count of files but is **wrong as a statement of one
problem**: the eight owners implement **three different problems on two
different transports**, and one of the eight implements nothing at all.

> **CORRECTED (R2).** Round 1 said "three different transports". It is **two**:
> HTML5 Drag and Drop (seven owners) and Pointer Events (widget-board). Item
> reordering versus external-file dropping is a difference of **semantics on the
> same transport**, not a third transport. Codex is right and the correction
> matters: it is why §2.7's file-drop zone is a second capability inside one
> transport owner rather than a second transport.

### 0.1 The existing kernel — confirmed, zero KNOWN consumers

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

**Production consumers: 0 in this repository and in the local BitHire, Evnto and
Platform trees** (Codex reproduced the search independently).

> **CORRECTED (R2).** Round 1 wrote "**Production consumers: 0.** Confirmed."
> without a scope. A source search establishes zero **known** consumers; it
> cannot establish that no consumer of the published package exists elsewhere.
> That distinction is the whole of §6.7: it is why lot 11 needs an authorized
> public-API decision and not a zero-callers argument.

Extension the inventory did not record: the facade is re-exported by
`infrastructure/runtime/facade/index.ts:2`, which `src/index.ts:256` re-exports
with `export *`. **`useSortableList` and its four types are on the ROOT public
entrypoint `@rottay/design-system`.** Retiring or narrowing it is a published-API
change and needs an authorized decision plus a contract-changeset. This is a cost
of alternative (c) in §5 and the whole content of lot 11.

### 0.2 The eight named owners — confirm / correct

Measured with three independent metrics so the "19 handlers" and "39" figures of
the starting census can be reconciled: `defs` = named `handle*Drag*|handle*Drop*`
definitions, `jsx` = JSX handler attachments, `tok` = occurrences of the HTML5 DnD
vocabulary (`onDrag*`, `onDrop`, `dataTransfer`, `draggable`), including type
declarations and prose. All eight triples were reproduced independently by Codex
at both the round-1 base and the reviewed checkout.

| # | Owner | Modern file | defs | jsx | tok | Verdict |
|---|---|---|---|---|---|---|
| 1 | kanban-board | `components/patterns/visualization/kanban-board/engines/modern/index.tsx` | 4 | 7 | 20 | CONFIRMED re-implementer. The starting census's "19 handlers" is the token count minus one; there are 4 handler definitions. |
| 2 | saved-views | `components/patterns/data/saved-views/engines/modern/index.tsx` | 4 | 4 | 8 | CONFIRMED re-implementer. |
| 3 | column-menu | `components/structures/workspace/column-menu/index.tsx` | 4 | 4 | 9 | CONFIRMED re-implementer. **Its operability premise is corrected in §0.5.** |
| 4 | primitives/tree | `components/primitives/display/tree/engines/modern/index.tsx` | 4 | 4 | 49 | CONFIRMED re-implementer. The starting census's "39" is not reproducible by any of my three metrics; the token count is 49 and the handler count is 4. |
| 5 | tree-view | `components/patterns/visualization/tree-view/engines/modern/index.tsx` | 1 | 1 | 10 | **CORRECTED — not a re-implementer.** It renders `ModernTree` (line 318) and its single `handleDrop` (lines 227-235) only reshapes `TreeDropInfo` into `{dragKey, dropKey, position}`. It is an ADAPTER over owner 4. |
| 6 | file-manager | `components/patterns/data/file-manager/engines/modern/index.tsx` | 2 | 3 | 5 | **CORRECTED — different problem, same transport.** No drag source exists. It is an external-file drop zone: `handleDrop` reads `e.dataTransfer.files` (`:248`) and calls `onUpload`. No item model, no reorder. |
| 7 | upload | `components/primitives/inputs/upload/engines/modern/index.tsx` | 1 | 3 | 6 | **CORRECTED — different problem, same transport.** Same shape as owner 6: `e.dataTransfer.files` at `:928`, dropzone at `:962-974`. |
| 8 | widget-board | `components/patterns/data/widget-board/engines/foundation/index.tsx` | 0 | 0 | 1 | **CORRECTED — the other transport.** It sets `draggable={false}` (`:1371`) and implements Pointer Events: `setPointerCapture` at `:782` and `:964`, window `pointermove`/`pointerup`/`pointercancel`/`keydown` at `:760-770`, an activation threshold and an origin snapshot for cancel at `:783-794`. HTML5 DnD is not used and cannot express this. |

### 0.3 Re-implementers the inventory missed

| Owner | Evidence | Disposition |
|---|---|---|
| `data-table` classic engine | `engines/classic/index.tsx:272-292, 390-413` — the same four-handler quartet for column reorder | **Frozen engine. Out of scope**, recorded so a later reader does not count it as un-migrated Modern debt. |
| `data-table` rustic engine | `engines/rustic/index.tsx:331-349, 492-496` — idem | Frozen. Out of scope. |

Three grep hits are prose only and are NOT DnD implementations:
`primitives/layout/splitter/index.ts:5` (docblock), `primitives/inputs/button/compound/icon/index.tsx:88`
(comment), `foundation/contracts/runtime/components/patterns/core/index.ts:376` (doc).
`charts/network-graph` and `charts/runtime/interaction/brush` use D3 pointer drag, a
third transport, outside F-69.

### 0.4 The real cohort: four sortable owners, one identical quartet

Of the eight, exactly **four** implement item reordering on the HTML5 transport,
and all four define the identical handler quartet:

| Owner | Handler names |
|---|---|
| kanban-board | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| saved-views | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| primitives/tree | `handleDragStart` `handleDragOver` `handleDrop` `handleDragEnd` |
| column-menu | `handleColumnDragStart` `handleColumnDragOver` `handleColumnDrop` `handleColumnDragEnd` |

The quartet is an **event-role intersection, not identical behavior** — Codex's
phrase, and it is the correct one. What the four genuinely share is stated in
§2.2; what they genuinely do not is §2.2.4, one typed adapter per owner. Matching
handler names settle nothing by themselves, and the contract no longer rests on
them.

### 0.5 Feature surface, measured per owner

`—` means the owner does not have the concept; `0` means it has it and it is empty.

| Capability | kanban | saved-views | column-menu | tree | tree-view | file-manager | upload | widget-board |
|---|---|---|---|---|---|---|---|---|
| Transport | HTML5 | HTML5 | HTML5 | HTML5 | (owner 4) | HTML5 files | HTML5 files | Pointer |
| Drag source | whole card | whole pill | **handle** (`Button`, `index.tsx:674-686`) | whole row | — | — (none) | — (none) | handle + edges |
| Cross-container | **yes** (column → column) | no | no | yes (reparent `inside`) | — | — | — | yes (grid cells) |
| Collision rule | container + index | target key, splice | target key, splice | **3-zone geometry** 25/50/25 by cursor Y (`tree/engines/modern:802-822`) | — | — | — | grid solver |
| Commit model | **controlled** (`onItemMove` fires on drop) | **controlled** (`onViewReorder(string[])`) | **DRAFT** — drop mutates local `draftOrder`, `onColumnsChange` fires on Apply (`index.tsx:489-491`) | **controlled** (`onDrop(TreeDropInfo)`) | controlled | — | — | controlled `commit()` |
| Reorder by keyboard | **yes** — arrows move immediately, no grab phase (`:313-338`) | **no** | **yes — `Move up`/`Move down` `IconButton`s** (`:894`, `:903` → `handleMove`, `:364`) | arrows are owned by tree NAVIGATION (WAI-ARIA TreeView), not by move | no | n/a | n/a | yes (window keydown) |
| Drag-specific keyboard protocol | yes (`'immediate'`) | **no** | **no** | **no** | no | n/a | n/a | yes |
| aria-live announcements | **yes** — `data-part="move-announcer"` `aria-live="polite"` `role="status"` (`:643`), 5 message keys | **0** | **0** | **0** | 1 region, loading only | **0** | 3 regions, file-list only | **0** |
| Touch operable | **yes** — explicit move rail gated on `(hover: none) and (pointer: coarse)` (`:135`, `:210`) | no | **yes — the same two buttons** | no | no | picker fallback | picker fallback | yes (pointer) |
| Auto-scroll | **0** | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Drag preview (`setDragImage`) | **0** | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Press-cancel on dragend | **yes** (`:93-125`, `cancelPress` at `:108`) | n/a | **missing** (see §7, R2) | n/a | — | — | — | n/a |

> **CORRECTED (R2) — the column-menu operability premise.** Round 1's row read
> "Keyboard operable: **no**" and "Touch operable: no" for column-menu, and §2.4
> built a mandatory new grab protocol partly on that. It is false.
> `column-menu/index.tsx:894` and `:903` render two `IconButton`s labelled
> `Move <column> up` / `Move <column> down`, `disabled` at the ends of the rendered list, wired
> to `handleMove(column.key, -1)` / `handleMove(column.key, 1)` (`:364`), which reorders the same `draftOrder`
> a drag does. They are real `Button`s: keyboard-activatable and touch-operable.
> The file also carries an `onKeyDown` for width editing. What column-menu lacks
> is a **drag-specific keyboard protocol** and any **announcement** — that claim
> is supportable and is what the operability lot may assert. The row above is
> split into two rows so the two claims can never be conflated again.
>
> Two measured bounds on those buttons, recorded so the operability lot inherits
> them rather than rediscovering them: (i) they announce nothing, so a screen
> reader user gets no confirmation that the column moved; (ii) their `disabled`
> ends are computed from the index within the **rendered section**
> (`renderColumnRow(col, idx, section.columns.length)`), while `handleMove`
> operates on the **complete normalized order**, so in a grouped menu the last
> row of a group is disabled from moving down even though the order below it
> continues.

**Auto-scroll and drag preview are 0/8.** This is a **scope observation, not
measured demand** (Codex's correction, accepted): it establishes that no owner
authors either today, which is why the kernel must not invent them in this WO. It
does not establish that no consumer wants them, and it says nothing about what
the browser draws by itself during an HTML5 drag.

### 0.6 Three keyboard models already exist, and they contradict

1. `useSortableList` — two-phase grab/drop: Space grabs, arrows choose, Space
   drops, Escape cancels (`drag-and-drop/index.ts:258-314`). **Zero consumers.**
2. kanban — one-phase immediate move: an arrow moves the card now and announces
   the result; there is no grabbed state (`kanban/engines/modern:312-335`).
   **Shipped, and consumed by app-bithire.**
3. tree — arrows are the WAI-ARIA TreeView navigation contract
   (`tree/engines/modern:849`). A move protocol cannot take bare arrows there
   without destroying navigation.

A fourth model, outside the drag protocol entirely, is column-menu's two move
buttons (§0.5): no keys of its own, no grabbed state, one commit per activation.
It is the shape Codex's answer to Q3 asks tree to adopt (Appendix A, A3).

A kernel that forces one of these breaks the others. §2.4 declares the mode
instead, and §2.4.1 states what each mode may and may not take from the family's
existing key contract.

### 0.7 A second orphan kernel in the same problem space

`useAriaAnnounce` (`infrastructure/runtime/application/accessibility/index.ts:500`)
exists, is exported by the same facade (`react-hooks/index.ts:190`), and has
**zero production consumers in core** — kanban hand-rolled its own live region
instead. Its `announce` is `requestAnimationFrame`-deferred with a 7 s auto-clear
(lines 516-545); kanban's inline region is synchronous. The kernel emits events
and owns no region (§2.5); `useAriaAnnounce`'s own fate is a separate decision
that this WO does not take (Appendix A, A4).

**Measured defect in kanban's region, recorded for the operability lot.**
`setAnnouncement` writes a string into React state and the region renders it. Two
consecutive blocked moves in the same direction write the **identical** string,
the DOM text does not change, and an assistive technology announces nothing the
second time (`kanban/engines/modern:286-289`). This is pre-existing, it is not
caused by adoption, and repairing it is a declared addition in the operability
lot — never inside a transport lot.

### 0.8 Shared vocabulary the kernel would also converge

| Duplicate | Sites |
|---|---|
| The order normalizer (`splice` out, `splice` in, by index derived from key order) | saved-views `:207-224` inline; column-menu `moveItem` (`:177`, one owner since `8c96f4197`); data-table classic and rustic (frozen) |
| The `dragleave` containment idiom (`relatedTarget` inside `currentTarget` → not an exit) | file-manager `:255-259` and upload `:963-972`, equivalent logic with different spellings (`instanceof Node` versus a truthiness test) and different comments |
| `resolveNavigationIntent` — the reading-direction law | already the single owner, 14+ consumers (`components/primitives/runtime/collection/roving-focus`). The kernel must consume it, never re-derive RTL. |

> **CORRECTED (R2).** Round 1 listed "column-menu `moveItem`/`moveDraftColumn`
> (the closure inventory already recorded it twice inside column-menu)". That
> observation is **stale**: `8c96f4197` extracted `normalizeDraftOrder`, and
> `grep -c` now returns one definition and two call sites. The duplication that
> remains is across owners (saved-views inline versus column-menu's `moveItem`),
> not inside column-menu.

The two surviving copies are **semantically identical**, which is what makes one
`reorderByKey` possible — and the identity is asymmetric in a way the kernel must
preserve exactly. Both remove the source and re-insert at the target's index in
the **original** array, so a forward drag lands the item **after** the target and a
backward drag lands it **before**: `[a,b,c,d]` dragging `a` onto `c` gives
`[b,c,a,d]`; dragging `d` onto `b` gives `[a,d,b,c]`. R1 in §7 is that asymmetry,
stated as a test rather than as a worry.

### 0.9 Live external consumers (constrains "no behavior change")

| Family | External consumer |
|---|---|
| kanban-board | `app-bithire/src/features/applications/surface/components/pipeline/kanban/**` — the production recruiting pipeline |
| widget-board | `app-bithire/src/ui/details/overview-grid/widget-board-preference/index.ts` — server-backed layout persistence |
| column reorder | `app-bithire/src/ui/tables/data-table/index.tsx:302, 1085, 1172` — `onColumnReorder(order: string[])` |
| `useSortableList` | none found in any local app tree |

`app-evnto` has none. This is why kanban is last in the adoption order (§3.2).

---

## 2. Proposed contract

### 2.0 The shape of the proposal, in one paragraph

The four sortable owners share the **transport and the session**, not the
**semantics of a move**. So the kernel is two layers: a session core that owns
the four handlers, the drag state and the commit point; and opt-in pure resolvers
a consumer composes when its semantics need them. The kernel decides *when*
something happened; the consumer decides *what it means*, *where it may land* and
*what it is called*. Nothing in the kernel knows what a column, a view, a
candidate or a node is. The session core is the **HTML5 transport session** and
says so (§2.9) — round 1 called it event-generic and it was not.

### 2.1 Placement

```
packages/core/src/components/primitives/runtime/collection/sortable/
  index.ts            pure resolvers + useDragSession
  tests/
```

Beside `roving-focus/` and `listbox/`. Justification, both directions measured:

- `foundation/behavior/` is **import-pure**: `grep` for `@/` across the whole
  owner returns nothing. The RTL law requires `useReadingDirectionIsRtl` from
  `@/infrastructure/runtime/i18n` (`roving-focus/index.ts:49`); placing the
  kernel in `foundation/behavior` would open a `foundation → infrastructure`
  edge against the declared dependency order. This is exactly why `roving-focus`
  is not there either.
- `components/primitives/runtime/collection/` is reachable from every tier that
  needs it, by precedent: the Tree primitive's siblings
  (`primitives/navigation/menu`, `segmented`, `tabs`, `rate`, `tour`, `dropdown`,
  `tree-select`, `time-picker`, `cascader`) and two structures
  (`table-toolbar`, `active-filters-bar`) already import from it. A primitive
  importing a peer `runtime/` layer is established; a primitive importing a peer
  component family is not (`sibling-owner-dependency`).

**The placement is not admitted by the gate as it stands** — see §3.1. The
`sortable → roving-focus` edge needs a named rank, and that admission is in the
implementation write set. Placement is also independent of public exposure: the
kernel is an internal owner and this proposal adds **no new root export**.

The existing `infrastructure/runtime/application/interaction/drag-and-drop/` owner
is retired by the last adoption lot, not before (§3.2 lot 11, §5, §6.7).

### 2.2 Layer 1 — `useDragSession`, the HTML5 session core

```ts
/** What the consumer is dragging. The kernel never inspects it beyond `key`. */
type DragPayload = { readonly key: string };

/**
 * A move that has not been committed, expressed on the logical axes. `first`
 * and `last` are deliberately absent -- see §2.4.3.
 */
type MoveIntent = 'prev-item' | 'next-item' | 'prev-container' | 'next-container';

interface DragSession<TPayload extends DragPayload, TTarget> {
  readonly payload: TPayload;
  /** Where the move would land if it committed now. `null` = not over a target. */
  readonly target: TTarget | null;
  /** Which entrypoint opened the session. Decides focus restoration (§2.4.4). */
  readonly origin: 'pointer' | 'keyboard';
  /** `grabbed` exists only in `'grab'` keyboard mode. §2.4 pins the rest to `dragging`. */
  readonly phase: 'dragging' | 'grabbed';
}

interface UseDragSessionOptions<TPayload extends DragPayload, TTarget> {
  /** Off switch. A disabled session stamps nothing, starts nothing, commits nothing. */
  disabled?: boolean;

  /**
   * Optional refinement of the target identity the consumer already bound at
   * the call site of `getTargetProps(target)`. It runs on `dragover`, AFTER
   * the kernel called `preventDefault()` and set `dropEffect`. Returning `null`
   * means "not a target here": the session's target clears and a drop is a
   * no-op. Omitting it means the bound identity IS the target.
   */
  resolveTarget?: (context: {
    readonly event: React.DragEvent;
    readonly payload: TPayload;
    readonly target: TTarget;
  }) => TTarget | null;

  /**
   * THE SINGLE COMMIT POINT, for the pointer path and the keyboard path alike.
   * The kernel mutates no array and does not know whether the consumer commits
   * now or stages a draft. Called at most once per session (§2.2.3).
   */
  onDrop: (payload: TPayload, target: TTarget) => void;

  /** Fires on `dragend` WITHOUT a commit, and on Escape in `'grab'` mode. */
  onCancel?: (payload: TPayload) => void;

  /** Fires after the kernel wrote `dataTransfer` and opened the session. */
  onDragStarted?: (payload: TPayload) => void;

  /**
   * PRESS-CANCEL ROUTE. The press-cancel entrypoint of the `useInteractionState`
   * instance that OWNS the source element's press state. The kernel never
   * creates an instance of its own -- it could not reach the owning one (§2.3).
   */
  pressCancel?: (event: React.PointerEvent) => void;

  /** The keyboard contract, IN the API rather than beside it (§2.4). */
  keyboard?: SortableKeyboardOptions<TPayload, TTarget>;

  /** The announcement contract, IN the API rather than beside it (§2.5). */
  onAnnounce?: (event: SortableAnnounceEvent<TPayload, TTarget>) => void;
}

interface UseDragSessionResult<TPayload extends DragPayload, TTarget> {
  /** Null between sessions. Never a partial session. */
  session: DragSession<TPayload, TTarget> | null;

  /** Spread on the drag SOURCE. */
  getSourceProps: (payload: TPayload) => SortableSourceProps;

  /**
   * Spread on a drop TARGET. `target` IS the target identity: the consumer
   * binds it at the call site, exactly where its closure binds it today.
   * Source and target may be the same element.
   */
  getTargetProps: (
    target: TTarget,
    options?: { readonly stopPropagation?: boolean }
  ) => SortableTargetProps;

  /** Focus restoration for keyboard commits (§2.4.4). Optional to call. */
  registerItem: (key: string) => (element: HTMLElement | null) => void;

  /** Imperative entrypoints. The ONLY move path in `'delegated'` mode (§2.4.2). */
  move: (intent: MoveIntent) => void;
  commit: () => void;
  cancel: () => void;
}
```

#### 2.2.1 Target identity — the binding mechanism

Round 1 gave `getTargetProps()` no argument and left a single
`resolveTarget(event, payload)` to recover a view key, a column key, a Tree key
or a Kanban `{columnId, position}` out of nothing. It cannot, and Codex was right
to block on it.

**The identity is bound at the call site.** `getTargetProps(target)` takes the
consumer's own target value as its first argument, which is *precisely* the
closure binding every owner already writes — `handleDragOver(e, column.id, index)`
becomes `getTargetProps({ columnId: column.id, position: index })`. There is no
DOM registration mechanism, no key attribute to parse and no `TTarget` equality
or projection rule, because the kernel never has to recover an identity it was
not handed and never compares two targets. `resolveTarget` exists only to
*refine* the bound identity with something only the event knows (Tree's cursor
zone) or to *refuse* it (`null`).

#### 2.2.2 Stamp ownership — the kernel stamps nothing

**CORRECTED (R2).** Round 1's invariant 5 said "the kernel stamps `data-*` and
returns state". The four owners' anatomies are measurably different and cannot be
unified by this WO:

| Owner | Source stamps | Target stamps | Absent-vs-false |
|---|---|---|---|
| kanban | `data-dragging` (card) | `data-dropping` (column root `:500`, column body `:547`), `data-drop-at-end` (`:549`), `data-drop-before` (card `:569`) | value is a boolean expression; `false` renders |
| saved-views | `data-dragging` (`:324`) | `data-drop-target` (`:325`), same element | `false` renders |
| column-menu | `data-dragging` (row `:653` AND handle `:673`) | `data-drag-target` (row `:651` AND handle `:672`) | `false` renders — and `ColumnMenu.causality.integration.test.tsx:157-167` pins the literal `[data-drag-target="false"][data-dragging="false"]` |
| tree | `data-draggable`, `data-dragging` (`:380-381`) | `data-drop-target` (`:378`), `data-drop-position` (`:379`, carries the zone) | `|| undefined` — the attribute is ABSENT when false |

So the kernel returns **event handlers only**, and each family keeps its own
stamp spelling, derived from `session` exactly as it derives it from local state
today. `getSourceProps` returns `draggable`, `onDragStart`, `onDragEnd`,
`onPointerCancel` and (when a keyboard mode is declared) `onKeyDown`;
`getTargetProps` returns `onDragOver`, `onDrop` and, when the family declares it,
`onDragLeave`. Nothing else. This is what makes R3 a non-event: column-menu's
four pinned selectors keep matching because the attributes never move.

#### 2.2.3 The laws the session core owns

Each one is a thing a consumer gets wrong today, and each is a named case or mutation in §6.3-§6.4.

- **PREVENT-DEFAULT LAW.** `dragover` calls `preventDefault()` unconditionally,
  before any consumer code runs. Without it the browser never fires `drop`. All
  four owners do this by hand (tree does it in the JSX wrapper, `:386`, not in
  its handler) and none of them has a test that would catch its removal.
- **DROPEFFECT LAW.** `dragover` sets `dataTransfer.dropEffect = 'move'`. Three
  of the four do; **tree does not** (`:802-822` — measured, and Codex flagged it).
  Setting it in tree's adoption is a one-line, user-visible cursor change, so it
  is a declared addition in tree's lot note, not a silent transport side effect.
- **PROPAGATION.** `getTargetProps(target, { stopPropagation: true })` calls
  `event.stopPropagation()` on `dragover` **before** the kernel's
  `preventDefault()`, and on `drop` **after** it — reproducing kanban's exact
  spelling (`:584` then the handler; `:246-248` preventDefault then
  stopPropagation). Only kanban needs it: its card target is a DOM descendant of
  its column-body target. Tree's rows are siblings under a `role="group"` wrapper
  (`:468-471`), not descendants, so nothing bubbles between them.
- **EXACTLY-ONCE TERMINATION.** The session is held in a ref for the guard and
  mirrored to state for rendering. `onDrop` reads and clears the ref
  **synchronously**, so a `drop` event that reaches a second, outer kernel target
  in the same bubble finds no session and is a no-op. Exactly-once therefore
  holds even if a family forgets `stopPropagation`; the flag is a visual/latency
  choice, not the correctness mechanism. Two named mutations, §6.4 N9/N10.
- **DROP-TIME VALIDATION.** A drop commits only when `session !== null` AND
  `session.target !== null`. This reproduces all four owners' guards
  (tree: `!dropTarget` → return, `:826`; saved-views: `dragViewId && dragViewId !== targetViewId`, `:210`;
  kanban: `if (dragData)`, `:246`; column-menu via the `-1` index guard in
  `moveItem`, `:177-186`). A **self-target** is NOT refused by the kernel: the
  three owners disagree (kanban commits a self-drop, saved-views and tree refuse
  it), so the rule stays in each family's `resolveTarget`.
- **CLEANUP LAW.** `dragend` clears the session unconditionally — commit or no
  commit, prevented or not — and is never routed through a chain that could skip
  it (§2.3).
- **PAYLOAD LAW.** `dragstart` sets `effectAllowed='move'` and
  `setData('text/plain', payload.key)`: the one line that makes the drag legible
  to `getData` fallbacks and to other drop surfaces. During `dragover` the drag
  data store is in **protected mode**: `getData()` returns the empty string, but
  `types` and `items[i].kind` **remain enumerable**. That is why `session.payload`
  exists for the sortable path — and why a file-drop adapter CAN legitimately
  reject a non-file drag during `dragover` by reading `types`/`kind` (§2.7).
  Round 1's "reading `dataTransfer` during `dragover` is forbidden" was too broad
  and is **CORRECTED (R2)**.
- **PAYLOAD RECOVERY, and the one behavior difference it creates.** The kernel
  takes its payload from the session, never from `dataTransfer`. Three owners do
  the same. **column-menu does not**: it reads `getData('text/plain')` first and
  falls back to local state (`:418-419`). For every in-document drag the two
  agree. They differ only for a foreign drag carrying `text/plain`, where
  column-menu's `indexOf` returns `-1` and `moveItem`'s guard returns the array
  unchanged (`:177-186`) — a no-op, which is exactly what the kernel's
  `session === null` guard produces. **Same observable outcome by a different
  route**, so the adoption is behavior-preserving; this is recorded because
  invariant 1 requires the reconciliation to be stated rather than assumed, and
  §6.4 N11 pins it.

#### 2.2.4 The four typed adapters

One per sortable owner, each showing target identity, stamp ownership,
propagation, drop-time validation and callback order. These are the contract, not
illustrations: if an adapter below cannot be written, the API is wrong.

**(a) saved-views** — single list, whole pill is both source and target,
controlled `string[]` callback.

```tsx
const drag = useDragSession<{ key: string }, { key: string }>({
  disabled: !onViewReorder,
  resolveTarget: ({ payload, target }) => (target.key === payload.key ? null : target),
  onDrop: (payload, target) =>
    onViewReorder?.(reorderByKey(views.map((v) => v.id), payload.key, target.key)),
});

// per pill -- source and target on the SAME element, stamps stay the family's
<div
  data-part="pill"
  data-dragging={drag.session?.payload.key === view.id}
  data-drop-target={drag.session?.target?.key === view.id}
  {...drag.getSourceProps({ key: view.id })}
  {...drag.getTargetProps({ key: view.id })}
/>
```

Order today: `preventDefault` → guard `dragViewId !== targetViewId` → splice pair →
`onViewReorder(newOrder)` → clear (`:207-224`). Order after: identical, with the
splice pair inside `reorderByKey` (§0.8 proves they are the same function).
`draggable={!!onViewReorder}` becomes `disabled: !onViewReorder` — `getSourceProps`
returns `draggable: !disabled`.

**(b) column-menu** — **separate handle and row**, DRAFT commit model.

```tsx
const drag = useDragSession<{ key: string }, { key: string }>({
  resolveTarget: ({ payload, target }) => (target.key === payload.key ? null : target),
  // THE DRAFT: the commit point writes local state, NOT the public callback.
  onDrop: (payload, target) =>
    setDraftOrder((previous) =>
      reorderByKey(normalizeDraftOrder(previous, columns.map((c) => c.key)), payload.key, target.key)),
  pressCancel: cancelRowAndHandlePress,   // §2.3
});

// the ROW is the drop target
<StatefulRow
  data-drag-target={drag.session?.target?.key === column.key}
  data-dragging={drag.session?.payload.key === column.key}
  {...drag.getTargetProps({ key: column.key })}
>
  {/* the HANDLE is the drag source */}
  <Button data-part="drag-handle" {...drag.getSourceProps({ key: column.key })} … />
```

Two identities, one session: the source identity is bound on the handle, the
target identity on the row. `onColumnsChange` is NOT reachable from `onDrop` —
Apply keeps calling it (`:489-491`), which is R4 and the lot-2 pin's first
assertion. The two `Move up`/`Move down` buttons (`:894`, `:903`) are untouched by
the transport lot: they already call `handleMove` and they are the family's
existing keyboard/touch path (§0.5).

**(c) tree** — hierarchical target, 3-zone geometry, reparent.

```tsx
const drag = useDragSession<{ key: TreeEngineKey }, { key: TreeEngineKey; position: TreeDropZone }>({
  disabled: !propDraggable,
  resolveTarget: ({ event, payload, target }) => {
    if (payload.key === target.key) return null;              // today's self guard, :804
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return { key: target.key, position: resolveEdgeZone(rect, event.clientY, { zones: 'before-inside-after' }) };
  },
  onDrop: (payload, target) => {
    const dragNode = findNode(payload.key); const dropNode = findNode(target.key);
    if (dragNode && dropNode)
      onDrop?.({ dragNode, dropNode, dropPosition: { before: -1, inside: 0, after: 1 }[target.position] });
  },
  onDragStarted: (payload) => { const node = findNode(payload.key); if (node) onDragStart?.({ node }); },
});

// per row -- `|| undefined` keeps tree's ABSENT-when-false anatomy
<div
  data-drop-target={drag.session?.target?.key === nodeKey || undefined}
  data-drop-position={drag.session?.target?.key === nodeKey ? drag.session.target.position : undefined}
  data-draggable={isDraggable || undefined}
  data-dragging={drag.session?.payload.key === nodeKey || undefined}
  {...drag.getSourceProps({ key: nodeKey })}
  {...drag.getTargetProps({ key: nodeKey })}
/>
```

`onDragStarted` exists for exactly this: tree emits a public `onDragStart({node})`
from inside its handler (`:797`), and §2.3 forbids composing a second handler onto
the prop. Tree keeps `keyboard: { mode: 'delegated' }` (§2.4), so
`getSourceProps` returns no `onKeyDown` and the WAI-ARIA TreeView contract at
`:849` is untouched. Tree does **not** refuse a descendant target today — only
`dragKey === key` is checked (`:804`) — so the kernel does not invent one; it is
named in Appendix A A3 and owed by lot 8.

**(d) kanban** — nested targets, cross-container, FLIP coupling, `'immediate'`
keyboard.

```tsx
type KanbanTarget = { columnId: string; position: number };
const drag = useDragSession<{ key: string }, KanbanTarget>({
  onDrop: (payload, target) => {
    measure();                                    // FLIP snapshot BEFORE the parent reorders
    onItemMove(payload.key, fromColumnOf(payload.key), target.columnId, target.position);
  },
  keyboard: { mode: 'immediate', orientation: 'vertical', crossAxis: 'horizontal',
              resolveKeyboardTarget, },
  onAnnounce: announceKanbanMove,                 // the family builds every string
  pressCancel: cardInteraction.handlers.onPointerUp,   // :108, verbatim
});

// column body: the outer target
<div data-part="column-body" data-dropping={drag.session?.target?.columnId === column.id}
     {...drag.getTargetProps({ columnId: column.id, position: column.items.length })} />
//   card: the inner target AND the source; stopPropagation reproduces :584
<BoardCard draggable
  data-drop-before={drag.session?.target?.columnId === column.id && drag.session.target.position === index}
  {...drag.getSourceProps({ key: itemKey(item) })}
  {...drag.getTargetProps({ columnId: column.id, position: index }, { stopPropagation: true })} />
```

`measure()` before `onItemMove` is **inside the family's own `onDrop`**, so R8's
ordering is preserved by construction rather than by a kernel promise; the kernel
guarantees only that `onDrop` runs synchronously during the `drop` event and that
the session clears after it returns. Kanban's self-drop behavior (it commits
`onItemMove` when a card is dropped on itself — measured, `:583-587` has no self
guard) is preserved because kanban declares no `resolveTarget`.

### 2.3 Press-cancel and handler composition — both corrected

**CORRECTED (R2), and this is the finding with the largest blast radius.**

#### 2.3.1 Press-cancel names the owning instance

`useInteractionState` holds state **per hook instance**
(`foundation/behavior/runtime/interaction-state/index.ts:45-120`) and exposes **no
public cancel entrypoint**: `cancelPress` is internal, and the only public routes
to it are `handlers.onPointerLeave`, `handlers.onPointerUp`, `handlers.onBlur`
and flipping `disabled`. A kernel that created its own instance would clear its
own state and nothing else.

So the route is **passed in**: `pressCancel` is the owning instance's
press-cancel entrypoint, and `getSourceProps` routes `dragend` and
`pointercancel` into it. Kanban is the reference and the contract is literally its
line: `const cancelPress = interaction.handlers.onPointerUp` (`:108`), because
"the kernel's press-cancel IS its pointerup handler".

Where the owning instance is unreachable, the adapter says so instead of
pretending. Measured, for column-menu:

- The **row**'s instance lives inside `StatefulRow` (`:1117-1130`), a component
  local to `column-menu/index.tsx`. Reachable: the file passes the route to
  itself.
- The **handle**'s instance lives inside the modern `Button`
  (`button/engines/modern/index.tsx:238`). Its only public routes are the
  chained `onPointerUp` / `onPointerCancel` props (`:491-492`) — and `Button`
  does **not** route `onDragEnd` to press-cancel, though it routes
  `onPointerCancel` to it on the line above. So the honest repair of R2 is a
  one-line `Button` change mirroring `:492`, and it is a **primitive change**: it
  is declared in its own lot with its own note, and it may never ride inside a
  lot labelled behavior-preserving.
- Both instances latch on one `pointerdown`, because React's pointer events
  bubble from the handle to the row. A family owning two instances passes a
  `pressCancel` that calls both. These are not preventable-event chains, so they
  are composed as plain function calls, never with `composeHandlers`.

#### 2.3.2 The composition law is replaced, because it was measurably wrong

`composeHandlers` (`foundation/behavior/runtime/compose-handlers/index.ts:21-32`)
skips its second handler when the event's default is prevented. I executed the
real module on three legs (Appendix B, leg 3; result
`["A.first","B.first","C.first","C.second"]`):

| Leg | Setup | Result |
|---|---|---|
| A | first handler calls `preventDefault()` | second ran **0 times** (reproduces Codex) |
| B | event arrives **already** `defaultPrevented`, neither handler prevents anything | second ran **0 times** |
| C | nobody prevents | both ran |

Leg B is the one that kills round 1's COMPOSITION LAW. The helper tests
`event.defaultPrevented` without caring who set it, and the kernel's
PREVENT-DEFAULT LAW always sets it on `dragover`. So on a composed `dragover`:
the caller's handler placed **after** the kernel's is dead in every drag, and a
caller's handler placed **before** it can prevent default itself and silently
destroy the drop for the whole family. Either order is a trap.

**The replacement law.** The kernel's returned bags are the ONLY handlers on the
four drag props. A family that needs its own reaction declares it as an option
(`onDragStarted`, `resolveTarget`, `onDrop`, `onCancel`) with the order stated in
§2.2.3 — it does not compose onto the prop. Three consequences, all tested:

1. **Cleanup is mandatory, never vetoable.** `dragend` clears the session inside
   the kernel's own handler, and no caller code path can skip it. An
   unconditional promise may not ride a chain that intentionally skips handlers.
2. **Vetoable actions are named and separate.** The only vetoable step is the
   commit, and it is vetoed by data (`resolveTarget` returning `null`), never by
   `preventDefault`.
3. **A caller-prevented event is a declared case.** If the event arrives at the
   kernel already `defaultPrevented` (an ancestor handler ran first), the session
   still cleans up and the commit still obeys the `resolveTarget`/session guards.
   §6.4 N12 plants exactly that.

`composeHandlers` remains the right tool everywhere it is used today — pointer,
focus and keyboard props, where prevention genuinely means "the caller opted
out". It is the drag props, where the kernel itself must prevent, that it cannot
serve.

### 2.4 Keyboard — inside the API

```ts
interface SortableKeyboardOptions<TPayload extends DragPayload, TTarget> {
  /** §2.4.1. There is no `'none'`: invariant 4 forbids a non-operable sortable. */
  mode: 'immediate' | 'grab' | 'delegated';

  /** The axis whose arrows move an item WITHIN its container. */
  orientation: 'horizontal' | 'vertical';

  /** The axis whose arrows move an item ACROSS containers. §2.4.5 refuses the
      invalid combinations. */
  crossAxis?: 'horizontal' | 'vertical';

  /** Keys that open and commit a `'grab'` session. Default `[' ', 'Enter']`;
      a family whose source element already owns those keys MUST name others. */
  grabKeys?: readonly string[];

  /**
   * The keyboard's target resolver: no event, no rect, no cursor. Returns the
   * destination for an intent, or `blocked` at an edge.
   */
  resolveKeyboardTarget: (
    payload: TPayload,
    intent: MoveIntent
  ) => { kind: 'target'; target: TTarget } | { kind: 'blocked' };
}
```

#### 2.4.1 Candidate movement versus committed movement

This is the distinction round 1 left implicit and Codex blocked on. It is what
makes "one commit point" auditable.

- A **candidate move** changes `session.target` and emits
  `onAnnounce({ kind: 'moved' })`. It never calls `onDrop`.
- A **committed move** calls `onDrop(payload, target)` **exactly once** and ends
  the session.

| Path | Candidate moves | Commit | Session between commits |
|---|---|---|---|
| pointer | every `dragover` | `drop` | open, `phase: 'dragging'` |
| `'immediate'` | **none** | every arrow key | **null** — no grabbed state can ever be stamped |
| `'grab'` | every arrow key after the grab key | the grab key again | open, `phase: 'grabbed'` |
| `'delegated'` | whatever the family drives with `move()` | the family's `commit()` | as the family drives it |

`'immediate'` is kanban's shipped behavior stated as a rule: an arrow resolves a
target and commits it in the same tick, no session is opened, and R10 ("no
grabbed state is ever stamped") is true by construction rather than by assertion.
Escape restoration in `'grab'` mode is auditable for the same reason: the data was
never touched, so cancelling is `session = null` plus `onCancel`, not an undo.

#### 2.4.2 Modes, and what each may take from the family

| Mode | Protocol | Who | What it may NOT take |
|---|---|---|---|
| `'immediate'` | An arrow moves the item now and announces the result. No grabbed state. | kanban (shipped, unchanged) | keys pressed on a control INSIDE the source: kanban already guards `e.target !== e.currentTarget` (`:317`), and `getSourceProps().onKeyDown` reproduces that guard. |
| `'grab'` | A grab key opens a candidate session, arrows choose, the grab key commits, Escape cancels and restores. | nobody in this WO by default — see below | Space/Enter where the family already owns them. |
| `'delegated'` | The kernel binds NO key. The family drives `move()`/`commit()`/`cancel()` and must name its operable path in its adoption lot. | tree, saved-views, column-menu | — |

**CORRECTED (R2).** Round 1 assigned `'grab'` to saved-views and column-menu as
"new operability". Both assignments were wrong for the same measured reason:

- **column-menu already has a keyboard and touch move path** (§0.5). It needs
  announcements, not a grab protocol. Its mode is `'delegated'`.
- **saved-views' pill is a `div` with no `tabIndex`** (`:319-331`); the focusable
  things inside it are the select `Button` (`:361-375`, Space/Enter = select), the
  rename `Input` (Enter/Escape) and the actions menu. A `'grab'` mode bound to
  Space/Enter would steal all three. Its mode is `'delegated'`, and its operability
  lot adds a real move affordance — the simplest being to promote the existing
  decorative `aria-hidden` drag grip (`:333-337`) into a control pair like
  column-menu's, which is the shape Codex's answer to Q3 endorses for tree (Appendix A, A3).

`'grab'` therefore ships as a supported mode with a full test suite and **no
adopter in this WO**. That is an honest outcome: the mode exists for a family
whose source element owns no keys, and none of these four does.

#### 2.4.3 `Home` / `End`

`resolveNavigationIntent` returns `'first'` for `Home` and `'last'` for `End`
(`roving-focus/index.ts:74-77`), and `MoveIntent` has no member for either.
Round 1 never said what happens. The rule:

> `resolveMoveIntent` returns `null` for `'first'` and `'last'`. `Home` and `End`
> are not move keys in this WO.

That is behavior-preserving by measurement: kanban's `handleCardKeyDown` maps only
the four arrows and returns for every other key (`:326-331`), so `Home`/`End` are
not move keys today in the one family that has a keyboard move. "Move to first /
last position" is a new user-visible behavior; it is available later as a declared
addition that extends `MoveIntent`, never as a side effect of adopting a resolver.
§6.4 N13 pins the `null`.

#### 2.4.4 Focus restoration

`registerItem(key)` returns a ref callback. After a **keyboard-originated** commit
the kernel holds the payload key pending and focuses that key's registered element
as soon as it exists, then clears the pending key. This generalizes kanban's
`pendingFocusId` + effect (`:297`, `:341-348`), including its measured asymmetry:
kanban sets `pendingFocusId` only in `applyMove`, never in `handleDrop`, so **a
pointer commit never moves focus**. The kernel reproduces that: `session.origin`
decides.

#### 2.4.5 Invalid axis combinations

`orientation` and `crossAxis` exclude `'both'` at the type level (a `'both'` axis
swallows all four arrows and leaves nothing to tell an item move from a container
move). Two further combinations are refused at the call site, in development, with
a named error: `crossAxis === orientation`, and `crossAxis` declared together with
`mode: 'delegated'` (the kernel binds no key, so it would resolve nothing).
§6.4 N14.

`resolveMoveIntent` is built ON `resolveNavigationIntent` and calls it twice —
once per declared axis — so the axis that answers non-`null` decides item versus
container. It restates no reading-direction rule and flips no key name, sign or
index delta. The result matches kanban's shipped mapping exactly: `ArrowLeft` under
RTL resolves `'next'` on the horizontal axis (`roving-focus/index.ts:86-88`), which
is kanban's `rtl ? 'next-column' : 'prev-column'` (`:329`).

### 2.5 Layer 2 — the pure resolvers

```ts
/** The 3-zone (or 2-zone) edge rule, stated once, testable without a DOM. */
function resolveEdgeZone(
  rect: { top: number; height: number },
  clientY: number,
  options: { zones: 'before-after' | 'before-inside-after'; edgeRatio?: number }
): 'before' | 'inside' | 'after';

/** The one order normalizer. Never mutates. §0.8 pins the asymmetry it must keep. */
function reorderByKey(order: readonly string[], sourceKey: string, targetKey: string): string[];

/** A key becomes a MOVE intent on the logical axes. Delegates the RTL law. */
function resolveMoveIntent(
  key: string,
  options: {
    orientation: 'horizontal' | 'vertical';
    rtl: boolean;
    crossAxis?: 'horizontal' | 'vertical';
  }
): MoveIntent | null;
```

`edgeRatio` defaults to `0.25` and the comparisons are **strict**: `y < h * ratio`
is `before`, `y > h * (1 - ratio)` is `after`, everything else — including exact
equality at both boundaries — is `inside`. That is tree's shipped arithmetic
character for character (`:812-818`), so tree's adoption is a no-op by
construction and the boundary cases in §6 R5 test the equality, not a neighbourhood
of it.

### 2.6 Announcements

The kernel owns the **when** and the **politeness**; the consumer owns the
**text** and the **region**. `onAnnounce` is an option on
`UseDragSessionOptions` (§2.2) — round 1 declared a floating
`SortableAnnouncements` interface connected to nothing.

```ts
type SortableAnnounceEvent<TPayload extends DragPayload, TTarget> =
  | { kind: 'grabbed';   payload: TPayload }
  | { kind: 'moved';     payload: TPayload; target: TTarget; crossedContainer: boolean }
  | { kind: 'dropped';   payload: TPayload; target: TTarget }
  | { kind: 'cancelled'; payload: TPayload }
  | { kind: 'blocked';   payload: TPayload; reason: 'edge' | 'not-a-target' };
```

Generic over the family's own payload and target — round 1 typed `target` as
`unknown`, which forced every consumer to cast before it could build a string.

- Politeness is `polite` for every kind. Nothing in a reorder interrupts.
  `assertive` is reserved and unused; a consumer wanting it must argue for it.
- **The kernel ships no strings and no i18n keys.** The message vocabulary is
  product vocabulary ("column", "position", "stage") and the key prefix belongs to
  the family (`kanbanBoard.move_column`). The consumer builds the string with its
  own `tOr` and owns the live region.
- **i18n-aware by construction**: the kernel never formats, so there is no
  concatenation to mis-order under RTL. `interpolateTranslation` stays with the
  family.
- **Repeated identical outcomes are the family's problem and the drill's target.**
  §0.7 measures kanban announcing nothing on a second consecutive blocked move.
  The kernel emits the second `blocked` event faithfully; the operability drill
  (§6.2) asserts the region's content actually changes.

### 2.7 Second kernel in the same owner: `useFileDropZone`

Not a sortable. `file-manager` and `upload` share one duplicated idiom and nothing
else with the four:

```ts
function useFileDropZone(options: {
  disabled?: boolean;
  /** The raw event, for consumers that expose it publicly. Called BEFORE onFiles. */
  onDropEvent?: (event: React.DragEvent) => void;
  onFiles: (files: File[]) => void;
}): { isDragOver: boolean; dropZoneProps: FileDropZoneProps };
```

**CORRECTED (R2).** `accept` and `multiple` are **removed** from the options.
Round 1 declared them and then said the hook does not enforce them; upload already
filters at the drop path with its own `filterDroppedFiles(…, accept, multiple)`
(`:928`), and the native input enforces the picker path. Declaring an option
nothing reads is a lie in a type.

It owns the `dragover` `preventDefault` and the `dragleave` containment rule
(`relatedTarget` inside `currentTarget` is not an exit; a `null` relatedTarget IS
an exit — leaving the window).

**The drop order is Upload's, verbatim** (`upload/engines/modern:921-929`):
`preventDefault()` → `if (disabled) return` (before the hover state clears, as
today) → clear `isDragOver` → `onDropEvent?.(event)` → `onFiles(files)`.
`onFiles` is called **unconditionally** with `Array.from(dataTransfer.files)`;
each consumer keeps its own guard inside it, which is how file-manager's
`files.length > 0 && onUpload` check (`:248-250`) survives unchanged. Upload's
public `onDrop(e)` prop maps to `onDropEvent` and keeps receiving the raw event
before any processing (R11).

**File identification and cleanup stay exactly where they are today.** The hook
passes `File[]` through untouched: upload's `resolveAcceptedUploadFiles` keeps
assigning its uids and building the `UploadFile` list (`:907`), and file-manager
keeps handing the array straight to `onUpload` (`:248-250`). The hook identifies
nothing. `isDragOver` clears on exactly the two routes both consumers already
have — the drop, and a `dragleave` whose `relatedTarget` is outside the zone
(including `null`, which is leaving the window). No `dragend` route is added:
neither consumer has one, so adding one would be an undeclared behavior change.

Codex's answer to Q5 is accepted in full (Appendix A, A5): **"no accessibility surface" is too
strong.** Upload's dropzone is `role="button"`, `tabIndex={disabled ? -1 : 0}`,
`aria-label={t('upload.drop_hint')}`, with an Enter/Space handler opening the
picker (`:962-981`). The hook must not touch any of it, and each consumer's picker
and keyboard fallback is preserved by name in its lot note.

### 2.8 What stays with the consumer

Rendering; every `data-*` stamp (§2.2.2); the drop indicator and every visual
value (the current kernel writes
`style.borderTop = '2px solid var(--ds-color-primary, #1677ff)'` at
`drag-and-drop/index.ts:356-358` — a hardcoded literal the family-cut law forbids
and the new kernel must not carry); the data mutation; the commit model
(controlled vs draft); whether a move is legal, including self and descendant
targets; the message text and the live region; the domain vocabulary; the
container/item roles and labels (the current kernel hardcodes `role="list"` and an
English `aria-label`, wrong for kanban's columns and for tree's `role="tree"`).

### 2.9 What the kernel does NOT model (SCOPE clause)

Stated in the kernel's own docblock, in the style of `roving-focus`.

- **It is the HTML5 transport session, and it says so.** **CORRECTED (R2).**
  Round 1 claimed a core "generic over its event type" while the same section took
  `React.DragEvent`, always returned HTML5 source props and mandated
  `dataTransfer`. That was an HTML5 adapter describing itself as event-neutral.
  Codex's option B is adopted: **this WO's session core is HTML5**. The pure
  resolvers (`resolveEdgeZone`, `reorderByKey`, `resolveMoveIntent`) are
  transport-neutral and are what FAM-13 may consume.
- **Pointer-transport move/resize** → widget-board, FAM-13. Its activation
  threshold, pointer identity, preview state, origin restoration and live
  ownership checks are not solved by parameterizing an event type. If the owner
  requires full session adoption there, a concrete event-neutral lifecycle
  contract comes back for joint review first; the handoff sentence "FAM-13 adopts
  it later" is satisfied by resolver adoption unless and until that happens
  (Appendix A, A2).
- **External file drops** → `useFileDropZone` (§2.7), a second capability on the
  same transport.
- **Auto-scroll** and **drag preview / `setDragImage`** — authored by 0 of 8
  owners today (a scope observation, §0.5). Not in the intersection, not invented
  here.
- **Cross-window and cross-document drags** — no owner does this.
- **D3 pointer drag** (`network-graph`, chart `brush`) — a third transport,
  outside F-69.

---

## 3. Owners / write set for the implementation phase

### 3.1 The kernel lot (FAM-08, singleton owner)

```
packages/core/src/components/primitives/runtime/collection/sortable/index.ts     NEW
packages/core/src/components/primitives/runtime/collection/sortable/tests/**     NEW
packages/core/scripts/check/architecture/audits/structure/index.mjs              EDIT
packages/core/scripts/check/architecture/audits/structure/index.test.mjs         EDIT
```

No consumer is touched. Lands green, adopted by nobody. This is deliberate: it
makes every adoption below a separable, revertible lot.

**The structure-gate admission is part of this lot, and round 1 omitted it.**
**CORRECTED (R2).** Measured: `SCOPED_OWNER_RANKS['components/primitives/runtime/collection']`
declares `combobox: 0`, `roving-focus: 0`, `typeahead: 0`, `listbox: 1`
(`scripts/check/architecture/audits/structure/index.mjs:173-178`), and the
same-UI-rank branch admits an edge only when **both** owners carry a declared rank
(`:1226-1232` — `sourceScopedRank !== undefined && targetScopedRank !== undefined`,
then `sourceScopedRank > targetScopedRank`). An undeclared `sortable` falls
through to `sibling-owner-dependency` (`:1323`). "Beside an admitted kernel" admits
nothing by itself.

The admission is exactly one entry, `sortable: 1`, and it is narrow in both
directions:

- `sortable` (1) → `roving-focus` (0): admitted, `1 > 0`.
- `roving-focus` (0) → `sortable` (1): **refused** as `local-layer-inversion`
  (`:1232-1246`), which is the tested reverse-edge prohibition Codex requires. It
  is a *different finding id* from the sibling-owner one, so the test must assert
  the inversion by name, not merely the absence of the sibling finding.
- `listbox` (1) ↔ `sortable` (1): same rank, so it still falls through to
  `sibling-owner-dependency`. Neither edge exists and neither is being bought.

The gate's own suite changes in three places: the mirrored `SCOPED_OWNER_RANKS`
literal (`index.test.mjs:127-133`), the `rankedChildren.length` pin (`:252`,
`94` → `95`), and a new causal test modelled on the existing
`'the collection kernels are a ladder'` case (`:545-570`) that plants
`sortable → roving-focus` (admitted) and `roving-focus → sortable` (inverted).
**No baseline is widened.**

**Pre-existing reds this lot inherits and must not be credited with.** At
`785771a30`, with both gate files byte-identical to HEAD,
`node --test scripts/check/architecture/audits/structure/index.test.mjs` reports
**32 pass / 3 fail**: `default macro roots match the governed graphics and UI
taxonomy` (the mirrored literal is missing the `components/primitives/feedback`
notifier ranks another writer added), `every scoped owner and ranked child
resolves to a real directory` (the owner-count pin says 25, the table has 26), and
`the theme contract chain is a directed ladder, and the reversed edge still
inverts` (the themes literal in the test disagrees with the source's current
order). The kernel lot must leave those three exactly as it found them — repairing
someone else's mirrored literal inside this lot would make its own A/B unreadable
— and its own two edits must move `rankedChildren.length` from the value the file
then carries, not from `94`, if another writer lands first.

### 3.2 Adoption lots, in recommended order

Each row is one lot, one commit, independently revertible. "Pin" = a PRE-lot that
adds pinning tests and touches no product code.

| # | Lot | Owner WO | Why here | Pin needed first |
|---|---|---|---|---|
| 0 | kernel + `useFileDropZone` + the structure admission | **FAM-08** | — | — |
| 1 | **saved-views** transport | FAM-08 | Smallest surface. Single-list, controlled, whole-pill source, id-order callback. 8 drag events already fired across 2 test files. Proves the session core against a real consumer with the least that can go wrong. | no — existing coverage suffices |
| 2 | **column-menu** transport | FAM-08 | Proves the **draft** commit model and the **separate handle/row** binding — the two structural divergences. | **YES** — 0 drag tests today |
| 3 | **tree (primitive)** transport | FAM-08 | Proves `resolveEdgeZone` and a hierarchical target. `tree-view` rides along at zero cost: it is an adapter (§0.2). Carries one declared addition: `dropEffect` (§2.2.3). | no — 6 drag events exist; extend for the zone boundaries (§6 R5) |
| 4 | **file-manager** + **upload** drop zones | FAM-08 | Independent of 1-3. Can run in parallel with them (disjoint files). | no — 9 drag events exist |
| 5 | **kanban-board** transport | FAM-08 | Last. Richest behavior, only live app-bithire pipeline consumer, FLIP coupling, nested targets, 11 drag events. Adopting it FIRST would shape the kernel to one family. | no |
| 6 | **`Button` dragend press-cancel** repair | FAM-08 | A one-line primitive change (§2.3.1) that R2 needs and that no transport lot may carry. Declared defect repair, its own note. | the lot-2 PRE-pin records the pre-repair value |
| 7 | **saved-views / column-menu** operability | FAM-08 | Announcements for both; a real move affordance for saved-views (§2.4.2). A declared behavior ADDITION, separate from its transport lot (§3.3). | — |
| 8 | **tree** operability | FAM-08 | Blocked: tree needs an explicit Move affordance (Appendix A, A3). | — |
| 9 | **F-69 instrument** arm | FAM-08 | The bounded instrument Codex requires before the DnD consolidation criterion may be claimed (§6.6). | — |
| 10 | **widget-board** pointer adapter | **FAM-13** | Not this WO. Resolver consumption only, unless the owner reopens §2.9. | — |
| 11 | retire `useSortableList` | FAM-08 | After lot 5, and only with the authorized public-API decision of §6.7. | — |

`column-menu/` may be reserved by another writer when lot 2 is scheduled; the DT
either waits for that writer to land or re-scopes.

### 3.3 Why transport and operability are separate lots

**CORRECTED (R2): round 1 cited the wrong invariants here.** The collision is
between **invariant 1** (no behavior change on adoption day) and **invariant 4**
(accessibility is a requirement, not an option) — not invariants 4 and 7.

For saved-views, column-menu and tree those two collide head-on: saved-views and
tree have no keyboard move path and none of the three announces anything, so
supplying either IS a behavior change.

Splitting resolves it without weakening either: the **transport lot** is provably
behavior-preserving and pinned by the family's own unchanged tests; the
**operability lot** is a declared, reviewed addition with its own drill and its own
`cutNote`. Merging them would force a reviewer to certify "no behavior change" on
a diff that changes behavior on purpose. The same rule is why the `Button`
press-cancel repair is lot 6 and not a line inside lot 2: a press-latch repair
cannot simultaneously be represented as byte-identical behavior (Codex, A6).

---

## 4. Invariants

1. **No behavior change on adoption day.** A transport lot leaves the family's
   interaction contract byte-identical: same callbacks, same argument shapes,
   same order of side effects, same DOM stamps. The family's existing drag tests
   run unchanged and green before and after; where none exist, they are written
   in a PRE-lot against the CURRENT implementation and must stay green byte-for-byte
   through the adoption. A test that has to be edited to pass is a behavior change,
   not a test fix. Exactly two declared exceptions exist in this program, each
   named in its own lot note: tree's `dropEffect` (§2.2.3) and the `Button`
   press-cancel repair (lot 6).
2. **Modern only.** The frozen classic/rustic engines are not touched — including
   `data-table`'s two frozen re-implementations (§0.3) and `tree`'s and
   `saved-views`'s and `upload`'s frozen siblings. The kernel is not imported into
   any frozen file, and the F-69 instrument (§6.6) excludes them by the existing
   `FROZEN_ENGINE_SEGMENT` rather than by a hand-written list.
3. **No new dependencies.** No `dnd-kit`, no `react-dnd`, no `@atlaskit/pragmatic-*`.
   The kernel is HTML5 + React, like everything it replaces.
4. **Accessibility is a requirement, not an option.** No family finishes its
   adoption pair non-operable by keyboard and silent to a screen reader. `'none'`
   is not a keyboard mode (§2.4). A family that cannot take arrows (tree) must
   name its alternative path, not skip the clause. A family that already has an
   operable path (column-menu, §0.5) owes announcements, not a second protocol.
5. **No visual values in the kernel, and no stamps either.** **CORRECTED (R2).**
   The kernel returns event handlers and session state; it writes no `style`, no
   color, no border, no transition — and it stamps no `data-*` attribute, because
   the four owners' anatomies genuinely differ (§2.2.2). The drop indicator is
   painted by the family's skin from its own channels. This is the family-cut law
   and it is the single clearest defect of the kernel being replaced
   (`drag-and-drop/index.ts:340-360`).
6. **No product semantics.** **CORRECTED (R2) — restated executably.** Round 1
   asked for a `grep` proving "no quoted English word", which is impossible:
   `'move'`, `'before'`, `'inside'`, `'after'`, `'blocked'` and `'text/plain'` are
   protocol literals the kernel must contain. The executable form is three
   assertions over the kernel's own source, each with a planted negative (§6.4
   N15):
   (a) it imports nothing from `@/foundation/i18n` or `@/infrastructure/runtime/i18n`
   and calls no `t` / `tOr` / `translateOr` / `interpolateTranslation`;
   (b) it contains no `aria-*` or `role` key, no `className`, no `style` and no
   `setAttribute`;
   (c) every string literal in the module is a member of the exported frozen
   `SORTABLE_PROTOCOL_VOCABULARY` (the intents, the zones, the announce kinds,
   `'move'`, `'text/plain'`), so a new literal is a compile-visible decision
   rather than a grep someone has to interpret.
7. **One authority per law.** The kernel consumes `resolveNavigationIntent`
   (RTL), the consumer's `useInteractionState` instance (F-37) and
   `partAttributes` (anatomy, at the consumer's call site). It re-derives none of
   them, and it does not compose onto drag props (§2.3.2).
8. **Every lot leaves a deployable state.** The kernel lands with zero consumers;
   each adoption is revertible alone; `useSortableList` stays exported until the
   last adoption lands.

---

## 5. Alternatives considered

### (a) Adopt a third-party library (dnd-kit, react-dnd, pragmatic-drag-and-drop)

Gets: a mature keyboard model, a sensor abstraction, auto-scroll, collision
strategies — several of which nothing in this cohort has today.

Costs: it violates invariant 3 outright, and invariant 3 is a standing repository
policy rather than a preference formed here. Beyond the dependency itself, the
adoption cost is a real one: a library's own keyboard model would have to be
reconciled with the three that already ship (§0.6), and it buys capability that
measures 0/8 in authored demand (auto-scroll, drag preview).

> **CORRECTED (R2).** Round 1 also claimed the library "owns the DOM it drags",
> forcing every owner's anatomy to be re-stamped around new wrapper nodes. That
> claim is **withdrawn**: dnd-kit explicitly supports augmenting existing elements
> without additional wrapper nodes, so the DOM-inevitability argument was
> unsupported. The rejection rests on the dependency policy and the adoption cost
> above, which stand on their own.

**Reject.**

### (b) Keep the per-owner implementations

Gets: zero risk today.

Costs, measured: four copies of the identical quartet (§0.4); three mutually
contradictory keyboard models (§0.6); one press-latch defect class already fixed
in exactly one of the four (§7, R2); 2 of 4 owners with any keyboard reorder path
and 1 of 4 announcing; the order normalizer written at least four times (§0.8);
and F-69 stays open, so WO-FAM-08 cannot close.

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
Extending it means shipping breaking changes to a public symbol with no known
consumers in order to serve four internal ones.

**Reject.**

### (d) New kernel beside it; retire `useSortableList` after the last adoption — RECOMMENDED

Gets: the new owner is written to the measured intersection of four real
consumers instead of to one hypothetical list; the public symbol stays exported
and untouched until nothing needs it, so every lot in between is deployable
(invariant 8); the retirement is one authorized, documented removal at the end
rather than a sequence of breaking widens.

Costs: two sortable owners coexist for the length of the adoption (lots 1-5) —
mitigated because the old one has no known consumers and cannot drift; and one
authorized public-API decision plus its changeset at lot 11 (§6.7).

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
`data-dragging`/`data-drag-target` stamp and clear; and the pre-repair value of
the handle's and the row's `pressed` state after a drag that starts and ends on
the handle (the lot-6 baseline, §7 R2).

**Leg 3 — the kernel's own suite,** with the required cases of §6.3 and the
planted negatives of §6.4.

### 6.2 The operability drill (lots 7-8, and kanban's regression in lot 5)

One drill per operable family, in the family's own package, asserting the full
keyboard round trip and the live region:

- activation (an arrow in `'immediate'` mode, the grab key in `'grab'` mode, the
  Move control in `'delegated'` mode) → a `polite` region receives a non-empty
  message;
- each move → the region content CHANGES. **Including two consecutive moves with
  the same outcome**: §0.7 measures kanban writing an identical string on a second
  blocked move at the same edge, which no assistive technology re-announces. The
  drill asserts the second announcement is distinguishable, not merely present;
- a blocked edge → a message, and the item does not move;
- Escape (`'grab'` mode) → the order is the pre-grab order and a cancel message
  is announced;
- commit → focus is on the moved item, not on `document.body` (kanban's
  `pendingFocusId` effect at `:341-348` is the reference), and a POINTER commit
  does not move focus (§2.4.4);
- RTL: with `dir="rtl"` and a horizontal axis, ArrowLeft moves in the opposite
  logical direction from LTR;
- the family's own keys still work: saved-views' select `Button`, rename `Input`
  and actions menu keep Space/Enter/Escape (§2.4.2); tree's
  `Tree.filtered-keyboard-reach` and `Tree.typeahead` stay green untouched.

Axe per family is OWED to WO-GAT-04 and is not this WO's instrument; the drill is.

### 6.3 Required cases — the kernel's own suite

These are behavior cases, not mutations. Codex named the last five and round 1
had none of them.

| # | Case | Asserts |
|---|---|---|
| C1 | `dragover` cancels the event | `event.defaultPrevented === true` after dispatch, in the unit suite (this is the honest unit-level form of the PREVENT-DEFAULT LAW; see the browser leg below) |
| C2 | drop with `session.target === null` | `onDrop` not called |
| C3 | **cancel after leaving every target** | after `dragover` on a target then `dragleave`/`dragover` resolving `null`, a `drop` is a no-op and `dragend` fires `onCancel` exactly once |
| C4 | **the source is disabled mid-session** | `disabled` flipping true during a drag clears the session, fires `onCancel`, routes `pressCancel`, and a subsequent `drop` commits nothing |
| C5 | **the target unmounts mid-session** | a `drop` that never arrives leaves no session after `dragend`; no stamp and no callback survive the unmount |
| C6 | **an unrelated external drag** | `dragover` + `drop` with no session (a foreign drag) commits nothing and clears nothing that was not its own — the case all four owners survive today only by their own separate guards (§2.2.3) |
| C7 | **nested targets commit once** | a `drop` on kanban's card target inside its column-body target calls `onDrop` exactly once, BOTH with and without `stopPropagation` (the ref guard, not the flag, is the mechanism) |
| C8 | **a caller-prevented event** | an event arriving already `defaultPrevented` still cleans up on `dragend` and still obeys the target guard on `drop` (§2.3.2) |
| C9 | keyboard `'immediate'` never opens a session | after an arrow move, `session === null` and no grabbed state was observable at any point (R10) |
| C10 | keyboard `'grab'` commits once | N arrows then one commit key → `onDrop` called exactly once; Escape instead → `onDrop` called zero times and `onCancel` once |
| C11 | `reorderByKey` asymmetry | `['a','b','c','d']` + (`a`→`c`) = `['b','c','a','d']`; + (`d`→`b`) = `['a','d','b','c']` (§0.8) |
| C12 | `resolveEdgeZone` quarter boundaries | see R5 below |

**The browser leg.** `fireEvent.drop()` dispatches the event directly and is
independent of the browser's drag-and-drop processing model, so a unit suite can
prove that the handler cancels `dragover` (C1) but **cannot** prove the
consequence "without `preventDefault` the browser never fires `drop`". That claim
moves to the Chromium harness the repository already runs
(`tests/support/family-causality/index.ts`, the resolver behind every
`*.causality.integration.test.tsx`): one real drag over a kernel target with the
cancellation present and one with it removed. **CORRECTED (R2)** — round 1 listed
the browser-level claim under a unit test.

### 6.4 Planted negatives

Each mutation must redden **at least its designated test**, and the suite must be
green on revert. Additional legitimate failures are not instrument defects.
**CORRECTED (R2)** — round 1 demanded "exactly one named test", which would have
made a correct, broadly-protective suite look like a broken instrument. A mutation
that reddens **nothing** is an instrument failure and blocks the lot.

| # | Mutation | Must redden at least |
|---|---|---|
| N1 | Delete `preventDefault()` in the `dragover` handler | `the dragover handler cancels the event` (unit, C1) **and** `a drag over an uncancelled target never drops` (browser leg) |
| N2 | Delete the `dragend` cleanup | `an aborted drag leaves no session and no stamp` |
| N3 | Remove the press-cancel route from `getSourceProps` | `a drag that starts and ends on the source leaves no pressed state` (the `PatternKanbanBoard.press-cancel` template) |
| N4 | Change `edgeRatio` from `0.25` to `0.5` in `resolveEdgeZone` | `the before/inside boundary sits at a quarter of the row` |
| N5 | Replace `resolveMoveIntent`'s delegation with a physical key map | `ArrowLeft moves next under rtl on a horizontal axis` |
| N6 | Make `resolveTarget` returning `null` still commit a drop | `a drop on a non-target is a no-op` |
| N7 | Suppress the `onAnnounce` call on `moved` | `every keyboard move announces` |
| N8 | Make `reorderByKey` mutate its input | `reorderByKey returns a new array and leaves the input intact` |
| N9 | Read the session from state instead of the ref in the commit guard | `a drop on nested targets commits exactly once` (C7) |
| N10 | Clear the session ref BEFORE calling `onDrop` | `onDrop receives the session's target` |
| N11 | Recover the payload from `dataTransfer.getData` instead of the session | `a foreign drag carrying text/plain commits nothing` (C6) |
| N12 | Skip cleanup when the event is already `defaultPrevented` | `a caller-prevented dragend still clears the session` (C8) |
| N13 | Let `resolveMoveIntent` map `Home`/`End` onto a move | `Home and End are not move keys` (§2.4.3) |
| N14 | Accept `crossAxis === orientation` | `an ambiguous axis pair is refused` (§2.4.5) |
| N15 | Add an `aria-label` string to the kernel | `the kernel contains no literal outside SORTABLE_PROTOCOL_VOCABULARY` (invariant 6) |

N3, N5 and N11 are the ones no existing test in the repository would catch today
outside kanban; they are why the planted-negative list is part of acceptance
rather than a nicety.

### 6.5 Gates

- `structure:check` — the new owner under `primitives/runtime/collection/` plus
  the rank admission of §3.1, which is what this gate adjudicates. The gate's own
  test file must go from its current 32/35 to 33/36 (the new causal case), with
  the three pre-existing failures untouched and un-baselined.
- `tsc` and `typecheck:tests`.
- `family-cut` for each adopted family.
- `contract-changeset` at lot 11 — **with immutable SHAs**. **CORRECTED (R2).**
  Round 1 wrote `--base=main`. The repository's own gate manifest warns that
  registering a range-scoped check against `main` "would compare main to itself on
  every checkout and pass vacuously"
  (`scripts/check/automation/gates/manifest/index.mjs:54`), and the default base
  is `origin/main`, which is stale under this repository's never-push rule. Every
  receipt records `--base=<pre-lot commit SHA> --head=<candidate commit SHA>`,
  both written into the lot report, so the range cannot silently become empty
  after integration.

### 6.6 The F-69 instrument — required, not optional

**CORRECTED (R2).** Round 1 offered mechanization as a question. Codex's A7
answer makes it a requirement, and Kimi's round-1 rider recommended the same lot:
**the DnD consolidation criterion may not be claimed until the instrument exists**
(lot 9). It extends existing machinery rather than adding a gate:
`family-cut`'s `OWED_ARMS` (`scripts/check/family-cut/index.mjs:128-141`) is the
declared extension point for an arm with an owner and a reason, the gate already
has a drill (`family-cut-drill`) and a decrease-only ratchet
(`scripts/check/family-cut/baseline/index.json`), and it already excludes frozen
engines structurally through `FROZEN_ENGINE_SEGMENT` (`:268`) instead of a
hand-written exclusion list.

What the arm must measure, per family:

1. **Adoption, positively**: the family's Modern source *imports* the kernel.
   Absence of a forbidden name is not adoption.
2. **Independent transport implementations, by shape and not by name**: an
   authored Modern module that holds the HTML5 vocabulary (`dataTransfer`,
   `draggable`, `onDrag*`, `onDrop`) together with its own session state is a
   re-implementation whatever its handlers are called. A pattern matching
   `handle*Drag*` would miss a renamed handler, an inline JSX arrow and a newly
   added file, and would falsely accuse the adapter callbacks that legitimately
   remain (tree-view's reshape, upload's public `onDrop` prop).
3. **Frozen engines excluded** by `FROZEN_ENGINE_SEGMENT`, with the exclusion
   *reported* so §0.3's two data-table copies stay visible as a named exception
   rather than disappearing.

Its drill plants, at minimum: a renamed handler quartet; the same quartet inlined
in JSX with no named handlers; a brand-new file carrying the vocabulary; and an
adapter-only module that must NOT be accused.

Scope, stated so the closure claim stays honest: this instrument establishes **DnD
consolidation only**. F-69's geometry and export obligations remain separately
accountable.

### 6.7 Lot 11 — what authorizes retiring a public symbol

**CORRECTED (R2).** Round 1 proposed to retire `useSortableList` on zero local
callers plus a passing changeset check. That is insufficient: a source search
establishes zero **known** consumers, never zero consumers of the published
package (§0.1). The lot requires, together:

1. the **owner's authorized public-API decision**, recorded in the lot report by
   name and date — not inferred from a census;
2. a `major` release declaration in `.changeset/` naming the removal and the
   replacement path;
3. **complete export and type accounting**: the hook and its four types removed
   from `react-hooks/index.ts:351-356`, the facade re-export
   (`facade/index.ts:2`) and therefore the root `export *` (`src/index.ts:256`),
   with the removal reflected in the published surface rather than only in source;
4. consumer documentation: what replaces it and how a caller migrates;
5. the `contract-changeset` receipt on immutable SHAs (§6.5).

Until all five exist, the owner stays exported and lot 11 does not run. Invariant
8 already allows that: nothing else in the program depends on its removal.

---

## 7. Migration risk register

| ID | Consumer | What adoption can break | The test that sees it |
|---|---|---|---|
| R1 | **saved-views** | The drop splices by **index derived from id order** (`:207-224`). A `reorderByKey` that inserts *before* instead of *after* the target on a forward drag silently reverses every backward drag. §0.8 pins the exact asymmetry both owners already implement. | `PatternSavedViewsBar.engine-advanced` + `.integration` assert the emitted `string[]`; add one case that drags backward AND forward across the same pair (C11 covers the resolver side). |
| R2 | **column-menu** | **Suspected pre-existing defect, not caused by adoption.** The row carries `useInteractionState` through `StatefulRow` (`:1117-1130`) and the handle is a `Button` with its own instance (`button/engines/modern:238`); the drag swallows the `pointerup`, so `pressed` can latch on BOTH, exactly as kanban's did before `32b2da644`. `Button` routes `onPointerCancel` to press-cancel (`:492`) but not `onDragEnd`. The repair is lot 6, and it is a primitive change. | Port `PatternKanbanBoard.press-cancel.test.tsx` to column-menu in the lot-2 PRE-pin and record BOTH instances' pre-repair values, so lot 6's change is attributed honestly. |
| R3 | **column-menu** | The axe-debt identity map in `ColumnMenu.causality.integration.test.tsx:157-167` pins `color-contrast` target paths whose ancestor chains contain the literal `div[data-part="row"][data-drag-target="false"][data-dragging="false"]`, per theme. Move where those attributes are stamped and four long selectors stop matching, reddening a pin that looks unrelated to DnD. | That file. §2.2.2 removes the risk at the root — the kernel stamps nothing and the family keeps its spelling — so a red there means the adoption moved an attribute it was not supposed to touch. Do not re-pin it to make the lot pass. |
| R4 | **column-menu** | The **draft** model: if the kernel's `onDrop` is wired to `onColumnsChange` instead of to `setDraftOrder`, every drag commits immediately and Apply/Cancel stop meaning anything. The single most likely wiring mistake in the program. | The lot-2 PRE-pin assertion "a drop does NOT call `onColumnsChange`; Apply calls it once". §2.2.4(b) shows the correct wiring literally. |
| R5 | **tree** | The 25/50/25 boundary is behavioral: any other default silently re-targets drops from `before`/`after` into `inside` — a reparent instead of a reorder, i.e. data loss in a consumer's tree. | **CORRECTED (R2).** Round 1 proposed adding `0.1h/0.5h/0.9h` cases; with the suite's 100px fixture rect those are `clientY` 10/50/90, which **already exist** at `Tree.modern-engine-advanced.test.tsx:206-238`. What is missing is the **boundary**, where the strict comparisons live: `clientY` 24 → `before`, **25 → `inside`** (`y < h*0.25` is false at equality), 74 → `inside`, **75 → `inside`** (`y > h*0.75` is false at equality), 76 → `after`. Those five cases, plus N4 on the kernel side. |
| R6 | **tree** | Arrows are the WAI-ARIA TreeView navigation contract. If a kernel keyboard mode leaks into tree, expand/collapse/navigate break. Mode must be `'delegated'`, and `getSourceProps` must return no `onKeyDown` in that mode. | `Tree.filtered-keyboard-reach` and `Tree.typeahead` are the canaries; both are pre-existing and must stay green untouched. |
| R7 | **tree-view** | Zero risk of its own — it is an adapter (§0.2) — but it has **zero drag tests**, so a regression in owner 4 surfaces at the pattern tier with nothing watching. | Add one `PatternTreeView` case asserting the `{dragKey, dropKey, position}` reshape, including the `-1/0/1 → before/inside/after` mapping. |
| R8 | **kanban-board** | FLIP coupling: `measure()` must run BEFORE the parent's reorder (`:250-251`, and again at `:295` for the keyboard path). | §2.2.4(d) puts both calls inside the family's own `onDrop`, so the ordering is internal to the family. The lot still writes the explicit assertion (`measure` called before `onItemMove`) because the kernel guarantees only the synchrony of the callback. |
| R9 | **kanban-board** | Live consumer: `app-bithire` pipeline. `onItemMove(itemId, fromColumn, toColumn, position)` is a four-argument contract; any reshape is an app-breaking change in a repository this WO does not touch. | A `WidgetBoardPublicApi`-style contract test for the kanban props, plus `contract-changeset` on immutable SHAs at the lot. |
| R10 | **kanban-board** | Its keyboard model is `'immediate'`. If `'grab'` became the default, a recruiter's ArrowRight would start grabbing instead of moving — a silent, user-visible regression. | C9 makes it structural: in `'immediate'` mode no session is ever opened, so no grabbed state can be stamped. `PatternKanbanBoard.engine-advanced` keyboard cases stay green as the family-side witness. |
| R11 | **upload** | `onDrop?.(e)` is a **public prop** called before internal processing (`:925`). A kernel that owns `onDrop` must still call the caller's first and must not swallow it. | §2.7 fixes the order in the contract (`onDropEvent` before `onFiles`); `Upload.engine-advanced` + `Upload.modern-drop-constraints` add a case asserting the caller's `onDrop` receives the raw event and that processing continues afterwards even though the event is already prevented. |
| R12 | **upload / file-manager** | The `dragleave` containment rule. Getting `relatedTarget === null` wrong (it means "left the window", an exit) makes the drop tint latch forever after the user drags out of the browser. | One kernel unit test per branch: inside → not an exit; outside → exit; `null` → exit. |
| R13 | **all four sortable** | `dist/` staleness. Several gates read `dist` (`gates-de-registry-leen-dist`), and the hooks manifest drives the dead-writers census. A kernel added without republishing the hooks manifest leaves censuses measuring the old surface. | The DT's serialized regeneration after the kernel lot, before any adoption is measured. |
| R14 | **all** | Foreign modified/untracked paths in this worktree (§1). An adoption lot measured against a dirty tree attributes another writer's reds to itself. | Every leg-1 A/B runs against a clean pre-lot tree, not the worktree. §1 records that the eleven files this packet measures are HEAD-identical. |
| R15 | **the kernel lot itself** | `structure:check`'s own suite is red at HEAD with three pre-existing failures (§3.1). A lot that "fixes" them while adding its rank entry cannot show what its own change did. | Run the suite on the pre-lot tree and on the candidate and show both; the delta must be exactly one new passing case. |

---

## Appendix A — round-1 dispositions

Round 1 ended this document with seven questions. They were answered: **Kimi**
returned ACCEPT with one rider (build the F-69 instrument lot), and **Codex**
returned HOLD with a reasoned answer to each question. The questions are replaced
here by their dispositions. `RESOLVED` means the answer is implemented in this
revision's contract text at the section named; `CARRIED` means a decision remains
open and who owns it.

| # | Question | Answer taken | Disposition |
|---|---|---|---|
| A1 | **Placement** | Codex: accept `components/primitives/runtime/collection/sortable/` **in principle**, with an explicit admission as a downstream consumer of `roving-focus`, a tested reverse-edge prohibition, and the gate change inside the write set. Public exposure is a separate question; the placement implies no new root export. | **RESOLVED** — §2.1 (placement and the no-new-export clause), §3.1 (the `sortable: 1` entry, the reverse-edge test, the three inherited reds). |
| A2 | **What "FAM-13 adopts it later" means** | Codex: **option B for this bounded contract.** FAM-13 may consume the applicable resolvers; this HTML5 interface must not claim to accommodate widget-board's pointer lifecycle (activation thresholds, pointer identity, preview state, origin restoration, live ownership checks), which an event type parameter does not solve. | **RESOLVED** — §2.9 states the core is the HTML5 transport session and withdraws round 1's event-generic claim; §1 reconciles it with the handoff sentence. **CARRIED (owner):** if full session adoption is required of FAM-13, a concrete event-neutral lifecycle contract returns for joint review before option A is adopted. |
| A3 | **Tree's keyboard move path** | Codex: an explicit, keyboard- and touch-operable **Move affordance** that selects a destination and a before/inside/after position. Bare arrows, Space and Enter stay with Tree navigation/selection. Specify invalid self and **descendant** targets, cancellation, announcements and focus restoration. A modifier chord may supplement it; it must not be the sole discoverability mechanism. | **CARRIED, and it blocks its lot** — lot 8 of §3.2 (lot 7 in round 1). Tree's mode is `'delegated'` (§2.4.2) and the affordance drives `move()`/`commit()`/`cancel()` (§2.2). The transport lots 0-5 are NOT blocked by it. Tree refuses only `dragKey === key` today (`:804`), so the descendant rule is a genuine addition this lot owes. |
| A4 | **The live region** | Codex: confirm consumer-owned regions and kernel-emitted events; make the events **generic over the actual payload and target** and connect them to the API; preserve kanban's timing during transport adoption; test repeated identical outcomes, especially consecutive blocked moves. `useAriaAnnounce`'s fate is separate and its orphan status does not justify changing kanban here. | **RESOLVED** — §2.6 (`onAnnounce` is an option, the event is generic, no strings, no region), §6.2 (the repeated-outcome assertion), §0.7 (kanban's measured identical-string defect, owned by the operability lot). **CARRIED (separate decision):** `useAriaAnnounce` retirement or repair. |
| A5 | **`useFileDropZone` in this WO** | Codex: keep it here as a **separately named capability**; remove `accept`/`multiple` if the hook does not enforce them; define raw-event callback ordering, disabled behavior, file identification, containment and cleanup; preserve each consumer's picker and keyboard fallback; "no accessibility surface" is too strong for an adapter attached to Upload's accessible drop control. | **RESOLVED** — §2.7: options trimmed, Upload's exact order reproduced, identification and cleanup left with the consumers, and the dropzone's `role="button"` / `tabIndex` / `aria-label` / Enter-Space path named as untouchable. |
| A6 | **The transport/operability split** | Codex: confirm the split. Transport lots preserve existing behavior; additions and defect repairs are declared separately. Correct ColumnMenu's premise and keep its move buttons. SavedViews' grab behavior must not steal Space/Enter from selection, rename or menu. **A press-latch repair cannot simultaneously be represented as byte-identical behavior.** | **RESOLVED** — §3.3 (with its invariant references corrected), §0.5 (the corrected column-menu premise), §2.4.2 (both families move to `'delegated'`; `'grab'` ships with no adopter), lot 6 (the `Button` press-cancel repair, declared, never inside a transport lot). |
| A7 | **Mechanization of F-69** | Kimi: recommended as a rider. Codex: **required** before the DnD consolidation criterion may be closed. Extend existing machinery; verify actual imports/adoption; detect independent transport state/handler implementations rather than forbidding a name pattern; drill renamed and inline handlers and new files; exclude frozen engines explicitly. This establishes DnD consolidation only — F-69's geometry and export obligations remain separately accountable. | **RESOLVED as a requirement** — §6.6 and lot 9 of §3.2. |

### Open decisions this revision takes, and the reviewer may reverse

1. **`'grab'` ships with no adopter.** Round 1 assigned it to saved-views and
   column-menu; both assignments were measurably wrong (§2.4.2), so the mode is
   implemented and fully tested but adopted by nobody in this WO. The alternative
   is to not ship it until a family needs it. I recommend shipping it: the
   `'delegated'` families drive the same candidate/commit machinery through
   `move()`/`commit()`/`cancel()`, so the code path is exercised either way, and a
   mode declared later would arrive without the tests.
2. **Tree gains `dropEffect` on adoption** (§2.2.3). It is a one-line, user-visible
   cursor change and the only way tree's `dragover` can be the same handler as the
   other three. Declared in tree's lot note as an addition. The alternative is a
   per-family opt-out flag, which buys a permanent divergence to avoid a cursor.
3. **The kernel stamps nothing** (§2.2.2), reversing round 1's invariant 5. This
   trades a converged anatomy for a zero-risk adoption. Converging the four
   anatomies later is a separate, declared lot with its own causality re-pins.

### Standing process items

- **Fable's independent review is still pending** under the three-reviewer rule.
  Kimi's ACCEPT and Codex's HOLD do not substitute for it.
- The FAM-08/FAM-13 circularity (D15, §1) is executed under the newer handoff law
  and still awaits **owner ratification**.
- Codex recorded that the historical Modern Rescue check fails at HEAD with
  constitution drift (obsolete compiler/skin paths). It is not a DnD regression,
  this packet does not touch it, and no adoption lot may be blocked on it.

---

## Appendix B — measurement reproduction

```
# leg 0 -- what moved between the two rounds (§1)
git rev-parse HEAD                                  # 785771a30e584bba784f258bf9a6471bf9fed45e
for f in <the eleven files of §1>; do
  git show 75ce56bfd:$f | shasum; git show HEAD:$f | shasum; shasum < $f
done                                                # 10 of 11 identical across all three; column-menu moved through 8c96f4197

# leg 1 -- the census
grep -rln "onDragStart\|onDragOver\|onDrop\b\|draggable\|dataTransfer" \
  --include=*.tsx --include=*.ts packages/core/src
grep -oE "const handle[A-Za-z]*(Drag|Drop)[A-Za-z]* *=" <owner file> | sort -u
grep -cE "^\s+onDrag(Start|Over|End|Enter|Leave)=|^\s+onDrop=" <owner file>
grep -oE "onDrag(Start|Over|End|Enter|Leave)|onDrop|dataTransfer|draggable" <owner file> | wc -l
grep -rn "useSortableList" packages/ --include=*.ts --include=*.tsx
grep -rn "autoScroll\|auto-scroll" <the eight owners>
grep -rn "setDragImage" packages/core/src
grep -c "aria-live" <owner file>
grep -oE "fireEvent\.(dragStart|dragOver|dragEnd|dragLeave|drop)" <test file> | wc -l

# leg 2 -- column-menu's existing move path (§0.5, the corrected premise)
grep -n "columnMenu.moveUp\|columnMenu.moveDown\|const handleMove" \
  packages/core/src/components/structures/workspace/column-menu/index.tsx
#   -> 894, 903 (two IconButtons), 364 (handleMove over the complete normalized order)
grep -c "normalizeDraftOrder" .../column-menu/index.tsx   # 3 = one definition + two call sites

# leg 3 -- composeHandlers, executed (§2.3.2)
node --experimental-strip-types /tmp/compose-probe.mts
#   A: first prevents            -> ["A.first"]            second skipped
#   B: event ALREADY prevented   -> ["B.first"]            second skipped
#   C: nobody prevents           -> ["C.first","C.second"] both run

# leg 4 -- the structure gate (§3.1)
sed -n '162,180p'  packages/core/scripts/check/architecture/audits/structure/index.mjs   # the ranks
sed -n '1226,1246p' packages/core/scripts/check/architecture/audits/structure/index.mjs  # both-ranks-required
node --test packages/core/scripts/check/architecture/audits/structure/index.test.mjs
#   -> 35 tests, 32 pass, 3 fail (pre-existing at HEAD; both gate files are HEAD-clean)

# leg 5 -- tree's zone arithmetic and the cases that already exist (§6 R5)
sed -n '802,822p' packages/core/src/components/primitives/display/tree/engines/modern/index.tsx
sed -n '206,238p' packages/core/src/components/primitives/display/tree/tests/Tree.modern-engine-advanced.test.tsx

# leg 6 -- the press-cancel routes (§2.3.1)
sed -n '45,120p' packages/core/src/foundation/behavior/runtime/interaction-state/index.ts   # no public cancel
sed -n '487,507p' packages/core/src/components/primitives/inputs/button/engines/modern/index.tsx  # onPointerCancel routed, onDragEnd not
sed -n '104,120p' packages/core/src/components/patterns/visualization/kanban-board/engines/modern/index.tsx  # the reference route

# leg 7 -- the changeset base trap (§6.5)
sed -n '50,56p' packages/core/scripts/check/automation/gates/manifest/index.mjs
grep -n "optionOf(argv, 'base'" packages/core/scripts/check/contract-changeset/index.mjs   # default origin/main

# leg 8 -- the instrument's extension point (§6.6)
sed -n '124,142p' packages/core/scripts/check/family-cut/index.mjs      # OWED_ARMS
sed -n '265,270p' packages/core/scripts/check/family-cut/index.mjs      # FROZEN_ENGINE_SEGMENT
grep -n "family-cut" packages/core/scripts/check/automation/gates/manifest/index.mjs
```
