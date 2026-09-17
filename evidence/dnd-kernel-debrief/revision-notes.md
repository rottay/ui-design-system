# DnD kernel debrief — revision 2 notes (Codex HOLD → resolution map)

What this file is: one row per finding in
`evidence/dnd-kernel-debrief/codex-HOLD-contract-gaps.txt`, the resolution taken,
where it now lives in `index.md`, and how it was verified. Written by the round-1
author (Opus writer seat) at the DT's assignment; the DT re-runs the Codex review
on the revision.

- Reviewed document: `evidence/dnd-kernel-debrief/index.md` at sha256
  `d79e5947a7c8d89c52c5cbe31c367b629e7de50124b37613c8da8e69bf369452`, cited base
  `75ce56bfd`, review-start HEAD `550a8ac9e`.
- Revision base: `785771a30e584bba784f258bf9a6471bf9fed45e`, branch `main`.
- Write set of this round: `evidence/dnd-kernel-debrief/` only. No product code,
  no gate code, no `git add`/`commit`/`mv`.

---

## 1. The five blocking findings

| # | Codex finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B1 | §2.2 shows no target-identity binding; a single `resolveTarget(event, payload)` cannot recover a view key, a column key, a Tree key or a Kanban `{columnId, position}`; a generic `TTarget` supplies no equality/projection rule for stamps, whose anatomies differ. Concrete typed adapters required for all four owners, specifying identity, stamp ownership, propagation, drop-time validation, callback order and exactly-once termination. | **Identity is bound at the call site**: `getTargetProps(target)` takes the family's own target value, which is exactly the closure binding each owner already writes; `resolveTarget` only *refines* or *refuses* it. **The kernel stamps nothing** — the four anatomies are measurably different (absent-vs-false, one element vs four), so each family keeps its own spelling and no equality/projection rule is needed. Propagation is an explicit per-call `stopPropagation` reproducing kanban's spelling; exactly-once is a synchronous **ref** guard that holds even without it; drop-time validation is `session !== null && session.target !== null`, with the self-target rule left to the family because the three owners disagree. Four typed adapters written out. | §2.2.1, §2.2.2, §2.2.3, **§2.2.4 (a)-(d)** | Read of all four owners' handlers and JSX: kanban `:222-265`, `:540-590`; saved-views `:187-230`, `:318-331`; column-menu `:364-433`, `:649-690`; tree `:791-846`, `:370-400`. Tree's rows proved to be siblings under `role="group"` (`:468-471`), so only kanban nests. |
| B2 | The keyboard and pointer abstractions are absent from the API: no mode, no announcement callback, no keyboard target resolver, no focus registration, no imperative move entrypoint; `SortableAnnouncements` floats unconnected. The core claims to be event-generic while taking `React.DragEvent` and mandating `dataTransfer`. Candidate movement must be distinguished from committed movement; `Home`/`End` and invalid axis combinations must be defined. | `SortableKeyboardOptions` (mode, orientation, crossAxis, grabKeys, `resolveKeyboardTarget`) and `onAnnounce` are **options on `UseDragSessionOptions`**; `move()`/`commit()`/`cancel()` and `registerItem()` are on the result. **Candidate vs committed** is a table with one commit point (`onDrop`), auditable by call count; `'immediate'` opens **no session at all**, which makes R10 structural. `Home`/`End` resolve to `null` (behavior-preserving: kanban maps only the four arrows). Invalid axis pairs are excluded at the type level plus a named dev-time refusal. **The event-generic claim is withdrawn**: the core is the HTML5 transport session (Codex option B), and FAM-13 consumes resolvers. | §2.2, §2.4, §2.4.1-§2.4.5, §2.6, §2.9, Appendix A A2 | `resolveNavigationIntent`'s vocabulary read at `roving-focus/index.ts:58-90` (`Home`→`'first'`, `End`→`'last'`, no move member); kanban's arrow map read at `:317-337`, its focus effect at `:297`/`:341-348`, its blocked branch at `:286-289`. |
| B3 | `useInteractionState` is per-instance and the proposed factory receives no reference to the owning one; `composeHandlers` **skips** its second handler after `preventDefault` (executed by Codex); Upload's order (`preventDefault` → disabled guard → clear hover → caller's raw `onDrop(event)` → processing) must be preserved; an unconditional cleanup promise cannot ride a chain that skips handlers. | `pressCancel` is **passed in** — the owning instance's entrypoint, which is literally kanban's `interaction.handlers.onPointerUp` (`:108`). Where the owner is unreachable the adapter says so: column-menu's row instance is inside its local `StatefulRow` (reachable), and its handle's instance is inside `Button`, whose only public routes are the chained `onPointerUp`/`onPointerCancel` props — and which **does not route `onDragEnd` to press-cancel** though it routes `onPointerCancel` on the line above. That one-line primitive repair becomes **lot 6**, declared, never inside a transport lot. The COMPOSITION LAW is **replaced**: no composition on the four drag props; family reactions are declared options with a stated order; cleanup is mandatory and non-vetoable; the only vetoable step is the commit, vetoed by data (`resolveTarget → null`), never by `preventDefault`. Upload's order is reproduced verbatim and `accept`/`multiple` are removed from the file-drop options. | §2.3.1, §2.3.2, §2.7, lot 6 of §3.2, invariant 7 | `interaction-state/index.ts:45-120` (no public cancel; `cancelPress` internal). `button/engines/modern:487-507` (`onPointerCancel` → `interactionHandlers.onPointerUp` at `:492`; no `onDragEnd`). `upload/engines/modern:921-929`. **`composeHandlers` executed on three legs** — see §3 below: leg B is new and strictly worse than the one Codex reported. |
| B4 | Placement is reasonable but the write set cannot satisfy the gate: the collection dependency ranks name `combobox`, `roving-focus`, `typeahead`, `listbox` — not `sortable` — so the edge falls through to `sibling-owner-dependency`. Add the narrow admission and its tests; do not widen the baseline. | Both gate files are added to the kernel lot's write set with the exact edit (`sortable: 1`), the three places the gate's own suite changes (the mirrored literal, the `rankedChildren.length` pin, a new causal case), and the **reverse-edge prohibition named by its own finding id** (`local-layer-inversion`, not merely the absence of the sibling finding). No baseline is widened. | **§3.1**, §6.5, R15 of §7 | `structure/index.mjs:172-178` (the ranks), `:1226-1246` (an edge is admitted only when **both** owners carry a declared rank, then strictly greater; the inverse emits `local-layer-inversion`), `:1323` (the fall-through). `index.test.mjs:127-133`, `:250-264`, `:545-570`. |
| B5 | Acceptance exceeds the instruments: N1 is a unit test for a browser-level claim; "exactly one test" is wrong; R5's proposed cases already exist; five case classes are missing; `--base=main` can compare main with itself; the public retirement needs real authorization. | N1 splits: **C1** asserts `defaultPrevented` in the unit suite, and the browser-level consequence moves to the repository's existing Chromium harness (`tests/support/family-causality/index.ts`). Mutations must redden **at least** their named test. **R5 is rewritten to the real quarter boundaries** (24 → before, **25 → inside**, 74 → inside, **75 → inside**, 76 → after, on the suite's 100px fixture), because the comparisons are strict. All five missing case classes are added as C3-C8, plus C9-C12. Changeset receipts use `--base=<pre-lot SHA> --head=<candidate SHA>`. Lot 11 requires five things together, starting with the owner's authorized public-API decision. | §6.3 (C1-C12), §6.4 (N1-N15), §6.5, §6.7, R5 of §7 | `Tree.modern-engine-advanced.test.tsx:206-238` (the 10/50/90 cases already exist); `tree/engines/modern:812-818` (strict `<` and `>`, so equality falls to `inside`); `gates/manifest/index.mjs:50-56` (the main-vs-main warning); `contract-changeset/index.mjs:1140` (default base `origin/main`). |

---

## 2. Measured-claim and "other" corrections

| # | Codex correction | Taken as | Where |
|---|---|---|---|
| M1 | **Operability census materially incorrect.** ColumnMenu renders Move up/Move down buttons wired to `handleMove`, giving keyboard activation and a touch alternative; "no drag-specific keyboard protocol" is supportable, "no keyboard/touch reordering" is not. The proposed mandatory grab protocol rested partly on a false premise. | Accepted in full. The §0.5 row is **split into two rows** so the two claims can never be conflated again; both column-menu and saved-views move to `'delegated'`, and `'grab'` ships with **no adopter**. Two further measured bounds on those buttons are recorded (they announce nothing; their `disabled` ends are per rendered section while `handleMove` spans the complete order). | §0.5, §0.6, §2.4.2, lot 7 |
| M2 | **Two transport mechanisms, not three.** Item versus file handling is semantics. | Accepted. Every "three transports" statement is corrected, including §2.9's scope list and §0's opening paragraph. | §0 opening, §0.2, §2.7, §2.9 |
| M3 | `useSortableList` zero consumers is established **within the searched source** and cannot establish that no published-package consumer exists. | Accepted. "Production consumers: 0" becomes "0 known", and the distinction becomes the whole basis of §6.7. | §0.1, §5(c), §6.7 |
| M4 | "No authored auto-scroll/custom drag image" is a **scope observation, not measured demand**; it does not prove 0/8 demand or that WidgetBoard ships a browser drag ghost. | Accepted. The 0/8 line now says what it does and does not establish, and the round-1 sentence "The browser default ghost is what every owner ships" is **deleted** as unsupported. | §0.5 |
| M5 | The dnd-kit rejection's dependency-policy argument is coherent; the claimed DOM inevitability is not — dnd-kit supports augmenting existing elements without wrapper nodes. | Accepted. The DOM-inevitability claim is **withdrawn in place**, with the withdrawal marked; the policy and adoption-cost arguments stand. | §5(a) |
| M6 | "Reading `dataTransfer` during dragover is forbidden" is too broad: contents are protected, formats and kinds remain enumerable — which matters to a file-drop adapter rejecting non-file drags. | Accepted. The PAYLOAD LAW is reworded to protected-mode precision, and the file-drop adapter's legitimate `types`/`kind` read is named. | §2.2.3 |
| M7 | The duplicate `normalizeDraftOrder` observation is stale after `8c96f4197`. | **Dropped**, and replaced by what is actually duplicated (saved-views' inline splice pair versus column-menu's `moveItem`) plus the asymmetry both share, stated as a test. | §0.8 |
| M8 | Invariant 6's "no quoted English word" grep is impossible: `'move'`, `'before'`, `'blocked'` are protocol literals. | Restated as three executable assertions (no i18n import or call; no `aria-*`/`role`/`className`/`style`/`setAttribute`; every literal a member of an exported frozen vocabulary), each with a planted negative. | invariant 6, N15 |
| M9 | §3.3 cites the wrong invariants. | Corrected: the collision is invariant **1** vs invariant **4**. | §3.3 |
| M10 | Tree's `preventDefault` lives in JSX wrappers and it does not set `dropEffect`; ColumnMenu reads the drop event's `text/plain` before falling back to local state. "Those differences matter to invariant 1." | Both are now named laws with their consequences worked out: `dropEffect` becomes a **declared addition** in tree's lot note (one of exactly two exceptions in the program), and the `text/plain` fallback is reconciled by measurement — the kernel's session-first rule and column-menu's `getData`-first rule produce the **same observable outcome**, because a foreign key yields `indexOf === -1` and `moveItem`'s guard returns the array unchanged. | §2.2.3, invariant 1, N11/C6 |

---

## 3. New measurements this revision took (not requested, load-bearing)

1. **`composeHandlers` is worse than reported.** Executing the real module on
   three legs returns `["A.first","B.first","C.first","C.second"]`. Leg B — the
   event arrives **already** `defaultPrevented` and neither handler in the chain
   prevents anything — also skips the second handler. Since the kernel's
   PREVENT-DEFAULT LAW always prevents on `dragover`, **any** handler composed
   after the kernel's is dead in every drag, and any handler composed before it
   can kill the drop for the whole family. This is why §2.3.2 bans composition on
   the drag props outright rather than merely ordering it.
2. **The structure gate's own suite is red at HEAD**: 32 pass / 3 fail, with both
   gate files byte-identical to HEAD, from other writers' rank-table edits that
   did not update the mirrored literal and the owner-count pin. Recorded in §3.1
   and as R15 so the kernel lot is neither blamed for them nor credited with
   fixing them.
3. **`Button` routes `onPointerCancel` to press-cancel but not `onDragEnd`**
   (`:492` versus nothing), which is the precise shape of R2's repair and the
   reason it is a primitive lot.
4. **saved-views' pill is a `div` with no `tabIndex`**, containing a select
   `Button`, a rename `Input` and a menu — so a Space/Enter grab mode there would
   have stolen all three. This independently confirms Codex's A6 warning.
5. **kanban announces nothing on a second consecutive blocked move** (identical
   string, unchanged DOM text). Pre-existing; repaired in the operability lot,
   and the drill asserts distinguishability rather than mere presence.
6. **Tree refuses only `dragKey === key`** — there is no descendant refusal today,
   so A3's "invalid self/descendant targets" is a genuine addition tree's
   operability lot owes rather than a restatement.
7. **The reorder asymmetry is shared, not divergent**: both surviving copies
   remove the source and re-insert at the target's index in the *original* array,
   so a forward drag lands after the target and a backward drag lands before it.
   Stated as C11 instead of as R1's worry.
8. **The eleven files this packet measures are byte-identical between `785771a30`
   and this worktree**, so no claim rests on another writer's uncommitted edit.

---

## 4. Carried, not resolved

| Item | Owner | Why it cannot close here |
|---|---|---|
| Tree's Move affordance (A3) | lot 8 writer + reviewers | Codex's answer fixes the *shape* (explicit affordance, destination + before/inside/after, bare arrows/Space/Enter untouched, self and descendant refusals, cancellation, announcements, focus restoration). The design itself is an accessibility design problem, it blocks only its own lot, and this packet is not its write set. |
| FAM-13's depth of adoption (A2) | owner | Option B is taken for this bounded contract. If full session adoption is required, a concrete event-neutral lifecycle contract must come back for joint review first. |
| `useAriaAnnounce` retirement or repair (A4) | separate decision | Codex: its orphan status does not justify changing kanban here. |
| D15 / FAM-08 ↔ FAM-13 circularity | owner ratification | Executed under the newer handoff law; the packet does not close it. |
| Fable's independent review | DT | Pending under the three-reviewer rule; Kimi's ACCEPT and Codex's HOLD do not substitute. |
| Modern Rescue constitution drift at HEAD | not this WO | Codex recorded it; it is not a DnD regression and no adoption lot may be blocked on it. |
| Three decisions this revision takes unilaterally | reviewers | `'grab'` ships with no adopter; tree gains `dropEffect` as a declared addition; the kernel stamps nothing (reversing round 1's invariant 5). Each is stated with its alternative in Appendix A so a reviewer can reverse it without reading the diff. |

---
---

# DnD kernel debrief — revision 3 notes (Codex round-2 HOLD → resolution map)

One row per finding in `evidence/dnd-kernel-debrief/codex-HOLD-round2.txt`, the
resolution taken, where it now lives in `index.md`, and how it was verified.
Written by the same writer seat that produced rounds 1 and 2; the DT re-runs the
Codex review on revision 3.

- Reviewed document: `index.md` at sha256
  `d09cd2521e65ebf30b0e1f714f453ec4b222fa38a01c1a9aa03fe7338d670fa0`, cited
  revision base `785771a30`, review-start HEAD `0032e7c7b` → `77e338adb`.
- Revision-3 base: `35122963005dca61b24503155d52687608b0097b`, branch `main`.
- **Base stability, re-measured:** the eleven files revision 2 tracked plus the
  seven this round reasons about are **18 of 18 byte-identical across
  `785771a30`, HEAD `351229630` and this worktree**. No claim in either revision
  rests on a moved byte. (Appendix B, leg 14.)
- Write set of this round: `evidence/dnd-kernel-debrief/` only. No product code,
  no gate code, no `git add`/`commit`/`mv`.
- Round-2 verdicts carried: B4 **RESOLVED**; B1, B2, B3, B5 blocking.

---

## 1. B1 — the four adapters

| # | Codex round-2 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B1.1 | Tree's mandatory adapter fails type checking **twice**: `{key: TreeEngineKey}` supplied where `DragPayload.key` must be `string` (TS2344), and `getTargetProps({key: nodeKey})` omits the required `position` (TS2345). Preserve numeric identity; distinguish bound target identity from resolved destination. | Both taken. `DragKey = string \| number` widens the **constraint**, so tree instantiates `{key: TreeEngineKey}` and the three string families instantiate `{key: string}` and lose nothing — stated explicitly with its cost, as asked. `TTarget` (bound) and `TDestination` (resolved) become separate parameters, `TDestination = TTarget` by default, so only tree writes three type arguments. | §2.2, §2.2.1 (the two-parameter table), §2.2.4(c) | **Reproduced Codex's two errors first** against revision 2's declarations verbatim (`/tmp/dnd-r2/round2.tsx`, TS 5.9.3): `TS2344` at 47,5 and `TS2345` at 54,23. Then compiled revision 3's declarations + all five adapters: **exit 0** under `strict: true`. Appendix B, legs 9-10. |
| B1.2 | Tree computes `isDraggable = propDraggable && !disabled` per row and attaches `onDragStart` accordingly; the adapter only disabled the whole session, and `data-draggable` does not disable native dragging. Per-source eligibility needed; disabled rows preserved. | `getSourceProps(payload, { eligible })`. The three measured states are tabulated against what tree returns today, including the asymmetry Codex did not name but the source carries: `onDragOver`/`onDrop`/`onDragEnd` are gated on `propDraggable` **alone**, so a disabled row is still a drop TARGET and the target bag is unaffected by `eligible`. | §2.2.4(c), C17, N17 | `tree/engines/modern:263` (the per-row computation), `:383-400` (the gating asymmetry, read line by line). |
| B1.3 | The ColumnMenu foreign-drag reconciliation is **false**: columns `[a,b,c]`, external text `"a"`, destination `"c"` → `[b,c,a]`. Rejection may be desirable but must be expressly declared with a pin covering a **matching** foreign key. | Accepted in full and **executed independently** — I reproduced `[b,c,a]` from the revision-base `normalizeDraftOrder`/`moveItem`/`moveDraftColumn`/`handleColumnDrop`, and confirmed a non-matching key (`"zz"`) leaves the order unchanged either way, which is precisely why revision 2's pin would have been green on both sides. Declared as a deliberate rejection with its reason, its own lot note, and a PRE-pin on a matching key whose single assertion the adoption lot flips in the commit that declares it. | **§2.2.5**, §6.1 leg 2, R17, N11 | `node /tmp/dnd-r3/probe.mjs` (Appendix B, leg 11). |
| B1.3b | *(not in the review — found by applying Codex's method to the other three owners)* | **Two more owners change the same way.** kanban's `handleDragOver` has **no session guard** (`:234-241`), and saved-views' guards only `viewId !== dragViewId` with `dragViewId === null` (`:196-205`), so both **highlight a drop target under any foreign drag** today and will not after adoption. Tree is the only one that already clears. Declared as two more exceptions with one assertion each. | §2.2.5, invariant 1 (six exceptions, not two) | Source read of all four `dragover` handlers. |
| B1.4 | SavedViews' `dragover` leaves the previous target intact when the source is re-hovered; a `null`-returning self-resolver clears it, so `a → b → a` changes the displayed target. Reproduce or declare. | **Reproduced**, not declared. `resolveTarget` receives `current`, so leave-intact is `target.key === payload.key ? current : target` and clearing is `… ? null : target`. Column-menu has the identical leave-intact shape (`:410-412`) and tree has the clearing one (`:804-807`) — a three-way split the kernel must not own, which is now the TARGET-HOLD law. | §2.2.3 (TARGET-HOLD), §2.2.4(a)(b)(c), C16 | `saved-views:196-205`, `column-menu:406-415`, `tree:802-812`. |
| B1.5 | Exactly-once termination and N10 disagree: §2.2.3 requires synchronous ref consumption, §2.2.4(d) says the session clears after the callback, N10 demands failure if the ref clears before `onDrop`. Specify terminal reservation before external callbacks, rendered-state cleanup, callback exception handling and announcement order independently. | Specified as a seven-step sequence in one place, for both paths: guard → destination → **reserve (before any external call)** → clear the rendered mirror → `onDrop(reserved locals)` → pending focus → announce. **No `try`/`finally`**: a consumer exception propagates and suppresses steps 6-7, which is kanban's behavior today; what the reservation buys is that a throwing `onDrop` leaves no half-open session. Announcement order is kanban's verbatim (callback → focus → announce). N10 is rewritten to a mutation that **does** fail (move the reservation after `onDrop` → C13), and N16 is added for re-reading the ref instead of the reserved locals. | §2.2.3, §6.3 C13, §6.4 N10/N16 | `kanban/engines/modern:295-306` (announce after the move callback, no catch). |

## 2. B2 — the keyboard API

| # | Codex round-2 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B2.1 | There is **no delegated session entrypoint**. `move`/`commit`/`cancel` accept no payload and open no session; starting from `session === null` a ColumnMenu button cannot say which column moves, and Tree's picker cannot supply an arbitrary node plus a before/inside/after destination through four relative intents. Requires a concrete typed entrypoint and **one complete delegated adapter**. | `start(payload, { target? })` opens a keyboard session; `commit(destination?)` accepts an **absolute** destination, which is what tree's picker needs and four relative intents cannot express. **One complete delegated adapter is written out** — column-menu's two move controls, chosen because they exist and are measured, so the adapter can be checked against a real implementation. | §2.2 (result API), **§2.4.6** | The delegated adapter compiles in leg 10. Its data equivalence with `handleMove` is **executed**, not argued: five cases on `[a,b,c,d]` including both edges, all SAME (leg 11). |
| B2.2 | The documented delegated configuration does not type-check: `SortableKeyboardOptions` requires `orientation` and `resolveKeyboardTarget` for every mode (**TS2739**). | Mode-specific discriminated union. `SortableDelegatedKeyboard` has only `mode` and an **optional** resolver — optional because a family that commits an absolute destination calls no `move()`. `{ mode: 'delegated' }` now compiles alone. | §2.4 | Reproduced TS2739 against revision 2's interface with string keys so the payload constraint could not mask it (`/tmp/dnd-r2/round2b.tsx`), then compiled the union clean. |
| B2.3 | Repeated candidate movement lacks a defined input: `resolveKeyboardTarget(payload, intent)` receives no current candidate, and requiring an unstated closure over returned session state leaves the contract incomplete. | The resolver takes a context object with an explicit `candidate: TDestination \| null`, `null` on the first move after `start`. The delegated adapter demonstrates why it is load-bearing: during a candidate phase the committed order has not moved, so `payload.key`'s index is stale after the first arrow. | §2.4, §2.4.6 | — |
| B2.4 | The direction source is missing. The resolver needs `rtl`; invariant 6 prohibited importing the i18n direction authority; importing `resolveNavigationIntent` does not supply the boolean. | **Invariant 6 was drawn in the wrong place.** `roving-focus/index.ts:48` — a peer owner in the same scoped directory the kernel is placed in — imports `useReadingDirectionIsRtl` at module scope. The kernel does the same and passes the boolean into `resolveMoveIntent`; there is **no `rtl` option**, because an option would be a second authority (invariant 7). Invariant 6(a) becomes an **import allowlist** over named bindings. | §2.4, invariant 6, N15a/N15b | `i18n/composition/direction/index.ts:43-66`: `useReadingDirectionIsRtl()` **is** `useOptionalDirection() === 'rtl'`, which is character-for-character the expression kanban computes at `:156`/`:325`. Behavior-preservation is exact, not approximate. |
| B2.5 | Generic announcement metadata exceeds the supplied information: `moved` requires `crossedContainer` and the kernel neither understands `TTarget` nor receives a container projection. Define who supplies it and which events fire for immediate commits, which have no candidate phase. | `crossedContainer` is **deleted**, not sourced: the consumer owns `TDestination` and already computes the fact (kanban's `crossesColumn`, `:277`). A per-path event table defines all four paths: `'immediate'` emits `dropped`/`blocked` only, and `moved` is **keyboard-only** so the pointer path does not announce per `dragover` (0 of 8 owners announce during a drag). | §2.6, refusal leg R-6 | `kanban:277` (the family's own crossing computation); §0.5's announcement row. |

## 3. B3 — the press route

| # | Codex round-2 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B3.1 | `cardInteraction.handlers.onPointerUp` is not accessible at the board's session call site; every `BoardCard` owns its own instance. | **The design was inverted.** `BoardCard` is *already* the cleanup boundary: it takes `onDragEnd`/`onPointerCancel` as props, calls the consumer's handler, then its own `cancelPress` (`:114-121`). Spreading `getSourceProps(...)` onto `<BoardCard>` puts the kernel's handler in that slot. **Kanban needs no option and no plumbing change.** | §2.3.1, §2.2.4(d) | `kanban/engines/modern:90-122`, read in full. |
| B3.2 | `cancelRowAndHandlePress` is an undeclared placeholder; every `StatefulRow` owns another local instance, and being declared in the same file does not expose it to the parent. | The row gets the same boundary `BoardCard` has, inside column-menu's own file: **lot 6a**. The option is dropped from the adapter entirely. | §2.3.1, §2.2.4(b), lot 6a | `column-menu:1117-1130`. **New hazard found while reading it:** `StatefulRow` spreads `{...rest}` and THEN `{...interaction.handlers}`, so a handler passed in for a pointer event the kernel also owns is silently **overwritten**, not composed — a lot-6a repair written as "pass the prop through" would change nothing and pass review. Recorded as R18 with a behavioral assertion. |
| B3.3 | Button's pointer props notify consumer callbacks; they do not export its internal cancellation. A Button dragend repair cannot clear its ancestor row's separate instance. | Accepted: two separate repairs for two separate instances, **lot 6b** (primitive) and **lot 6a** (structure-local). Revision 2's "one-line `Button` change" is corrected to **two** lines: `onDragEnd` must be destructured out of `props` *and* chained, because `nativeButtonProps` is spread **before** `interactionProps`, so adding the key alone would swallow every caller's own `onDragEnd` — including column-menu's. | §2.3.1 | `button/engines/modern:186-200` (destructuring), `:487-495` (the chain), `:560-570` (the spread order). |
| B3.4 | The lot split is contradictory: lot 2's adapter already calls the supposed combined cancellation route although its PRE-pin must preserve both pre-repair values; lot 6 is Button-only, leaving the row unassigned. | Both repairs assigned, and reconciled explicitly: **lot 2 is a transport lot, so the latch survives it** and both recorded values stay unchanged — which is the correct outcome for a lot claiming byte-identical behavior. Lots 6a and 6b then change exactly one recorded value each. Three commits, three readable states. | §2.3.1 (closing paragraph), §3.2, §6.1 leg 2 | — |

## 4. B5 — acceptance and the instrument

| # | Codex round-2 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B5.1 | `family-causality` injects server markup through `host.innerHTML`, reads computed styles and removes the host; it does not hydrate React or mount handlers, and its page interface exposes no drag input API. Name the live-mount/browser-input extension or an existing suitable harness, with an owned write set. | The harness is withdrawn and replaced by a **live-mount scene + runner** built to the shape of the repository's **two existing precedents** — FAB-17's static-hatch scene (Vite dev server + `@vitejs/plugin-react` + Playwright resolved from the showroom package + real input drivers + a `--self-check` falsifiability mode) and the skeleton geometry-invalidation runner. Four files, named, owned by lot 0. Input is `page.mouse` down/move/up, which produces trusted events and therefore a real HTML5 drag. Four claims are listed that no unit suite can make. Stated as a **lot-report receipt, not a CI gate**, because neither precedent is registered in the gate manifest. | §6.3 (the browser leg), R19 | `tests/support/family-causality/index.ts:120-215` (Codex's reading confirmed line by line: `ProbePage` declares `setContent`/`addStyleTag`/`addScriptTag`/`emulateMedia`/`evaluate`/`close` and nothing else). `fab17-static-hatch-scene/runner/index.mjs` read in full. |
| B5.2 | C3 requires `dragleave` behavior but source props say it appears "when the family declares it" and no such option exists. C5 covers only target removal. Non-null session fields are not live validity checks. | **There is no `onDragLeave` in the contract at all**, because none of the four sortable owners has one — measured, `grep` returns nothing in all four files. C3 is rewritten to the measured truth (leaving every target fires nothing, so the destination is HELD until `dragend`). C14 adds **source removal mid-session** — and reproduces the leak rather than repairing it, because all four owners leak it today and a window listener would be an undeclared improvement inside a behavior-preserving lot. C15 adds **commit against a removed destination** and states in the test that the kernel performs no liveness check, so a later reader cannot mistake a non-null field for a validity proof. | §2.2.2, §6.3 C3/C13-C17 | `grep -rn "onDragLeave\|onDragEnter"` over the four owners: no output. |
| B5.3 | Tree's declared `dropEffect` addition conflicts with an unchanged fixture: the existing `dragOver` helper supplies `clientY` but no `dataTransfer`, so an unconditional write fails it. "Existing tests unchanged" cannot silently absorb it. | A **declared PRE-lot fixture correction** in lot 3: `dragOverAt` gains a `dataTransfer` stub, landed and proved green against the **unchanged** implementation first. It is inert at the base — today's handler never reads `dataTransfer` on `dragover` — and that inertness is the proof it is not a test edited to make a lot pass. | §2.2.3 (DROPEFFECT LAW), R16, lot 3's pin column | `Tree.modern-engine-advanced.test.tsx:206-210` (no `dataTransfer`) versus `:219` (one IS supplied to `dragStart`). |
| B5.4 | Kanban's announcement repair has no consistent lot: §0.7 assigns it to an operability lot, the table provides none for kanban, and §6.2 demands the improved outcome inside transport lot 5, which the measured implementation fails. | **Lot 5b**, its own declared repair lot. §6.2's distinguishability assertion moves there and §0.7 points at it. §3.3 records the general rule: an improved outcome cannot be demanded inside a lot whose claim is that nothing changed. | §3.2 (lot 5b), §6.2, §0.7, §3.3 | — |
| B5.5 | The F-69 arm needs an executable admission rule: `OWED_ARMS` **prints** unmet obligations, and the proposed positive test only requires an import, which may be unused. Require actual invocation/wiring, define transitive adapter treatment, and name the measurement, blocking check and drill files. | Rebuilt where the gate decides. **Four files named**, all existing: measurement in `measureFamily`, a **blocking** finding in `judgeFamily` (the `a11yAssertions === 0` branch is the template), a decrease-only pin in `baseline/index.json`, and the drill in `index.test.mjs`. `dndKernelWired` is an **invocation-and-use** check: a call expression whose result is bound *and read*, so an unused import fails. Transitive adapters are defined by three named shapes with their measured instances. The drill has eight cases, **three of which must NOT be accused** — the half that revision 2's name-pattern would have failed. | **§6.6** | `family-cut/index.mjs:1428-1434` (printed on the success path, after findings), `:1345-1356` (the blocking template), `:265-270` (`FROZEN_ENGINE_SEGMENT`), `gates/manifest/index.mjs:350-362` (already registered, so no new gate). |
| B5.6 | §5(a) line 1163 still says capability "measures 0/8 in authored demand". | Removed. The sentence now says 0/8 in **authored code** and states that this is a scope observation which says nothing about demand. | §5(a) | — |

## 5. Smaller corrections

| # | Codex round-2 note | Taken as | Where |
|---|---|---|---|
| S1 | Invariant 6's literal rule needs explicit treatment of module specifiers, directives and required keyboard/mode literals; N15 supplies only one negative despite promising one per assertion. | Both taken. The literal rule is scoped to **string literals in expression position**, which excludes specifiers, directives and TypeScript literal types by construction. N15 splits into N15a (a stray `aria-label`) and N15b (an extra i18n import). | invariant 6, §6.4 |
| S2 | B4 resolves the structural admission **as a design requirement**, not as evidence that an implementation passed; the recorded pre-existing failures still need attribution against the actual pre-lot SHA. | Re-measured at HEAD `351229630` with both gate files byte-identical across the three trees: still **32 pass / 3 fail**, `rankedChildren.length` still pinned at `94`. R15 already requires the A/B against the actual pre-lot tree. **Superseded in R4**: `2c4ba44af` repaired all three during the round-3 review — 37/37 and `98` at `30ec496c1`. | §3.1, §6.5, R15 |
| S3 | All eight `defs/jsx/tok` triples reproduced; seven earlier corrections confirmed fixed. | No action; recorded so revision 3 does not re-litigate settled rows. | §0.2 |

## 6. The self-verification the brief required

Every TypeScript block in §2 of `index.md` was compiled **in memory**, under the
repository's own TypeScript, before the document was written:

| Leg | Files | Command | Result |
|---|---|---|---|
| Red | `/tmp/dnd-r2/round2.tsx`, `round2b.tsx` — **revision 2's** declarations verbatim | `packages/core/node_modules/.bin/tsc -p /tmp/dnd-r2/tsconfig.json` | **TS2344**, **TS2345**, **TS2739** — all three of Codex's errors reproduced independently |
| Green | `/tmp/dnd-r3/contract.ts` (the declared API), `adapters.tsx` (all four adapters **plus** the delegated adapter), `refusals.tsx` (six negative legs) | `packages/core/node_modules/.bin/tsc -p /tmp/dnd-r3/tsconfig.json` | **exit 0**, `strict: true`, TypeScript **5.9.3** (the repository's own, `node -e "require('typescript/package.json').version"`) |

Two properties of that check are deliberate:

- **It cannot pass by being permissive.** The six refusals are
  `@ts-expect-error`-annotated, so a contract that stopped refusing one of them
  reddens the same run on the unused directive.
- **It is not a substitute for the real thing.** It compiles declarations and
  adapter bodies with `declare`d stand-ins for each family's own symbols; it does
  not compile against the actual `ModernTree`, `BoardCard` or `StatefulRow`.
  When lot 0 lands, `tsc` and `typecheck:tests` supersede it and the scratch
  files are not maintained. Recorded in §"Standing process items".

One shape had to be corrected *because* of the check rather than before it: the
first `BoardCard` stand-in was typed `React.FC`, which rejected
`ref={drag.registerItem(...)}`. The real component is a `forwardRef`
(`kanban/engines/modern:90`), so the stand-in was wrong, not the contract — but
it is recorded here because it is the only place where the scratch harness, and
not the debrief, produced an error.

## 7. Carried, not resolved

| Item | Owner | Why it cannot close here |
|---|---|---|
| Tree's Move affordance (A3) | lot 8 writer + reviewers | Unchanged from revision 2. What **did** close is the API blocker underneath it: `start(payload)` + `commit(destination)` give a picker a typed path to an arbitrary node and position (§2.4.6). The affordance's design remains an accessibility design problem outside this write set. |
| Source-removal session leak (C14) | named as owed | Reproduced rather than repaired, because all four owners leak it and repairing it inside a behavior-preserving lot would be an undeclared improvement. A later declared lot may add a window `dragend` route. |
| `crossAxis === orientation` | the kernel lot | Cannot be expressed in the type system without inflating the option into a matrix of literal pairs; stays a development-mode call-site refusal with a named error (N14). The other invalid combination **did** become structural. |
| Registering the browser leg in `gates:ci` | owner | Neither existing Playwright scene is in the gate manifest; adding a browser run to CI is a decision about gate runtime that this packet is not the place to take. The leg is a lot-report receipt with a `--self-check`. |
| Fable's independent review | DT | Still pending under the three-reviewer rule. |
| D15 / FAM-08 ↔ FAM-13 circularity; `useAriaAnnounce`'s fate; FAM-13's depth of adoption; Modern Rescue constitution drift | owner / separate decisions | Unchanged from revision 2. |

**Nothing in the round-3 brief was unresolvable.** The five B1 items, the five B2
items, the four B3 items and the six B5 items are each answered in the contract
text at the section named above, and the self-verification the brief required was
performed and is reproducible from Appendix B, legs 9-11.

---

# DnD kernel debrief — revision 4 notes (Codex round-3 HOLD → resolution map)

- Reviewed document: `evidence/dnd-kernel-debrief/index.md` at sha256
  `be96315f96086c04a9442424ecf8bd4626045ec96853159b9f39fbd8626c49f4`
  (Codex's recorded digest), review-start HEAD `2c4ba44af`.
- Revision base: `30ec496c1e4420395b614033ddf404dfd0d321a4`, branch `main`.
- Write set of this round: `evidence/dnd-kernel-debrief/` only. No product code,
  no gate code, no `git add`/`commit`/`mv`.
- Round-3 verdict: **HOLD**, with **B3 resolved** and **B4 still resolved** at
  contract level. Neither is reopened. Eleven items across B1 (five), B2 (three)
  and B5 (three).

**What round 3 got right about itself.** Codex compiled the whole contract in
memory at TS 5.9.3 and got zero diagnostics, and confirmed the six refusal legs
each produce a real error when their directive is removed. The type-level work of
revision 3 stands. Every finding below is behavioral, and Codex found them by
*executing* the extracted handlers rather than by reading them — which is the
method this file has been recording as the load-bearing one for three rounds now,
and which caught its author again.

## 1. B1 — the adapters

| # | Round-3 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B1.1 | **The held hover target is promoted into the drop destination.** `explicit ?? session.target` reorders `[a,b,c]` to `[b,a,c]` on drag a → hover b → hover a → drop on a, where all four owners do nothing. The claim that the guard reproduces all four owners is also false: kanban commits its drop handler's bound column/position, tree combines the receiving row with the stored zone. | Accepted whole. `resolveTarget` gains `phase: 'hover' \| 'drop'`; the commit sequence splits (pointer resolves the **receiving element**, keyboard commits the candidate); `session.target` is re-stated as the **indicator**, which is what it always was — three of four owners never read it at drop time and tree reads only its `position`. DROP-TIME VALIDATION is rewritten with the four owners' actual guards tabulated. C16 carries the sequence **through the drop**; N18 plants revision 3's own rule as the mutation. | **§2.2.1(a)**, §2.2.3, §2.2.4(a)-(d), §6.3 C2/C16, §6.4 N18 | Executed, Appendix B leg 17: the four sources and the R4 rule all give `[a,b,c]` / 0 callbacks, R3 gives `[b,a,c]` / 1. Drop signatures re-read at `30ec496c1` (leg 18): saved-views `handleDrop(e, targetViewId)` `:207`, its JSX `:330`; column-menu `handleColumnDrop(event, key)` `:417` and `moveDraftColumn`'s `sourceKey === targetKey` return `:380`; kanban `handleDrop(e, columnId, position)` `:245`, its JSX `:587`; tree `handleDrop(key,_e)` `:824` using `dropTarget.position` `:834`. |
| B1.2 | A distinct `TDestination` does not require its resolver; the decoy compiles. | `ResolverRequirement<…>` keyed on `[TTarget] extends [TDestination]`, intersected into the options type. Codex's decoy is refusal leg **R-7**. | §2.2, §2.2.1, §2.2.6 | Compiled both directions (leg 16): green with the directive, `TS2345: Property 'resolveTarget' is missing` without it. |
| B1.3 | Tree's global target gating is contradicted by the API and C17; returning `{}` is TS2739. | Two changes: `SortableTargetProps`' handlers become **optional**, and `getTargetProps` gains its own `eligible`. `disabled` is deliberately NOT overloaded — saved-views keeps target handlers attached while its source is off, which is the fourth row of the new state table and the reason one option cannot serve both. PREVENT-DEFAULT is restated as applying to an *attached* handler, which is the reconciliation Codex asked for. | §2.2, **§2.2.4(c)**, §6.3 C17, §6.4 N17b | Tree `:383-401` (source gated on `isDraggable`, targets on `propDraggable`, all four absent when it is false); saved-views `:327-331` (`draggable` gated, targets unconditional). |
| B1.4 | Kanban's adapter replaces FLIP registration with focus registration; `measure()` then traverses an empty map. | The ref callback composes **both**, with their null/unmount calls. C20 asserts a non-empty snapshot through its observable consequence, because R8's ordering assertion is green on a `measure()` that snapshots nothing. | §2.2.4(d), §6.3 C20 | Kanban `:571-575` (both `register(...)` and `cardRefs.set/delete`); `flip-layout/index.ts:83-89` (`measure()` iterates `nodesRef`, so an unregistered card cannot animate). |
| B1.5 | Removed-target handling preserves the array but changes saved-views' callback behavior: zero callbacks today, one from the adapter. | The family's `fromIndex !== -1 && toIndex !== -1` guard is preserved **in the adapter**, and C15 asserts callback **count**. | §2.2.4(a), §6.3 C15 | saved-views `:213`; executed in leg 17 (source 0, R3 adapter 1, R4 adapter 0). |

## 2. B2 — the lifecycle

| # | Round-3 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B2.1 | The universal commit sequence excludes immediate mode, so a kanban arrow produces **zero commits**. | A named **IMMEDIATE FINALIZATION** branch — resolve, blocked→announce+return, `onDrop`, pending focus, `dropped` — opening no session, which is what makes R10 structural rather than asserted. The session sequence is re-scoped to session commits. Exactly-once comes from the branch having no re-entry point: an `onDrop` calling `commit()` finds no session. | §2.2.3, §2.4.1, §6.3 C19 | kanban `applyMove` `:269-310`: blocked → `setAnnouncement` + return; else `measure` → `onItemMove` → `setPendingFocusId` → `setAnnouncement`. The branch is that, verbatim. |
| B2.2 | Kanban acquires undeclared pointer announcements; the event carries no origin to distinguish them. | Every announce event carries **`origin`**, which the session already holds. Kanban's adapter guards `origin === 'pointer'` and lot 5 pins that a pointer drop leaves the region unchanged. R-8 closes the domain; N19 plants a mislabelled origin. The alternative — the kernel emitting nothing on the pointer path — was rejected as a product decision in the wrong owner. | §2.2.4(d), **§2.6**, §6.4 N19 | kanban `:245-257` (pointer drop: `measure` → `onItemMove`, no announcement) vs `:295-306` (keyboard: plus focus and announcement). |
| B2.3 | The delegated adapter leaves blocked sessions open, double-reports blocked, and its disabled buttons cannot fire `onClick` at an edge at all. | `move()` returns whether the candidate advanced; `cancel()` announces only with a candidate; the adapter branches on the return. The `disabled` prop is **removed** from the move controls, following kanban's shipped enabled move rail — which also dissolves the §0.5 section-vs-complete-order divergence, since the resolver becomes the only edge authority. Declared change with a pin in lot 7; the alternative is recorded as open decision 1. | **§2.4.6**, §2.2, §2.6, §6.4 N20 | column-menu `:897` / `:906` (`disabled={index === 0}` / `{index === listLength - 1}`, per rendered section) vs `handleMove` `:364` over the complete normalized order; kanban `:602-614` (enabled `ModernButton`s calling `applyMove`). Lifecycle re-executed, leg 19: three arms, one message each, `session === null` each. |

## 3. B5 — the instruments

| # | Round-3 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| B5.1 | The F-69 predicate misses both actual file-drop implementations: they have no drag source, so they measure zero. | A second ratchet, `dndDropZoneOwners`, on the measured drop-zone shape — drop vocabulary plus its own hover state plus a `dataTransfer.files` read, **without** `draggable` or a drag-start handler. Both owners' shapes are tabulated from source. Drills D12 (accused) and D13 (not accused). | **§6.6** | `grep -n "onDragStart\|draggable"` returns **nothing** in either file (leg 20); file-manager `:212`, `:248-249`, `:406-408`; upload `:873`, `:924-928`, `:962-972`, `:984`. |
| B5.2 | Invocation plus a session read does not establish adoption; the decoy passes with the legacy transport still attached. | The predicate is raised to **attachment** — a JSX spread of the bag, or one of two named delegation shapes — and a bare `session` read no longer counts. **Zero independent implementations** becomes the explicit closure condition, stated separately from the blocking finding. Codex's decoy is drill **D9**, asserted on both arms (not wired, and the ratchet pin fails). | **§6.6** | `family-cut/index.mjs:1095` (`measureFamily`), `:1268` (`judgeFamily`), `:1350` (the blocking template), `:268` (`FROZEN_ENGINE_SEGMENT`), `:1431` (`OWED_ARMS` printed, never judged) — all re-read at `30ec496c1`. |
| B5.3 | N3 mutates an option no adapter passes; N11's mutant dies on the null-session guard before recovery runs. | N3 becomes **N3a-d**, aimed at the real cleanup boundaries: `BoardCard`'s `onDragEnd` wrapper (`:114-117`, the `cancelPress` call at `:116`), lot 6a's `StatefulRow` route, lot 6b's `Button` route, and — for the kernel option itself — the kernel's own scene named as its fixture. N11 keeps the matching-key foreign pin and gains **C18**, a live session whose transfer names a different existing key, which is the only place a `getData` recovery can be observably wrong. | §6.4, §6.3 C18 | `BoardCard` `:113-118` (`onDragEnd` → consumer → `cancelPress`); `StatefulRow` `:1124-1125` (`{...rest}` then `{...interaction.handlers}` — R18's overwrite); `Button` `:492` (`onPointerCancel` routed, no `onDragEnd`). |
| B5.4 | The `dropEffect` browser claim overclaims a cursor change: tree already sets `effectAllowed='move'`, so the negotiated `dropEffect` is already `move`. | Withdrawn. Replaced by a **two-arm negotiated-operation** measurement: the `move` arm proves inertness and is explicitly declared **not** a sufficient instrument (it is green with the write removed), and the foreign **copy-only** arm is the control that flips — operation `none`, no `drop` dispatched. That is also the honest statement of what tree's lot adds, and it is consistent with §2.2.5's foreign-drag rejection. | §2.2.3, §6.3 claim 2, R21 | tree `:794` (`effectAllowed = 'move'` on dragstart), `:801-821` (no `dropEffect` write on dragover). |

## 4. The observation Codex made in passing, which was load-bearing

Codex noted that the structure gate's test file changed independently during the
review and that "its old test-count receipt is not the current checkout's
result". Re-measured at `30ec496c1`: the suite is **37 pass / 0 fail** (was
32/35) and `rankedChildren.length` is pinned at **98** (was 94), both moved by
`2c4ba44af`. Revisions 2 and 3 carried the stale figures in three places — §3.1,
§6.5 and R15 — and instructed the kernel lot to preserve three reds that no
longer exist. All three are re-stated, and the *hazard itself* becomes the new
R15: a design packet's gate receipts decay while it is under review, so a lot
must re-measure at its own pre-lot commit rather than trust this document's
numbers. Revision 3 had already written the correct rule ("move the pin from the
value the file then carries, not from `94`, if another writer lands first"); only
the numbers needed refreshing.

Separately, `saved-views/engines/modern/index.tsx` is **modified in this
worktree** by another writer (a `ViewPill` owning a `useInteractionState`
instance). Every saved-views measurement here is taken with `git show HEAD:`, so
no number is affected — but the *lot plan* would be incomplete if it lands, since
saved-views would acquire a fourth press-cancel boundary. That is R22, with a
prospective lot 6c.

## 5. The two rules this round is the evidence for

Both are about instruments, and both cost a round.

1. **A planted negative must be aimed at the boundary that owns the behavior.**
   N3 mutated a kernel option while the behavior lives in a component's
   `onDragEnd` wrapper; the mutant was therefore inert and its designated
   assertion stayed green. The general failure mode is planting a mutation
   *behind an earlier guard* — N11's mutant died on the null-session check before
   the mutated line ran, which proves the guard works and nothing else.
2. **An acceptance claim whose green is guaranteed by the platform is not
   evidence.** The `dropEffect` cursor claim would have passed for a reason that
   has nothing to do with the code under test, because the HTML processing model
   already negotiates `move` for a `move`-only source. The repair is not a better
   assertion on the same arm — it is a second arm where the platform's default
   and the code's behavior disagree.

A third, narrower one, recorded because it is the round's largest single error:
**a field that renders is not necessarily a field that commits.** `session.target`
drove four families' stamps and I read that as it being the destination. Three of
the four never consult it at commit time. The check that would have caught it is
the one Codex ran and I did not: execute the drop handler, not just the dragover.

## 6. Carried, not resolved

Unchanged from revision 3 — tree's Move affordance (A3, lot 8), the
source-removal session leak (C14), `crossAxis === orientation` as a dev-time
refusal, registering the browser leg in `gates:ci`, Fable's independent review,
and the D15 / `useAriaAnnounce` / FAM-13-depth / constitution-drift items — plus:

| Item | Owner | Why it cannot close here |
|---|---|---|
| Whether `pressCancel` survives at all | reviewer | All three real cleanup boundaries turned out to be component-owned, so the option has no adopter among the four. It is kept with the kernel's own scene as its named fixture (N3d); deleting it is the honest alternative and is open decision 4. |
| Whether column-menu's move controls lose `disabled` | reviewer | Taken here (open decision 1) because the edge announcement is otherwise unreachable and a disabled control is out of the tab order. It is a visible change to a shipped affordance and the reviewer may prefer the smaller lot. |

**Nothing in the round-4 brief was unresolvable.** The five B1 items, the three
B2 items and the three B5 items are each answered in the contract text at the
section named above. The standing requirement was met in both directions: the
declarations, five adapters and eight refusal legs compile clean at TS 5.9.3
`strict`, and stripping the eight directives yields exactly eight errors, one per
leg (Appendix B, leg 16).

---

# DnD kernel debrief — revision 5 notes (Codex round-4 HOLD → resolution map)

- Reviewed document: `evidence/dnd-kernel-debrief/index.md` at sha256
  `3dd9dccff80bcdbafbb2a3000da5b7eb0eabc9e9836eaa243ab8845c24020d0b`
  (Codex's recorded digest; the document did not move during the review),
  review-start HEAD `b81e304c9`, review-end HEAD `bdbee769a`.
- Revision base: `cc5f10739a91c0114eef4df3445f557160d1732c`, branch `main`.
  HEAD advanced twice after Codex's review ended and **once more during the
  writing of this revision**, to `fb2f44b4d` (another writer's theme-ingress
  lot). The thirteen files this revision reads are byte-identical at
  `cc5f10739`, at `fb2f44b4d` and on disk, and the structure suite is 37/37 at
  both tips (Appendix B, leg 21). Four rounds running, the base has moved under
  the review.
- Write set of this round: `evidence/dnd-kernel-debrief/` only. No product code,
  no gate code, no `git add`/`commit`/`mv`.
- Round-4 verdict: **HOLD**, with **B3** and **B4** still resolved at contract
  level and **thirteen** corrections independently verified as working. Neither
  the resolutions nor the verified table is reopened. Five items across B1
  (three), B2 (one) and B5 (one).
- **This is the last Codex round.** The seat is retired by owner order of
  2026-09-17; `codex-HOLD-round4-FINAL.txt` is its final artifact and **Kimi
  reviews revision 5 directly** — compile and execute. There is no round-6 Codex
  artifact to defer anything to, which is why nothing below is carried on the
  grounds that a later reviewer will settle it.

**The shape of this round's defect class, stated once because four of the five
items are instances of it.** Revision 4 diagnosed correctly and then wrote the
diagnosis *beside* the text that carried the defect instead of replacing it:

| Corrected in prose | Still specified the defect |
|---|---|
| §2.2.1(a) stated the two-phase commit rule and the phase table | §2.2.3's authoritative sequence still read `explicit ?? session.target` |
| Appendix A recorded "the commit sequence now nine steps" | no nine-step sequence was ever written |
| §2.2.4(d) said the FLIP and focus registrations compose | the same adapter called an undeclared `fromColumnOf` |
| §2.4.6 claimed the delegated adapter compiles | it compiled against a **scratch** `IconButton`, not the family's |
| §6.6's D9 row required `dndKernelWired === false` | the closure paragraph three screens down said `true` |

A reviewer who reads the *narrative* sees a resolved packet; a reviewer who
compiles the *artifact* does not. Codex compiled and executed. The rule this
round is the evidence for is in §5 below.

## 1. B1 — the terminal sequence, C16, and the kanban snapshot

| # | Round-4 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| 1 | **The authoritative terminal sequence still specifies the round-3 regression.** It reads `destination = explicit ?? session.target`, never invokes the drop-phase resolver, and Appendix A's claimed nine-step replacement is absent. Its refusal branch also contradicts two other passages: `commit()`'s API says a missing destination closes the session, step 2 returns without closing it, and R21 requires a refused pointer drop to close immediately. Executed: `start({key:'a'}); commit()` emits `blocked(no-destination)` and leaves the session open. | **The sequence is replaced, not annotated** — which is what the finding asked for, and the reason no reconciling paragraph sits beside it. `P1-P3` is the pointer branch and it resolves the identity bound on the **receiving** element through `phase: 'drop'`, passing `session.target` in as `current`. `K1-K3` is the keyboard branch: `explicit ?? session.target`, resolver **not invoked**, because there is no receiving element. `T1-T5` is the shared tail (reserve → clear mirror → `onDrop` → pending focus → `dropped`). Both `P3` and `K3` **clear the ref, clear the rendered mirror and emit `blocked('no-destination')` explicitly**, so `commit()`'s doc, the sequence and R21(ii) now state one rule. `origin` is read from the session rather than the entrypoint, so the tail needs no per-path variant. `commit()`'s JSDoc is rewritten to say which branch it is. | **§2.2.3**, §2.2 (`commit`), §2.2.1(a), §7 R21, §6.4 N21 | Executed, Appendix B leg 23: the replaced sequence reproduces all four owners on the self-return case, including kanban's commit. The refused-drop leg shows the source leaving tree's `dragKey` set and the kernel closing (leg 23 leg 4). `start(); commit()` now ends `session === null` with one message. N21 plants revision 4's own refusal branch. |
| 2 | **C16 is not family-specific.** Kanban's self-drop COMMITS — executed, `onItemMove("a","todo","todo",0)` — so "zero callbacks in all four owners" is false, and C16 contradicts the very adapter it certifies. Separately, tree's source does **not** reject a receiving key equal to the source at drop time; that guard belongs to `dragover`. The R4 adapter applies it before the phase split and therefore **changes tree**: with a retained zone, source commits `{dragNode:a, dropNode:a, dropPosition:1}` and the adapter commits nothing. | Both accepted. C16 becomes a **four-leg matrix** with a per-family row: saved-views 0 (`:229`), column-menu 0 (`moveDraftColumn` `:378`), tree 0 *when a self-hover cleared the zone* (`:826`), kanban **exactly one** (`:249`, no guard, no resolver). Leg 3 is tree's no-self-hover drop and asserts **one callback**. Leg 4 is the ordinary drop, kept as the anti-blanket-refusal control. Tree's resolver is **re-ordered**: the `'drop'` phase runs first and carries no key comparison at all, which is `handleDrop`'s actual guard set; the self check moves inside the hover branch, which is where `:804-807` puts it. **Preservation over declaration** was chosen deliberately — a transport lot whose claim is "no behavior change" is the wrong place to add a refusal — and the alternative is written up as open decision 1, routed to lot 8 if the reviewer takes it. DROP-TIME VALIDATION's self-target sentence becomes a **three-way** table (commits / refuses at drop / refuses at hover). | §2.2.1(a), **§2.2.4(c)** correction 4, §2.2.3, **§6.3 C16**, §7 R21(iii), §6.4 N22 | Executed, Appendix B leg 23: leg 1 gives 0/0/1/0 callbacks across saved-views/column-menu/kanban/tree, with kanban's tuple identical on both sides; leg 2 gives 1 callback from both the tree source and the R5 adapter and **0** from the R4 adapter. Source re-read: tree `:824-826` (the guard is `dragKey === null \|\| !dropTarget`), `:804` (the key comparison), kanban `:249`. |
| 3 | **Kanban's source-column snapshot has no producer.** The source records `fromColumn` at drag start and passes the saved value at drop; the adapter retains only `{key}` and calls an undeclared `fromColumnOf(payload.key)` at commit. A current-column lookup diverges: with the parent moving `x` from `todo` to `doing` mid-drag, source gives `("x","todo","done",0)` and the adapter gives `("x","doing","done",0)`. The four-argument contract includes **when** its arguments were captured. | `TPayload` becomes `{ key: string; fromColumn: string }` — the **start column rides in the payload**, and `getSourceProps({ key: itemKey(item), fromColumn: column.id })` binds it at the same JSX site the family's `handleDragStart(e, item, columnId)` closure binds it. The kernel copies `payload` into the session **inside `onDragStart`**, so the capture instant is `setDragData({itemId, fromColumn: columnId})`'s (`:222-228`) and the session then holds a value a re-render cannot change. `fromColumnOf` is deleted from the document and the harness. The licence is already in the contract: `DragPayload` is a *constraint* and the kernel "never inspects it beyond `key`". The `'immediate'` keyboard path lands on the same value from the other side — no session, so the payload is the current render's, which is `applyMove`'s `columns[columnIndex].id` (`:271`, `:296`). | **§2.2.4(d)**, §6.3 C21, §2.2.6 R-9, §2.6 (`crossedContainer` note), §6.4 N23 | Executed, Appendix B leg 24: source `("x","todo","done",0)`, R4 `("x","doing","done",0)`, R5 `("x","todo","done",0)`. **And the control that explains why this needed a case:** the same drag without the mid-drag reparent gives `("x","todo","done",0)` from all three, so the quiet drag is green on the defect. Type side: stripping R-9's directive yields `TS2339: Property 'fromColumn' does not exist on type '{ key: string; }'` (leg 22). |

## 2. B2 — the delegated adapter against the real component

| # | Round-4 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| 4 | **The "complete" delegated adapter does not compile against its actual component.** The document supplies `aria-label` to both move controls. ColumnMenu's local `IconButton` requires `label: string`, consumes it and writes `aria-label={label}` internally; it forwards no incoming `aria-label`. In-memory compilation gave **two TS2741s**. The retained scratch adapter already used `label`, which is why its green compilation established nothing about the document. | The document uses the **real contract**: `label` plus the required icon `children` (`<NavigationUpIcon size={14} decorative />`), in the family's own three-part label spelling — `${tOr("columnMenu.moveUp","Move")} ${column.title} ${tOr("columnMenu.upSuffix","up")}` (`:894-896`) — so the accessible name a screen-reader user hears is **unchanged by the lot** and only `disabled`/`onClick` differ from `:893-911`. The harness's scratch declaration is replaced by the source contract verbatim, including required `children`, so the file that compiles is the text the document shows. A named consequence is added: passing `aria-label` would not merely fail to type-check, it would render both controls **nameless** — and §6.2's drill now asserts the accessible name by role, not a prop. | **§2.4.6**, §6.2 | Both directions, Appendix B leg 22. (A) Codex's finding reproduced: the R4 text with children restored gives `TS2741` at `(23,6)` and `(27,6)`, exit 2; `aria-label` → `label` gives zero diagnostics. (B) The R5 text, in the full harness with the real contract: **zero diagnostics**. The scratch/real difference is recorded in the leg so the false green cannot recur silently. |

## 3. B5 — the F-69 instrument's false green

| # | Round-4 finding | Resolution | Where | Verified by |
|---|---|---|---|---|
| 5 | **Attachment plus a zero count still permits a false green.** (a) The attachment predicate counts a JSX spread without checking whether later props overwrite its handlers; Codex's counterexample compiles, the kernel's handlers run **0** times and the independent upload handler runs once, and the specified predicates report `wired=true`, both counts `0`, blocking `false`, closure `true` — the kernel bypassed and the consolidation proof passing. (b) The drop-zone count requires independent hover state, excluding stateless independent file-drop handling. (c) D11: passing a bag to a child is not evidence the child consumes it. (d) The closure paragraph says the original decoy is wired, contradicting D9's explicit `false`. | Four changes, each aimed at one clause. **(a)** Attachment becomes **effective and positional**, stated as the rule the JSX transform itself applies: for each element carrying a kernel spread, nothing after it may name `draggable`, `onDragStart`, `onDragEnd`, `onDragOver`, `onDragLeave`, `onDrop`, `onPointerCancel` or `onKeyDown` — not a later **attribute** (D15, Codex's), not a later **spread with enumerable keys** (D18), not an **overriding key in a merge literal** that produced the spread local (D16). Writing the rule surfaced that third shape, which the finding did not name and which the repository **does** ship: `ViewPill` (`saved-views:73-83`) and `StatefulRow` (`column-menu:1124-1125`) are both `{...rest}` followed by `{...interaction.handlers}`, so a predicate that only watched later *attributes* would have missed the one live form. A later spread whose keys are not enumerable is `SPREAD-UNVERIFIED`: printed, not effective, blocking arm fires (D19, fail-closed by open decision 4). An attribute or spread *before* the kernel spread is overwritten **by** the kernel and is explicitly not a defect (D17 is that control). This is an AST walk in the file's existing idiom — `family-cut/index.mjs` already imports `typescript` and parses with `ts.createSourceFile(..., ScriptKind.TSX)` (`:68`, `:442`). **(b)** The hover-state conjunct is **removed**: it was a sufficient signal, never a necessary one, and both real owners still count. **(c)** D11 credits the **pair** — the child must be in the family's census and spread the bag under the same positional rule — and unresolvable delegation is printed `DELEGATED-UNVERIFIED` rather than counted in either direction (D14), so a family whose only wiring is unverified cannot close the criterion. **(d)** The closure paragraph is rewritten to agree with D9 and carries a four-row decoy table. One addition the finding did not ask for but the arm needs: the blocking condition is gated on a new **`dndKernelDeclared`**, because the ungated form is red on every un-adopted family the day it lands, which would force the gate to be disabled. | **§6.6**, §6.4 N24, open decisions 3 and 4 | Executed and measured per file, Appendix B leg 25 — one file per shape, because the gate's granularity is the file. All five decoy files **compile** (exit 0). Executed kernel-handler calls and surviving kernel keys: d15 **0** calls / **no** keys survive (Codex's reported result exactly); d16 **2** / `onDragOver`+`onDragLeave`; d18 **1** / `onDragLeave`; d19 **2** / `onDragOver`+`onDragLeave`; d17 (control) **3** / all three. **All five are GREEN under R4's predicates; only the control is GREEN under R5's.** d16 and d19 are RED on the blocking arm alone, which proves the arm is not redundant with the ratchets; d15 and d18 are RED on both. The spread of surviving-key counts (0, 1, 2) is also why the walk is **per key** rather than per element: "did any kernel handler run?" is green on three of the four decoys. |

## 4. The base moved again, and one file mattered

Codex noted HEAD advancing from `b81e304c9` to `bdbee769a` during its review and
that "SavedViews gained `ViewPill`, with its drag handlers unchanged". Re-measured
at `cc5f10739`: **12 of the 13 files this revision reads are byte-identical at
the revision-4 base, at Codex's review HEAD, at this HEAD and on disk.** The one
that moved is `saved-views/engines/modern/index.tsx`, through `8fb516981`.

Three consequences, none of them a behavioral claim:

1. **Every saved-views citation is re-anchored.** `ViewPill` shifted the handler
   region by exactly **+19** lines and the JSX region by exactly **+18**,
   measured rather than assumed. Fifteen citation sites were re-read and
   corrected (`:200-202 → :219-221`, `:207 → :226`, `:210 → :229`,
   `:213`/`:214 → :233`, `:324 → :342`, `:325 → :343`, `:327 → :345`,
   `:330 → :348`, `:207-224 → :226-243`). The handlers are byte-identical, so
   nothing this packet says about saved-views' behavior changes — only its
   address. Revision 4's "DIRTY ON DISK" note is discharged: the file is
   committed and clean.
2. **R22 stops being conditional.** It said "if `ViewPill` lands, the boundary
   repair joins lots 6a/6b as lot 6c". It landed. Lot 6c is now a **required**
   row in §3.2, and lot 1's PRE-pin acquires one assertion (the pill's
   pre-repair `pressed`) that revision 4 recorded as "no pin needed".
3. **R18 becomes a family of two, and that is why §6.6's rule is positional.**
   `ViewPill` spreads `{...rest}` and *then* `{...interaction.handlers}`, the
   same order as `StatefulRow` (`:1124-1125`). `useInteractionState` exposes six
   pointer/focus handlers and **no** drag handler (`:36-41`), so the drag props
   survive both spreads today — the shape is live in the repository, the DnD
   defect is not. An attachment predicate that ignored attribute order would be
   wrong about this shape the moment anyone adds a drag handler to it.

The structure gate's suite was re-run rather than quoted: **37/37**,
`rankedChildren` pin still `98`. Three consecutive rounds of receipt decay is why
§3.1 states a rule ("re-measure at the lot's own pre-lot commit") instead of a
number, and this re-measurement is that rule being obeyed.

## 5. The rule this round is the evidence for

**A correction is not resolved until the authoritative text says it.** Every
other rule this file has recorded was about *finding* a defect — execute the
handler, aim the mutation at the owning boundary, don't accept a green the
platform guarantees. This one is about *landing* a fix, and it cost a whole round
on its own:

> When a packet corrects a rule, the correction must **replace** the text that
> carries the rule. A new section that states the right rule, a table that
> illustrates it, and a dispositions row that claims the replacement happened are
> three descriptions of a fix, not the fix. If two passages can both be read as
> normative and they disagree, the packet specifies the defect — and a reviewer
> is entitled to act on either one.

The four checks that would have caught all five items, in order of cost:

1. **Grep your own document for the text you claim to have replaced.** Searching
   for `explicit ?? session.target` would have found the surviving sequence in
   one second. Revision 4 changed it in §2.2.1(a) and left it in §2.2.3.
2. **Compile the document's text, not a harness approximation of it.** The
   `IconButton` harness declaration was *close enough to read the same* and had a
   different required-prop set. If a declaration in the harness is not copied
   from the source file, it is a second authority on that component's contract.
3. **Grep the harness for `declare` names that the document does not produce.**
   `declare function fromColumnOf(key: string): string` is the whole defect in
   one line: a stand-in for a producer that does not exist, which makes the
   adapter compile and the behavior wrong.
4. **Apply a predicate to its own counterexample before claiming it holds.** The
   F-69 attachment rule was stated, then asserted to resist evasion, and never
   run against an evasion. Codex wrote three lines of JSX and it failed.

A fifth, earned twice in one leg while writing the F-69 walk: **when a predicate
and the executed behavior disagree, the executed behavior is right and the
predicate is the defect.** Both corrections are recorded in Appendix B leg 25
rather than quietly fixed:

- the first walk measured per *function slice*, which put a shape's `const` out
  of scope and reported an **enumerable** later spread as unverifiable. The fix
  is to measure at the gate's real granularity — one file per owner;
- the second had a **dangling `else`** inside the later-spread loop, so
  `unverified` was never assigned and D19's opaque `{...rest}` read as
  *effective*. Nothing in the predicate's own output looked wrong; the disagreement
  with the runtime column is the only thing that exposed it.

Neither was a contract defect, and that is the point: an instrument written to
catch a false green produced two of its own inside one afternoon, and only the
execution leg caught them. A drill row (**D18**) now pins the first and the
`unverified` printout pins the second.

A sixth, specific to this packet's subject: **an assertion that is green on the
quiet case is not an assertion.** Both of this round's behavioral defects —
kanban's `fromColumn` and tree's self-drop — are invisible unless the test
disturbs something (a parent re-render mid-drag; a drop with no intervening
`dragover`). C21 and C16 leg 3 are written to disturb it, and both are pinned on
**callback count** rather than on resulting data, because the defective and
correct readings produce the same array.

## 6. Carried, not resolved

Unchanged from revision 4 — tree's Move affordance (A3, lot 8), the
source-removal session leak (C14), `crossAxis === orientation` as a dev-time
refusal, registering the browser leg in `gates:ci`, Fable's independent review,
and the closure-inventory D15 / `useAriaAnnounce` / FAM-13-depth /
constitution-drift items. The two reviewer decisions carried out of revision 4
(whether `pressCancel` survives; whether column-menu's move controls lose
`disabled`) are still open and still the reviewer's. Added this round:

| Item | Owner | Why it cannot close here |
|---|---|---|
| Whether tree gains a drop-time self-refusal | reviewer | Revision 5 **preserves** the commit, because adding a refusal inside a transport lot contradicts that lot's own claim. But committing `{dragNode:a, dropNode:a, dropPosition:1}` is very likely a latent consumer bug, so the refusal is probably right *product* behavior in the wrong *lot*. Open decision 1 routes it to lot 8 with its own pin if the reviewer takes it. |
| The browser receipt for the negotiated-operation arm | lot 0 | Unchanged from revision 4: the two-arm measurement is specified and the harness's write set is named, but no Playwright run is recorded in this packet. The copy-only arm is the control that can fail and it has not been run. |
| Whether the F-69 blocking arm's `dndKernelDeclared` gate is the right shape | reviewer | Taken here (open decision 3) so the arm is green at HEAD and therefore shippable. The alternative — an explicit per-family adoption roster in the gate config — is a second place to keep the truth, which is the failure mode invariant 7 exists to prevent. |

**Nothing in the round-5 brief was unresolvable.** All five blocking groups are
answered in the contract text at the sections named above, every round-4 executed
repro was re-executed and lands on the corrected side, and the standing compile
requirement is met in both directions: the declarations, five adapters (including
the delegated one against the **real** `IconButton`) and **nine** refusal legs
compile clean at TS 5.9.3 `strict`, and stripping the nine directives yields
exactly nine errors, one per leg (Appendix B, leg 22).
