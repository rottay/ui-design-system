# DT adjudication — T-0 scope expansion

Authority: Codex DT. Date: 2026-08-21.

## Decision

ACCEPT both measured scope additions in `/private/tmp/f4a-t0-opus-implementation-brief.md` (SHA-256 `d14ca07ba1b3d2cb490629e60c07ef78d7fc7af32a7167137801d2265148a3f1`).

1. Admit `packages/core/src/tooling/lane-control/public/program-state/index.mjs` as path 4. The blocking gate cannot be wired honestly while `gates-tests/flags/index.test.mjs` sees `--check` and `--intent` as phantom flags. The accepted solution is the single consumed `FLAGS` vocabulary described by Opus; no wrapper or second invocation authority.
2. Admit `docs/prompt-codex-continue.md` as path 5. Update exactly the two live operational counters from 88 to 89. Historical receipts remain immutable. This satisfies Fable R-3 and prevents a correct 89-gate result being misread as failure.

The T-0 write-set is exactly five paths. The dirty roadmap remains outside the tranche and must stay byte-identical at SHA-256 `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202` until the tranche is sealed. No other authority, theme, manifest, generated, build, browser, git-index, or repository path is admitted.

Opus must issue a concise v2 brief with `READY_FOR_FABLE_PREAUDIT`; Fable must ACCEPT that exact v2 before any repository write.

## Verdict

ACCEPT — `T0_FIVE_PATH_SCOPE_ADMITTED_FOR_FABLE_PREAUDIT`
