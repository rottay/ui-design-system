# WO-SKIN-03 — feedback batch — design contracts (Fable, 2026-07-13)

Two pipelined checkpoints. ALL standing laws apply (lane doc + the five inputs-batch laws in
memory: free-token scope classes grep-verified; atomic border shorthands over maybe-undefined
tokens; per-engine popup/hook classes; ReactDOM undefined-removal reproduced explicitly;
clock-pinned specs for time-dependent paint; reinstall-solo; no pipes on gates; pixel-scan/CDP
diagnosis kit). Inventories: scratchpad/skin03-{status,overlays}-inventory.md — code over
inventory on any disagreement.

## Checkpoint S — status family (Skeleton 48/10f, Alert 28, Progress 18/4f, Spinner 13, Rate 9)

1. Skin homes per file kind (engine files -> engines/*/skin/<comp>.css; the 8 Skeleton compounds +
   Progress compounds -> components/skin/<comp>-compounds.css, agnostic).
2. **Skeleton's 4-way animation split is PRESERVED mechanism-by-mechanism**: modern stays
   DaisyUI-owned (uncounted classes stay); rustic's local pulse (bottom 0.4) moves into the rustic
   skin RENAMED ds-skeleton-pulse-rustic (the DEAD ds-skeleton-pulse at 0.5 in rustic/theme.css is
   LEFT UNTOUCHED — deletion is not migration); compounds keep referencing the global
   skeleton-loading (animation prop inline, exempt). The 4-way split goes in the proposal.
3. **Progress rustic STATUS_COLORS**: transcribe the full var(--undefined, #hex) strings VERBATIM
   (they compute to the hex today and keep the tenant hook); token gap filed. Runtime percent
   fills/stroke stay inline (runtime law); stroke COLOR when status-driven -> data-status rules.
4. **Rate**: hover paint to CSS per engine faithfully (rustic all-state -> :hover rules; modern's
   mixed CSS+state -> consolidate the STATE half into the same :hover/:focus-visible the CSS half
   already uses — same computed result, verify per channel). Per-star runtime color (fractional
   fills) rides '--ds-rate-star-fill' custom-prop hatches stamped per star (quoted keys). Dead
   -color-active/-color-hover vocab left untouched + filed.
5. Alert/Spinner: straight transcription (cleanest files). Spinner rotation keyframes into skins
   renamed if local.
6. Pre-step coverage: torture ?statusfb=1 (every component x variants incl. Rate half-star,
   Progress per status + circle, Skeleton every compound, Alert 4 tones, spinners); spec
   status-batch.spec.ts: 4 rest shots + interaction pins ONLY where paint reacts (Rate star
   hovered x2 engines; nothing else has hover). Contract test both engines.

### Ckpt S addendum (2026-07-13, post-recovery verification)
- **Progress scope class is `rottay-progress-shell` (+`--modern`/`--rustic`)** — the pre-step's
  original `rottay-progress` COLLIDED with live unscoped rules in
  surfaces/pages/experience/oauth-transition/styles/index.ts:678 (display:grid/gap/width/margin —
  injected globally when that surface mounts). Renamed per the ds-select-shell precedent;
  grep-verified free incl. dist. Compound tokens rottay-progress-line/-circle verified free.
  Skeleton/Rate/Spinner rottay-* tokens verified free (css + CSS-in-JS + showroom sweeps).
- Pre-existing BEM mock in Progress/tests/Progress.test.tsx uses bare `rottay-progress__*` — it is
  a test fixture, not paint; left untouched.

## Checkpoint O — overlays (Modal 51/6f, Drawer 42/5f, Toast 47/4f, Message 46, Notification 34, Result 15)

1. **Portal map (grep-verified)**: Modal BOTH engines (shared Portal util); Toast ONLY
   compound/Container; Drawer/Message/Notification/Result NONE. Portaled trees get free-token
   standalone classes (grep-verify!); everything else root-scoped. One overlay vocabulary:
   root/backdrop/surface/header/title/body/footer/close-button/icon/action + data-placement/
   data-tone/data-open.
2. **THE PERSONALITY.CSS SUPPRESSION RULE (the batch's crux)**: personality.css targets
   `.rottay-toast-container > *`, `.rottay-drawer`, `.rottay-drawer-overlay`. Today inline paint
   SUPPRESSES those rules wherever they overlap (dead for modern Drawer, live for rustic blur).
   Post-migration every skin rule replacing that inline paint MUST outrank the personality.css
   rule on the overlapping channels (measure its specificity, escalate per the FFP idiom) — or the
   dead rules come alive. The migration agent MEASURES each personality.css rule and documents the
   floor in the skin header. Rules personality.css legitimately WINS today (rustic blur) keep
   winning — do not out-specificity those channels.
3. **Toast showProgress (rAF + Date.now width loop)**: the WIDTH stays runtime-inline (never a
   counted key — verify; if the loop writes .style.width only, it is layout, uncounted, KEEP the
   loop). Entrance animations: the triple stack (engine fade + container slide + personality rule)
   is preserved exactly — keyframes move into skins renamed per engine where local; the EXTERNAL
   personality rule is left as-is (it is not the component's paint).
4. **Notification 240ms JS vs 180ms CSS exit drift**: real shipping bug — preserve (the migration
   does not touch timers), file in the proposal.
5. **Message/Notification modern stacking container** referencing 6 undefined --ds-toast-* tokens
   (functionally unstyled): transcribe the var() references VERBATIM with their exact fallbacks
   (or lack thereof — atomicity law where they gate shorthands); token gap filed.
6. **Drawer rustic dead transition:transform**: preserved; filed.
7. Pre-step coverage: torture ?overlayfb=1 — Result + inline Toast + Message/Notification
   INSTANCES rendered statically where possible; Modal/Drawer open via the spec (click trigger,
   wait, shoot surface — Modal both engines, Drawer both). Toast Container path: trigger a
   container toast in-page, CLOCK PINNED (playwright clock freezes Date.now + rAF timers, making
   the showProgress bar deterministic — pin to a fixed instant, shoot). Spec overlays-batch:
   4 rest + open shots (modal x2, drawer x2, container-toast x2) + close-button hover pins where
   hover paint exists. Contract test incl. portal-posture pins (Modal outside container both
   engines; Toast Container outside; everything else inside).

## Sequencing
S pre-step (sonnet) -> record+commit -> S migration (sonnet-tier components mostly; opus for
Skeleton+Rate) while O pre-step (sonnet) stamps -> record O -> O migration (opus — the
personality-suppression work) -> batch cert -> publish minor + repin ride-along -> extend
docs-engineering data-part contracts with inputs+feedback vocabularies (owed).
