# Mandatory Single-Authority Audit Protocol (Round 3, draft for official doc)

Status: DRAFT authored 2026-07-27 by Claude (orchestrator); final text lands in the official
audit document under "Round 3 — Static theme provenance and dual-authoring correction".

## The rule

No future audit, gate report, or architecture document may assert "single source of truth",
"single authority", "sole owner", or any equivalent for a channel (CSS custom property, DOM
attribute, config value, locale, token) unless it demonstrates ALL SIX properties separately,
each with its own evidence:

1. **Author uniqueness** — exactly one authorized place declares the semantic value.
   Evidence: enumeration of every file that textually declares the channel, with each
   non-canonical declarant either absent or explicitly subordinated.
2. **Emitter uniqueness** — no two compilers/bridges/build steps emit the same channel
   without explicit, documented coverage of the split.
   Evidence: pipeline map listing every emitter that can produce the channel in any shipped
   artifact or runtime path.
3. **Writer uniqueness** — no two runtime writers (SSR, client provider, effect, script)
   write the same element/channel.
   Evidence: writer census for the channel's target (element attribute, style property).
4. **Precedence correctness** — the cascade/merge order makes the declared owner win, shown
   with the actual selectors/layers/specificity, not assumed from file order.
5. **Behavioral propagation** — changing the canonical source produces an observable change
   in the shipped output/runtime. A source whose edits do not propagate is not a source.
6. **Negative drill** — deliberately introducing a second author/emitter/writer makes a
   guard/gate FAIL. A green gate that has never been shown to fail on a planted violation
   certifies nothing about authority.

A certification that demonstrates only #4 (a deterministic runtime winner) while omitting
#1–#3 is exactly the error that produced the Round 3 correction: the browser having a
deterministic winner does NOT demonstrate a unique authority.

## Accompanying laws

- **L1 — No grep as semantic evidence.** When an AST/parser is available (postcss, TS
  compiler API, tinycss2), name-level grep may scope the search but may not be cited as
  final evidence for declarations, selectors, or contexts.
- **L2 — No "duplication" from name intersection.** An intersection of names is a candidate
  list. Calling anything duplication (or contradiction) requires classifying selector,
  at-rule context, reachability, and value equality per declaration.
- **L3 — "Generated" is not "single-source".** An artifact carrying a generated header may
  still concatenate hand-authored sections. Provenance must be traced per-section, not
  per-file.
- **L4 — Deterministic output ≠ correct ownership.** Reproducible builds (`--check`-style
  byte comparisons) prove reproducibility of the composition, including reproduction of any
  embedded contradiction.
- **L5 — No total without denominator and method.** Every count published in an audit must
  name its denominator, extraction method, and the evidence file from which it can be
  recomputed.
- **L6 — UNKNOWN never becomes PASS.** Unverified claims are carried as UNKNOWN with what
  evidence would resolve them.
- **L7 — Vertical trace mandatory.** Every broad audit must include at least one full
  vertical traceability chain: source → compiler → artifact → bundle → DOM/computed style,
  for at least one concrete channel, with file:line at each hop.
