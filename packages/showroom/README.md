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
| `pnpm build` | Production Webpack build |
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
      primitives/          Generated component pages with live rendering
      patterns/            Generated pattern and chart pages
      structures/          Generated structure pages
      surfaces/            Generated surface pages
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

- Live primitive previews with engine comparison (Classic/Modern/Rustic)
- Pattern pages with interactive demos
- 18 chart families rendered with real D3 + sample data
- Governed 282-name `Icon` facade plus generated vertical packs
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
