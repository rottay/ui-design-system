# App BitHire Target Tree

This tree assumes the final architecture, not the current transitional one.

Tone:

- editorial-network
- balanced
- calm
- comfortable

## Target tree

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
      registry/
      use-route-meta/
    recipes/
      index.ts
      shell.ts
      workspace.ts
      dashboard.ts
      settings.ts

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
      api/
      auth/
      tenancy/
      analytics/
      formatting/
    database/
      index.ts
    types/
      index.ts

  features/
    talent-acquisition/
      index.ts
      candidates/
      jobs/
      positions/
      applications/
      talent-pool/
      recruiters/

    hiring-operations/
      index.ts
      interviews/
      my-interviews/
      evaluations/
      calibrations/
      approvals/
      offers/
      pipeline/
      workflows/

    recruiter-workspace/
      index.ts
      dashboard/
      recruiter-hub/
      hiring-command/
      analytics/
      activity/
      outreach/
      templates/
      sprints/
      profile/

    ai-operations/
      index.ts
      copilot/
      studio/
      provider-management/
      model-management/
      usage/
      phone/
      transcription/
      email-generation/
      resume-parsing/
      match-scoring/

    organization-admin/
      index.ts
      admin/
      settings/
      teams/
      clients/

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

## Why these family names

### `talent-acquisition`

This is the core recruiting funnel:

- candidates
- jobs
- positions
- applications
- talent pool

### `hiring-operations`

This is the decision and execution layer:

- interviews
- evaluations
- calibrations
- approvals
- offers
- pipeline
- workflows

### `recruiter-workspace`

This is the recruiter-facing operating environment:

- dashboard
- recruiter hub
- hiring command
- analytics
- activity
- outreach
- templates
- sprints
- profile

### `ai-operations`

This solves the current flat AI sprawl.

Instead of many root folders, AI becomes one coherent family.

### `organization-admin`

This is the company-side admin plane:

- settings
- admin
- teams
- clients

## Migration notes

- `src/actions/ai-*` rehome into `features/ai-operations/*/actions`
- `src/actions/scoring*` merges into `features/ai-operations/match-scoring`
- `src/surfaces/*` move into matching feature `screens/`
- domain components move from `src/components/*` into the owning feature
- `src/components/_shared` converges into `ui/`
