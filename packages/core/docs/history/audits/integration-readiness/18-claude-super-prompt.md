Continue the Design System 10/10 program across `ui-design-system`, `app-platform`, `app-evnto`, and `app-bithire`.

Read these docs first:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/README.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/01-executive-scorecard.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/02-master-rubric-matrix.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/03-runtime-and-tenancy.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/04-modern-foundation-and-display.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/05-modern-inputs-and-forms.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/06-modern-navigation-feedback-overlay.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/07-hooks-surfaces-patterns.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/08-premium-customization-and-appearance.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/09-rotate-app-platform.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/10-cross-verticals.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/11-db-tenants-vs-bundled.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/12-non-functional-quality.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/13-testing-docs-guardrails.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/14-wave-plan-for-claude.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/galactic-integration-rubric/17-10-10-action-plan.md`

Mission:

Raise the system from its current audited state to a truthful 10/10 for the Modern MVP path.

This does NOT mean adding more declared tokens, contracts, or knobs.
It means making the Design System the real source of rendered truth across:

- bundled first-party verticals
- runtime DB tenants
- Modern primitives
- patterns / surfaces / structures
- hooks / runtime integration
- Rotate / app-platform host behavior
- static preview / generator / docs / tests / guardrails

Non-negotiable architecture decisions:

1. Bundled first-party verticals are file-first.
2. Runtime DB tenants are core-first in v1.
3. `appearance.general` is the primary DB styling contract.
4. `appearance.advanced` is optional and explicitly bounded.
5. `brandTheme` remains the richest premium source for first-party bundled tenants.
6. No contract field is acceptable unless it affects real rendered output or is explicitly narrowed/removed.
7. app hosts must stop silently bypassing the DS in visible product styling.

Definition of done:

We only call this complete when all of the following are true:

- bundled tenants no longer hit DB branding by default before file-first resolution
- DB tenant contract is explicit, validated, and reflected in app-platform authoring/UI
- runtime, static generation, and tenant preview tell the same `appearance` story
- high-value Modern primitives each use one canonical token/bridge/render path
- Rotate visibly derives its shell identity from DS-owned styling rather than app-owned overlay styling
- command/search/data/routing/state/notifications/dnd/ai are each either truly fused or clearly narrowed as app-facing
- docs, tests, and guardrails match live runtime behavior
- no "compiled but unread", "declared but inert", or "documented but false" surface remains in touched scope

Execution order:

1. `A0 Tenant model freeze`
2. `A1 True file-first bundled tenants`
3. `A2 DB tenant contract v1`
4. `A3 Static / preview / runtime parity`
5. `A4 Modern display truth pass`
6. `A5 Modern inputs closure`
7. `A6 Navigation / overlay / accessibility`
8. `A7 Rotate host assimilation`
9. `A8 Hook / system story decision`
10. `A9 Docs / tests / guardrails / non-functional closure`

Wave-by-wave intent:

### A0 Tenant model freeze

Decide and document the product model:

- bundled first-party verticals = file-first + premium capable
- runtime DB tenants v1 = core-first
- advanced DB styling = optional, bounded, validated
- `brandThemeId` either implemented end to end or narrowed/removed

### A1 True file-first bundled tenants

Fix `app-platform` route/layout/metadata entrypoints so known bundled tenants short-circuit before DB branding fetch.

### A2 DB tenant contract v1

Upgrade app-platform’s DB adapter and authoring surfaces from legacy `branding/personality/tokenOverrides` to a core-first contract centered on `appearance.general`.

### A3 Static / preview / runtime parity

Make `appearance` work consistently in:

- `DesignSystemProvider`
- static CSS generation
- tenant preview

### A4 Modern display truth pass

Close renderer/bridge/token drift for:

- `Card`
- `Carousel`
- `Image`
- `Statistic`
- `Descriptions`
- `QRCode`
- related `modern/theme.css` bridges

### A5 Modern inputs closure

Close the highest-value gaps in:

- `AutoComplete`
- `DatePicker`
- `TimePicker`
- `TreeSelect`
- `Cascader`
- `ColorPicker`
- `Slider`
- `Upload`

### A6 Navigation / overlay / accessibility

Fix:

- `CommandPalette`
- `ShortcutsOverlay`
- `Link`
- `Breadcrumb`
- `Tabs`
- `Stepper`
- `Steps`
- feedback components with Daisy-first ownership

Bring overlays up to real modal semantics and reduce Daisy ownership where it still governs appearance.

### A7 Rotate host assimilation

Move more visible Rotate shell styling out of app-owned CSS and host geometry and into DS-owned tokens/components.

### A8 Hook / system story decision

For each family:

- commands / search
- data / routing / state
- notifications
- dnd
- ai

Either activate them with real consumers or narrow them clearly as app-facing.

### A9 Docs / tests / guardrails / non-functional closure

Close the truth loop:

- stale docs/comments removed
- provider-level tests added where needed
- guardrails catch contract/runtime divergence
- performance/accessibility/security-adjacent issues addressed

Implementation rules:

1. Prefer narrowing over fake support.
2. Prefer one canonical styling path per primitive.
3. Prefer real provider/render tests over map/string assertions.
4. Preserve public API where practical, but do not preserve misleading surface area.
5. If a host bypass is necessary, document it explicitly in the same wave.
6. If a wave changes the product model, update docs/contracts/tests in that same wave.
7. Do not overclaim in STOP messages.

Every STOP must include:

- commit hash
- wave name
- changed files
- exact user-visible or runtime-visible gains
- exact bypasses removed
- tests added/updated
- remaining deferrals
- whether the wave increased the rubric score and why

Approval bar per wave:

- no declared field in the touched scope remains inert
- no emitted CSS var in the touched scope remains unread unless intentionally removed
- no touched app host still bypasses the intended DS contract without documentation
- tests prove behavior, not only implementation detail

If a wave uncovers a design decision that must be made before safe implementation:

- stop
- explain the exact decision
- propose the smallest truthful options
- do not silently invent a larger contract than the system can support
