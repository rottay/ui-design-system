# Kimi Proposed Execution Plan — 2026-07-23

Status: reconciled and superseded for execution by
`CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md` and
`KIMI-MODERN-K0-K1-MACRO-WAVE-PROMPT.md`. The K0/K1 grouping is accepted, but
the corrections in the Codex reconciliation are mandatory.

Original status: proposal only. No implementation before the user and Codex review and
explicitly approve a separate implementation prompt. Companion to
`KIMI-INDEPENDENT-DS-AUDIT-2026-07-23.md`, whose evidence base this plan
cites.

Goal: the fastest safe route from 14/92 certified primitives (15.2%) and
14/119 certified artifacts (11.8%) to a meaningful majority, without lowering
the 90/95 score bar, the two-pass rule, or Codex's exclusive certification
authority.

---

## 1. Assessment of the current execution hypothesis

The standing hypothesis: one audit/onboarding phase; four primitive
macro-waves; up to four non-overlapping lanes per wave; shared foundation
frozen before family lanes; one coordinator owning barrels, generated
artifacts and serial gates; Pass 1 contract review and Pass 2 adversarial
visual review with different criteria/reviewers; Codex alone certifies.

**Keep all of it.** The audit found the model sound; what failed in practice
was different:

1. **Parallel family lanes never actually ran.** OLA 1–5 were sequential
   authority waves. The four-lane policy exists on paper; no wave ever had
   more than one implementation lane.
2. **The remediation loop is the throughput killer.** Every wave needed Codex
   corrections (8 findings in OLA 2, 10 in OLA 4, 9 in OLA 5-P1, 2 P0s in F2).
   The repeated defect class is handoff narrative ahead of verified code. The
   roadmap's own rule 1 ("a work order is a hypothesis; its first step is to
   falsify itself") must be applied per family ticket, not just per wave.
3. **Codex reviews waves narratively instead of batch-reviewing standardized
   per-family evidence.** A 21-family wave with a uniform evidence matrix per
   family is auditable in one sitting; a prose handoff is not.

**Therefore: 4 macro-waves is the right number** for 78 remaining families at
19–21 per wave — but grouped by *risk and supplier dependency*, not by visual
category, and preceded by a small K0 that closes the F2 proof and locks the
hygiene items every later wave depends on.

### Process changes (no bar lowered)

- **Standardized per-family evidence package** (one fixture URL convention,
  one focused-suite naming, identical matrix cells: states × density × tenant
  × locale × direction × container × motion). Codex batch-reviews the wave
  against the rubric; Pass 1 and Pass 2 remain distinct reviewers/criteria.
- **Sighted sign-off becomes an in-repo artifact**
  (`test-artifacts/rottay-design-platform/<wave>/SIGHTED-REVIEW.md` with
  per-family verdicts and linked captures). Today that review is out-of-band;
  certification depends on it, so it must be durable.
- **Baselines re-locked in the same commit that earns the tightening**
  (starting with Daisy 15→12). A ceiling that stays loose after progress is a
  quiet regression window.
- **Every family ticket begins by falsifying its premise** (measure the
  family; name its real defects; then implement). This is the single change
  most likely to cut the remediation rate.

---

## 2. Critique of the candidate K1 grouping

Candidate K1 (≈27 families): Lane A identity (Avatar, Badge, Tag, Link, Kbd);
Lane B text/boolean (Input, Textarea, FormField, Checkbox, Radio, Switch,
Toggle); Lane C selection/date/value (Select, AutoComplete, DatePicker,
TimePicker, InputNumber, Slider, Upload); Lane D feedback (Alert, Callout,
Message, Progress, Skeleton, Spinner, Empty, Result).

| Question | Finding |
| --- | --- |
| Ownership disjoint? | Mostly yes at the file level. But Lane C shares the bespoke overlay/collection runtime (Select↔AutoComplete↔DatePicker↔TimePicker) — they are *behaviorally* coupled, so four families in one lane will serialize internally anyway. |
| Shared dependencies ready? | For A/B/D: yes (accepted foundation, recipe profiles, density on Input/Button). For Lane C: **no** — Select/AutoComplete/DatePicker are the exact DS-S002 bake-off subjects. |
| Tranche size right? | Too large. 27 families exceeds any demonstrated review capacity (largest accepted wave was 8). 19–21 with a standardized matrix is the realistic ceiling per wave. |
| Any family should move? | Yes. Select, AutoComplete, DatePicker, TimePicker → wave K2 (post-bake-off); they are the four highest behavior-risk families in the catalog (1,138 / — / 1,267 LOC bespoke; TimePicker has 6 red tests in the current failure baseline). InputNumber, Slider, Upload → K2 Lane B (Slider still paints Daisy `range`; Upload mixes 17 inline styles + raw `z-[9999]` — both need repair, not fast-track). PasswordInput (cheap, pairs with Input) and Result (pairs with Empty) should move *into* K1. |
| Any accepted primitive to reopen? | No. Flag only: re-anchor the 7 layout families' evidence when `framework-bridge.css` drains (no status change). |
| Expected gain realistic? | 27 certifications in one tranche is not; 19–21 is. |
| Better grouping? | Group by supplier-dependency and behavior risk (below), which lets K1 run entirely on the frozen foundation with zero blocked families. |

---

## 3. Recommended wave plan

### K0 — close OLA 5 and lock hygiene (no certifications)

Scope (small, serial, single lane):

1. **F2 same-tree density proof** (the only missing OLA 5 deliverable): add a
   `density` parameter to the recipe-profile specimen probe (or a dedicated
   density probe) and one e2e spec sweeping static BitHire vs DB The
   Management × compact/comfortable/spacious × EN/ES/AR on one identical DS
   tree, asserting agreement across compiler output, CSS effective scale,
   root `data-density` metadata, JS `useDensity()` context and rendered
   control geometry; nested `DensityScope` override changes only its subtree
   and restores; DB overrides static without a markup fork; 44px floor holds.
2. **Baseline re-lock**: `daisy.classConsumers` 15→12 (tightening only, same
   commit).
3. **Doc-drift hygiene**: 132→216 state cells; remove the phantom "1,026
   hardcoded values" and "3,227 counters" figures; `CLAUDE.md` 50-role→282
   icon corpus; note `css-layer-paint-gate` is `csspaint:check`, not pretest;
   `theme.css` 626→617.
4. **Ledger decision prepared** (approval required): add `SemanticSurface` as
   the 93rd ledger family or rule it out of the denominator; delete dead
   `MaterialSurface`.
5. **Tailwind Variants formal acceptance** (S-01 closure) once the remaining
   DS-S001 exit evidence is linked.

Exit: F2 closed by Codex inspection; baselines tightened; denominator
decision recorded. Estimated duration: short (days, not a wave). 0
certifications — deliberately.

### K1 — identity, text/boolean, feedback basics (21 families, 3 lanes + evidence lane)

Prerequisites: K0 done. No supplier decision needed. All families run on the
frozen foundation.

| Lane | Families | Notes |
| --- | --- | --- |
| A — identity & compact chrome (5) | Avatar, Badge, Tag, Link, Kbd | Tag already recipe-profile-wired; Icon/IconButton behavior verified only where a canonical owner exists |
| B — text & boolean controls (8) | Input, Textarea, PasswordInput, FormField, Checkbox, Radio, Switch, Toggle | Input already density-wired; FormField owns the label/error/hint anatomy the pattern layer reuses |
| C — feedback & readiness (8) | Alert, Callout, Message, Progress, Skeleton, Spinner, Empty, Result | Alert/Callout/Progress drain their Daisy residues; Message documents its imperative engine-dispatch exception |
| D — evidence infrastructure | fixtures, probes, matrices | density-swept fixture scaffolding from K0 reused; per-family state cells incl. cross-tenant hover |

Estimated certifications: 18 conservative / 21 expected.
Projected primitives: 32–35/92 = **34.8–38.0%**.
Projected basket: 32–35/119 = **26.9–29.4%**.
Unlocks: ListToolbar and DataTable state anatomy (Empty/Skeleton/Result),
form patterns (FormField), ListSurface prerequisites.

Primary regression risks: Daisy drain in Alert/Callout/Progress changing
uncertified visuals consumed by apps (mitigate: same-markup fixture before/
after); Message/Notification imperative APIs diverging under recipe defaults
(mitigate: contract tests first).

Evidence matrix per family: default/hover/focus/press/disabled ×
compact/comfortable/spacious × BitHire static + The Management DB × EN/ES/AR ×
LTR/RTL × desktop/narrow/mobile × normal/reduced motion; focused suite +
real-engine suite; story entry.

Serial integration order: Lane D scaffolding lands first (coordinator), then
A → B → C merges, one aggregate gate per lane merge, one showroom build,
one batch Codex review at wave close.

Stop/rollback: any accepted-14 regression → halt the wave at the offending
lane; >3 families failing Pass 1 on the same axis (e.g. density consumption)
→ stop, fix the shared owner, restart the lane; any baseline-widening request
→ wave stops until Codex adjudicates.

### K2 — supplier-gated selection controls, value inputs, overlays (19 families)

Prerequisites: **DS-S002 behavior bake-off decided** (React Aria vs Base UI
behind identical Rottay facades: Select/ComboBox, Drawer/Dialog, DatePicker;
score ≥ 85, no critical red flag; loser removed) and **DS-CAN009 Modal
consolidation decided** (one canonical owner + compat alias). The bake-off is
Lane D's first job inside K2 prep — it is the only new-dependency event in
this plan and needs explicit approval.

| Lane | Families | Notes |
| --- | --- | --- |
| A — selection controls (6) | Select, AutoComplete, DatePicker, TimePicker, Cascader, TreeSelect | Bake-off winner owns focus/collection/overlay mechanics; TimePicker's 6 baseline-red tests fixed first |
| B — value inputs (6) | InputNumber, Slider, Upload, TagInput, Form, Rate | Slider drains Daisy `range` + proves coarse-pointer floor; Upload loses inline/raw utilities (`z-[9999]`) |
| C — overlays (7) | overlay/Modal + feedback/Modal (merge), Drawer, Sheet, AlertDialog, ConfirmDialog, Popconfirm | AlertDialog drains Daisy `modal-*`; adaptiveFullscreen kept; portal/SSR invariants |
| D — spike & evidence | DS-S002 adapters, scorecard, fixtures | Claude recommends; Codex accepts/rejects; loser removed before lane A/C certification |

Estimated certifications: 15 conservative / 18 expected (bake-off tie or
sub-85 score keeps bespoke runtimes and costs schedule, not quality).
Cumulative primitives: 47–53/92 = **51.1–57.6%**.
Cumulative basket: 47–53/119 = **39.5–44.5%**.
Unlocks: FilterBuilder/CommandPalette behavior paths, PeekPanel,
RecordSurface form anatomy, DecisionSurface dialogs.

Primary regression risks: behavior-swap regressions in controlled/uncontrolled
form semantics (mitigate: existing real-engine suites must pass unchanged
before adapter swap); overlay z/focus-trap interactions with DataTable
(mitigate: nested-overlay fixture); Modal merge breaking app imports
(mitigate: compat alias + codemod note, no silent rename).

Evidence matrix: as K1 plus keyboard/SR-critical cells, virtual-keyboard/
small-viewport cells for overlays, locale-intensive date/number cells.

Serial integration: DS-S002 adapters → scorecard → Codex decision → Lane A →
Lane C → Lane B → aggregate gates per merge → batch review.

Stop/rollback: bake-off tie → implement lanes on existing runtime, defer RED
families to K4 rather than adopting a sub-85 supplier; any hydration/SSR
failure in overlay lane → lane stops; supplier leakage finding → offending
adapter removed before review.

### K3 — data display, navigation, layout behavior (19 families)

Prerequisites: K1 (feedback/empty/loading states consumed by data families);
DS-R006 pagination unification decided.

| Lane | Families | Notes |
| --- | --- | --- |
| A — data display (6) | Table, List, Statistic, Descriptions, Timeline, Tree | Table: one paint owner (38 inline sites removed); Statistic/Timeline drain Daisy; List/Statistic red rustic tests fixed |
| B — navigation (6) | Menu, Breadcrumb, Pagination, Segmented, Steps, Stepper | Steps/Stepper drain Daisy `steps`; one Pagination implementation shared with DataTable |
| C — layout behavior (7) | Collapse, ScrollArea, Layout, Splitter, Affix, Anchor, BackTop | Collapse consumes `disclosure.reveal`; Splitter proves RTL keyboard resize |
| D — evidence + DS-S003 prep | fixtures, DataTable bake-off scaffolding | native-vs-TanStack adapters behind the same renderer (spike executes in P1) |

Estimated certifications: 15 conservative / 18 expected.
Cumulative primitives: 62–71/92 = **67.4–77.2%**.
Cumulative basket: 62–71/119 = **52.1–59.7%**.
Unlocks: DataTable pattern certification (P1), WorkspaceTabs, ListSurface,
collection surfaces.

Primary regression risks: Table paint consolidation shifting app-consumed
selectors (mitigate: `data-part` contract freeze first); Pagination unification
touching DataTable (mitigate: DS-R006 in same lane, shared suite); Menu
keyboard model conflicts with CommandPalette (mitigate: one collection
runtime).

Serial integration: Lane C (lowest risk) → Lane B → Lane A → gates per merge
→ batch review.

Stop/rollback: Table lane blocks >1 review cycle → split Table into its own
mini-wave; any mobile-anatomy regression (the OLA-5 fix) → immediate lane
halt.

### K4 — specialized, AI-adjacent and stress families (19 families)

Prerequisites: K2 overlay decisions (Dropdown/ContextMenu inherit the winning
menu/overlay mechanics); K3.

| Lane | Families | Notes |
| --- | --- | --- |
| A — feedback/overlay remainder (6) | Toast, Notification, Dropdown, ContextMenu, HoverCard, Tour | Toast/Notification pair with Message stack; HoverCard defines coarse-pointer fallback |
| B — AI-adjacent content (4) | CodeBlock, MarkdownView, VoiceInputButton, Calendar | VoiceInputButton needs its full evidence base from zero (no tests/stories today); Calendar shares the K2 date runtime |
| C — specialized display (6) | Carousel, Image, QRCode, ColorPicker, FloatButton, Watermark | Carousel drains Daisy; ColorPicker is the Brand Studio proof |
| D — stress inputs (3) | Mentions, OTPInput, Transfer | Transfer may defer to a post-wave if its collection behavior red-lanes |

Estimated certifications: 14 conservative / 17 expected.
Cumulative primitives: 76–88/92 = **82.6–95.7%**.
Cumulative basket: 76–88/119 = **63.9–73.9%**.
Unlocks: AI capability families (DS-AI001..006 content primitives), Brand
Studio, AIWorkspace.

Primary regression risks: imperative stacks (Toast/Notification) racing under
reduced motion (mitigate: F3 recipe consumption tests); VoiceInputButton
scope creep (mitigate: certify the button contract only, not the speech
pipeline); Tour/Transfer complexity (explicit defer option).

Serial integration: Lane C → Lane B → Lane D → Lane A (overlay stack last,
it depends on all decisions) → batch review.

Stop/rollback: VoiceInputButton red-lanes on media permissions in CI →
certify keyboard/pointer contract, defer capture-path; Transfer red-lanes →
defer without blocking the wave.

---

## 4. Post-primitive waves (patterns, surfaces, AI grammar, canary)

Run after the primitive waves they depend on; P1 may start once K3 Lane A
closes.

| Wave | Contents | Depends on | Certifications unlocked |
| --- | --- | --- | --- |
| P1 — data patterns | DS-S003 DataTable bake-off (native vs TanStack, same renderer), DS-CAN001/002 ownership, ListToolbar container-responsiveness, WorkspaceTabs | K3 | DS-C010, DS-C011 (DataTable), DS-C001, DS-SUR001 ListSurface |
| P2 — record/decision patterns | RecordHero, ActionDock, DetailFactsEditor, PriorityBand, RankedActionList, DecisionBrief, AssistantRail | K1–K2 | DS-C002..007, DS-SUR002 OverviewSurface, DS-SUR003 RecordSurface |
| P3 — board & comparison | DS-S004 WidgetBoard bake-off (native vs RGL2) + DS-W001..006, PeekPanel, DecisionComparison, SplitDecisionWorkspace, JourneyWorkspace | K2–K3 | DS-C008, DS-C012..015, DS-SUR004 DecisionSurface, DS-SUR005 WidgetWorkspace |
| P4 — AI grammar | DS-S006 supplier-neutral contracts → DS-AI001..006; assistant-ui/AI-SDK/CopilotKit evaluated only for measured runtime roles | K4 Lane B | 6 AI families, DS-SUR006 AIWorkspace |
| G — Candidates canary | Slice 1: `/candidates` list (after P1); then overview, record, journey, matching, compare, details; app exceptions migrated to public slots, each removal documented | P1–P3 | APP-C001..007 (canary evidence, not denominator artifacts) |

Pattern/surface score bar stays 95. The 15 cross-product + 6 surfaces + 6 AI
artifacts are certified in these waves, taking the basket from ~88 to as high
as **115–119/119 (96.6–100%)** in the expected case; a realistic program
landing is 90–105/119 (**75.6–88.2%**) with Tour/Transfer-class deferrals.

---

## 5. Expected percentage progression

| Checkpoint | Primitives (of 92) | Basket (of 119) |
| --- | --- | --- |
| Today | 14 = 15.2% | 14 = 11.8% |
| K0 done | 14 = 15.2% | 14 = 11.8% (F2 closed; hygiene locked) |
| K1 done | 32–35 = 34.8–38.0% | 32–35 = 26.9–29.4% |
| K2 done | 47–53 = 51.1–57.6% | 47–53 = 39.5–44.5% |
| K3 done | 62–71 = 67.4–77.2% | 62–71 = 52.1–59.7% |
| K4 done | 76–88 = 82.6–95.7% | 76–88 = 63.9–73.9% |
| P1–P4 done | up to 92 | 90–105 = 75.6–88.2% realistic; 115–119 possible |

A "meaningful majority" (≥ 50% of the basket) is reached at **K3 close** in
the expected case and still in the conservative case (52.1%).

---

## 6. Exact proposal for the next implementation tranche

**Tranche = K0 + K1**, one implementation prompt, gated as follows:

1. K0 items 1–5 (F2 proof, baseline re-lock, doc hygiene, ledger decision
   prepared, TV acceptance evidence). Codex closes OLA 5 by inspection.
2. Lane D scaffolding: standardized per-family fixture + matrix generator on
   the K0 density-swept probe; storybook matrix helper; SIGHTED-REVIEW
   artifact template.
3. Lane A (5 identity families) → merge, gates.
4. Lane B (8 text/boolean families) → merge, gates.
5. Lane C (8 feedback families) → merge, gates.
6. One aggregate serial validation, one showroom production build, one batch
   Codex Pass 1 + Pass 2 review with the standardized matrices; Codex
   certifies per family; ledger and percentages move only then.

Every family ticket uses the runbook header, begins by falsifying its
premise, and names its paint owner. No Candidates work in this tranche.

---

## 7. Open questions requiring user/Codex approval

1. **Denominator**: add `SemanticSurface` as the 93rd public family (with a
   certification row) or formally exclude it? Approve deletion of dead
   `MaterialSurface`.
2. **DS-CAN009**: which Modal becomes canonical (recommendation: consolidate
   behavior in one owner, keep the compound API as the compat surface) — and
   the migration/deprecation rule.
3. **DS-S002 authorization**: permission to install `react-aria-components`
   and `@base-ui/react` in isolated spike scope (the only new dependencies in
   this plan), and the tie/sub-85 fallback (keep bespoke, fix red tests).
4. **Batch certification process**: approval of the standardized evidence
   matrix + in-repo SIGHTED-REVIEW artifact as Codex's per-wave review input,
   replacing narrative wave handoffs for family waves.
5. **VoiceInputButton**: certify in K4 Lane B (rebuild evidence from zero) or
   move to the P4 AI wave?
6. **Visual-baseline platform**: keep the committed canon darwin-only, or
   record Linux baselines once in CI (fail-closed vs self-certify tradeoff)?
7. **i18n pluralization**: add `Intl.PluralRules` support to the formatter
   layer in K0/K1-prep, or defer to a dedicated i18n ticket?
8. **First-party recipe profiles**: approve selecting `recipes.profile` in the
   rottay/bithire/evnto `BrandTheme`s (the audit's flagship white-label
   activation gap) — and which profile each vertical gets.

---

*Prepared by Kimi as audit input. Codex reconciles, the user approves, and a
separate implementation prompt authorizes execution.*
