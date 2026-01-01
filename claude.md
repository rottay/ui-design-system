# Claude Code Rules - Platform

## GitHub Configuration

- **Token**: `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`
- **Author**: davila23 <daniel.avila@rottay.com>

## Git Rules

- **NEVER include Co-Authored-By** in commit messages
- **NEVER include "Generated with Claude Code"** in commit messages
- Use conventional commit format: `type(scope): description`

## Project Context

- **Platform is BACKEND-ONLY** - No frontend/UI code
- No antd, no UI components, no React components
- Contains: API routes (`src/app/api/`), core modules (`packages/core`), platform modules (`packages/platform/*`)
- Architecture: Hexagonal/Clean Architecture with DDD

## What Platform Contains

- `src/app/api/` - Next.js API routes only
- `packages/core/` - Shared infrastructure (logging, errors, DI)
- `packages/platform/` - Domain modules (auth-system, multi-tenant, access-control, etc.)

## What Platform Does NOT Contain

- No `src/ui/` folder
- No frontend pages (no `(app)`, `(auth)`, `(public)` route groups)
- No antd or UI libraries
- No client-side stores (zustand, etc.)
