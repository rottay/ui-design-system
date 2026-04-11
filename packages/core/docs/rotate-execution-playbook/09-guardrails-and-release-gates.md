# Guardrails And Release Gates

## Baseline

- `5.4/10`

## Main Gaps

1. Docs still risk overclaiming what the live product actually does.
2. Tests prove compiler/provider plumbing better than real product behavior.
3. Guardrails do not strongly monitor host-vs-DS boundary drift.
4. Legacy branding-first coverage still survives in places where the model says otherwise.
5. There is no strong fidelity test for visible flagship primitives and shells.

## Required Guardrails

1. Truth pass for docs.
   `TENANT_MODEL.md` must be the canonical story and conflicting prescriptive docs must be reconciled or retired.

2. Host-aware tenancy tests.
   Add app-platform tests proving:
   - bundled tenants short-circuit DB
   - DB tenants normalize to the bounded contract
   - preview/draft uses the same merge rules

3. Modern-engine appearance behavior tests.
   Provider tests should assert rendered behavior, not only root CSS vars.

4. Canonical token fidelity tests.
   High-visibility components such as `Statistic` should fail tests when they bypass their declared token surfaces.

5. Shell ownership checks.
   Add a guardrail that flags growth of app-owned shell math and chrome in top-level hosts.

## Release Gates

Do not call the track complete until:

- Rotate shell is DS-owned
- dashboard and user workspace pass manual visual QA against this playbook
- bundled vs DB tenant behavior is proven in tests
- the admin authoring path uses the intended contract
- the docs tell one truthful story

