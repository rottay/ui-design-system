# Enforcement And QA

If the template is going to stay world-class, it needs enforcement.

## Required governance

## 1. ADR rule for new app-owned patterns

Any new reusable app-owned visual abstraction must answer:

- should this be DS?
- should this be `vertical/`?
- should this be feature-local?

That decision should be documented.

## 2. Lint/CI rules

Recommended checks:

- forbid new top-level `_shared` growth for shell/page/workspace systems
- flag raw `<style>` injection in DS consumer surfaces
- flag engine-specific host override files unless whitelisted
- flag parallel shell families
- flag large screen files above agreed thresholds
- flag flat folder roots that exceed the agreed fan-out threshold without justified grouping
- require public `index.ts` entrypoints at feature and vertical boundaries when those folders are consumed externally

## 3. Canonical visual regression set

Per vertical, snapshot at least:

- auth screen
- dashboard
- primary workspace/list
- detail page
- settings page
- mobile shell

## 4. Recipe validation

Recipes should be schema-checked.

Teams should not be able to invent arbitrary recipe keys in app code.

## 5. Template compliance review

A periodic audit should score:

- DS ownership
- `vertical/` ownership
- feature boundaries
- `_shared` shrinkage
- shell convergence
- settings convergence

## Release bar for a new vertical or major refactor

Before calling a vertical “ready”, require:

1. `vertical/manifest.ts` present
2. recipe contracts present
3. route metadata present for flagship sections
4. no parallel shell family
5. no undocumented host override CSS
6. visual regression coverage on canonical screens

## Current conclusion

With these additions, the template moves from:

- strong architectural recommendation

to:

- enforceable operating model

That is the difference between “good docs” and “world-class system discipline”.
