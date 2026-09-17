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
