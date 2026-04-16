# Priority Rubric And Wave Plan

## Rubric

Each candidate initiative is scored on four dimensions:

| Dimension | Meaning |
| --- | --- |
| Reach | how many apps/screens benefit |
| Leverage | how much duplicated plumbing it deletes |
| Product lift | how much user-facing quality it unlocks |
| Risk | how invasive the migration is |

## Highest-Value Cross-App Plays

### Wave 1

These are the cleanest “raise the floor everywhere” moves:

1. **Collection workspace spine**
   - why now: highest duplication, highest reuse potential
   - touches: Platform, BitHire, Evnto
2. **Header family consolidation**
   - why now: page-header and command-header duplication is extreme
   - touches: all three apps
3. **Search / command / shortcuts spine**
   - why now: current implementations are fragmented and underpowered
   - touches: all three apps
4. **Status / empty / loading registry**
   - why now: small-to-medium effort, lots of consistency payoff
   - touches: all three apps

### Wave 2

These move the repo from consistent UI to stronger product workflows:

1. **Approval / decision inbox system**
2. **Activity / timeline standardization**
3. **Draft-safe form lifecycle**
4. **Export/report plumbing standardization**

### Wave 3

These are the more product-shaped upgrades by vertical:

1. Platform tenant preview + publishing workbench
2. Platform scheduler + investigative filtering
3. BitHire recruiting workspace + hiring workbench
4. BitHire scheduler + analytics upgrade
5. Evnto command center + staffing matrix + run-of-show scheduler

## Best “Now / Next / Later” Plan

### Now

- centralize list workspace
- centralize header family
- centralize shell search/command infrastructure
- standardize empty/loading/status primitives at app-ui level

### Next

- unify approvals
- unify timelines/activity
- standardize form lifecycle and drafts
- move export/report hooks onto DS-owned primitives

### Later

- Platform premium tenant tooling
- BitHire hiring intelligence/productization
- Evnto live-ops command products

## Most Important Structural Recommendation

Do not respond to this audit by adding more one-off wrappers.

Prefer this hierarchy:

1. DS owns the general pattern/surface/state system
2. app `ui/` owns light adapters when needed
3. features provide config, data, and domain actions
4. verticals tune identity and shell behavior

If we skip that discipline, the repo will keep consuming the DS while still failing to capture its real leverage.
