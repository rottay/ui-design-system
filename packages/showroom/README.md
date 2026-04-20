# @rottay/showroom

Commercial showcase and documentation for the Rottay Design System.

## Quick Start

```bash
# From the ui-design-system root
cd packages/showroom
pnpm install
pnpm dev
```

Open http://localhost:7000

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server on port 7000 (Turbopack) |
| `pnpm build` | Production build (~10s, 265 static pages) |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type check |
| `pnpm lint` | Run ESLint |

## Architecture

This is a Next.js 16 app that lives alongside `packages/core/` in the pnpm workspace.

```
packages/showroom/
  src/
    app/                    # Next.js routes (265 pages)
      page.tsx              # Commercial landing (Tailwind)
      (docs)/               # Documentation shell
        foundations/         # Tokens, themes, engines, icons
        primitives/          # 105 component pages
        patterns/            # 56 pattern + 28 chart pages
        structures/          # 28 structure pages
        surfaces/            # 44 surface pages
        verticals/           # Platform, BitHire, Evnto demos
        playground/          # Interactive sandbox
        developers/          # Getting started, architecture
    components/
      layout/               # Shell, sidebar, header, footer, search
      playground/            # Engine/theme switcher, code block, etc.
      demos/                # Vertical demo screens
      showroom-context/     # Global engine/theme state
    data/
      registry/             # Component registries (verified from DS source)
      navigation.ts         # Sidebar navigation tree
```

## DS Integration

Uses `@rottay/design-system` as a workspace dependency:
- Changes to `packages/core/` are reflected immediately (hot reload)
- No need to publish a new DS version during development
- Production deploys use the workspace-resolved version

## Features

- 105 live primitive previews with engine comparison
- 56 pattern pages with interactive demos
- 28 chart types rendered with real D3 + sample data
- 109 searchable icons with copy-to-clipboard
- 6 interactive token pages (colors, spacing, typography, radius, shadows, motion)
- 9 vertical demo screens (Platform, BitHire, Evnto)
- Global Cmd+K search across all registries
- Engine switcher (Classic/Modern/Rustic) affects all previews
- Theme switcher (Rottay/BitHire/Evnto) with state toast feedback

## Deployment

Deploys to showroom.rottay.com via Vercel.

| Setting | Value |
|---------|-------|
| Root Directory | `packages/showroom` |
| Framework | Next.js |
| Build Command | `pnpm build` |
| Node Version | >= 20 |
| Port | 3002 (dev) |
