Continue the Rotate quality-reset program across `ui-design-system`, `app-platform`, `app-evnto`, and `app-bithire`.

Read first:

- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/README.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/00-definition-of-done.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/01-baseline-and-root-causes.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/02-rotate-north-star.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/03-visual-system-reset.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/04-shell-and-workspace-ownership.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/05-dashboard-control-room.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/06-data-workspace.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/07-tenant-admin-and-api-architecture.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/08-cross-app-coherence.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/09-guardrails-and-release-gates.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/10-wave-plan.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/TENANT_MODEL.md

Mission:

Take the visible Rotate MVP path from "functional but under-authored" to a truthful flagship quality level.

Do not treat this as a token-expansion task.
This is a product-quality, system-ownership, and contract-honesty program.

Non-negotiable decisions:

1. Bundled first-party verticals are file-first.
2. DB tenants are bounded and DS-first.
3. `appearance.general` is the primary DB customization contract.
4. `appearance.advanced` remains optional and bounded.
5. `brandTheme` remains the richest first-party bundled path.
6. Shell ownership must move into the DS.
7. Rotate should feel premium through hierarchy, proportion, and restraint, not through grids, gloss, and muted microcopy.
8. Do not invent new public contract surface unless it has a real runtime reader.
9. Do not start with a schema migration unless the existing JSONB `whitelabelConfigs.config` path truly blocks implementation.

Execution order:

1. R0 Freeze The Truth
2. R1 Rotate Visual Direction Reset
3. R2 DS Shell Contract
4. R3 Dashboard Control Room Rebuild
5. R4 Data Workspace Rebuild
6. R5 Tenant Admin Normalization
7. R6 Adapter And Public Contract Cleanup
8. R7 Cross-App Coherence
9. R8 Guardrails, Tests, And Docs
10. R9 Final QA And Rubric Re-Score

Mandatory focus files:

Design System:
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/headers/collection/index.tsx
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Card/engines/modern/index.tsx
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Statistic/engines/modern/index.tsx
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx

App Platform:
- /Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/shell-metrics.ts
- /Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/sidebar/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/topbar/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/builder/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/global-filter-bar/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/widget-grid/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/surfaces/users/workspace-config.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/tables/entity-table-workspace/index.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/surfaces/settings/overview.tsx
- /Users/daniel/Developer/Rottay/app-platform/src/lib/tenancy/branding-to-tenant-config.ts
- /Users/daniel/Developer/Rottay/app-platform/src/actions/tenancy/workflows/index.ts
- /Users/daniel/Developer/Rottay/app-platform/src/actions/tenancy/whitelabel/index.ts
- /Users/daniel/Developer/Rottay/app-platform/src/lib/tenancy/get-tenant-branding.ts
- /Users/daniel/Developer/Rottay/app-platform/src/app/api/public/tenant-branding/[slug]/route.ts
- /Users/daniel/Developer/Rottay/app-platform/src/app/api/public/tenant-branding/by-host/route.ts

Cross-app coherence:
- /Users/daniel/Developer/Rottay/app-evnto/src/app/layout.tsx
- /Users/daniel/Developer/Rottay/app-evnto/src/providers/index.tsx
- /Users/daniel/Developer/Rottay/app-bithire/src/app/layout.tsx
- /Users/daniel/Developer/Rottay/app-bithire/src/providers/index.tsx

Execution rules:

1. Prefer moving ownership into the DS over polishing app-local shell code.
2. Prefer fewer stronger primitives and structures over more one-off local surfaces.
3. Prefer bounded authoring contracts over legacy branding blobs.
4. Keep legacy reads only as migration shims.
5. Prefer behavior tests over map/string assertions.
6. Do not overclaim in STOPs.
7. If a touched surface still bypasses its canonical token path, either fix it or document the narrowing honestly in the same wave.
8. If a wave touches docs, tests, and code, update all three in the same wave.

Acceptance bar per wave:

- the touched scope must look materially better in rendered output
- the touched scope must reduce host-vs-DS drift
- the touched scope must have a clearer ownership story than before
- no touched contract field remains inert without explicit narrowing
- tests prove behavior where the change affects runtime

STOP format after every wave:

- wave name
- commit hash
- repos changed
- exact files changed
- exact runtime-visible gains
- exact ownership shifts
- exact contract/adaptor changes
- tests added or updated
- docs updated
- remaining deferrals
- rubric dimensions improved and why

Special instruction for tenancy/API work:

Do not assume a new DB column is required.
Start from the existing `whitelabelConfigs.config` JSONB path and only propose schema changes if the current path cannot support the bounded authoring model cleanly.

Special instruction for Rotate visual work:

Use the screenshots and the playbook diagnosis as hard evidence.
The goal is not "more styling." The goal is:

- stronger hierarchy
- less decorative noise
- better shell ownership
- a dashboard that tells one main story
- a data workspace that feels premium and operational

