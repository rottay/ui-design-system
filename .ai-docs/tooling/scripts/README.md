# Scripts - Development Environment Tools

> Access-resilient setup and management scripts for the Rottay ecosystem.

## Overview

The `scripts/` repository provides bash scripts that adapt to the user's repository access level, supporting different vertical profiles (BitHire, Evnto, Platform, Full Access).

## Repository

- **Location**: `scripts/`
- **GitHub**: `rottay/scripts`

## Structure (folder/index pattern)

```
scripts/
├── _common/
│   └── index.sh    # Shared library
├── setup/
│   └── index.sh    # Environment setup
├── status/
│   └── index.sh    # Repository status
├── sync/
│   └── index.sh    # Pull/push repos
├── dev/
│   └── index.sh    # Dev servers
├── clean/
│   └── index.sh    # Clean caches
├── update/
│   └── index.sh    # Update deps
├── logs/
│   └── index.sh    # Docker logs
└── *.sh            # Wrapper scripts
```

## Scripts

| Script | Description |
|--------|-------------|
| `_common/index.sh` | Shared library (access detection, helpers) |
| `setup/index.sh` | Environment setup with access detection |
| `status/index.sh` | Repository status dashboard |
| `sync/index.sh` | Pull/push all accessible repos |
| `dev/index.sh` | Start development servers |
| `clean/index.sh` | Clean node_modules and caches |
| `update/index.sh` | Update dependencies |
| `logs/index.sh` | Docker logs viewer |

## Access Profiles

Scripts automatically detect user's GitHub access:

| Profile | Access |
|---------|--------|
| `full` | All repositories |
| `platform` | Core team (platform + all modules) |
| `bithire` | app-bithire + dm-recruiter, dm-scoring, dm-ia-chat |
| `evnto` | app-evnto + dm-events, dm-bar, dm-staff, dm-payments, dm-web3 |
| `limited` | ui-design-system only |

## Key Features

### Access Detection

```bash
# Probe GitHub for access
can_access_repo "platform"

# Get user's profile
detect_access_profile  # Returns: full, platform, bithire, evnto, limited
```

### Vertical Selection

```bash
./scripts/setup.sh --vertical bithire
./scripts/setup.sh --detect-only
./scripts/setup.sh --list-repos
```

### npm Fallback

When `platform/` is not accessible, scripts use published `@rottay/*` packages from npm instead of local builds.

## Vertical Definitions

```bash
# Shared (all profiles)
SHARED_REPOS=("ui-design-system")

# Platform (core team)
PLATFORM_REPOS=("platform" "app-platform")

# BitHire vertical
BITHIRE_REPOS=("app-bithire" "dm-recruiter" "dm-scoring" "dm-ia-chat")

# Evnto vertical
EVNTO_REPOS=("app-evnto" "dm-events" "dm-bar" "dm-staff" "dm-payments" "dm-web3")
```

## Common Usage

```bash
# Initial setup
./scripts/setup.sh

# Daily workflow
./scripts/sync.sh
./scripts/dev.sh platform --docker
./scripts/status.sh --short
```

## Shell Compatibility

Scripts avoid associative arrays for broader shell compatibility. Tested with `/bin/bash` on macOS and Linux.
