# Module Versions Registry

> **RULE**: When publishing a new version of ANY @rottay/* module, UPDATE this file immediately.

Last updated: 2026-02-11

## Platform Modules

| Module | Package | Version | Dependencies |
|--------|---------|---------|--------------|
| Core | @rottay/core | 2.0.50 | - |
| Auth | @rottay/auth | 1.3.71 | core@2.0.50, identity@1.4.19, tenancy@1.3.22, permissions@1.4.29 |
| Identity | @rottay/identity | 1.4.19 | core@2.0.50 |
| Permissions | @rottay/permissions | 1.4.29 | core@2.0.50 |
| Tenancy | @rottay/tenancy | 1.3.22 | core@2.0.50 |
| Compliance | @rottay/compliance | 1.3.23 | core@2.0.50, identity@1.4.19, tenancy@1.3.22 |
| Feature Flags | @rottay/feature-flags | 1.3.14 | core@2.0.50 |
| Navigation | @rottay/navigation | 1.3.19 | core@2.0.50 |
| Notifications | @rottay/notifications | 1.1.13 | core@2.0.50 |

## Domain Modules

| Module | Package | Version | Dependencies |
|--------|---------|---------|--------------|
| Bar | @rottay/bar | 1.1.9 | core@2.0.50 |
| Events | @rottay/events | 1.1.9 | core@2.0.50 |
| IA Chat | @rottay/ia-chat | 1.0.26 | core@2.0.50 (peer) |
| Payments | @rottay/payments | 0.2.7 | core@2.0.50 |
| Recruiter | @rottay/recruiter | 1.0.30 | core@2.0.50 |
| Scoring | @rottay/scoring | 1.0.22 | core@2.0.50 |
| Staff | @rottay/staff | 2.0.9 | core@2.0.50 |
| Web3 | @rottay/web3 | 1.1.7 | core@2.0.50 (peer) |

## UI

| Module | Package | Version | Dependencies |
|--------|---------|---------|--------------|
| Design System | @rottay/design-system | 2.1.3 | - |

## Publishing Checklist

1. `cd` to module directory
2. Bump version: `pnpm version patch --no-git-tag-version`
3. Update @rottay/* deps to latest (see table above)
4. Clean install: `rm -rf node_modules pnpm-lock.yaml && pnpm install --ignore-scripts`
5. Build: `pnpm run build` (or `pnpm run build:bundle` + `pnpm run build:types`)
6. Verify: `ls dist/index.js dist/index.d.ts`
7. Publish: `pnpm publish --no-git-checks --ignore-scripts`
8. **UPDATE THIS FILE** with new version
9. Update dependent modules if needed
