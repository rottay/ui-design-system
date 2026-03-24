# Design System Structure Guardrails

## Forbidden Patterns
- NEVER create src/core/ folders for new code (use domain homes)
- NEVER create src/shared/ (use utils/ or domain-owned)
- NEVER create leaf index.ts (use ComponentName.tsx)
- NEVER put tests in global tests/ folders (co-locate with component)
- NEVER put stories in global stories/ folders (co-locate with component)

## Required Patterns
- Each domain owns its hooks, provider, and types
- Tests next to implementation (Component.test.tsx)
- Stories next to implementation (Component.stories.tsx)
- Engine files flat (engines/classic.tsx, not engines/classic/index.tsx)
- Max 4 levels from src/ to leaf file

## Naming Convention
- Folders: kebab-case for domains, PascalCase for components
- Files: PascalCase.tsx for components, kebab-case.ts for utilities
- Tests: ComponentName.test.tsx, ComponentName.integration.test.tsx
- Stories: ComponentName.stories.tsx
- Types: ComponentName.types.ts

## Test Suffixes (standardized)
- .test.tsx - Unit test
- .integration.test.tsx - Integration test
- .engines.test.tsx - Engine parity test
- .a11y.test.tsx - Accessibility test
