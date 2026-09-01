# World-Class Refactor Wave Plan

## Wave 1: Foundation (app-platform)

Create `vertical/` and `features/` structure. Move shell to vertical.
Create VerticalManifest contract in DS.

### 1a. DS: Create VerticalManifest contract
- New file: `foundation/contracts/kernel/verticals/index.ts`
- Define `VerticalManifest` interface
- Export from DS barrel

### 1b. app-platform: Create `src/vertical/`
- `vertical/index.ts` — barrel
- `vertical/manifest.ts` — Platform manifest (control-room, sharp, precise, compact, ops)
- `vertical/shell/` — move from `components/_shared/layouts/app-layout/`
- `vertical/navigation/` — move sidebar-config from shell
- `vertical/profile/` — shape/motion/density defaults

### 1c. app-platform: Create `src/features/`
- Move domain components from `components/[domain]/` to `features/[domain]/components/`
- Merge with matching `surfaces/[domain]/` into unified feature folders
- Keep `surfaces/_shared/` adapters as `features/_shared/`

### 1d. app-platform: Shrink `components/`
- Only `_shared/` remains (tables, brand, ui utilities)
- Domain folders are gone (moved to features)

## Wave 2: app-platform Shell + Dashboard + Home

### 2a. Dashboard identity
- Dashboard builder already extracted (R3 from previous program)
- Add platform-specific dashboard recipe in `vertical/dashboard/`
- Wire real domain data to dashboard widgets

### 2b. Home surface
- Platform home = security ops / tenant posture / investigation
- Must combine: real business context + copilot + quick actions

## Wave 3: app-platform Cleanup

### 3a. _shared shrinkage
- Promote to DS: global-search, navigation breadcrumbs
- Move to vertical: command-header-component
- What stays: entity-table-workspace, brand assets

### 3b. BitHire action consolidation prep
- Document the 43-folder issue
- Group AI actions under `actions/ai/`

## Wave 4: app-bithire Convergence

### 4a. Create `vertical/` + `features/`
- Same template as platform
- BitHire manifest: editorial-network, balanced, calm, comfortable, professional
- Move `components/layout/` to `vertical/shell/`
- Resolve v2 parallel shell (merge or remove)

### 4b. Consolidate 43 action folders
- Group 15 `ai-*` folders under `actions/ai/`
- Group hiring workflow under `actions/hiring/`

## Wave 5: app-evnto Convergence

### 5a. Create `vertical/` + `features/`
- Same template
- Evnto manifest: lively-venue, rounded, expressive, airy, hospitality
- Move `components/_shared/layout/` to `vertical/shell/`

## Wave 6: Guardrails + Enforcement

- Lint rule: no new `_shared` growth for shell/page/workspace
- Lint rule: `vertical/manifest.ts` must exist
- Lint rule: fan-out threshold on flat directories
- Update CLAUDE.md files for all 3 apps
