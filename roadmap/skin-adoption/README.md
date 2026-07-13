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
