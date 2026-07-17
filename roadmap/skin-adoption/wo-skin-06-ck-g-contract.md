# WO-SKIN-06 · CK-G — navigation patterns — design contract

279 sites, 9 files, **five skins**. Inventory: `wo-skin-06-ck-g-inventory.md` — read it fully. It is
rigorous and it falsifies three separate claims made about this cluster. Code beats it on any
disagreement; this contract already updates it in one place (§6).

## Five skins, not one

The triage grouped this cluster as a shared "Menu/palette/switcher vocabulary". The inventory
checked, and there is none: five components, five independent recipes, no shared helper, no shared
constants module. **One token set per component.** If two turn out value-identical, say so and STILL
keep them separate — unification is a later design pass with its own baselines, and flattening two
recipes inside a byte-exact pass is a visual change.

## 1. command-palette — where all the risk is

**Ten LIVE imperative writes** (modern 4, rustic 6). This is the imperative-write concentration of
the checkpoint, and **every one of them is live**: neither engine's rows or input carry any
first-party className, so no CSS selector anywhere can contest them. That is the opposite of the
WO-SKIN-04 Menu precedent, where an injected `!important` rule made the equivalent write DEAD. **The
same mechanism is live in one component and dead in another — never pattern-match, check each write.**

- `modern.tsx:208-209, 257-258` — `onMouseEnter`/`onMouseLeave` write `.style.background` on each
  row, **guarded by `activeIndex !== idx`** so pointer hover does not fight keyboard selection. The
  two result sections (Recent, grouped) repeat the identical row markup, which is why there are four
  writes and not two.
- `rustic.tsx:211-212, 218-219` — item-row hover writes `.style.borderLeftColor` + `.style.background`
  (4 writes). `rustic.tsx:279-283` — input focus/blur writes `.style.boxShadow` on the PARENT element
  to fake an inset focus line (2 writes).

**Transcribe every one; none may simply be dropped.**

**CORRECTION (2026-07-13) — an earlier revision of this contract said "the counter is BLIND to the
`.style.x =` shape". That is FALSE**, and it was corrected only because a migration agent read the
lexer instead of believing the brief. `scripts/lib/inline-paint-counter.mjs:227-240` has an explicit
`.style.` branch counting both the assignment form and `.style.setProperty('paint-prop', …)`. So
command-palette CANNOT reach `inlinePaint: 0` with the hover still inline — the counter is a second
gate on these ten writes, not a blind spot. (What IS blind: `(el.style as any).background = …`, where
the cast sits between `.style` and the property, leaving no `.style.` substring. A different shape.)

**The counter still cannot save you**, and this is the part that matters: it sees *that* a write
exists, never *what it wrote*. Delete a handler and re-add it with the wrong colour, the wrong
fallback, or without the `activeIndex` guard, and the counter reports a clean 0. **So the pre-step
must PIN each of these interactions in a baseline before any paint moves**, in both engines: row
hover, row hover **while a DIFFERENT row is keyboard-selected** (that is what the `activeIndex !== idx`
guard exists for — a `:hover` rule that ignores it lights up two rows at once), and input focus. No
rest shot photographs a hover.

The guard is the subtle part: `:hover` alone re-implements the mechanism WRONG. Use
`:hover:not([data-active])` (or the equivalent on whatever attribute carries `activeIndex === idx`)
so the keyboard-selected row keeps its selection paint while the pointer is over it.

**Zero first-party className in either engine** — the weakest anatomy in the cluster. Mint scope
classes fresh, and **grep-verify each is a FREE token across CSS *and* CSS-in-JS**. A modern scope
class has collided with a legacy rule before and silently shrank a component by 8px.

**It is NOT portaled.** `createPortal` appears nowhere in `patterns/navigation/` (zero hits, all 15
files). Both dialogs use `position: fixed` and stay DOM descendants of the tenant-scoped root. The
brief's portal instruction is void: **do not mint a portal scope class and do not write
`:where(html)`-rooted escapes.** Ordinary descendant selectors from the tenant scope reach every
element in both dialogs.

### The intra-component token split — preserve it exactly

`--ds-command-palette-*` is a real, declared, tenant-themeable namespace with per-tenant overrides
shipping today. **Rustic honors it fully (18 reads). Modern uses it ZERO times** — modern reads
generic `--ds-color-*` / `--ds-surface-*` / `--ds-elevation-*` instead.

So a tenant who overrides `--ds-command-palette-bg` today **changes rustic and has no effect
whatsoever on modern.** That is a live, pre-existing cross-engine theming inconsistency.

**Both vocabularies must survive the migration unchanged.** Writing one skin rule that maps BOTH
engines onto `--ds-command-palette-*` newly makes modern tenant-themeable through a channel it has
never honored — a behavior change. Collapsing both onto modern's generic tokens is the same mistake
in the other direction. **Two token vocabularies, one per engine.** File the inconsistency as a
proposal; do not resolve it here.

### The keyframes

`rustic.tsx:264` injects `@keyframes ds-cmd-backdrop-in` and `ds-cmd-panel-in` on **every render
while open** — counter-invisible (string content), with no dedup guard. Move both into the rustic
skin **once**. Modern has no keyframes at all; do not give it any.

## 2. environment-toggle — the hatch, and the trap inside it

**20 hatch sites** (12 modern, 8 rustic) — the largest hatch concentration in the program. The paint
value is `activeEnv.color`, consumer-supplied config data, so it cannot live in a rule. It rides a
custom property: `--ds-envtoggle-accent`.

**THE TRAP, and the contract decides it so no migration agent has to guess:**

`activeEnv.color + '15'` (`modern.tsx:207`, `rustic.tsx:343`) appends a **two-digit HEX alpha byte**.
`0x15 = 21`, and `21/255 = 8.24%`. It is **not** 15% opacity. The component's own comment says so.
A migration that reads "15" as a percentage and writes
`color-mix(in srgb, var(--ds-envtoggle-accent) 15%, transparent)` nearly **doubles** the tint — a
byte-exactness violation hiding inside what looks like a mechanical hatch conversion.

**The decision: do not do the arithmetic at all.** Emit a SECOND hatch property carrying the
already-concatenated eight-digit value — `--ds-envtoggle-accent-soft: <activeEnv.color>15` — and let
the CSS read it directly. No `color-mix`, no percentage, no rounding, nothing to get wrong. It is
byte-exact by construction rather than by careful arithmetic, and careful arithmetic is exactly what
this program keeps getting wrong.

### `ds-pulse` is dead — RECORD, DO NOT FIX

`rustic.tsx:41`'s `animation: animate ? 'ds-pulse 2s infinite' : undefined` names a keyframe that
**does not exist anywhere in the repo**. The browser silently drops the invalid `animation-name`, so
**rustic's banner dot never pulses.** Modern's does (it uses Tailwind's real `animate-pulse`). That
is a live cross-engine behavioural asymmetry, and `animation` is not a counted channel, so it is
invisible to the ratchet and to any diff.

**If the migration defines `@keyframes ds-pulse` in the new skin, rustic's dot starts pulsing.** That
is a visual change and it is forbidden here. Record it as a proposal; do not fix it.

## 3. workspace-switcher, shortcuts-overlay, and the fifth component

Clean: 100% category A, no hatch, no imperative writes, no DaisyUI, no bridges. shortcuts-overlay is
the simplest thing in the cluster (100% STATIC, zero interaction paint) — but note its docstring
claims DaisyUI usage that the code does not have. Do not act on the docstring.

## 4. Standing laws

1. **The discriminator**: ask WHERE the runtime identifier LANDS. A ternary/map over static tokens is
   STATE-SELECTED → it becomes a `[data-x]` / `:hover` rule. Only a value computed FROM DATA rides
   the hatch. `activeEnv.color` lands in the paint value ⇒ hatch. `idx === 0 ? radiusA : radiusB`
   only SELECTS ⇒ rule.
2. **Anchor every rule to the component's own scope class.** Never a bare `[data-part='x']`. Prefer
   direct-child (`>`) chains. Never require a part on a component a parent may re-stamp.
3. **P-79**: `data-part` on a composed `Grid`/`Card` emits NOTHING (and on a `Button`, only in
   rustic). Use a className there. **Never add a wrapper element to obtain a stampable node.**
4. **A later object key silently overwrites an earlier spread** (P-78). Grep the object before
   lifting a key out of it.
5. **Border shorthands over maybe-undefined tokens are ATOMIC.**
6. **The counter is not the coverage checklist — the INVENTORY is.**

## 5. Pre-step coverage

- Torture section `?navigation=1`, own `data-testid` root, per-component Stack testids.
- Fixtures for every keyed state: `activeIndex` (selected vs not), each env in the toggle, open/closed
  dialogs, the two duplicated result sections, empty states.
- Spec `navigation-batch.spec.ts`: 4 rest shots ({rottay,bithire} × {modern,rustic} × w1280) **plus a
  pin for every one of the ten imperative writes** — row hover (both engines), **row hover while a
  DIFFERENT row is keyboard-selected** (the guard), and input focus (rustic). **Never
  `waitForTimeout` after a hover** — use `waitForSettled`.
- Contract test: every part and state attribute reaches the DOM, and every stamp survived the
  primitive it sits on.

## 6. The inventory's counter blind-spot report is STALE — do not chase it

§1 reports a "new blind-spot class": `background: active ? color : 'transparent'`, where a parameter
is literally named `color`, causing the lexer to read the ternary's own colon as a second key and
inflate `environment-toggle/engines/rustic/index.tsx` from 48 to 50.

**That bug is fixed.** The ternary-colon guard landed on 2026-07-13, and the counter now reports
`environment-toggle/engines/rustic/index.tsx: 48` — the true count. Verified by running it. The inventory
was written against the older counter. **Expect 48, not 50, and do not go looking for a 2-site delta.**

Everything else in the inventory's counter discussion still stands: it remains blind to string
contents (`@keyframes`, per-instance `<style>` tags), to `.style.x as any =`, and to SVG presentation
attributes. **Reconcile your hand count against it and REPORT THE DELTA** — four counter bugs have
been found, and every single one was caught by an agent hand-counting a file and disagreeing.
