# Premium Styling Track

Documentation baseline for the premium styling and token taxonomy track.

## Reading Order

1. `00-glossary.md` -- Frozen vocabulary and source-of-truth model
2. `00-current-role-map.md` -- Current tree classified by role
3. `00-stop-template.md` -- Mandatory STOP format for all waves
4. `01-target-taxonomy.md` -- Target tree, naming rules, current-vs-target comparison
5. `02-customization-model.md` -- Vertical Theme vs Tenant Appearance General/Advanced
6. `03-premium-contract-parity.md` -- Minimum expressive contract for all first-party verticals
7. `04-vertical-style-briefs.md` -- Implementation-grade briefs for rottay, bithire, evnto
8. `05-master-prompt.md` -- Final implementation order and wave definitions for I0-I7

## Canonical Audit Reference

The full audit pack that produced these decisions lives at:
`app-platform/docs/audits/2026-04-10-design-system-premium-styles-and-token-taxonomy/`

Reading order within that pack:
1. 01-glossary-and-source-of-truth-model.md
2. 02-current-state-taxonomy-audit.md
3. 03-target-taxonomy-and-folder-index-rules.md
4. 04-customization-model-vertical-vs-tenant.md
5. 05-premium-contract-parity-matrix.md
6. 06-vertical-style-briefs.md
7. 07-wave-plan-and-audit-checkpoints.md

## Wave Status

| Wave | Scope | Status |
|------|-------|--------|
| H0 | Documentation baseline | Approved |
| H1 | Taxonomy truthfulness | Approved |
| H2 | Customization model definition | Approved |
| H3 | Premium contract parity | Approved |
| H4 | Vertical style briefs | Approved |
| H5 | Claude master prompt | In progress |
| I0-I7 | Implementation | Blocked on H0-H5 |

### Implementation Waves (blocked until H5 approved)

| Wave | Scope |
|------|-------|
| I0 | Inventory and test net |
| I1 | Token taxonomy cleanup |
| I2 | Customization model scaffolding |
| I3 | Parity test harness |
| I4 | Rottay overhaul |
| I5 | BitHire overhaul |
| I6 | Evnto overhaul |
| I7 | Final cleanup and guardrails |
