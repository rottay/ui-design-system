# @rottay/showroom

Commercial showcase and documentation for the Rottay Design System. Deployed at showroom.rottay.com.

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:7001
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server on port 7001 (webpack) |
| `pnpm dev:turbopack` | Experimental Turbopack dev server |
| `pnpm build` | Production build (~10s, 265 static pages) |
| `pnpm start` | Production server |
| `pnpm typecheck` | TypeScript type check |
| `pnpm lint` | ESLint |

## Architecture

Next.js 16 app that lives alongside `packages/core/` in the pnpm workspace.

```
src/
  app/
    page.tsx              Landing page (Tailwind, marketing exception)
    (docs)/               Documentation shell
      foundations/         Tokens, themes, engines, icons
      primitives/          105 component pages with live rendering
      patterns/            56 pattern + 28 chart pages
      structures/          28 structure pages
      surfaces/            44 surface pages
      verticals/           Platform, BitHire, Evnto demos
      playground/          Interactive sandbox + theme builder
      developers/          Getting started, architecture deep-dive
  components/
    layout/               Shell, sidebar, header, footer, search (Cmd+K)
    playground/            Engine/theme switcher, code block, prop table
    demos/                Vertical demo screens (platform, bithire, evnto)
    showroom-context/     Global engine/theme state context
  data/
    registry/             Component registries (primitives, patterns, structures, surfaces, charts, icons)
    navigation.ts         Sidebar navigation tree
```

## DS Integration

Uses `@rottay/design-system` as a `workspace:*` dependency:
- Changes to `packages/core/` reflect immediately via hot reload
- No need to publish a new DS version during development
- Production deploys use the workspace-resolved version

## Features

- 105 live primitive previews with engine comparison (Classic/Modern/Rustic)
- 56 pattern pages with interactive demos
- 19 chart types rendered with real D3 + sample data
- 109 searchable icons with copy-to-clipboard
- 6 token explorer pages (colors, spacing, typography, radius, shadows, motion)
- 9 vertical demo screens (Platform, BitHire, Evnto)
- Global Cmd+K search across all registries
- Engine switcher affects all previews in real-time
- Theme switcher (Rottay/BitHire/Evnto) with live preview

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind 4 (landing page only), DS components everywhere else
- **Types**: TypeScript 5.9
- **Build**: webpack (Turbopack available via `dev:turbopack`)

## Deployment

Deploys to showroom.rottay.com via Vercel.

| Setting | Value |
|---------|-------|
| Root Directory | `packages/showroom` |
| Framework | Next.js |
| Build Command | `pnpm build` |
| Node Version | >= 20 |
