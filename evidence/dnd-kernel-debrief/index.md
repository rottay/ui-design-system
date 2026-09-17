# Shared DnD kernel — contract debrief (WO-FAM-08 / F-69)

Design packet, **revision 3**. No product code was written. Every number below is
a measurement over the tree, and each claim carries its `file:line`.

Reviewers: Codex, Kimi, Fable (shared-core review, `roadmap/README.md` execution
policy). Record ACCEPT or HOLD with evidence.

> **Revision 3 (2026-09-17).** Round 2 was reviewed by Kimi (ACCEPT of the
> direction) and by Codex (**HOLD** —
> `evidence/dnd-kernel-debrief/codex-HOLD-round2.txt`; B4 resolved, B1/B2/B3/B5
> still blocking). This revision resolves the four. The contract is now
> **type-checked**: every TypeScript block in §2 was compiled in memory under
> the repository's own TypeScript 5.9.3 and the three errors Codex reproduced
> (TS2344, TS2345, TS2739) were first reproduced against revision 2's
> declarations and then eliminated (Appendix B, legs 9-10). The substantive
> changes: the payload key is widened to `string | number` and the **bound
> target is separated from the resolved destination** (§2.2, §2.2.1);
> `getSourceProps` takes **per-source eligibility** (§2.2.4(c)); `resolveTarget`
> receives the **current** target, which reproduces saved-views' and
> column-menu's leave-intact `dragover` (§2.2.3); **three** foreign-drag
> behavior changes are declared with pins instead of one being wrongly
> reconciled (§2.2.5); **terminal reservation** is specified before any external
> callback and N10 is rewritten so its designated assertion fails (§2.2.3,
> §6.4); the keyboard options become **mode-specific types** with a typed
> `start()` entrypoint, an explicit candidate input and a named direction source
> (§2.4), with one **complete delegated adapter** written out (§2.4.6);
> press-cancel becomes a **per-source cleanup boundary** shown at every instance
> (§2.3.1); the browser leg names a **live-mount harness** with its own write
> set (§6.3); and the F-69 arm becomes an **executable blocking admission rule**
> with its measurement, gate and drill files named (§6.6). Every round-2 finding
> and its resolution is in `revision-notes.md`. Claims corrected in this round
> are marked **CORRECTED (R3)** where they appear; round-2 corrections keep
> their **CORRECTED (R2)** marks.

---

## 1. WO / base

| | |
|---|---|
| Work order | WO-FAM-08 — Family cut: data-table, toolbars, column settings, saved views, widget-board, kanban, calendar-view, file-manager and shared DnD/export kernels |
| Finding | F-69 — DnD re-implemented per pattern |
| WO step | `roadmap/family-cuts.md:207` step 4 — "one DnD kernel and one export" |
| Round-1 base | `75ce56bfdef64388d7c32b3c36bfef116c3367b4`, branch `main` |
| Revision-2 base | `785771a30e584bba784f258bf9a6471bf9fed45e`, branch `main` |
| Revision-3 base | `35122963005dca61b24503155d52687608b0097b`, branch `main` |
| Checkout | `/Users/daniel/Developer/Rottay/r4-recon-opus` |
| Phase | DESIGN. Implementation is a separate dispatch AFTER this debrief resolves. |

**Base movement between the rounds, measured.** Of the eleven files this packet
reasons about — the eight census owners plus `compose-handlers`,
`interaction-state` and `roving-focus` — ten are byte-identical between
`75ce56bfd` and `785771a30`. The single file that moved is
`column-menu/index.tsx`, through `8c96f4197` (it extracted `normalizeDraftOrder`;
its `defs/jsx/tok` counts are unchanged).

**Revision 3 re-measured a wider set.** The eleven above plus the seven this
round reasons about directly — `button/engines/modern`, `tree/runtime/tree-behavior`,
`Tree.modern-engine-advanced.test.tsx`, `tests/support/family-causality`,
`scripts/check/family-cut/index.mjs` and the two `structure` gate files — are
**18 of 18 byte-identical across `785771a30`, HEAD `351229630` and this
worktree**. Every measurement in revisions 2 and 3 therefore stands on the same
bytes, and none is taken against another writer's uncommitted edit.
Reproduction: Appendix B, leg 0.

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
caused by adoption, and repairing it is **lot 5b** (§3.2), a declared addition
with its own note — never inside a transport lot.

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

**CORRECTED (R3).** Revision 2's declarations did not compile. Codex reproduced
TS2344, TS2345 and TS2739 in memory; I reproduced all three against revision 2's
own types before changing anything (Appendix B, leg 9), and every block below is
compiled clean under the repository's TypeScript 5.9.3 (leg 10). Three shape
changes carry the fix: `DragPayload.key` widens to `string | number`; the **bound
target** and the **resolved destination** become separate type parameters; and
the keyboard options become a discriminated union per mode.

```ts
/**
 * An item identity. `string | number` because a Tree key is a React key
 * (`TreeEngineKey`, `tree/runtime/tree-behavior/index.ts:19`) and the kernel
 * must not force a lossy `String()` on the family's own identity.
 */
type DragKey = string | number;

/** What the consumer is dragging. The kernel never inspects it beyond `key`. */
type DragPayload = { readonly key: DragKey };

/**
 * A move that has not been committed, expressed on the logical axes. `first`
 * and `last` are deliberately absent -- see §2.4.3.
 */
type MoveIntent = 'prev-item' | 'next-item' | 'prev-container' | 'next-container';

interface DragSession<TPayload extends DragPayload, TDestination> {
  readonly payload: TPayload;
  /** Where the move would land if it committed now. `null` = no destination. */
  readonly target: TDestination | null;
  /** Which entrypoint opened the session. Decides focus restoration (§2.4.4). */
  readonly origin: 'pointer' | 'keyboard';
  /** `grabbed` exists only in `'grab'` and `'delegated'` sessions. */
  readonly phase: 'dragging' | 'grabbed';
}

interface SortableSourceProps {
  readonly draggable: boolean;
  readonly onDragStart?: React.DragEventHandler<Element>;
  readonly onDragEnd?: React.DragEventHandler<Element>;
  readonly onPointerCancel?: React.PointerEventHandler<Element>;
  readonly onKeyDown?: React.KeyboardEventHandler<Element>;
}

interface SortableTargetProps {
  readonly onDragOver: React.DragEventHandler<Element>;
  readonly onDrop: React.DragEventHandler<Element>;
}

interface UseDragSessionOptions<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
> {
  /** Off switch. A disabled session stamps nothing, starts nothing, commits nothing. */
  readonly disabled?: boolean;

  /**
   * Refines the target identity the consumer bound at the call site of
   * `getTargetProps(target)` into the DESTINATION the commit receives. It runs
   * on `dragover`, AFTER the kernel called `preventDefault()` and set
   * `dropEffect`. Returning `null` clears the destination; returning `current`
   * LEAVES THE PREVIOUS ONE INTACT, which is what saved-views and column-menu
   * do today (§2.2.3). Omitting it means the bound identity IS the destination,
   * which is only typable when `TDestination` defaults to `TTarget`.
   */
  readonly resolveTarget?: (context: {
    readonly event: React.DragEvent;
    readonly payload: TPayload;
    readonly target: TTarget;
    /** The destination the session is holding right now. */
    readonly current: TDestination | null;
  }) => TDestination | null;

  /**
   * THE SINGLE COMMIT POINT, for the pointer path and the keyboard path alike.
   * The kernel mutates no array and does not know whether the consumer commits
   * now or stages a draft. Called at most once per session (§2.2.3).
   */
  readonly onDrop: (payload: TPayload, target: TDestination) => void;

  /** Fires on `dragend` WITHOUT a commit, and on `cancel()`. */
  readonly onCancel?: (payload: TPayload) => void;

  /** Fires after the kernel wrote `dataTransfer` and opened the session. */
  readonly onDragStarted?: (payload: TPayload) => void;

  /**
   * Press-cancel for a source that does NOT own a component-local cleanup
   * boundary. Where the source component owns its own `useInteractionState`
   * instance -- kanban's `BoardCard`, column-menu's `StatefulRow` -- the
   * boundary belongs there and this option stays unset (§2.3.1).
   */
  readonly pressCancel?: (event: React.PointerEvent) => void;

  /** The keyboard contract, IN the API rather than beside it (§2.4). */
  readonly keyboard?: SortableKeyboardOptions<TPayload, TDestination>;

  /** The announcement contract, IN the API rather than beside it (§2.6). */
  readonly onAnnounce?: (event: SortableAnnounceEvent<TPayload, TDestination>) => void;
}

interface UseDragSessionResult<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
> {
  /** Null between sessions. Never a partial session. */
  readonly session: DragSession<TPayload, TDestination> | null;

  /**
   * Spread on the drag SOURCE. `eligible` is PER SOURCE and defaults to `true`:
   * tree computes `propDraggable && !disabled` per row, so a session-level
   * `disabled` cannot express it (§2.2.4(c)).
   */
  getSourceProps(
    payload: TPayload,
    options?: { readonly eligible?: boolean }
  ): SortableSourceProps;

  /**
   * Spread on a drop TARGET. `target` IS the bound identity: the consumer binds
   * it at the call site, exactly where its closure binds it today. Source and
   * target may be the same element.
   */
  getTargetProps(
    target: TTarget,
    options?: { readonly stopPropagation?: boolean }
  ): SortableTargetProps;

  /** Focus restoration for keyboard commits (§2.4.4). Optional to call. */
  registerItem(key: DragKey): (element: HTMLElement | null) => void;

  /**
   * Opens a KEYBOARD session on `payload`, optionally seeded with a
   * destination. This is the entrypoint `'delegated'` mode needs and revision 2
   * did not have: without it a family driving `move()` from `session === null`
   * has no way to say WHICH item is moving (§2.4.2).
   */
  start(payload: TPayload, options?: { readonly target?: TDestination }): void;

  /** Advances the candidate. Requires an open session and a keyboard resolver. */
  move(intent: MoveIntent): void;

  /**
   * Commits. An explicit destination OVERRIDES the candidate, which is how a
   * destination picker commits to an arbitrary node and position that four
   * relative intents cannot express (§2.4.6, tree).
   */
  commit(destination?: TDestination): void;

  cancel(): void;
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
not handed and never compares two targets.

**CORRECTED (R3) — the bound target is not the resolved destination.** Revision 2
used one type parameter for both, so tree's mandatory adapter could not be
written: `TTarget` was `{key; position}` because that is what `onDrop` receives,
while `getTargetProps(target)` is called with only `{key}` — the position is a
fact of the *cursor*, not of the *row*, and it does not exist at bind time.
Codex reproduced the resulting **TS2345** and I reproduced it too (Appendix B,
leg 9). The contract now carries two parameters:

| Parameter | What it is | Who produces it | Where it appears |
|---|---|---|---|
| `TTarget` | the **bound** identity of a drop surface | the consumer's JSX closure | `getTargetProps(target)`, `resolveTarget`'s `target` |
| `TDestination` | the **resolved** landing place | `resolveTarget`, or the bound identity when it is omitted | `session.target`, `onDrop`, `commit(destination)`, `onAnnounce` |

`TDestination` defaults to `TTarget`, so the three families whose destination IS
the bound row keep writing two type arguments and nothing else changes. Tree
writes three. `resolveTarget` therefore *refines* the bound identity into a
destination with something only the event knows (Tree's cursor zone), *refuses*
it (`null`), or *holds the previous one* (`current`).

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
`onPointerCancel` (only when `pressCancel` is supplied) and `onKeyDown` (only in
`'immediate'` and `'grab'` modes); `getTargetProps` returns `onDragOver` and
`onDrop`. Nothing else. This is what makes R3 a non-event: column-menu's four
pinned selectors keep matching because the attributes never move.

> **CORRECTED (R3) — there is no `onDragLeave`.** Revision 2 said the target bag
> carries `onDragLeave` "when the family declares it", and no such option
> existed. Measured: **none of the four sortable owners has an `onDragLeave` or
> an `onDragEnter` handler at all** (`grep -n "onDragLeave\|onDragEnter"` returns
> nothing in any of the four files). Leaving every target is expressed today by
> the absence of further `dragover` events, which leaves the last target
> stamped until `dragend`. The kernel reproduces exactly that, and C3 in §6.3 is
> rewritten to assert it instead of asserting a handler that does not exist.
> `dragleave` belongs to `useFileDropZone` (§2.7), whose two consumers do have
> it, and it stays there.

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
  **CORRECTED (R3) — it also breaks tree's existing fixture, and that is handled
  before the lot, not inside it.** `Tree.modern-engine-advanced.test.tsx:206-210`
  builds its `dragOver` with `createEvent.dragOver(childItem)` and supplies **no
  `dataTransfer`** (the same file does supply one to `dragStart`, `:219`), so an
  unconditional `event.dataTransfer.dropEffect = 'move'` throws there. Revision 2
  said "existing tests unchanged" and silently absorbed it; Codex caught it. The
  treatment is a **declared PRE-lot fixture correction**, landed and green
  BEFORE lot 3 touches any product code: `dragOverAt` gains a `dataTransfer`
  stub. The correction is **inert at the base** — today's handler never reads
  `dataTransfer` on `dragover` — so it is green both before and after it lands
  against the unchanged implementation, which is the proof that it is not a
  test edited to make a lot pass. R16 in §7.
- **PROPAGATION.** `getTargetProps(target, { stopPropagation: true })` calls
  `event.stopPropagation()` on `dragover` **before** the kernel's
  `preventDefault()`, and on `drop` **after** it — reproducing kanban's exact
  spelling (`:584` then the handler; `:246-248` preventDefault then
  stopPropagation). Only kanban needs it: its card target is a DOM descendant of
  its column-body target. Tree's rows are siblings under a `role="group"` wrapper
  (`:468-471`), not descendants, so nothing bubbles between them.
- **TERMINAL RESERVATION.** **CORRECTED (R3).** Revision 2 said "`onDrop` reads
  and clears the ref synchronously" in §2.2.3 and "the session clears after the
  callback" in §2.2.4(d), and N10 demanded a failure if the ref cleared *before*
  `onDrop`. Codex is right that the three cannot all hold. The commit is one
  sequence, in one place, for the pointer path and the keyboard path alike:

  1. read `sessionRef.current`; `null` → return, nothing happened;
  2. `destination = explicit ?? session.target`; `null` → return (pointer: the
     session stays open and `dragend` will clean it up; keyboard: emit
     `blocked` with `reason: 'no-destination'`);
  3. **reserve**: copy `payload` and `destination` into locals, then set
     `sessionRef.current = null` — *before any external call*;
  4. clear the rendered mirror (`setSession(null)`);
  5. call `onDrop(payload, destination)` with the **reserved locals**, never by
     re-reading the ref;
  6. if `origin === 'keyboard'`, set the pending focus key (§2.4.4);
  7. emit `onAnnounce({ kind: 'dropped', … })`.

  Steps 5-7 are **not** wrapped in `try`/`finally`. A consumer exception
  propagates and steps 6-7 do not run, which is kanban's behavior today
  (`:295-306` — `measure()`, `onItemMove`, `setPendingFocusId`, then
  `setAnnouncement`, with no catch anywhere). What
  the reservation buys is that a throwing `onDrop` still leaves **no half-open
  session**. Order is kanban's, verbatim: the move callback, then the pending
  focus, then the announcement.

  The reservation is also what makes exactly-once hold: a `drop` that bubbles to
  a second, outer kernel target in the same event finds `sessionRef.current`
  already `null` and is a no-op, so `stopPropagation` is a visual/latency choice
  and not the correctness mechanism. Three named mutations, §6.4 N9/N10/N16.
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
- **TARGET-HOLD.** A `dragover` that resolves to `null` CLEARS the destination;
  a `dragover` that returns `current` HOLDS it. The three owners that have a
  self-target rule disagree on which they do, so the kernel owns neither: tree
  clears (`setDropTarget(null)` then `return`, `:804-807`), while saved-views
  (`if (viewId !== dragViewId)`, `:200-202`) and column-menu
  (`if (draggedColumnKey && draggedColumnKey !== key)`, `:410-412`) leave the
  previous target stamped. That is why `resolveTarget` receives `current`, and
  it is the whole of §2.2.4(a)/(b)'s one-line resolver. §6.3 C16 pins the
  a → b → a sequence in both spellings.
- **PAYLOAD RECOVERY.** The kernel takes its payload from the session, never
  from `dataTransfer`. Three owners do the same; **column-menu does not** — it
  reads `getData('text/plain')` first and falls back to local state
  (`:420-421`). The consequence is a real, declared behavior change and it has
  its own section: §2.2.5.

#### 2.2.4 The four typed adapters

One per sortable owner, each showing target identity, source eligibility, stamp
ownership, propagation, drop-time validation and callback order. These are the
contract, not illustrations: if an adapter below cannot be written, the API is
wrong. **All four, plus the delegated adapter of §2.4.6, were compiled together
under the repository's TypeScript 5.9.3 with `strict: true` and returned zero
errors** (Appendix B, leg 10). Six negative legs in the same check prove the
contract still refuses the wrong shapes (§2.2.6).

**(a) saved-views** — single list, whole pill is both source and target,
controlled `string[]` callback.

```tsx
const drag = useDragSession<{ key: string }, { key: string }>({
  disabled: !onViewReorder,
  // HOLDS the previous target when the source is re-hovered -- `:200-202`.
  resolveTarget: ({ payload, target, current }) =>
    target.key === payload.key ? current : target,
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
splice pair inside `reorderByKey`. Executed side by side on the same inputs:
`[a,b,c,d]` with `a` onto `c` gives `["b","c","a","d"]` from **both** the
family's inline pair and `reorderByKey`, and `d` onto `b` gives
`["a","d","b","c"]` from both (Appendix B, leg 11) — which is §0.8's identity
claim discharged by execution rather than by reading.
`draggable={!!onViewReorder}` becomes `disabled: !onViewReorder` — `getSourceProps`
returns `draggable: !disabled`.

**(b) column-menu** — **separate handle and row**, DRAFT commit model.

```tsx
const drag = useDragSession<{ key: string }, { key: string }>({
  // Same leave-intact rule as saved-views -- `:410-412`.
  resolveTarget: ({ payload, target, current }) =>
    target.key === payload.key ? current : target,
  // THE DRAFT: the commit point writes local state, NOT the public callback.
  onDrop: (payload, target) =>
    setDraftOrder((previous) =>
      reorderByKey(normalizeDraftOrder(previous, columns.map((c) => c.key)), payload.key, target.key)),
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
existing keyboard/touch path (§0.5). **`pressCancel` is not passed here** —
revision 2 passed an undeclared `cancelRowAndHandlePress` and Codex was right
that it named nothing. The row's instance lives inside `StatefulRow`, so the
boundary belongs there (§2.3.1).

**(c) tree** — hierarchical destination, 3-zone geometry, reparent, and the only
owner whose key is not a string.

```tsx
const drag = useDragSession<
  { key: TreeEngineKey },                              // TPayload
  { key: TreeEngineKey },                              // TTarget      -- bound per row
  { key: TreeEngineKey; position: TreeDropZone }       // TDestination -- resolved by cursor
>({
  disabled: !propDraggable,
  resolveTarget: ({ event, payload, target }) => {
    if (payload.key === target.key) return null;              // today's self guard, :804 CLEARS
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return { key: target.key, position: resolveEdgeZone(rect, event.clientY, { zones: 'before-inside-after' }) };
  },
  onDrop: (payload, target) => {
    const dragNode = findNode(payload.key); const dropNode = findNode(target.key);
    if (dragNode && dropNode)
      onDrop?.({ dragNode, dropNode, dropPosition: { before: -1, inside: 0, after: 1 }[target.position] });
  },
  onDragStarted: (payload) => { const node = findNode(payload.key); if (node) onDragStart?.({ node }); },
  keyboard: { mode: 'delegated' },
});

// per row -- `|| undefined` keeps tree's ABSENT-when-false anatomy
const isDraggable = propDraggable && !disabled;            // :263, unchanged
<div
  data-drop-target={drag.session?.target?.key === nodeKey || undefined}
  data-drop-position={drag.session?.target?.key === nodeKey ? drag.session.target.position : undefined}
  data-draggable={isDraggable || undefined}
  data-dragging={drag.session?.payload.key === nodeKey || undefined}
  {...drag.getSourceProps({ key: nodeKey }, { eligible: !disabled })}
  {...drag.getTargetProps({ key: nodeKey })}
/>
```

Three corrections live in this adapter, each one a Codex finding:

1. **Numeric identity is preserved.** `TreeEngineKey` is `string | number`
   (`tree/runtime/tree-behavior/index.ts:19`), so revision 2's
   `DragPayload = { key: string }` made tree's mandatory adapter a **TS2344**.
   `DragKey` widens to `string | number`. **What that costs the other three
   owners: nothing.** `DragPayload` is a *constraint*, not the payload type;
   saved-views, column-menu and kanban instantiate `TPayload = { key: string }`,
   so `payload.key` stays `string` at every one of their call sites and
   `reorderByKey(order: readonly string[], …)` keeps refusing a number. The
   refusal leg R-2 of §2.2.6 proves the widen does not leak. The one kernel-side
   consequence is `setData('text/plain', String(payload.key))` — which is
   character-for-character what tree already writes (`:795`) and the identity
   function for the three string families.
2. **The bound row is not the resolved destination**, which is the TS2345 fix
   (§2.2.1). The row binds `{ key }`; the cursor resolves `{ key, position }`.
3. **Per-source eligibility.** Tree computes `isDraggable = propDraggable && !disabled`
   per row (`:263`) and today attaches `onDragStart` only when it holds
   (`:383`), while `onDragOver`/`onDrop`/`onDragEnd` are gated on `propDraggable`
   ALONE (`:384-400`) — a disabled row is still a drop TARGET. Revision 2's
   `disabled: !propDraggable` could not express that, and its
   `data-draggable` stamp does not disable native dragging, which Codex
   correctly called out. `getSourceProps(payload, { eligible })` reproduces the
   three states exactly:

   | State | Tree today | `getSourceProps` returns |
   |---|---|---|
   | `propDraggable === false` | `draggable={false}`, all four handlers `undefined` | session `disabled` → `{ draggable: false }` and nothing else |
   | `propDraggable && disabled` | `draggable={false}`, `onDragStart` `undefined`, `onDragEnd` attached | `{ draggable: false, onDragEnd }` — no `onDragStart`, no `onKeyDown` |
   | `propDraggable && !disabled` | `draggable={true}`, `onDragStart` and `onDragEnd` attached | the full bag |

   The target bag is unaffected by `eligible`, so a disabled row keeps receiving
   drops exactly as it does today. §6.3 C17 pins all three rows.

`onDragStarted` exists for exactly this: tree emits a public `onDragStart({node})`
from inside its handler (`:797`), and §2.3 forbids composing a second handler onto
the prop. `keyboard: { mode: 'delegated' }` now type-checks on its own (it was
**TS2739** in revision 2 — §2.4), so `getSourceProps` returns no `onKeyDown` and
the WAI-ARIA TreeView contract at `:849` is untouched. Tree does **not** refuse a
descendant target today — only `dragKey === key` is checked (`:804`) — so the
kernel does not invent one; it is named in Appendix A A3 and owed by lot 8.

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
              resolveKeyboardTarget },
  onAnnounce: announceKanbanMove,                 // the family builds every string
});

// column body: the outer target
<div data-part="column-body" data-dropping={drag.session?.target?.columnId === column.id}
     {...drag.getTargetProps({ columnId: column.id, position: column.items.length })} />
//   card: the inner target AND the source; stopPropagation reproduces :584
<BoardCard
  ref={drag.registerItem(itemKey(item))}
  data-drop-before={drag.session?.target?.columnId === column.id && drag.session.target.position === index}
  {...drag.getSourceProps({ key: itemKey(item) })}
  {...drag.getTargetProps({ columnId: column.id, position: index }, { stopPropagation: true })} />
```

`measure()` before `onItemMove` is **inside the family's own `onDrop`**, so R8's
ordering is preserved by construction rather than by a kernel promise; the kernel
guarantees only that `onDrop` runs synchronously during the `drop` event and that
the session is reserved before it is called. Kanban's self-drop behavior (it
commits `onItemMove` when a card is dropped on itself — measured, `:583-587` has
no self guard) is preserved because kanban declares no `resolveTarget`.

**`pressCancel` is not passed here either. CORRECTED (R3).** Revision 2 wrote
`pressCancel: cardInteraction.handlers.onPointerUp` and Codex correctly answered
that no such binding exists at the board's session call site: **every `BoardCard`
owns its own `useInteractionState`** (`:94`). What revision 2 missed is that
`BoardCard` *already is* the boundary — it takes `onDragEnd` and
`onPointerCancel` as props, calls the consumer's handler, then calls its own
`cancelPress` (`:114-121`). So spreading `getSourceProps(...)` onto `<BoardCard>`
hands the kernel's `onDragEnd` to the component that owns the instance, and the
press-cancel route is preserved with **no kernel option at all** (§2.3.1).

#### 2.2.5 Foreign drags — three declared behavior changes, not one reconciliation

**CORRECTED (R3), and this is the largest factual correction of the round.**
Revision 2 claimed column-menu's `getData`-first payload recovery and the
kernel's session-first rule produce the "same observable outcome". **That is
false.** Codex executed the revision-base helpers and got `[b,c,a]`; I executed
them independently and reproduced it exactly (Appendix B, leg 11):

```
columns [a,b,c], NO local session, foreign text/plain = "a", dropped on "c"
  today  -> ["b","c","a"]        (indexOf("a") === 0, not -1)
  kernel -> ["a","b","c"]        (session === null, no commit)
```

The revision-2 argument assumed every foreign `text/plain` yields
`indexOf === -1`. It does for a non-matching value (`"zz"` → unchanged, verified
in the same run), and not for a matching one. Applying the same method to the
other three owners found **two more** differences of the same class that
revision 2 also missed:

| Owner | Foreign drag today | With the kernel | Class |
|---|---|---|---|
| column-menu | a matching `text/plain` **reorders the draft** (`:420-424`) | no commit | **data** |
| kanban | `handleDragOver` sets `dropTarget` with no session guard (`:234-241`), so a column **highlights** under any foreign drag | no highlight | stamp |
| saved-views | `handleDragOver` guards only `viewId !== dragViewId`, and `dragViewId` is `null`, so a pill **highlights** (`:196-205`) | no highlight | stamp |
| tree | `dragKey === null` → clears and returns (`:804-807`) | identical | none |

**The decision, declared:** rejecting foreign drags is **deliberate**. A drop
originating outside the document must not reorder a user's columns on the
coincidence that its text matches a column key — there is no consent, no source
semantics and no way to know the value meant that column. The two stamp changes
follow from the same rule: a highlight promises a drop that will not happen.

How it is carried, so no lot claims byte-identical behavior it does not have:

- Each of the three changes is a **declared addition in its own transport lot's
  note** (lots 1, 2 and 5), named individually. They are the third, fourth and
  fifth declared exceptions to invariant 1.
- **The column-menu PRE-pin (lot 2, leg 2) must cover a MATCHING foreign key**,
  not merely a non-matching one: `columns [a,b,c]`, no local `dragstart`,
  `dataTransfer.getData('text/plain') === 'a'`, drop on `c`, assert the
  pre-adoption result is `[b,c,a]`. The adoption lot then flips that single
  assertion to `[a,b,c]` in the same commit that declares it — the one place in
  this program where an existing assertion is intentionally rewritten, which is
  precisely why it must be written down before it happens.
- kanban's and saved-views' stamp changes get one assertion each in their lots:
  a `dragover` with no preceding `dragstart` leaves `data-dropping` /
  `data-drop-target` unset.
- §6.4 N11 is re-pointed at this case (C6), so a kernel that recovered its
  payload from `dataTransfer` would redden.

#### 2.2.6 The contract's negative legs

Six shapes the contract must **refuse**, each compiled with `@ts-expect-error`
so that a contract which stopped refusing one reddens the check rather than
passing silently (Appendix B, leg 10):

| # | Refused shape | Why |
|---|---|---|
| R-1 | `getTargetProps({ key, position })` where `TTarget` is `{ key }` | the bound target may not carry the resolved destination's shape |
| R-2 | `const k: string = session.payload.key` on tree's session | `DragKey`'s widen must not leak a `number` into a string-keyed family |
| R-3 | `commit({ key })` on tree's session | `commit` takes the DESTINATION, which carries `position` |
| R-4 | `keyboard: { mode: 'grab', orientation }` | `resolveKeyboardTarget` is required in `'grab'` mode |
| R-5 | `keyboard: { mode: 'delegated', crossAxis }` | §2.4.5's refusal is now at the type level, not a dev-time throw |
| R-6 | `event.crossedContainer` on a `'moved'` announce event | the kernel does not know what a container is (§2.6) |

### 2.3 Press-cancel and handler composition

**CORRECTED (R2), and this is the finding with the largest blast radius.**

#### 2.3.1 Press-cancel is a per-source cleanup boundary, not a session option

**CORRECTED (R3).** Revision 2 said the route is "passed in" and then passed two
things that do not exist at a session call site. Codex verified both:
`cardInteraction.handlers.onPointerUp` is unreachable from the kanban board
because every `BoardCard` owns its own instance, and `cancelRowAndHandlePress`
was an undeclared placeholder. The mechanism is the other way round.

**The fact the design turns on:** `useInteractionState` holds state **per hook
instance** (`foundation/behavior/runtime/interaction-state/index.ts:45-120`) and
exposes **no public cancel entrypoint** — `cancelPress` is internal and the only
public routes to it are `handlers.onPointerLeave`, `handlers.onPointerUp`,
`handlers.onBlur` and flipping `disabled`. An instance is therefore only
cancellable **from inside the component that created it**. A session at the
parent cannot reach down into it, and no option shape changes that.

**So the boundary is the source component, and the kernel supplies nothing but
`onDragEnd`.** `getSourceProps` returns an `onDragEnd` handler; a source
component that owns an instance takes that handler as a prop, calls it, and then
cancels its own press. That is not a new pattern — it is the pattern kanban
already ships, and reading it is what corrects the design:

```tsx
// kanban-board/engines/modern/index.tsx:93-122 at the revision base, condensed
// (`chained` elided); the two handlers below are verbatim, `:108` and `:114-121`
const BoardCard = React.forwardRef(function BoardCard({ children, onDragEnd, onPointerCancel, ...rest }, ref) {
  const interaction = useInteractionState();
  const cancelPress = interaction.handlers.onPointerUp;      // ":108"
  return (
    <div {...rest} {...chained} {...partAttributes('card', interaction.state)}
      onDragEnd={(event) => { onDragEnd?.(event); cancelPress(event as unknown as React.PointerEvent); }}
      onPointerCancel={(event) => { onPointerCancel?.(event); cancelPress(event); }}
      ref={ref}>{children}</div>
  );
});
```

`onDragEnd?.(event)` **is** the consumer slot the kernel plugs into. Spreading
`drag.getSourceProps({ key })` onto `<BoardCard>` puts the kernel's cleanup
handler in that slot, and the card cancels its own press after it. Kanban needs
no `pressCancel` option and no plumbing change at all.

**The three instances, and who repairs each.** Measured per source:

| Instance | Where it lives | Reachable from the session? | Repair |
|---|---|---|---|
| kanban card | `BoardCard`, local to `kanban/engines/modern` (`:90-122`) | no — but it **already** routes `onDragEnd` → `cancelPress` (`:114-117`) | **none.** Lot 5 spreads the source props onto `BoardCard` and the route is preserved |
| column-menu row | `StatefulRow`, local to `column-menu/index.tsx` (`:1117-1131`) | no — and it spreads `{...rest}` *then* `{...interaction.handlers}` (`:1124-1125`), so a passed `onPointerUp` is **overwritten**, not composed | **lot 6a**, in column-menu's own file: give `StatefulRow` the same `onDragEnd` boundary `BoardCard` has |
| column-menu handle | the modern `Button` (`button/engines/modern:238`) | no — its pointer props *notify* the consumer, they do not export its cancel (`:487-507`) | **lot 6b**, a primitive change |

`StatefulRow`'s repair is four lines in a component that is local to the
structure's own file: destructure `onDragEnd` out of `rest`, call it, then call
`interaction.handlers.onPointerUp`. It is **not** a transport change and it may
not ride lot 2.

`Button`'s repair is **two** lines, not the one revision 2 claimed: `onDragEnd`
must be destructured out of `props` (the list ending `...nativeButtonProps` at
`:200`) *and* chained in `interactionProps` (`:487-495`), because
`nativeButtonProps` is spread **before** `interactionProps` (`:566-567`) — adding the key to `interactionProps` alone
would silently swallow every caller's own `onDragEnd`, including column-menu's.
The existing `onPointerCancel: chain(interactionHandlers.onPointerUp, …)` at
`:492` is the exact shape to mirror.

**Reconciling the lots with the unchanged PRE-pin** (Codex's last B3 point).
Lot 2's PRE-pin records the **pre-repair** `pressed` value of *both* instances
after a drag that starts and ends on the handle, and lot 2's adoption must leave
both values unchanged — it is a transport lot, so the latch survives it, and
that is the correct outcome for a lot that promises byte-identical behavior. Lots
6a and 6b then change exactly those two recorded values, each in its own commit
with its own declared note. Three commits, three states, each one readable.

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

**CORRECTED (R3).** Revision 2's single `SortableKeyboardOptions` required
`orientation` and `resolveKeyboardTarget` for **every** mode, so the
`keyboard: { mode: 'delegated' }` it instructed tree to write was a **TS2739**
(Codex reproduced it; so did I, Appendix B leg 9). And the result API exposed
`move` / `commit` / `cancel` with no way to open a session or name a payload, so
`'delegated'` mode could not be driven from `session === null` at all. Both are
fixed here: mode-specific option types, and a typed `start()` on the result
(§2.2).

```ts
type KeyboardTargetResolver<TPayload extends DragPayload, TDestination> = (
  context: {
    readonly payload: TPayload;
    readonly intent: MoveIntent;
    /**
     * The session's current candidate; `null` on the first move after `start`.
     * Successive arrows in `'grab'` and `'delegated'` mode advance from HERE,
     * not from the payload's committed position -- during a candidate phase the
     * committed data has not moved, so the payload's index is stale after the
     * first arrow.
     */
    readonly candidate: TDestination | null;
  }
) => { readonly kind: 'target'; readonly target: TDestination } | { readonly kind: 'blocked' };

/** An arrow moves the item NOW and announces the result. No grabbed state. */
interface SortableImmediateKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'immediate';
  readonly orientation: 'horizontal' | 'vertical';
  readonly crossAxis?: 'horizontal' | 'vertical';
  readonly resolveKeyboardTarget: KeyboardTargetResolver<TPayload, TDestination>;
}

/** A grab key opens a candidate session; arrows choose; the grab key commits. */
interface SortableGrabKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'grab';
  readonly orientation: 'horizontal' | 'vertical';
  readonly crossAxis?: 'horizontal' | 'vertical';
  /** Default `[' ', 'Enter']`; a source that already owns those MUST name others. */
  readonly grabKeys?: readonly string[];
  readonly resolveKeyboardTarget: KeyboardTargetResolver<TPayload, TDestination>;
}

/**
 * The kernel binds NO key. The family drives `start()` / `move()` /
 * `commit()` / `cancel()`. The resolver is required only if the family calls
 * `move()`; a family that commits an absolute destination with
 * `commit(destination)` needs none. `orientation` and `crossAxis` are absent by
 * construction: the kernel reads no key here, so an axis would resolve nothing.
 */
interface SortableDelegatedKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'delegated';
  readonly resolveKeyboardTarget?: KeyboardTargetResolver<TPayload, TDestination>;
}

type SortableKeyboardOptions<TPayload extends DragPayload, TDestination> =
  | SortableImmediateKeyboard<TPayload, TDestination>
  | SortableGrabKeyboard<TPayload, TDestination>
  | SortableDelegatedKeyboard<TPayload, TDestination>;
```

**The reading direction has a named source. CORRECTED (R3).** Revision 2's
resolver needed `rtl` and nothing supplied it, while invariant 6 appeared to
forbid the only authority that could. The prohibition was drawn in the wrong
place. Measured: `roving-focus/index.ts:48` — a **peer owner in the very same
scoped directory** the kernel is placed in — imports `useReadingDirectionIsRtl`
from `@/infrastructure/runtime/i18n` at module scope. The kernel is a React hook
in that same folder, so the import is legal by precedent and by the gate.

`useDragSession` therefore calls `useReadingDirectionIsRtl()` itself and passes
the boolean into `resolveMoveIntent`. There is **no `rtl` option**, because an
option would be a second authority on the same question and invariant 7 forbids
that.

Behavior-preservation is exact, not approximate:
`useReadingDirectionIsRtl()` is literally `useOptionalDirection() === 'rtl'`
(`i18n/composition/direction/index.ts:64-66`), and kanban's handler computes
`const rtl = direction === 'rtl'` from `useOptionalDirection()` (`:156`, `:325`).
The kernel computes the same expression from the same hook.

**Invariant 6 is restated as an import allowlist**, which is what it should have
been: the kernel may import **`useReadingDirectionIsRtl` and nothing else** from
any i18n module, and may call no `t` / `tOr` / `translateOr` /
`interpolateTranslation`. A direction is a layout law; a string is product
semantics. §6.4 N15 plants a negative for each half.

#### 2.4.1 Candidate movement versus committed movement

This is the distinction round 1 left implicit and Codex blocked on. It is what
makes "one commit point" auditable.

- A **candidate move** changes `session.target` and never calls `onDrop`. It
  emits `onAnnounce({ kind: 'moved' })` **when the session's origin is the
  keyboard**; a pointer `dragover` moves the candidate silently, because no
  owner announces during a drag today (§2.6). **CORRECTED (R3)** — revision 2
  made the emission unconditional, which Codex read, correctly, as one
  announcement per `dragover`.
- A **committed move** calls `onDrop(payload, target)` **exactly once** and ends
  the session.

| Path | Opened by | Candidate moves | Commit | Session between commits |
|---|---|---|---|---|
| pointer | `dragstart` | every `dragover` (destination only; see §2.6 for what is announced) | `drop` | open, `phase: 'dragging'` |
| `'immediate'` | nothing | **none** | every arrow key | **null** — no grabbed state can ever be stamped |
| `'grab'` | a grab key | every arrow key after it | the grab key again | open, `phase: 'grabbed'` |
| `'delegated'` | `start(payload)` | `move(intent)` | `commit()` or `commit(destination)` | open, `phase: 'grabbed'` |

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
| `'delegated'` | The kernel binds NO key. The family drives `start()`/`move()`/`commit()`/`cancel()` and must name its operable path in its adoption lot. A complete adapter is written out in §2.4.6. | tree, saved-views, column-menu | — |

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
move).

**CORRECTED (R3):** of the two further refusals revision 2 deferred to a runtime
throw, one is now structural — `crossAxis` **does not exist** on
`SortableDelegatedKeyboard`, so declaring it there is a compile error rather than
a development-mode message (refusal leg R-5, §2.2.6). The remaining one,
`crossAxis === orientation`, cannot be expressed in the type system without
inflating the option into a matrix of literal pairs, so it stays a call-site
refusal in development, with a named error. §6.4 N14.

`resolveMoveIntent` is built ON `resolveNavigationIntent` and calls it twice —
once per declared axis — so the axis that answers non-`null` decides item versus
container. It restates no reading-direction rule and flips no key name, sign or
index delta. The result matches kanban's shipped mapping exactly: `ArrowLeft` under
RTL resolves `'next'` on the horizontal axis (`roving-focus/index.ts:86-88`), which
is kanban's `rtl ? 'next-column' : 'prev-column'` (`:329`).

#### 2.4.6 One complete delegated adapter — column-menu's move controls

Codex requires one delegated adapter written out in full, because a mode with no
demonstrated consumer is a claim rather than a contract. Column-menu is the
honest choice: its controls exist and are measured today (`:894`, `:903` →
`handleMove`, `:364`), so the adapter can be checked against a real
implementation rather than against a design. This is **lot 7**, the operability
lot — not a transport lot.

```tsx
const completeOrder = (previous: readonly string[]) =>
  normalizeDraftOrder(previous, columns.map((c) => c.key));

const drag = useDragSession<{ key: string }, { key: string }>({
  onDrop: (payload, target) =>
    setDraftOrder((previous) => reorderByKey(completeOrder(previous), payload.key, target.key)),
  keyboard: {
    mode: 'delegated',
    resolveKeyboardTarget: ({ payload, intent, candidate }) => {
      const order = completeOrder(draftOrder);
      // The CANDIDATE advances, not the payload: after one arrow the committed
      // order is unchanged, so `payload.key`'s index is stale.
      const from = order.indexOf(candidate ? candidate.key : payload.key);
      const step = intent === 'next-item' ? 1 : intent === 'prev-item' ? -1 : 0;
      const to = from + step;
      if (step === 0 || from < 0 || to < 0 || to >= order.length) return { kind: 'blocked' };
      return { kind: 'target', target: { key: order[to] } };
    },
  },
  onAnnounce: (event) => setAnnouncement(columnMenuMessage(event)),   // the family's strings
});

const moveBy = (key: string, intent: MoveIntent) => {
  drag.start({ key });        // opens the keyboard session on THIS column
  drag.move(intent);          // resolves the candidate
  drag.commit();              // one commit, one announcement
};

<IconButton aria-label={`${tOr('columnMenu.moveUp', 'Move up')} ${column.title}`}
            disabled={isAtEdge(column.key, 'prev-item')}
            onClick={() => moveBy(column.key, 'prev-item')} />
<IconButton aria-label={`${tOr('columnMenu.moveDown', 'Move down')} ${column.title}`}
            disabled={isAtEdge(column.key, 'next-item')}
            onClick={() => moveBy(column.key, 'next-item')} />
```

**The data outcome is identical to `handleMove`, proved by execution, not by
inspection.** `handleMove` does a POSITIONAL move (`moveItem(order, i, i ± 1)`)
and the kernel does a KEYED one (`reorderByKey(order, source, neighbour)`). For a
±1 step they coincide, because the neighbour's index in the *original* array is
the destination index. Executed on `[a,b,c,d]` over five cases including both
edges (Appendix B, leg 11):

| Move | `handleMove` today | via the kernel | |
|---|---|---|---|
| `b` down | `[a,c,b,d]` | `[a,c,b,d]` | SAME |
| `b` up | `[b,a,c,d]` | `[b,a,c,d]` | SAME |
| `c` down | `[a,b,d,c]` | `[a,b,d,c]` | SAME |
| `a` up (edge) | `[a,b,c,d]` — `moveItem`'s `to < 0` guard | `[a,b,c,d]` — `{ kind: 'blocked' }`, no commit | SAME |
| `d` down (edge) | `[a,b,c,d]` — `to >= length` guard | `[a,b,c,d]` — `{ kind: 'blocked' }` | SAME |

What the lot **adds**, declared: at the edges the user now hears something. Today
both edge cases are silent no-ops; through the kernel they emit
`{ kind: 'blocked', reason: 'edge' }` and the family renders a message. That is
the entire point of the operability lot.

**The lot also repairs the disabled-ends divergence** that §0.5 recorded as a
measured bound: today `disabled` is computed from the index within the **rendered
section** while `handleMove` spans the **complete normalized order**, so in a
grouped menu the last row of a group is disabled from moving down although the
order below it continues. Once the resolver owns the edge decision, the control
and the announcement would disagree — a button that says it cannot move next to
a resolver that says it can. `isAtEdge` above therefore asks the same resolver
(`resolveKeyboardTarget(...).kind === 'blocked'`), which makes them one decision.
Declared addition, one named test, in lot 7.

**What tree needs that column-menu does not.** Tree's destination picker must
name an **arbitrary** node and a before/inside/after position, which four
relative intents cannot express. That is what `commit(destination)` is for:
`start({ key: dragKey })`, the picker's own UI chooses, then
`commit({ key: destinationKey, position })`, with no `resolveKeyboardTarget`
declared at all. The affordance's design is still A3/lot 8 and this packet does
not take it — but the API it needs now exists and is typed, which was the actual
B2 blocker.

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
type SortableAnnounceEvent<TPayload extends DragPayload, TDestination> =
  | { readonly kind: 'grabbed';   readonly payload: TPayload }
  | { readonly kind: 'moved';     readonly payload: TPayload; readonly target: TDestination }
  | { readonly kind: 'dropped';   readonly payload: TPayload; readonly target: TDestination }
  | { readonly kind: 'cancelled'; readonly payload: TPayload }
  | { readonly kind: 'blocked';   readonly payload: TPayload;
      readonly reason: 'edge' | 'no-destination' };
```

Generic over the family's own payload and destination — round 1 typed `target` as
`unknown`, which forced every consumer to cast before it could build a string.

> **CORRECTED (R3) — `crossedContainer` is deleted.** Revision 2 put it on the
> `'moved'` event, and Codex is right that nothing could supply it: the kernel
> does not understand `TDestination`, receives no container projection and gets
> no crossing result from the resolver. The fix is not to add a supplier — it is
> to notice that the **consumer already has the fact**. It owns `TDestination`,
> so kanban computes `target.columnId !== fromColumnOf(payload.key)` from the
> event it was handed, which is exactly the `crossesColumn` its handler computes
> today (`:273`). The kernel emits what it knows and nothing more. Refusal leg
> R-6 (§2.2.6) keeps the field from coming back.

**Which events fire on which path. CORRECTED (R3)** — revision 2 left this
undefined, which is how `'immediate'` ended up owing a candidate event it has no
phase for, and how the pointer path ended up implying an announcement per
`dragover`.

| Path | `grabbed` | `moved` | `dropped` | `cancelled` | `blocked` |
|---|---|---|---|---|---|
| pointer | — | **—** | on the commit | on `dragend` without a commit | — |
| `'immediate'` | — | — | on each committed arrow | — | on a blocked arrow (`'edge'`) |
| `'grab'` | on the grab key | on each candidate arrow | on the commit key | on Escape / `cancel()` | `'edge'` |
| `'delegated'` | on `start()` | on each `move()` | on `commit()` | on `cancel()` | `'edge'`, or `'no-destination'` from a bare `commit()` with no candidate |

Two rules make that table, and both are measured rather than chosen:

- **`moved` is keyboard-only** (`session.origin === 'keyboard'`). Announcing
  every `dragover` would be new behavior for all four families — **0 of 8 owners
  announce anything during a pointer drag** (§0.5) — and it would be unusable
  besides. The pointer path announces once, at the commit.
- **`'immediate'` has no candidate phase, so it emits no `grabbed` and no
  `moved`**: one `dropped` per successful arrow, one `blocked` per refused one.
  That is kanban's shipped message pattern exactly — one string per move
  (`:295-306`), one per blocked edge (`:286-289`) — which is why adopting the
  kernel leaves its announcements byte-identical.

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

**Pre-existing reds this lot inherits and must not be credited with.**
Re-measured for revision 3 at HEAD `351229630`, with both gate files
byte-identical across `785771a30`, HEAD and this worktree,
`node --test scripts/check/architecture/audits/structure/index.test.mjs` still
reports **32 pass / 3 fail** and `rankedChildren.length` is still pinned at `94`
(`index.test.mjs:258`), so revision 2's figures stand unchanged. The three: `default macro roots match the governed graphics and UI
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
| 3 | **tree (primitive)** transport | FAM-08 | Proves `resolveEdgeZone`, a hierarchical destination and per-source eligibility. `tree-view` rides along at zero cost: it is an adapter (§0.2). Carries one declared addition: `dropEffect` (§2.2.3). | **YES, a PRE-lot fixture correction** — the `dataTransfer` stub of R16, inert at base; plus the zone boundaries of R5 |
| 4 | **file-manager** + **upload** drop zones | FAM-08 | Independent of 1-3. Can run in parallel with them (disjoint files). | no — 9 drag events exist |
| 5 | **kanban-board** transport | FAM-08 | Last. Richest behavior, only live app-bithire pipeline consumer, FLIP coupling, nested targets, 11 drag events. Adopting it FIRST would shape the kernel to one family. Carries one declared addition: the foreign-drag highlight (§2.2.5). | no |
| **5b** | **kanban announcement** repair | FAM-08 | **NEW (R3).** §0.7's measured defect — two consecutive blocked moves write the identical string, so nothing is re-announced. Codex is right that it cannot be demanded inside lot 5: an unchanged-behavior transport lot cannot also require an improved announcement. Its own declared lot, its own note, and it is where §6.2's distinguishability assertion lands. | lot 5's own suite is the baseline |
| 6 | **press-cancel** repairs — **6a** column-menu's `StatefulRow` boundary, **6b** the `Button` two-line change | FAM-08 | **SPLIT (R3).** §2.3.1 measures two separate instances that latch, in two different owners; revision 2 assigned only the primitive one and left the row unassigned. Two commits, each a declared defect repair, neither inside a transport lot. | the lot-2 PRE-pin records BOTH pre-repair values |
| 7 | **saved-views / column-menu** operability | FAM-08 | Announcements for both; a real move affordance for saved-views (§2.4.2); column-menu's complete delegated adapter and its disabled-ends repair (§2.4.6). A declared behavior ADDITION, separate from its transport lot (§3.3). | — |
| 8 | **tree** operability | FAM-08 | Blocked: tree needs an explicit Move affordance (Appendix A, A3). | — |
| 9 | **F-69 instrument** arm | FAM-08 | The bounded, **blocking** instrument Codex requires before the DnD consolidation criterion may be claimed (§6.6). Measurement, gate and drill files are named there. | — |
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
a diff that changes behavior on purpose. The same rule is why the two
press-cancel repairs are lots **6a** and **6b** and not lines inside lot 2: a
press-latch repair cannot simultaneously be represented as byte-identical
behavior (Codex, A6). **CORRECTED (R3):** the same rule also moves kanban's
announcement repair out of lot 5 into **lot 5b** — §6.2 demanded an improved
outcome inside a lot whose claim is that nothing changed, which is the identical
contradiction pointed the other way.

---

## 4. Invariants

1. **No behavior change on adoption day.** A transport lot leaves the family's
   interaction contract byte-identical: same callbacks, same argument shapes,
   same order of side effects, same DOM stamps. The family's existing drag tests
   run unchanged and green before and after; where none exist, they are written
   in a PRE-lot against the CURRENT implementation and must stay green byte-for-byte
   through the adoption. A test that has to be edited to pass is a behavior change,
   not a test fix. **CORRECTED (R3): there are six declared exceptions, not two**,
   each named in its own lot note — revision 2 counted two because it had wrongly
   reconciled the foreign-drag differences away:
   (i) tree's `dropEffect` (§2.2.3, lot 3);
   (ii) column-menu's foreign-drag **data** change (§2.2.5, lot 2 — the only
   place in the program where an existing assertion is intentionally rewritten);
   (iii) kanban's foreign-drag highlight (§2.2.5, lot 5);
   (iv) saved-views' foreign-drag highlight (§2.2.5, lot 1);
   (v) column-menu's `StatefulRow` press-cancel boundary (lot 6a);
   (vi) the `Button` press-cancel repair (lot 6b).
   Tree's PRE-lot fixture correction (R16) is not on this list because it is
   inert at the base and changes no behavior.
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
6. **No product semantics.** **CORRECTED (R2) — restated executably; AMENDED
   (R3).** Round 1 asked for a `grep` proving "no quoted English word", which is
   impossible: `'move'`, `'before'`, `'inside'`, `'after'`, `'blocked'` and
   `'text/plain'` are protocol literals the kernel must contain. Revision 2's
   restatement then over-corrected in the other direction: it banned *every*
   i18n import, which would have banned the reading-direction authority and left
   the resolver with no source for `rtl` at all — Codex's B2 finding. A direction
   is a layout law; a string is product semantics. The executable form is three
   assertions over the kernel's own source, each with its own planted negative
   (§6.4 N15a/N15b):
   (a) the **only** binding it may import from any i18n module is
   `useReadingDirectionIsRtl` (the same import `roving-focus/index.ts:48` makes),
   and it calls no `t` / `tOr` / `translateOr` / `interpolateTranslation`. The
   assertion is over the named imports, not over the module specifier, so
   widening the import list is a visible edit;
   (b) it contains no `aria-*` or `role` key, no `className`, no `style` and no
   `setAttribute`;
   (c) every string literal in the module is a member of the exported frozen
   `SORTABLE_PROTOCOL_VOCABULARY` (the intents, the zones, the announce kinds,
   the keyboard mode names, `'move'`, `'text/plain'`), so a new literal is a
   compile-visible decision rather than a grep someone has to interpret. The
   rule is stated over **string literals in expression position**: module
   specifiers, the `'use client'`-class directives and TypeScript literal TYPES
   (`mode: 'delegated'` in an interface) are excluded by construction, which
   revision 2 left ambiguous.
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
reconciled with the three that already ship (§0.6), and the capability it adds
beyond that reconciliation — auto-scroll and a custom drag image — is authored
by none of the eight owners today (§0.5). **CORRECTED (R3):** round 2 still
called that "0/8 in authored demand". It is 0/8 in **authored code**, which is a
scope observation and says nothing about demand; the sentence is rewritten to
claim only what was measured.

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
`data-dragging`/`data-drag-target` stamp and clear; the pre-repair value of
the handle's and the row's `pressed` state after a drag that starts and ends on
the handle (the lots 6a/6b baseline, §7 R2); **and — added (R3) — the
foreign-drag case with a MATCHING key**: no local `dragstart`,
`getData('text/plain') === 'a'`, drop on `'c'`, columns `[a,b,c]`, asserting the
pre-adoption result `[b,c,a]` (§2.2.5). A pin that only covers a non-matching
foreign key is green on both sides of the change and proves nothing — which is
exactly how revision 2 came to believe the behavior was preserved.

Tree gains a **PRE-lot fixture correction** of its own on the same principle
(R16): the `dataTransfer` stub, landed and proved green against the unchanged
implementation before lot 3 writes `dropEffect`.

**Leg 3 — the kernel's own suite,** with the required cases of §6.3 and the
planted negatives of §6.4.

### 6.2 The operability drill (lots 7-8, and kanban's repair in lot 5b)

One drill per operable family, in the family's own package, asserting the full
keyboard round trip and the live region:

- activation (an arrow in `'immediate'` mode, the grab key in `'grab'` mode, the
  Move control in `'delegated'` mode) → a `polite` region receives a non-empty
  message;
- each move → the region content CHANGES. **Including two consecutive moves with
  the same outcome**: §0.7 measures kanban writing an identical string on a second
  blocked move at the same edge, which no assistive technology re-announces. The
  drill asserts the second announcement is distinguishable, not merely present.
  **CORRECTED (R3):** this assertion belongs to **lot 5b**, kanban's declared
  announcement repair, not to lot 5. Requiring an improved outcome inside a lot
  whose whole claim is that behavior did not change is a contradiction, and the
  measured implementation fails it — Codex's point, accepted;
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

These are behavior cases, not mutations. Codex's round-1 review named five of
them and round 1 had none; its round-2 review showed that C3 asserted a handler
no owner has and that removal coverage was weaker than claimed, so **C3 is
rewritten and C13-C17 are new in revision 3**.

| # | Case | Asserts |
|---|---|---|
| C1 | `dragover` cancels the event | `event.defaultPrevented === true` after dispatch, in the unit suite (this is the honest unit-level form of the PREVENT-DEFAULT LAW; see the browser leg below) |
| C2 | drop with `session.target === null` | `onDrop` not called |
| C3 | **leaving every target** — **REWRITTEN (R3)** | after `dragover` on a target, dragging away from every kernel target fires nothing, so the destination is **held** and its stamp stays (the measured behavior of all four owners, none of which has an `onDragLeave` — §2.2.2); a `dragend` there fires `onCancel` exactly once and clears it |
| C4 | **the source is disabled mid-session** | `disabled` flipping true during a drag clears the session, fires `onCancel`, routes `pressCancel`, and a subsequent `drop` commits nothing |
| C5 | **the target unmounts mid-session** | a `drop` that never arrives leaves no session after `dragend`; no stamp and no callback survive the unmount |
| C13 | **re-entrant commit** — **NEW (R3)** | an `onDrop` that synchronously drives a second commit (the kernel's own `commit()`, or a nested `drop` dispatched from inside it) finds the session already reserved: `onDrop` is called **exactly once** (§2.2.3 step 3) |
| C14 | **the SOURCE unmounts mid-session** — **NEW (R3)** | the session OUTLIVES the source, because the browser fires `dragend` on a detached node and React's handler never runs. This reproduces all four owners at base (`dragKey`/`dragData`/`draggedColumnKey`/`dragViewId` all stay set), so the kernel must NOT invent a window listener: the test asserts the session is still open, that `cancel()` closes it, and that the next `dragstart` reserves a fresh one over the stale payload |
| C15 | **commit against a removed destination** — **NEW (R3)** | `session.target` is a VALUE, not a live node: `commit({ key: 'gone' })` passes it through to `onDrop` unvalidated, and the family's own guard decides — tree's `findNode` returns `undefined` and fires nothing (`:825-833`), saved-views' and column-menu's `indexOf` return `-1` and the order is unchanged. The kernel performs no liveness check and the test says so, so a later reader does not mistake a non-null field for a validity proof |
| C16 | **the leave-intact / clear split** — **NEW (R3)** | dragging `a → b → a`: with `resolveTarget` returning `current` the destination stays `b` (saved-views, column-menu), and with it returning `null` the destination clears (tree). Both spellings in one test, because §2.2.3's TARGET-HOLD law is the only thing that keeps saved-views' stamp from changing on adoption |
| C17 | **per-source eligibility** — **NEW (R3)** | the three rows of §2.2.4(c): a session-disabled source returns `{ draggable: false }` alone; an ineligible source returns `draggable: false` with `onDragEnd` but NO `onDragStart`, and a `dragStart` fired on it opens no session; an eligible source returns the full bag. The target bag is identical in all three |
| C6 | **an unrelated external drag** | `dragover` + `drop` with no session (a foreign drag) commits nothing and clears nothing that was not its own — the case all four owners survive today only by their own separate guards (§2.2.3) |
| C7 | **nested targets commit once** | a `drop` on kanban's card target inside its column-body target calls `onDrop` exactly once, BOTH with and without `stopPropagation` (the ref guard, not the flag, is the mechanism) |
| C8 | **a caller-prevented event** | an event arriving already `defaultPrevented` still cleans up on `dragend` and still obeys the target guard on `drop` (§2.3.2) |
| C9 | keyboard `'immediate'` never opens a session | after an arrow move, `session === null` and no grabbed state was observable at any point (R10) |
| C10 | keyboard `'grab'` commits once | N arrows then one commit key → `onDrop` called exactly once; Escape instead → `onDrop` called zero times and `onCancel` once |
| C11 | `reorderByKey` asymmetry | `['a','b','c','d']` + (`a`→`c`) = `['b','c','a','d']`; + (`d`→`b`) = `['a','d','b','c']` (§0.8) |
| C12 | `resolveEdgeZone` quarter boundaries | see R5 below |

**The browser leg. CORRECTED (R3) — the named harness cannot do it.** Revision 2
routed the claim to `tests/support/family-causality/index.ts`. Codex read it and
is right: `measureArms` injects **server markup** through `host.innerHTML`
(`:180-188`), reads `getComputedStyle`, and removes the host. It never hydrates
React, never mounts a handler, and its `ProbePage` interface declares no input
API at all (`:129-136` — `setContent`, `addStyleTag`, `addScriptTag`,
`emulateMedia`, `evaluate`, `close`). Running in Chromium is not the same as
exercising the browser's drag-and-drop processing model.

**The harness this leg needs already has two precedents in this repository**, and
the kernel's is built to their shape rather than invented:

| Precedent | What it does | File |
|---|---|---|
| FAB-17 static-hatch | boots a Vite dev server rooted at the fixture folder with `@vitejs/plugin-react`, resolves Playwright `chromium` **from the showroom package** (core has no Playwright dependency), mounts a real React scene, drives it with `page.hover` / `page.focus` / `page.keyboard.press`, runs assertions **inside the page**, exits non-zero, and carries a `--self-check` mode that proves its own predicates can fail | `src/components/primitives/overlay/dropdown/tests/fixtures/fab17-static-hatch-scene/runner/index.mjs` |
| skeleton geometry-invalidation | compiles a renderer in memory through the installed Vite, mounts it in Chromium, and can `--pin <git-rev>` to compile from another revision so the same runner produces the red-before and green-after receipts | `.../skeleton/runtime/anatomy-renderer/tests/fixtures/geometry-invalidation-scene/runner/index.mjs` |

**Owned write set of the browser leg** (part of lot 0, alongside the kernel):

```
packages/core/src/components/primitives/runtime/collection/sortable/tests/fixtures/drag-session-scene/index.tsx        NEW  the React scene: one source, two nested targets
packages/core/src/components/primitives/runtime/collection/sortable/tests/fixtures/drag-session-scene/runner/index.html NEW
packages/core/src/components/primitives/runtime/collection/sortable/tests/fixtures/drag-session-scene/runner/entry.tsx  NEW
packages/core/src/components/primitives/runtime/collection/sortable/tests/fixtures/drag-session-scene/runner/index.mjs  NEW  the runner, modelled on FAB-17
```

Input is driven with Playwright's `page.mouse` down/move/up over the source,
which produces trusted events and therefore a **real** HTML5 drag in Chromium —
the one thing `fireEvent.drop()` cannot simulate. Four claims, none of which a
unit suite can make:

1. **N1's real form**: with the kernel's `dragover` cancellation present, a
   `drop` event fires; with it removed (the runner injects the mutation into the
   page, exactly as FAB-17 injects `position: static`), **no `drop` event fires
   at all**. This is the consequence, not the `defaultPrevented` proxy of C1.
2. `dataTransfer.dropEffect = 'move'` actually changes the drag cursor
   negotiation, which is what makes tree's addition user-visible (§2.2.3).
3. `effectAllowed` + `setData('text/plain', …)` round-trips through a real drag
   data store, and `getData()` is **empty during `dragover`** while `types`
   stays enumerable — the protected-mode claim §2.2.3 makes.
4. Nested targets commit exactly once under a real bubble (C7), which is the
   only place the ref guard faces a browser-generated event sequence.

The runner carries a `--self-check` mode like FAB-17's: it must be able to show
its own assertions going RED. A browser leg that cannot fail is not evidence.
**It is a lot-report receipt, not a CI gate** — neither precedent is registered
in the gate manifest, and this packet does not propose registering a Playwright
run in `gates:ci`. The lot report records the runner's JSON output for the green
run and for the mutated run.

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
| N10 | **REWRITTEN (R3).** Move the terminal reservation to AFTER `onDrop` returns | `a re-entrant commit during onDrop commits exactly once` (C13). Revision 2's N10 demanded a failure when the ref cleared *before* `onDrop`, which is now the specified behavior — so its designated assertion would have stayed green and the mutation would have caught nothing. Codex verified that counterexample; this is the mutation that actually bites |
| N11 | Recover the payload from `dataTransfer.getData` instead of the session | `a foreign drag whose text/plain MATCHES an existing key commits nothing` (C6). **Re-pointed (R3):** the old case used a non-matching key, which passes either way — executed proof in §2.2.5 |
| N16 | **NEW (R3).** Re-read `sessionRef.current` inside the `onDrop` call instead of passing the reserved locals | `onDrop receives the payload and destination the session held at commit time` — after step 3 the ref is `null`, so the mutant throws or passes `undefined` |
| N17 | **NEW (R3).** Make `getSourceProps` ignore `options.eligible` | `an ineligible source is not draggable and opens no session` (C17) — this is the mutation that reproduces revision 2's own defect, where a `data-draggable` stamp was mistaken for a native-drag switch |
| N12 | Skip cleanup when the event is already `defaultPrevented` | `a caller-prevented dragend still clears the session` (C8) |
| N13 | Let `resolveMoveIntent` map `Home`/`End` onto a move | `Home and End are not move keys` (§2.4.3) |
| N14 | Accept `crossAxis === orientation` | `an ambiguous axis pair is refused` (§2.4.5) |
| N15a | Add an `aria-label` string to the kernel | `the kernel contains no literal outside SORTABLE_PROTOCOL_VOCABULARY` (invariant 6c) |
| N15b | **NEW (R3).** Import `useOptionalTranslation` beside `useReadingDirectionIsRtl` | `the kernel imports no i18n binding but the direction authority` (invariant 6a). One negative per assertion, which is what revision 2 promised and did not deliver |

N3, N5 and N11 are the ones no existing test in the repository would catch today
outside kanban; they are why the planted-negative list is part of acceptance
rather than a nicety. **N10, N16 and N17 are new in revision 3** and each one
corresponds to a defect that was present in revision 2's own contract text — the
list is not a formality, it caught its author.

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

### 6.6 The F-69 instrument — an executable admission rule

**CORRECTED (R3).** Revision 2 proposed adding an entry to `family-cut`'s
`OWED_ARMS`. Codex read the code and is right that this enforces nothing:
`OWED_ARMS` is **printed**, never judged —

```js
for (const arm of OWED_ARMS) {                       // scripts/check/family-cut/index.mjs:1431
  console.log(`family-cut OWED ${arm.id} -> ${arm.owner}: ${arm.reason}`);
}
```

— and it is reached only on the success path, after the findings have already
been evaluated. An entry there is a printed obligation, which is the opposite of
an instrument. Codex is also right that "the family imports the kernel" is not
adoption: an unused import satisfies it.

The arm is therefore built where the gate actually decides. Named files, all
four already existing:

| Role | File | Change |
|---|---|---|
| measurement | `packages/core/scripts/check/family-cut/index.mjs` → `measureFamily` | two new counts on the returned object |
| blocking judgment | same file → `judgeFamily` (the `blocking.a11yAssertions === 0` branch at `:1350` is the template) | one blocking finding |
| ratchet | `packages/core/scripts/check/family-cut/baseline/index.json` | one decrease-only pin per family |
| drill | `packages/core/scripts/check/family-cut/index.test.mjs` | the planted cases below |

No gate registration is needed: `family-cut` and `family-cut-drill` are already
in the manifest with `drillFor` / `drillId` and the baseline as their ratchet
(`scripts/check/automation/gates/manifest/index.mjs:350-362`).

**What is measured, and how it resists the obvious evasions.**

1. `dndTransportOwners` — a **ratchet** (decrease-only): the number of authored
   Modern source files in the family that carry an **independent HTML5 transport
   implementation**, detected *by shape*, never by handler name. A file counts
   when it holds the HTML5 vocabulary (`dataTransfer`, `draggable`, `onDrag*`,
   `onDrop`) **together with its own session state** — a `useState`/`useRef`
   whose value is written in a `dragstart`-shaped handler and read in a
   `drop`-shaped one. A renamed quartet, an inline JSX arrow and a brand-new file
   all count; a pattern matching `handle*Drag*` would miss all three.
2. `dndKernelWired` — **blocking**, and it is an *invocation* check, not an
   import check: the family must contain a **call expression** to
   `useDragSession` or `useFileDropZone` whose result is bound and whose bound
   name is then **read** at least once (a spread of `getSourceProps` /
   `getTargetProps` / `dropZoneProps`, or a `session` read). An unused import
   fails. The finding fires only when `dndTransportOwners > 0` **and**
   `dndKernelWired` is false — a family with no drag at all is not accused.

**Transitive adapters are defined, not left to judgement.** Three shapes are
named and excluded, each with its measured instance:

- a file whose only DnD tokens appear in a **prop type declaration or a callback
  it re-emits** — `tree-view`'s `handleDrop` reshaping `TreeDropInfo`
  (`:227-235`) — has no session state and therefore is not an owner;
- a file that **renders another owner** and passes drag props through —
  `tree-view` rendering `ModernTree` (`:318`) — is credited with the rendered
  owner's wiring, so it is neither accused nor required to wire the kernel
  itself;
- a **public prop named `onDrop`** that the family calls rather than defines —
  upload's `onDrop?.(e)` (`:925`) — is a consumer callback, not a transport.

**Frozen engines excluded, and reported.** The existing `FROZEN_ENGINE_SEGMENT`
(`:268`) does the exclusion structurally, and the exclusion is **printed** on the
`EXCLUDED` line the gate already emits, so §0.3's two `data-table` copies stay
visible as a named exception instead of disappearing.

**The drill plants, at minimum** (each must redden, and the suite must be green
on revert):

| # | Planted | Must be |
|---|---|---|
| D1 | the quartet renamed (`beginDragging`, `overSlot`, `release`, `finishDrag`) | ACCUSED |
| D2 | the same quartet inlined in JSX with no named handlers | ACCUSED |
| D3 | a brand-new file in the family carrying the vocabulary and its own state | ACCUSED |
| D4 | `import { useDragSession } from …` present and never called | **not** wired — the blocking finding fires |
| D5 | `useDragSession` called, result bound, never read | **not** wired |
| D6 | an adapter-only module (tree-view's reshape) | **NOT** accused |
| D7 | a family with no DnD vocabulary at all | **NOT** accused |
| D8 | a frozen `engines/classic` copy of D1 | **NOT** accused, and **reported** on the EXCLUDED line |

D6, D7 and D8 are the half that matters most: a gate that accuses everything is
as useless as one that accuses nothing, and revision 2's proposed name-pattern
would have failed D6.

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
| R2 | **column-menu** | **Suspected pre-existing defect, not caused by adoption.** The row carries `useInteractionState` through `StatefulRow` (`:1117-1130`) and the handle is a `Button` with its own instance (`button/engines/modern:238`); the drag swallows the `pointerup`, so `pressed` can latch on BOTH, exactly as kanban's did before `32b2da644`. `Button` routes `onPointerCancel` to press-cancel (`:492`) but not `onDragEnd`. **AMENDED (R3):** there are TWO repairs, not one — the row's boundary is lot **6a** (column-menu's own file) and the primitive is lot **6b** (§2.3.1). | Port `PatternKanbanBoard.press-cancel.test.tsx` to column-menu in the lot-2 PRE-pin and record BOTH instances' pre-repair values; lot 2 must leave both unchanged, and 6a and 6b each change exactly one of them. See R18 for why the lot-6a assertion must be behavioral. |
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
| R16 | **tree** | **NEW (R3).** The `dropEffect` addition throws in tree's own suite: `Tree.modern-engine-advanced.test.tsx:206-210` fires `dragOver` with no `dataTransfer`, so `event.dataTransfer.dropEffect = 'move'` is a TypeError, not a cursor change. Revision 2's "existing tests unchanged" would have hidden a red behind a declared addition. | A PRE-lot fixture correction adding a `dataTransfer` stub to `dragOverAt`, landed and proved green against the UNCHANGED implementation first (it is inert there), then lot 3 lands the write. Both runs go in the lot report. |
| R17 | **column-menu, kanban, saved-views** | **NEW (R3).** The foreign-drag differences of §2.2.5. The dangerous one is column-menu's: a foreign `text/plain` that happens to equal a column key reorders the draft today (`[a,b,c]` + `"a"` on `"c"` → `[b,c,a]`, executed) and will not after adoption. A lot that claims byte-identical behavior while carrying it is a false claim. | The lot-2 PRE-pin asserts the pre-adoption `[b,c,a]` for a MATCHING key; the adoption lot flips that single assertion in the commit that declares the change. kanban's and saved-views' stamp changes get one assertion each. §6.4 N11. |
| R18 | **column-menu** | **NEW (R3).** `StatefulRow` spreads `{...rest}` and THEN `{...interaction.handlers}` (`:1124-1125`), so any handler a caller passes for a pointer event the kernel also owns is silently **overwritten** rather than composed. A lot-6a repair written as "pass `onPointerUp` through" would look correct, change nothing, and pass review. | Lot 6a's assertion must be behavioral — `pressed` is false after a drag that starts and ends on the row — never "the prop was passed". The lot-2 PRE-pin's recorded pre-repair value is what makes the delta visible. |
| R19 | **the kernel lot itself** | **NEW (R3).** The browser leg's runner resolves Playwright from `../showroom/package.json`, exactly as FAB-17 does, because core has no Playwright dependency. A machine without the showroom install, or a checkout whose nested `node_modules` symlinks were not preserved, cannot run it — and a leg that silently does not run reads as an absent red. | The runner aborts non-zero with a named message when `chromium` is unresolvable (FAB-17's `resolveChromium` throw is the template); the lot report records the runner's JSON, so "it did not run" and "it passed" cannot be confused. |

---

## Appendix A — dispositions

### A.0 Round-2 dispositions (Codex HOLD, `codex-HOLD-round2.txt`)

One row per blocking finding. `RESOLVED` means the answer is in the contract text
at the section named. Full detail, one row per sub-finding, is in
`revision-notes.md`.

| Finding | Round-2 verdict | Round-3 resolution | Where |
|---|---|---|---|
| B1.1 tree's adapter fails type checking twice (TS2344, TS2345) | blocking | `DragKey` widens to `string \| number` at the **constraint** (costing the three string families nothing, proved by refusal leg R-2); `TTarget` and `TDestination` become separate parameters. Both errors reproduced against revision 2 and eliminated | §2.2, §2.2.1, §2.2.4(c), §2.2.6 |
| B1.2 tree's per-row source eligibility is lost | blocking | `getSourceProps(payload, { eligible })`, with the three measured states tabulated and pinned (C17, N17) | §2.2.4(c), §6.3 |
| B1.3 the column-menu foreign-drag reconciliation is FALSE | blocking | Accepted and **executed independently** (`[b,c,a]`). Declared as a deliberate rejection, with a PRE-pin on a **matching** key — and the same method found **two more** owners with the same class of change | **§2.2.5**, R17 |
| B1.4 saved-views' dragover leaves the previous target intact | blocking | **Reproduced**, not declared: `resolveTarget` receives `current`, so the leave-intact spelling is one line and tree's clearing spelling is another. TARGET-HOLD law + C16 | §2.2.3, §2.2.4(a)(b), §6.3 |
| B1.5 exactly-once vs N10 disagree | blocking | Terminal reservation specified as a seven-step sequence with the announcement order, the rendered-state clear and the no-catch rule; N10 rewritten to a mutation that actually fails, plus N16 | §2.2.3, §6.4 |
| B2.1 no delegated session entrypoint | blocking | `start(payload, { target })` on the result, plus `commit(destination)` for an absolute destination; **one complete delegated adapter** written out and type-checked | §2.2, **§2.4.6** |
| B2.2 the delegated config does not type-check (TS2739) | blocking | Mode-specific discriminated union; `{ mode: 'delegated' }` compiles alone. Reproduced against revision 2 first | §2.4, §2.2.6 |
| B2.3 repeated candidate movement has no defined input | blocking | `resolveKeyboardTarget({ payload, intent, candidate })`; the delegated adapter advances from the candidate and says why | §2.4, §2.4.6 |
| B2.4 the direction source is missing | blocking | The kernel calls `useReadingDirectionIsRtl()` itself — the identical import `roving-focus` makes from the same folder — and invariant 6 is restated as an **import allowlist** rather than a blanket ban. Equality with kanban's `direction === 'rtl'` proved from the hook's own source | §2.4, invariant 6 |
| B2.5 announcement metadata exceeds the supplied information | blocking | `crossedContainer` **deleted** (the consumer owns `TDestination` and already computes it); a per-path event table defines what `'immediate'` fires, and `moved` becomes keyboard-only | §2.6, refusal R-6 |
| B3 the press route does not reach the real instances | blocking | Inverted: press-cancel is a **per-source cleanup boundary**, which kanban's `BoardCard` already implements — so kanban needs no option and no plumbing. `StatefulRow` and `Button` get one repair each, in lots 6a and 6b, reconciled with the unchanged lot-2 PRE-pin | **§2.3.1**, §3.2, R18 |
| B4 structure-gate admission | resolved in round 2 | Re-measured at HEAD: still 32/35, `rankedChildren` still `94` | §3.1 |
| B5.1 the named browser harness cannot drive the hook | blocking | `family-causality` withdrawn (it injects markup and never hydrates). A live-mount scene + runner modelled on the repository's **two existing precedents**, with its own write set, its own `--self-check` and four claims a unit suite cannot make | §6.3 |
| B5.2 leaving/removal coverage weaker than claimed | blocking | C3 rewritten to the measured no-`dragleave` truth; C13-C17 added, including source-removal-mid-session and commit-against-a-removed-destination, with the explicit statement that a non-null field is not a liveness check | §6.3 |
| B5.3 tree's dropEffect conflicts with an unchanged fixture | blocking | A declared **PRE-lot** fixture correction, proved inert at the base | §2.2.3, R16, lot 3 |
| B5.4 kanban's announcement repair has no consistent lot | blocking | **Lot 5b**, its own declared repair lot; §6.2's distinguishability assertion moves there | §3.2, §6.2, §0.7 |
| B5.5 the F-69 arm needs an executable admission rule | blocking | Rebuilt as a measured ratchet + a **blocking** invocation-and-use check in `judgeFamily`, with the four files named, transitive adapters defined, and an eight-case drill in which three cases must NOT be accused | **§6.6** |
| B5.6 the residual "0/8 demand" claim at §5(a) | correction | Removed; the sentence now claims only 0/8 in authored code | §5(a) |
| M-a invariant 6's literal rule needs explicit treatment of specifiers, directives and mode literals; N15 promised one negative per assertion | correction | Both taken: the literal rule is scoped to expression position, and N15 splits into N15a/N15b | invariant 6, §6.4 |

### A.1 Round-1 dispositions

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
| A6 | **The transport/operability split** | Codex: confirm the split. Transport lots preserve existing behavior; additions and defect repairs are declared separately. Correct ColumnMenu's premise and keep its move buttons. SavedViews' grab behavior must not steal Space/Enter from selection, rename or menu. **A press-latch repair cannot simultaneously be represented as byte-identical behavior.** | **RESOLVED** — §3.3 (with its invariant references corrected), §0.5 (the corrected column-menu premise), §2.4.2 (both families move to `'delegated'`; `'grab'` ships with no adopter), lots 6a/6b (the two press-cancel repairs, declared, never inside a transport lot) and lot 5b (kanban's announcement repair, moved out of its transport lot in R3). |
| A7 | **Mechanization of F-69** | Kimi: recommended as a rider. Codex: **required** before the DnD consolidation criterion may be closed. Extend existing machinery; verify actual imports/adoption; detect independent transport state/handler implementations rather than forbidding a name pattern; drill renamed and inline handlers and new files; exclude frozen engines explicitly. This establishes DnD consolidation only — F-69's geometry and export obligations remain separately accountable. | **RESOLVED as a requirement** — §6.6 and lot 9 of §3.2. |

### Open decisions REVISION 3 takes, and the reviewer may reverse

1. **Foreign drags are rejected, in all three owners that behave differently
   today** (§2.2.5). The alternative is to preserve each owner's current
   foreign-drag behavior — which for column-menu means the kernel would have to
   accept a payload it never saw, reintroducing the `getData`-first recovery the
   PAYLOAD LAW exists to remove, and for kanban and saved-views means stamping a
   drop target for a drop that will not commit. I recommend rejecting: a foreign
   drop must not reorder a user's data on a string coincidence. It is three
   declared changes with three pins, not a silent one.
2. **`DragKey` is `string | number`.** The alternative is a serialization
   boundary that stringifies tree's keys at the kernel edge, which would make
   `session.payload.key` a different value from `node.key` inside tree's own
   `onDrop` and put a `Number()` guess on the way back. The widen is at the
   constraint, so no string-keyed family loosens (refusal leg R-2).
3. **`moved` is keyboard-only and `crossedContainer` is gone** (§2.6). The
   alternative is an announce event per `dragover` plus a container projection
   the kernel would have to be taught. Zero owners announce during a pointer
   drag today, and the consumer already owns the crossing fact.
4. **Source removal mid-session is reproduced, not repaired** (C14). All four
   owners leak the session when the dragged node unmounts; adding a window
   `dragend` listener would be an undeclared improvement inside a
   behavior-preserving lot. It is named as owed rather than fixed here.
5. **The browser leg is a lot-report receipt, not a CI gate** (§6.3). Neither
   existing Playwright scene in this repository is registered in the gate
   manifest, and registering one is a decision about `gates:ci` runtime that
   this packet is not the place to take.

### Open decisions REVISION 2 took, still standing

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
  Kimi's round-2 ACCEPT and Codex's round-2 HOLD do not substitute for it.
- **Codex re-reviews revision 3.** Its round-2 HOLD resolved B4 and left
  B1/B2/B3/B5 blocking; Appendix A.0 maps each to where it is now answered.
- **The type-check of §2 is reproducible but not yet a repository artifact.**
  It runs from `/tmp` scratch files (Appendix B, legs 9-10) because no product
  code exists to compile against yet. When lot 0 lands, the same declarations
  compile in place under `tsc` and `typecheck:tests`, and the scratch check is
  superseded rather than maintained.
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
sed -n '1428,1434p' packages/core/scripts/check/family-cut/index.mjs    # OWED_ARMS is PRINTED, never judged
sed -n '1345,1356p' packages/core/scripts/check/family-cut/index.mjs    # the blocking-arm template
sed -n '265,270p' packages/core/scripts/check/family-cut/index.mjs      # FROZEN_ENGINE_SEGMENT
grep -n "family-cut" packages/core/scripts/check/automation/gates/manifest/index.mjs   # 350-362, already registered

# ---------------------------------------------------------------------------
# REVISION 3
# ---------------------------------------------------------------------------

# leg 9 -- REPRODUCING revision 2's three type errors, before fixing them
#   /tmp/dnd-r2/round2.tsx  holds revision 2's declarations verbatim
#   /tmp/dnd-r2/round2b.tsx isolates the delegated config with string keys
packages/core/node_modules/.bin/tsc -p /tmp/dnd-r2/tsconfig.json
#   round2.tsx(47,5)  TS2344  '{ key: TreeEngineKey; }' does not satisfy 'DragPayload'
#                             -> 'number' is not assignable to 'string'
#   round2.tsx(54,23) TS2345  '{ key: TreeEngineKey; }' is missing 'position'
#   round2b.tsx(30,5) TS2739  '{ mode: "delegated"; }' is missing orientation,
#                             resolveKeyboardTarget
#   All three are Codex's, reproduced independently at TypeScript 5.9.3.

# leg 10 -- TYPE-CHECKING revision 3 (§2.2, §2.2.4, §2.2.6, §2.4, §2.4.6)
#   /tmp/dnd-r3/contract.ts   the declared API, nothing else
#   /tmp/dnd-r3/adapters.tsx  the four adapters + the delegated adapter,
#                             family symbols as `declare`d stand-ins
#   /tmp/dnd-r3/refusals.tsx  the six negative legs, each `@ts-expect-error`
node -e "console.log(require('typescript/package.json').version)"   # 5.9.3
packages/core/node_modules/.bin/tsc -p /tmp/dnd-r3/tsconfig.json    # strict, exit 0
#   Zero errors. Because every negative leg is an `@ts-expect-error`, a contract
#   that STOPPED refusing one of the six would redden this same run on the
#   unused directive -- the check cannot pass by being permissive.

# leg 11 -- EXECUTING the reorder claims (§2.2.5, §2.2.4(a), §2.4.6)
node /tmp/dnd-r3/probe.mjs
#   (1) foreign "a" onto "c", no session:  today ["b","c","a"]  kernel ["a","b","c"]
#       (Codex's result, reproduced)       non-matching "zz":   unchanged, both
#   (2) handleMove(+/-1) vs reorderByKey(adjacent), 5 cases incl. both edges: SAME
#   (3) reorderByKey asymmetry: a->c = [b,c,a,d];  d->b = [a,d,b,c]
#   (4) saved-views' inline splice pair, same inputs: identical to (3)

# leg 12 -- the four B-findings' source facts, re-read at HEAD 351229630
sed -n '19,19p'    packages/core/src/components/primitives/display/tree/runtime/tree-behavior/index.ts   # TreeEngineKey = string | number
sed -n '263,263p'  packages/core/src/components/primitives/display/tree/engines/modern/index.tsx         # isDraggable per row
sed -n '383,400p'  packages/core/src/components/primitives/display/tree/engines/modern/index.tsx         # onDragStart gated on isDraggable; the rest on propDraggable
sed -n '195,204p'  packages/core/src/components/patterns/data/saved-views/engines/modern/index.tsx       # leave-intact dragover
sed -n '406,412p'  packages/core/src/components/structures/workspace/column-menu/index.tsx               # leave-intact dragover
sed -n '233,239p'  packages/core/src/components/patterns/visualization/kanban-board/engines/modern/index.tsx  # NO session guard on dragover
sed -n '90,126p'   packages/core/src/components/patterns/visualization/kanban-board/engines/modern/index.tsx  # BoardCard IS the press boundary
sed -n '1117,1130p' packages/core/src/components/structures/workspace/column-menu/index.tsx              # StatefulRow: rest THEN handlers
sed -n '186,200p'  packages/core/src/components/primitives/inputs/button/engines/modern/index.tsx        # props destructuring (no onDragEnd)
sed -n '560,570p'  packages/core/src/components/primitives/inputs/button/engines/modern/index.tsx        # nativeButtonProps spread BEFORE interactionProps
sed -n '43,67p'    packages/core/src/infrastructure/runtime/i18n/composition/direction/index.ts          # useReadingDirectionIsRtl === useOptionalDirection() === 'rtl'
grep -rn "onDragLeave\|onDragEnter" <the four sortable owners>                                          # no output
sed -n '155,215p'  packages/core/tests/support/family-causality/index.ts                                 # innerHTML, no hydration, no input API
sed -n '1,120p'    packages/core/src/components/primitives/overlay/dropdown/tests/fixtures/fab17-static-hatch-scene/runner/index.mjs  # the live-mount precedent

# leg 13 -- the tree fixture that dropEffect would break (R16)
sed -n '188,212p' packages/core/src/components/primitives/display/tree/tests/Tree.modern-engine-advanced.test.tsx
#   dragOverAt() builds createEvent.dragOver(childItem) with NO dataTransfer;
#   the same file DOES pass one to dragStart at :219.

# leg 14 -- base stability for revision 3 (§1)
git rev-parse HEAD                     # 35122963005dca61b24503155d52687608b0097b
for f in <the 18 files of §1>; do
  git show 785771a30:$f | shasum; git show HEAD:$f | shasum; shasum < $f
done                                   # 18 of 18 identical across all three
node --test packages/core/scripts/check/architecture/audits/structure/index.test.mjs
#   -> 35 tests, 32 pass, 3 fail (unchanged from revision 2; rankedChildren pin still 94)
```
