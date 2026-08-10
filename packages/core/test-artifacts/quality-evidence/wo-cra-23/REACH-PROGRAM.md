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

## Standing rules for every lane

- Additive. Add readers; never remove a channel to move a number.
- The current default must not change by one pixel. A tenant that sets nothing sees exactly what
  it sees today. Verify it, do not assume it.
- Do not invent paint to satisfy a census. A family that is genuinely flat states WHY —
  `quality-rubric.json` is explicit that silence is not an invariant.
- No new public `--ds-*` from a family lane. No tenant selector, no tenant conditional TSX.
- Never hand-edit `styles/**` or `dist/**`; the coordinator regenerates them.
- A state channel must not resolve to the element's resting value.
