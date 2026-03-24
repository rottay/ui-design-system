# Version Governance Strategy

## Architecture

The Rottay monorepo uses separate git repositories for apps and domain modules.
This means `workspace:*` protocol is not available for cross-repo dependencies.

## Strategy: Aligned Fixed Versions

All first-party packages use explicit fixed versions that are aligned across all consumers:

| Package | Current Version | Consumers |
|---------|----------------|-----------|
| @rottay/core | 2.0.62 | all apps + all dm-* |
| @rottay/design-system | 2.4.2 | app-platform, app-bithire, app-evnto |
| next | ^16.1.1 | app-platform, app-bithire, app-evnto |
| next (legacy) | ^15.1.0 | app-auth (pending migration) |

## Version Bump Protocol

When publishing a new version of any @rottay/* package:
1. Bump version in source package
2. Build and publish to GitHub Packages
3. Update ALL consumer package.json files to new version
4. Run `pnpm install` in each consumer repo
5. Verify builds pass

## Enforcement

- CI validates that all apps build against declared versions
- Version alignment is checked during audit reviews
- Drift tolerance: patch versions only (e.g., 2.0.59 vs 2.0.61 is flagged)
