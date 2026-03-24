# ui-remotion - Video Templates

> Remotion-based video templates for Rottay marketing and promotional content.

## Overview

The `ui-remotion/` repository contains React-based video compositions using Remotion for automated video generation.

## Repository

- **Location**: `ui-remotion/`
- **GitHub**: `rottay/ui-remotion`

## Structure

```
ui-remotion/
├── src/
│   ├── Root.tsx           # Main Remotion root
│   ├── brands/            # Brand configurations
│   │   ├── rottay.ts
│   │   ├── bithire.ts
│   │   └── evnto.ts
│   ├── components/        # Reusable video components
│   │   ├── core/          # Base components
│   │   ├── rottay/        # Rottay-specific
│   │   ├── bithire/       # BitHire-specific
│   │   └── evnto/         # Evnto-specific
│   ├── videos/            # Video compositions
│   │   ├── rottay/        # Rottay videos
│   │   ├── bithire/       # BitHire videos
│   │   └── evnto/         # Evnto videos
│   └── data/              # Static data
├── remotion.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Compositions

### Main Videos

| Composition | Description |
|-------------|-------------|
| `RottayPromo` | Full promotional video |
| `Intro` | Opening sequence |
| `Modules` | Platform modules showcase |
| `Verticals` | BitHire and Evnto verticals |
| `Compliance` | Security features |
| `Outro` | Closing sequence |

### Platform Compositions

| Folder | Videos |
|--------|--------|
| `videos/rottay/` | HomeNewVisitor, HomeReturning, LinkedInEnterprise, YouTubeDemo |
| `videos/bithire/` | HomePrincipal, LinkedInDecisionMakers, TikTok series |
| `videos/evnto/` | HomePrincipal, WhiteLabelFocus, TikTok series |

## Core Components

| Component | Description |
|-----------|-------------|
| `Terminal` | Animated terminal window |
| `CodeBlock` | Syntax-highlighted code |
| `Typewriter` | Text typing animation |
| `ModuleGrid` | Grid of platform modules |
| `FlowLine` | Animated connection lines |
| `SplitScreen` | Side-by-side comparison |

## Commands

```bash
# Development
pnpm dev              # Start Remotion Studio

# Rendering
pnpm build            # Render full promo
pnpm build:intro      # Render intro only
pnpm build:modules    # Render modules section
pnpm render <comp> <out>  # Custom render
```

## Tech Stack

- Remotion 4.0
- React 19
- TypeScript
- Tailwind CSS

## Brand Colors

Defined in `src/brands/`:

- **Rottay**: Primary platform brand
- **BitHire**: Recruiting vertical (purple theme)
- **Evnto**: Events vertical (teal theme)
