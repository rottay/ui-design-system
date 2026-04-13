# World-Class Template Additions

This file answers the question:

- can the template still be improved beyond the current recommendation?

Answer:

- yes

The current template is good.
It is not yet the maximum-quality version of itself.

The missing layer is not another visual opinion.
The missing layer is governance, enforcement, and typed conventions.

## Highest-value additions

## 1. ADRs for the template

Add:

```text
docs/architecture/adr/
  001-ds-vs-vertical-vs-feature-ownership.md
  002-vertical-layer-contract.md
  003-shared-shell-contract.md
  004-settings-family-contract.md
  005-no-_shared-growth.md
```

Why:

- the template needs durable decisions, not only markdown advice

## 2. `vertical/manifest.ts`

Every app should expose:

```text
vertical/
  manifest.ts
```

The manifest should define:

- vertical key
- DS `productProfile`
- shell recipe
- workspace recipe
- dashboard recipe
- page-chrome recipe
- settings recipe
- supported route groups

Why:

- it turns vertical identity into one explicit source of truth

## 3. Typed recipe schemas

All vertical recipes should be schema-validated.

Suggested files:

```text
vertical/profile/schema.ts
vertical/shell/schema.ts
vertical/workspace/schema.ts
vertical/dashboard/schema.ts
vertical/page-chrome/schema.ts
```

Why:

- recipe layers otherwise become style blobs
- typed contracts keep customization leveled

## 4. Route metadata contract

Every feature should expose route metadata, not just pages.

Suggested shape:

```text
features/<domain>/routes/
  meta.ts
  index.ts
```

Each route metadata entry should define:

- title
- nav group
- icon
- page-chrome recipe
- workspace recipe when applicable
- breadcrumb policy
- permissions

Why:

- this keeps shell/header/navigation decisions consistent

## 5. Boundary lint and CI enforcement

Add rules that fail CI when the template is violated.

Recommended rules:

- forbid new imports from `_shared` except allowlisted legacy paths
- forbid cross-feature deep imports
- require route files to import feature public entrypoints only
- forbid raw `<style>` blocks in app code except allowlisted migration files
- forbid engine-specific host CSS patches without explicit temporary waiver

Why:

- architecture quality only holds if the repo enforces it

## 6. Visual regression by vertical recipe

Add visual regression coverage for:

- shell
- dashboard
- workspace
- settings

At minimum:

- one canonical screen per app
- one mobile shell snapshot
- one recipe comparison snapshot across the three apps

Why:

- premium quality is visible
- code-only checks do not protect composition and rhythm

## 7. DS recipe gallery

Extend the showroom or internal demo to render:

- Rotate vertical recipe
- BitHire vertical recipe
- Evnto vertical recipe
- shell variants
- workspace variants
- dashboard variants

Why:

- teams need a truthful place to compare sibling apps side by side

## 8. App template checklist script

Add a script that verifies each app has:

- `vertical/manifest.ts`
- route metadata registration
- one provider entrypoint
- no new shell family outside `vertical/shell`
- no page-header duplication outside `vertical/page-chrome`

Why:

- this turns the template into an enforceable standard

## 9. Public feature entrypoints only

Each feature should expose:

```text
features/<domain>/index.ts
```

Route files should import from feature public entrypoints, not deep internals.

Why:

- this keeps modules refactorable and reduces entanglement

## 10. Migration waivers with expiry

For temporary exceptions, require:

- owner
- reason
- expiry wave/date

Examples:

- engine-specific CSS patch
- temporary `_shared` import
- duplicate shell during migration

Why:

- temporary architecture debt otherwise becomes permanent

## Strong recommended add-ons

### Ownership matrix

Add:

- `docs/architecture/ownership-matrix.md`

It should answer:

- what belongs in DS
- what belongs in `vertical/`
- what belongs in `features/`
- what is allowed in `components/`
- what is forbidden in `_shared`

### Golden-path examples

Document one reference implementation for:

- list screen
- detail screen
- dashboard page
- settings page

### CODEOWNERS alignment

Map ownership to the new layers:

- DS owners
- vertical/template owners
- feature owners

## Final judgment

If we add these mechanisms, the template moves from:

- strong proposal

to:

- world-class operating system for multiple sibling apps

