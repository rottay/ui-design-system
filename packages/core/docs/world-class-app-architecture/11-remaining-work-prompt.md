# Remaining Work Prompt

Copy this entire file as a prompt to Claude Code to continue the architecture program.

---

## Context

The world-class architecture migration is well advanced. Here is the honest current state:

### app-platform (most advanced)

**Completed:**
- 6 permanent roots active: `app/`, `vertical/`, `features/`, `core/`, `ui/`, `styles/`
- 8 transitional roots DELETED: `lib/`, `database/`, `platform/`, `types/`, `constants/`, `stores/`, `config/`, `contexts/`
- `core/` has physical content: lib, database, hooks, providers, utils, types, config, state
- `features/` has physical screens (21 dirs) and actions (15 dirs) inside feature families
- `ui/` has physical content: brand, feedback, tables, layout, navigation, global-search
- All permanent roots have ZERO references to transitional roots
- Typecheck: 0 errors

**Remaining 3 transitional roots:**
- `surfaces/` (263 files) — content duplicated in `features/*/screens/`, only referenced by itself and by `actions/` and `components/`
- `actions/` (119 files) — content duplicated in `features/*/actions/`, only referenced by itself and by `surfaces/`
- `components/` (804 files) — contains `_shared/` (duplicated in `ui/`), domain folders (auth, compliance, identity, landing, marketing, showroom, showcase, etc.), and `providers/`

**To finish platform:**
1. Delete `surfaces/` — safe because features/screens has the content and permanent roots don't reference it
2. Delete `actions/` — safe because features/actions has the content and permanent roots don't reference it
3. Clean `components/` — move `providers/` to `core/providers/`, keep marketing/landing/showroom/showcase (marketing exception), delete domain folders that are duplicated in features
4. Verify typecheck stays at 0

**Critical detail about permissions and tenancy:**
Two feature barrels still fallback to `@/surfaces/` for exports that were overwritten during the copy:
- `features/identity-access/permissions/index.ts` exports `PermissionsListSurface`, `PermissionCreateSurface`, `PermissionEditSurface`, `PermissionDetailSurface`, `PoliciesSurface` from `@/surfaces/permissions`
- `features/tenant-administration/tenancy/index.ts` exports `TenantsListSurface`, `TenantDetailSurface`, `TenantEditSurface`, `TenantCreateSurface`, `TenantDetailView` from `@/surfaces/tenants`

These must be resolved BEFORE deleting `surfaces/`:
- Copy the actual permission surface files (list.tsx, create.tsx, edit.tsx, detail.tsx) from `surfaces/permissions/` into `features/identity-access/permissions/screens/` with unique names (e.g., `permissions-list.tsx`)
- Same for tenant surface files from `surfaces/tenants/`
- Update the internal imports in those files from `@/surfaces/_shared` to `@/features/_shared`
- Update the feature barrels to export from `./screens/permissions-list` etc.
- Then delete `surfaces/`

### app-bithire

**Completed:**
- 6 permanent roots present: `app/`, `vertical/`, `features/`, `core/`, `ui/`, `styles/`
- `core/config/` and `core/state/` have physical content
- `features/` has physical screens (24 dirs) and actions (16 dirs)
- `ui/` has physical content (8 categories)
- Feature family barrels exist (talent-acquisition, hiring-operations, recruiter-workspace, ai-operations, organization-admin)

**Remaining transitional roots:**
- `surfaces/` — content duplicated in features/screens
- `actions/` — content duplicated in features/actions
- `components/` — _shared duplicated in ui/, domain folders, layout/, v2/
- `lib/` — NOT moved to core/lib yet
- `database/` — NOT moved to core/database yet
- `hooks/` — NOT moved to core/hooks yet
- `providers/` — NOT moved to core/providers yet
- `stores/` — already in core/state
- `constants/` — already in core/config
- `types/` — NOT moved to core/types yet

**To finish bithire:**
1. Physical move: `lib/` -> `core/lib/`, `database/` -> `core/database/`, `types/` -> `core/types/`, `hooks/` -> `core/hooks/`, `providers/` -> `core/providers/`
   - Move directory, then update ALL imports globally (including inside the moved files)
   - The key: move first, then `find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/|@/core/lib/|g'` — this works because after the move, the files ARE in core/lib/
2. Delete emptied transitional roots
3. Update permanent roots to not reference transitional roots
4. Delete `surfaces/` once features/screens barrels are self-sufficient
5. Delete `actions/` once features/actions content is complete
6. Clean `components/` — move _shared to ui/, move layout to vertical/shell, resolve v2/ experiment

### app-evnto

**Same pattern as bithire:**
1. Physical move: `lib/`, `database/`, `types/`, `hooks/`, `providers/` -> `core/`
2. Delete emptied roots
3. Clean remaining transitional roots

### Cross-app

1. Update all 3 CLAUDE.md files to reflect final state
2. Run `lint:vertical` and fix any violations
3. Verify typecheck passes on all 3 apps

---

## Execution Strategy

### For each app, do the physical moves in this order:

1. `types/` -> `core/types/` (smallest, fewest cross-refs)
2. `hooks/` -> `core/hooks/`
3. `providers/` -> `core/providers/`
4. `lib/` -> `core/lib/` (largest, most cross-refs)
5. `database/` -> `core/database/`

For each move:
```bash
# 1. Remove old core/ barrel (it's a re-export)
rm -rf src/core/{target}/*

# 2. Copy physical content
cp -r src/{source}/* src/core/{target}/

# 3. Delete original
rm -rf src/{source}

# 4. Update ALL imports globally (including inside moved files)
find src/ tests/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/{source}/|@/core/{target}/|g'
find src/ tests/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|@/{source}'|@/core/{target}'|g"

# 5. Typecheck
pnpm tsc --noEmit
```

### For deleting surfaces/:

1. Check that no permanent root references `@/surfaces/`
2. Fix any feature barrels that still fallback to `@/surfaces/`
3. Delete `surfaces/`

### For deleting actions/:

1. Check that no permanent root references `@/actions/`
2. Delete `actions/`

### For cleaning components/:

1. Move `components/providers/` to `core/providers/`
2. Move `components/_shared/` remaining content to `ui/`
3. Keep marketing/landing/showroom/showcase (marketing exception)
4. Delete empty domain folders

---

## Non-negotiable rules

1. Move first, update imports globally after (including inside moved files)
2. Typecheck after each root move
3. If typecheck breaks, fix before continuing
4. Don't delete a root until its content is fully in its permanent home
5. Leave compat re-exports only temporarily and document them
6. The only allowed permanent roots are: app, vertical, features, core, ui, styles

## STOP format

If blocked:
- STOP
- Blocker:
- What I found:
- Options:
- Recommendation:

## Start by

1. Finishing app-platform: resolve permissions/tenancy surface overwrite, delete surfaces/, delete actions/, clean components/
2. Then app-bithire: physical moves of lib/database/types/hooks/providers into core/
3. Then app-evnto: same pattern
4. Final: CLAUDE.md updates, lint verification
