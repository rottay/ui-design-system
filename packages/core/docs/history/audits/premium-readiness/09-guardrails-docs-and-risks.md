# Guardrails, Docs, And Residual Risks

## Guardrails today

There was real progress in R8:

- system tests exist
- audit integration script exists
- tenancy boundary checks exist
- token fidelity checks exist

This is good and worth keeping.

## Why it is still not enough

### 1. Too much is still static/source-level

Examples:

- string-count token checks
- file-presence checks
- registry/static expectations

Those are useful, but they miss the exact class of regressions that already happened in this program:

- provider/runtime mismatches
- preview/runtime mismatches
- bridge classes emitted but not really driving behavior
- client first-paint differences

### 2. Coverage is too selective

`token-fidelity.test.ts` only covers a small matrix of components.

That makes it a good early warning, not a premium sign-off mechanism.

### 3. Cross-app protection is still shallow

There is still no strong automated protection for:

- shell contract drift across apps
- app-local header/pattern duplication
- host CSS engine-specific patches
- settings/admin family divergence

## Docs truth risks

Several older rubric/playbook files still encode stale assumptions, especially around:

- `brandThemeId`
- exact `appearance` parity status
- older intermediate states of the migration

Examples verified in this pass:

- `docs/galactic-integration-rubric/08-premium-customization-and-appearance.md`
- `docs/galactic-integration-rubric/03-runtime-and-tenancy.md`

## Residual technical risks

### P1. First-paint theme drift for DB tenants

The client session path still does not carry bounded canonical `appearance.general`.

### P1. Preview/authoring lies can mislead teams

If the preview is not rendering real DS components, it can approve a direction that runtime does not actually honor.

### P1. Cross-app shell drift will continue unless ownership moves

As long as Evnto and BitHire keep their own shell stacks, coherence will remain fragile.

### P2. App-local micro design systems will keep growing

The biggest risk is not total failure.

It is slow re-fragmentation:

- local control clusters
- local pill/button systems
- local widget/header shells
- local page furniture

## What would make this sign-off-grade

1. behavior-based tests for first paint, client hydration, preview truth, and shell accessibility
2. cross-app guardrails for shell/header/settings ownership
3. doc truth pass that removes outdated intermediate-state instructions

