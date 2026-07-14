# WO-SKIN-06 · CK-A — dashboard widgets — design contract

439 sites, 10 files. **Unblocked 2026-07-13** (see §1). Inventory:
`wo-skin-06-ck-a-inventory.md` — it is the most thorough in the program; it ran an instrumented
clone of the counter to locate every site, and it resolved the variant trap itself. Code beats it on
any disagreement.

## 0. The one place in this program where sharing is REAL

Six clusters in a row falsified the triage's "shared vocabulary" premise, and the standing law became
**one token set per component**. CK-A is the exception, and it is worth being precise about why:
`dashboard/metrics/tokens.ts` exports 48 tokens that all four metrics variants **import cleanly**.
That is not similarity — that is a module with importers. It is the only genuine shared vocabulary
found in 3,582 sites.

**So metrics gets ONE token set, and it is the right call.** The law was never "never share". The law
is **measure, then contract** — and it cuts both ways. In CK-C a capability was assumed shared and
was not. In CK-A's own §7.1 a capability was assumed missing and was already there. Grep for
importers before you decide either way.

## 1. Variant pinning — RESOLVED, there is nothing to build

The plan carried CK-A as BLOCKED on a "variant-pinning harness". There is no harness.

`data-terminal-card/index.tsx:862-866` gives an explicit prop precedence over the random pick:

```ts
const variant = useMemo(() => {
  if (propVariant) return propVariant;       // an explicit prop WINS, deterministically
  if (contextVariant) return contextVariant; // DataTerminalCardProvider pins a whole page
  return getPageVariant();                   // only then the random/SSR-mismatched fallback
}, [propVariant, contextVariant]);
```

- **`data-terminal-card`** — mount four instances, `variant={1}` … `variant={4}`. All four bodies
  (`CommandCard`, `HUDCard`, `CircuitCard`, `MatrixCard`) are reachable through the switch. The prop
  is the ONLY door: the four bodies are not exported.
- **`dashboard-insights`** — different shape, and the difference matters. Its **8 renderers are
  individually exported and directly mountable**, and no composite wrapper ships. The spec imports
  and mounts all 8 leaves directly. **Do NOT wire up its `useVariant` hook to "cover" them** — the
  hook has ZERO callers, so its `Math.random()` trap is inert. Wiring it up would create the very bug
  it looks like it has.

**P-77 is untouched by any of this and must not be "fixed" here.** `getPageVariant()` returns 1 on
the server and rolls `Math.random()` on the client, so every unpinned `DataTerminalCard` hydration-
mismatches in every SSR app shipping today. Pinning the fixture makes the BASELINE honest. It does
not make the PRODUCT correct. That is a separate work order with its own baselines.

## 2. `TYPE_CONFIG` — three byte-identical copies and one that diverged

All four `dashboard-insights/activity/*` files define their own local, non-imported `TYPE_CONFIG`
over the bounded 5-value `ActivityItem["type"]` enum. `ticker`, `timeline` and `compact` are
byte-identical. **`cards` uses a 90-degree gradient angle where the other three use 135.**

That is real, visible paint — the accent bar's gradient direction — not a naming difference.

**One token set for the three; `cards` keeps its 90deg as its own value.** Flattening it onto 135deg
is a visual change and is forbidden in a byte-exact pass. If you are tempted, re-read this paragraph:
the whole reason this cluster is cheap is that someone measured the four copies instead of assuming
they matched.

`TYPE_CONFIG[item.type]` is the textbook static-map index → **STATE-SELECTED** → it becomes
`[data-type='success'|'primary'|'info'|'warning'|'error']`.

## 3. The string-concatenated token names — a gate blind spot, in every file

All four files ALSO build token names by string concatenation, a **second, independent mechanism for
the same enum**:

```tsx
background: "var(--ds-color-" + item.type + "-100)"
border:     "var(--ds-color-" + item.type + ")"
color:      "var(--ds-color-" + item.type + ")"
```

Sites: `ticker:96,97,102,114`; `timeline:39,40,42,47,51` (`:42` is a concat nested inside a ternary);
`compact:40,41,46,50`; `cards:40,41,46,50`.

**A naive grep for `var(--ds-` finds none of them.** Any token-coverage check you run will report
these files as cleaner than they are. They are all category A — the enum is the same bounded 5-value
type — and they migrate into the SAME `[data-type=…]` selector family as the `TYPE_CONFIG`-indexed
sites. Do not invent a second mechanism in CSS for what is one mechanism in the data.

## 4. `color: "white"` — migrate it verbatim. Do not fix it.

All four files hardcode the unread-badge count text to the literal `"white"` (`ticker:71`,
`timeline:66`, `compact:64`, `cards:64`) — a real, live violation of the repo's "No Hardcoded Colors"
rule, replicated by copy-paste rather than arrived at independently.

It is STATIC. **It migrates to the skin verbatim, as `white`.** A byte-exact pass may not fix a
defect, however small and however much it offends the linter. Fixing it is a visual change with no
baseline behind it. File it; do not touch it.

## 5. Standing laws

1. **The discriminator**: ask WHERE the runtime identifier LANDS. `TYPE_CONFIG[item.type]` and
   `"var(--ds-color-" + item.type + ")"` both only SELECT among author-time tokens ⇒ STATE-SELECTED
   ⇒ a `[data-type=…]` rule. Neither is RUNTIME.
2. **P-79**: `data-part` on a composed `Grid`/`Card` emits NOTHING (and on a `Button`, only in
   rustic). Use a className there. **Never add a wrapper element to obtain a stampable node** — it
   changes the tree, which changes layout, which moves pixels. **The contract test must assert every
   stamp reached the DOM.**
3. **Anchor every rule to the component's own scope class.** Never a bare `[data-part='x']`. Prefer
   direct-child (`>`) chains. Never require a part a parent may re-stamp.
4. **A later object key silently overwrites an earlier spread** (P-78). Grep the object before
   lifting a key out of it.
5. **A numeric literal glued to a colour is an ALPHA BYTE, not a percentage.**
6. **Border shorthands over maybe-undefined tokens are ATOMIC.**
7. **The counter is not the coverage checklist — the INVENTORY is.** Reconcile your hand count
   against it and REPORT THE DELTA.

## 6. Pre-step coverage

- Torture section `?dashboard=1`, own `data-testid` root.
- **Four `DataTerminalCard`s, `variant={1..4}`** (§1) — otherwise three of the four bodies are never
  photographed and the migration is uncertified for them.
- **All 8 `dashboard-insights` renderers mounted directly** as leaves (§1).
- Every `ActivityItem["type"]` value (all five) in every one of the four activity files — the whole
  `TYPE_CONFIG` and concat surface keys on it, and an unrendered enum value is an unphotographed rule
  (P-80).
- Hover states wherever `isHovered` drives paint (`timeline:42`'s nested concat-in-ternary is one).
  **Never `waitForTimeout` after a hover** — use `waitForSettled`.
- Contract test: every part and state attribute reaches the DOM.
