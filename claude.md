# Claude Code Rules - Design System

## AI Documentation

- **Catálogo Central**: `/docs-engineering/README.md`
- **Component Reference**: `/docs-engineering/engineering/design-system/`

---

## GitHub Configuration

- **Token**: `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`
- **Author**: davila23 <daniel.avila@rottay.com>

## Git Rules

- **NEVER include Co-Authored-By** in commit messages
- **NEVER include "Generated with Claude Code"** in commit messages
- Use conventional commit format: `type(scope): description`

## Project Context

- Multi-engine design system with four engines:
  - **classic** — Ant Design 5.21 wrapper
  - **modern** — Tailwind / DaisyUI wrapper
  - **rustic** — Vanilla CSS fallback
  - **custom** — Reserved for white-label tenants (pluggable component pack registered at runtime)
- Components in `packages/core/src/components/`
- Each component has `engines/{classic,modern,rustic}/index.tsx` siblings selected at runtime via `createEngineComponent()` and the active engine context
- Follow existing component patterns for new additions
- The canonical engine names are `classic` / `modern` / `rustic` / `custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.

## Ownership rules

This package is the **single source of truth** for reusable, domain-agnostic UI capability across all Rottay apps.

- The DS owns: primitives, patterns, generic surfaces, page shells, detail shells, detail-form shells, collection workspace shells, layout shells, reusable widget chrome, runtime tenant contracts, product-profile contracts, engine extension points, motion vocabulary, and reusable lane layouts (ranked-row, signal-lane, feed-lane, action-lane).
- The DS does **not** own: tenant/company/user/role/candidate/interview/event semantics, control-plane narrative, recruiting copy, dashboard storytelling, or any product-specific AI/operator narration.
- Before adding a new component, ask: *"Could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"* If no, it does not belong here — it belongs in the consuming app.
- See `docs-engineering/archive/audits/2026-04-07-home-ai-agent-audit-davila/11-system-ownership-boundaries.md` for the full ownership contract.
