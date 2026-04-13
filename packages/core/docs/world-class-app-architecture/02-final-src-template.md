# Final Src Template

This is the final target tree for all three apps.

```text
src/
  app/
  vertical/
    manifest.ts
    index.ts
    profile/
      index.ts
    shell/
      index.ts
    navigation/
      index.ts
    routes/
      index.ts
    recipes/
      index.ts
      shell.ts
      workspace.ts
      dashboard.ts
      settings.ts

  features/
    <family>/
      index.ts
      <feature>/
        index.ts
        actions/
          index.ts
        components/
          index.ts
        hooks/
          index.ts
        lib/
          index.ts
        screens/
          index.ts
        types/
          index.ts

  core/
    index.ts
    config/
      index.ts
    providers/
      index.ts
    state/
      index.ts
    hooks/
      index.ts
    lib/
      index.ts
    database/
      index.ts
    types/
      index.ts

  ui/
    index.ts
    brand/
      index.ts
    feedback/
      index.ts
    forms/
      index.ts
    tables/
      index.ts

  styles/
```

## Stable subfolder vocabulary

Inside a feature use the same words everywhere:

- `actions/`
- `components/`
- `hooks/`
- `lib/`
- `screens/`
- `types/`

Do not invent per-feature synonyms such as:

- `views/`
- `ui/`
- `helpers/`
- `models/`
- `services/`

unless there is a specific need and it is documented.

## What this template optimizes for

- one ownership path per concern
- predictable imports
- less root fan-out
- cleaner migration from current roots
- easier `index.ts` enforcement

## What this template avoids

- parallel feature and surface trees
- global action forests
- domain logic in presentation roots
- hidden app-owned design systems
