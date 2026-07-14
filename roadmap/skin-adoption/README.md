# Skin-adoption working papers

The durable artifacts of the WO-SKIN lane. They live here, in the repo, because
a batch's contracts and inventories are the only thing that makes a dead agent's
work resumable — and a session scratchpad does not survive the session (one was
purged mid-batch on 2026-07-13, costing an hour of reconstruction).

| File | What it is |
| --- | --- |
| [migration-kit.md](./migration-kit.md) | The playbook every migration agent follows: skin homes, entrypoint wiring, selector idioms, verification order. Written during WO-SKIN-02. |
| [migration-kit-addendum.md](./migration-kit-addendum.md) | The pickers-checkpoint addendum to the kit. |
| [wo-skin-03-contracts.md](./wo-skin-03-contracts.md) | WO-SKIN-03's per-checkpoint design contract (the decisions a migration agent may not re-litigate). |
| [wo-skin-03-status-inventory.md](./wo-skin-03-status-inventory.md) | Per-component paint map, status family. |
| [wo-skin-03-overlays-inventory.md](./wo-skin-03-overlays-inventory.md) | Per-component paint map, overlay family. |

The normative authoring law is not here — it is
`docs-engineering/engineering/design-system/runtime/skins/README.md`, and the
public part vocabulary is
`docs-engineering/engineering/design-system/runtime/skins/data-part-contracts/README.md`.
These files are working papers: they record what a batch decided and what its
code looked like going in, not what a skin author must obey.

## The pipeline a batch runs

1. **Inventory** (one agent per component family, read-only) — the paint map.
2. **Contract** (orchestrator) — the decisions: skin homes, what stays inline
   (runtime paint), which mechanisms are preserved verbatim, which suppressions
   must survive.
3. **Pre-step** (inert) — anatomy stamps, torture-page section, visual spec,
   contract test. Zero paint moves. Baselines are recorded from the PRODUCTION
   build and re-run once for stability, then committed.
4. **Migration** — paint moves into unlayered skins. Byte-exact by construction:
   the committed baselines are the gate.
5. **Certification** (orchestrator) — `engine-token-audit --check`, both
   typechecks, the family's unit suite, the full visual suite, and at batch close
   the full core suite against the standing failure ledger.

Checkpoints pipeline: one build cycle can serve [cert N] + [record N+1]. The
build is a singleton — never run two concurrently.

## Laws this lane has paid for

- A skin that does not **parse** loads no rules, and nothing else in the chain
  notices (the counter reads TSX, `tsc` does not read CSS, jsdom does not read
  stylesheets). Gate: `skins.parseErrors`, exact-0.
- A skin that is written but never **imported** paints nothing, just as silently.
  Wire every new skin into BOTH `tokens/css/foundation/base.css` (which feeds the
  per-tenant bundles the apps load) and `tokens/css/entrypoints/styles.css`.
- `data-part` is a shared **vocabulary**, not an identifier. Any selector — skin,
  test probe, or tenant CSS — must be anchored to the component's scope class.
- Scope classes must be grep-verified free tokens, across CSS *and* CSS-in-JS.
- `personality.css` is **layered**; an unlayered skin outranks it regardless of
  specificity. Suppression therefore survives a migration by construction. The
  hazard is the inverse: silently killing a personality rule that legitimately
  wins today (see the two hard runtime constraints in the data-part contract doc).

## Selector law (hardened after seven incidents)

`data-part` is a shared VOCABULARY. Every migrated component stamps `root`/`icon`/`label`/…, so a
selector that reaches for a part without saying WHOSE part it is will eventually match a component
it was never written for.

**Anchor every rule to the component's own scope class.** Then, inside that scope:

- Prefer a DIRECT-CHILD chain (`>`) over a descendant hop. `.rottay-x[data-part='root'] > [data-part='body'] > [data-part='title']` cannot escape into a composed child; `.rottay-x [data-part='title']` can.
- A DESCENDANT hop is only safe when no component X composes also stamps that part. Audited
  2026-07-13: the shipped skins' descendant hops (Modal's `description`, AlertDialog's `icon`,
  Message's `icon`) do not currently collide — but that is a property of today's composition, not of
  the selector. If you add one, say in the skin header WHY it cannot escape.
- **Never require a `data-part` on a component a parent may re-stamp.** SelectionPreviewRail passes
  `data-part="identity-title"` to the `Text` it composes; Typography's skin required
  `[data-part='root']`, matched nothing, and the text inherited white. A component that can be
  COMPOSED anchors on its CLASS alone.
- The same law binds test queries and visual probes, not just skins. Five of the seven incidents were
  a probe or a suite, not a stylesheet.

The ARC-09 real-engines suites now resolve ownership STRUCTURALLY: a node belongs to the component
under test iff no other `data-part='root'` sits between it and that component's own root. Any new
real-engines suite must do the same.

## A surface owns no DOM (the eighth incident, 2026-07-13)

> **A surface owns no DOM. It owns composition. Its anatomy is therefore carried by the classNames it
> puts on the primitives it composes — never by stamping `data-part` on them.** `data-part` is for
> DOM a component renders ITSELF.

`BaseComponentProps` declares `'data-part'?: string` on **every** component ("Skin anatomy hook"), so
`tsc` accepts the stamp everywhere. But the engines build their DOM props from explicit allowlists,
and several never emit it. Measured, both engines:

| primitive | modern | rustic |
| --- | --- | --- |
| Box, Stack, Flex, Text | forwards | forwards |
| **Grid, Card** | **drops** | **drops** |
| **Button** | **drops** | **forwards** |

So a stamp on a composed `Grid`/`Card` is a **lie in the source**: it reads as anatomy and emits
nothing. `tsc` passes, the paint counter does not read attributes, and a skin rule anchored on it
would simply never match — the same silence as an unparseable or unimported skin, both of which
already needed their own gate. Button is the sharp edge: the stamp EXISTS in rustic and VANISHES in
modern.

**Do not "fix" this by making the engines forward it.** That would let a composing parent OVERRIDE
the primitive's own root part, and 85 shipped skins anchor on `[data-part='root']` — a parent stamp
would silently strip the child's skin, which is the Typography incident mechanized fleet-wide. Filed
as P-79; it needs its own baselines and an answer to "when parent and child both name a part, who
wins?".

Use the class. It is already in the DOM (className forwards on every primitive probed), it costs no
DOM change, and it is what the selector law asks for anyway. Where an anatomy node has no stable
class, ADD one in the surface's own BEM namespace. **Never add a wrapper element to obtain a
stampable node** — that changes the tree, which changes layout, which moves pixels.
