# Rottay Design System - Development Rules

## Core Principles

- **Web-First, Responsive** - Desktop primary, responsive down to mobile
- **Performance Central** - Bundle size, lazy loading, tree-shaking
- **Premium Quality** - Commercial-grade standards

## CSS

- Prefix: `--ds-*`
- Naming: `--ds-{category}-{element}-{variant}-{state}-{property}`
- No hardcoded colors - use variables
- Units: `rem` for sizing, `px` for borders

## Components

- `'use client'` directive
- `forwardRef` + `displayName`
- Props: `size`, `variant`, `disabled`, `className`, `style`

## Engines

| Engine | Library | Priority |
|--------|---------|----------|
| Titan | Ant Design | CRITICAL |
| Hermes | Tailwind | CRITICAL |
| Apollo | Vanilla | Medium |

## Commits

- NO `Co-Authored-By: Claude`
- NO `Generated with Claude Code`
- Format: `feat:`, `fix:`, `refactor:`, `docs:`

## Docs

- JSDoc on public functions
- Storybook story per component

## Reference Files

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | Full architecture + migration tasks + tracking |
| `/design-system/themes/tenants/bithire/theme.css` | Reference CSS (~1600 lines) |
