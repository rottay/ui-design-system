# Reach program — make a tenant's decision arrive at the screen

## The single direction

> Every axis a family paints must be reachable from the three tiers that already exist,
> and where it is not, the reader is ADDED.

No new architecture. Standard / Pro / Expert stay exactly as they are. The work is additive:
wire readers, never remove channels. Retirement is the exception and requires death-proof —
evidence that the reader was deliberately struck, not merely missing.

## The measurement

```
node packages/core/scripts/tenant-reach-census.mjs
node packages/core/scripts/tenant-reach-census.mjs --tenant=bithire --detail
```

It asks, from the tenant's side: for every property this tenant sets, how many files read it?
Every other gate in this repo measures from the token's side and can pass while the product
looks identical under every tenant.

### Baseline, 2026-08-10

| tenant | declared | reach nothing | compiler chain | reach 1-2 files |
|---|---:|---:|---:|---:|
| bithire | 1283 | 245 | 27 | 556 |
| rottay | 1143 | 418 | 13 | 462 |
| evnto | 422 | 84 | 12 | 170 |
| themanagement (DB) | 35 | 2 | 0 | 9 |

**801 of BitHire's 1283 decisions move two files or fewer.**

### By dimension — BitHire

| dimension | set | reach nothing | reach 1-2 | best |
|---|---:|---:|---:|---:|
| color | 137 | 27 | 31 | **267** |
| text | 33 | **29** | 2 | 3 |
| tint | 25 | **22** | 3 | 1 |
| detail | 15 | **15** | 0 | 0 |
| list | 14 | **14** | 0 | 0 |
| tall | 11 | **11** | 0 | 0 |
| badge | 65 | 14 | **51** | 2 |
| button | 95 | 9 | **52** | 9 |
| collection | 18 | 9 | 4 | 4 |
| table | 40 | 6 | 19 | 5 |
| command | 34 | 5 | 29 | 2 |
| input | 135 | 4 | 37 | 20 |
| surface | 33 | 9 | 11 | 106 |

Colour is the one axis that genuinely lands. That is the mechanical reason two tenants on one
tree read as the same company: the art-direction contract asks for at least six NON-colour
divergence axes, and the corpus cannot carry them.

## Waves

Ordered by damage. Each wave owns FILES, not dimensions, so lanes are provably disjoint —
write boundaries come from `family-ledger.json` (`writeRoot` / `writeExcludes` / `skinFiles`),
never from guessing a name. Four of the 252 skin locations exist: the modern engine tree, the
shared presentation tree, `presentation/components/*.css`, and co-located beside the component.

### W1 — in flight

| lane | owns | target |
|---|---|---|
| type-roles | Typography family + shared type CSS | 29 `--ds-text-*` from 0 readers |
| status-tints | alert, badge, tag, callout, message, notification, toast, result | 22 `--ds-tint-*` from 0 readers |
| family-chrome | the owners of `detail-*`, `list-*`, `tall-*` | 40 channels, three families inert at 100% |
| structure-material | the 15 structures that read no elevation | material/depth as a real divergence axis |

### W2 — the thin majority

`badge` 51 thin, `button` 52, `input` 37, `command` 29, `table` 19, `card` 19. These are not
unreachable, they are *narrow*: configurable in dozens of ways, each moving one or two files.
A per-family sweep raising reach, same method.

### W3 — the other two tenants

`rottay` has 418 unreachable and `evnto` 84. Same census, same method. Evnto's static theme is
396 lines against BitHire's 1412 — it can express markedly less through the same system, which
is its own finding.

### W4 — deepen The Management

35 declared against BitHire's 1283. Divergence has a ceiling set by the thinner side: you cannot
differ on an axis one side cannot express. Deepen it through the existing Expert exact route,
which it already uses well (`--ds-radius-sm/md: 0px`, hard offset shadows, glass forbidden).

### W5 — prove the divergence

Both tenants, identical scenes, at 280/320/390/768/1440. Count observable axes and non-colour
axes. The contract's floor is 8 and 6, surviving greyscale. This is the number that says whether
the system is world-class, and it cannot be claimed before W1-W4 move.

### W6 — UX and craft

Only once the chain arrives. Kimi proposes inside `KIMI-ANNOTATIONS/inbox`, never implements;
each proposal is adjudicated before it touches code. Structures and surfaces first — the layer a
human reads as "a different company".

## What W1 established, and what the census cannot see

W1 wired 13 tint channels, 14 detail/list channels and typography's weight and display leading,
and filed 26 retirement candidates with evidence. It also found three defects the census could
not have found, because the census asks whether a channel LANDS, not whether it lands CORRECTLY:

- rottay's primary tint scale rendering `#CCDCCA`, a green-grey, where its brand theme specifies
  blue — on live consumers. The OKLCH ramp interpolates hue as an angle, so a ground with any
  chroma at all drags a tone across the wheel.
- Five BitHire surfaces painting nothing, because `color-mix()` was handed a gradient and the
  whole declaration was dropped. Plus the widget-board error region, blank under every tenant.
- BitHire authoring an eleven-field `tallCard` block that cannot reach a pixel, because no element
  with that class has ever existed.

**The census measures files, not screen.** Typography's roles were not unread — they were
UNROUTED, reaching only the 23 callers that passed `textStyle` and none in app-bithire. Wiring
them moved the token count by one and the rendered element count from roughly nothing to 8534. A
channel with one reader and a channel with one reader that paints half the product are the same
number here. Read the thin column as a question, never as damage.

**A channel reading zero may be deprecated rather than unwired.** `--ds-text-*` showed 29
unreachable names and is classified debt-until-retired; a DB tenant writing it is rejected
fail-closed. The sanctioned channel is `--ds-type-*`, which derives from the Standard type-scale
control. Check that a channel is SANCTIONED before treating its zero as work.

## What a token cannot carry — the second axis, measured

A token carries a VALUE. Some of what separates one product from another is not a value, so the
question is what the non-value axis actually reaches. Audited 2026-08-10:

**Values: yes. Structure: yes, but enumerated and small. Composition: no.**

- **Anatomy is real and gated.** Four families, ten non-default variants, every one selected by CSS
  in both modern and rustic, zero stamped-but-unselected attributes. `anatomy-variant-gate`
  enforces both directions and fails closed, so the class cannot silently rot. Card frame
  (framed/underline/ghost) and table rules (ruled/zebra/open) are genuine structural change.
- **One variant is oversold.** Sidebar `rail` sets `inline-size`, but `Layout.Sider` writes `width`
  as an always-present INLINE style, which beats any stylesheet rule — so the rail does not narrow
  the sidebar. Nothing anywhere hides labels; the contract's "narrow icon-first rail with flyout
  labels" is prose, not mechanism. Item padding, gap and alignment do land.
- **The six "recipe groups" are per-family defaults wearing the word group.** Each changes exactly
  one family, which fails the test that a group must span more than one. A tenant selects one of
  THREE published profile ids; it cannot author per-family recipe values. Three of the six are
  modern-only.
- **Emphasis does not exist.** `quiet | balanced | assertive | hero` appears only in
  `customization-model.json` as a target. There is zero code. The `data-emphasis` that does exist
  is an unrelated app-prop vocabulary on SemanticSurface. Do not plan around it as if it ships.
- **`responsive.posture` is data-only** — a closed three-id enum emitting no CSS channel, with one
  consumer in the widget-board solver. It does not restructure pages.

**The six-non-colour-axis bar is already met.** Type, geometry, edge/divider, material/depth,
density/rhythm and icon posture are all reachable and all survive greyscale. Icon posture is the
cleanest example of the second axis: four postures select per-role glyph WEIGHT through a policy
table, live in RSC, client and SSR, with state weights staying supreme.

So two recognisably different products are achievable once the plumbing lands. Two differently
STRUCTURED products are not, and true composition — adding, removing or reordering parts — belongs
to the app's surface config rather than the tenant document.

## The four rules, each earned by a lane

1. **A dead channel may take an ungoverned property; it may not displace an authored one.** And a
   value carries a tenant decision by ANY route, including a dial it derives from — a pass-through
   to `--ds-type-scale` is still a decision. The rule protects authorship, not DS-local formulas:
   joining a channel twenty siblings already read is consistency, not displacement.
2. **"The element declares nothing" is not "the element renders nothing."** An inherited value is
   an authored value with a different owner, so the equality test is against the COMPUTED value.
   `font-variant-numeric` resolving `normal` everywhere reads as free equality and is a trap — the
   real value arrives by inheritance from containers setting `tabular-nums`, and an inline
   declaration on the child outranks it.
3. **An interpolated token name is invisible to every gate here.** `var(--ds-text-${role}-size)`
   reads as ZERO to the reach census, engine-token-audit, the hooks manifest and the customization
   report, all of which match `var(--ds-…` in source. Spell names literally in a channel table.
   The blind spot under-reports, so it licenses debt.
4. **A number that moves without the screen moving is worse than a number that does not move**,
   because it teaches everyone to stop trusting the number. Two lanes reverted their own wiring on
   this ground after finding both chains resolved identically.

## Verification standards this programme now expects

- **Zero-delta with a negative control.** Collapse every `var(--x, FALLBACK)` to its fallback and
  compare byte-identically against the pre-wave commit — then INJECT a divergence and confirm the
  drill names it. A drill that has never been seen to fail proves nothing.
- **Attribute a shared-tree gate failure by re-running, never by reading the diff.** Clean detached
  worktree of HEAD, three combinations: pristine, plus-yours, plus-theirs.
- **A gate must assert a floor on its own corpus.** A gate that scans nothing passes everything;
  fix the path, never lower the floor. This failure mode appeared three times in one day.
- **Prove paint in a browser, not in a parser.** "It parses" says nothing about an invalid
  `color-mix()`: invalid CSS neither throws nor fails a snapshot.

## Standing rules for every lane

- Additive. Add readers; never remove a channel to move a number.
- The current default must not change by one pixel. A tenant that sets nothing sees exactly what
  it sees today. Verify it, do not assume it.
- Do not invent paint to satisfy a census. A family that is genuinely flat states WHY —
  `quality-rubric.json` is explicit that silence is not an invariant.
- No new public `--ds-*` from a family lane. No tenant selector, no tenant conditional TSX.
- Never hand-edit `styles/**` or `dist/**`; the coordinator regenerates them.
- A state channel must not resolve to the element's resting value.
