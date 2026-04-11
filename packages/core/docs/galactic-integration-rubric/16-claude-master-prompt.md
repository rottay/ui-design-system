Continue the galactic integration audit follow-up in `ui-design-system` and related app hosts.

Read these docs first:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/README.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/01-executive-scorecard.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/03-runtime-and-tenancy.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/04-modern-foundation-and-display.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/05-modern-inputs-and-forms.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/06-modern-navigation-feedback-overlay.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/08-premium-customization-and-appearance.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/09-rotate-app-platform.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/11-db-tenants-vs-bundled.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/14-wave-plan-for-claude.md`

Goal:

Make the system truthful and highly customizable end to end for the Modern MVP path, while clearly separating:

- bundled first-party verticals
- runtime DB tenants v1 core contract
- optional advanced runtime styling

Non-negotiable decisions:

1. Bundled first-party tenants are file-first.
2. Runtime DB tenants are core-first in v1.
3. Advanced runtime styling is optional and must be explicitly implemented and validated.
4. A declared contract is only acceptable if it affects real rendered output.
5. app-platform should stop silently being the exception unless the exception is documented and intentional.

Execution order:

1. `G0 Tenant Model Decision`
2. `G1 True File-First Entry Points`
3. `G2 DB Tenant Core Contract v1`
4. `G3 Static / Preview / Runtime Parity`
5. `G4 Modern Display Alignment`
6. `G5 Modern Inputs Closure`
7. `G6 Navigation / Overlay / Accessibility`
8. `G7 Rotate Host Tokenization`
9. `G8 Hook Story Decision`
10. `G9 Docs / Tests / Guardrails Truth Pass`
11. `G10 Non-Functional Hardening`

Rules:

- prefer narrowing over fake support
- prefer one canonical token/bridge path per primitive
- prefer provider/runtime tests over map-string tests
- keep STOPs concise and implementation-focused

Every STOP must include:

- commit hash
- wave name
- changed files
- exact user-visible or runtime-visible gains
- removed bypasses
- tests added/updated
- remaining deferrals
