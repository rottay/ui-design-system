# Component and surface owner mechanics

This is an operational annex to the repository's
[architecture authority](../../../../../../docs/ARCHITECTURE.md). That document
owns the canonical tree and admissible dependency direction.

## UI ownership stack

- `primitives/` owns engine-switched leaves.
- `patterns/` owns reusable task compositions.
- `structures/` owns page chrome around patterns.
- `surfaces/` owns declarative page recipes.

The owner name is the capability boundary. Authored implementation peers use
their own `folder/index.ts` or `folder/index.tsx`; supporting branches such as
`contracts`, `runtime`, `presentation`, `engines`, and `tests` remain below the
owner they support.

Charts are a specialized manifest cohort but remain product code below
`ui/patterns/visualization/charts/`. Public chart subpaths forward through
`src/entrypoints/charts/`; they do not create a second implementation tree.

## Surface configuration

A surface separates its declaration into three responsibilities:

```text
presentation  what the user sees: title, fields, columns, renderers, slots
behavior      what it does: source, actions, pagination, sorting, adapters
visual        layout posture: variant, density, width, responsive hints
permissions   optional field, action, and tab visibility policy
```

Permissions are open by default. When a rule exists, an explicit policy
callback decides first; otherwise the named permission must be present in the
granted set. Fields, actions, columns, and tabs use the same resolution law.

`EntityAdapter<TRaw, TView>` is the boundary between app/domain data and a
surface view model. Stable field identifiers declared by the adapter are the
shared vocabulary used by permissions, columns, and surface configuration.
This keeps a reusable surface independent from tenant, candidate, role,
company, interview, event, or other consuming-product semantics.
