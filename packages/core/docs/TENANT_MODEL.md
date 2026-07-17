# Tenant Model — Frozen Decisions

This document is the single source of truth for how the DS handles tenant identity,
branding, and customization. All implementation must conform to these rules.

## Two Authority Classes

### Code-owned vertical baselines (file-first)

Baselines: `rottay`, `bithire`, `evnto`.

- They define the visual grammar shared by a product vertical: topology,
  component recipes, semantic icon roles, chart renderers, motion posture and
  accessibility behavior.
- They resolve from
  `infrastructure/runtime/tenant/foundation/configuration/registry/` with zero
  network and have a
  generated CSS artifact under `foundation/tokens/css/facade/artifacts/{slug}/`.
- Use `isBundledTenant(slug)` when a host must distinguish these baselines from
  customer tenants. `isKnownTenant` is registry discovery, not a DB policy.
- The full `BrandTheme` remains code-owned and is not tenant-editable.

### Published customer tenants (DB-owned)

Every real customer tenant, including `themanagementmiami`, is owned by the
canonical tenancy DB.

- The hostname selects tenant identity only. It must never select CSS,
  components or a checked-in theme.
- Apps load the tenant's published `TenantThemeDocument`, validate the closed
  schema and vertical envelope, compile it, then pass that exact artifact to
  SSR and hydration.
- A checked-in customer theme may be an explicit migration or visual-regression
  fixture. It must never enter the automatic registry, aggregate token catalog
  or generic CSS bundle.
- Superadmin has the same branding resolution path as every other viewer. Broad
  data access must not bypass tenant identity or branding.

## Runtime Authority and Precedence

```
DS defaults
  -> code-owned vertical baseline
    -> published DB tenant override
      -> explicit preview override (editor only)
```

The DB is not queried by browser components. The server compiles and caches an
immutable artifact keyed by `{ tenantId, rowVersion, compilerVersion }`; SSR
embeds that artifact and the client hydrates it. A cache or fetch failure must
preserve the requested tenant identity and fail closed, never fall through to
Rottay or another customer's styling.

## Customization Contract

`TenantThemeDocument` schema v1 compiled by `tenant-theme-compiler@3` is the
only write contract for tenant customization.

- General fields expose bounded palette, typography, shape, density, motion,
  elevation and navigation dials, plus one code-owned presentation profile
  allowlisted by the trusted vertical envelope.
- Advanced fields expose only allowlisted visual values across DS chrome
  families and allowlisted reference/override tokens.
- Chart tenants may choose the bounded category palette; renderer, data
  semantics and insight provenance remain code-owned.
- Font selection uses approved font-pack identifiers. Asset fields store
  references to approved static/CDN assets, not arbitrary executable content.
- The vertical envelope caps fields, values, variable count and canonical byte
  size. Unknown keys, schema/compiler drift, invalid contrast and duplicate
  chart colors are rejected before publication.

Tenants cannot author component topology, permissions, glyph semantics,
responsive rules, chart renderers, spatial lifecycle, motion topology or
accessibility behavior. A presentation-profile selection chooses only a
reviewed code-owned posture; it does not open any of those authoring channels.

## Publication and Concurrency

- Platform is the editor; the canonical tenancy DB is the authority.
- Publication uses compare-and-swap row versions. Stale editors receive a
  conflict and cannot silently overwrite a newer theme.
- A migration seed is insert-only. Once the tenant exists, later Platform edits
  win and rerunning a seed must be a no-op or explicit recovery operation.
- Schema digest, vertical-envelope digest, compiler version and artifact digest
  travel with the published document so consumers can reject drift.

## Compatibility

Legacy `TenantConfig.branding`, `personality`, `appearance` and
`tokenOverrides` remain readable at compatibility boundaries, but new writes
must normalize into `TenantThemeDocument`. The deprecated
`themanagementmiamiBrandTheme` export is an explicit fixture only and is not a
runtime source.

## Enforcement

- Registry/bundle tests prove that only the three code-owned baselines are
  automatic and that TMM has no legacy CSS authority.
- Compiler tests prove schema/envelope validation, deterministic artifacts,
  contrast and budget limits.
- Host/app architecture tests prove custom tenants require an explicit DB
  artifact and that superadmin does not skip branding.
- Supplier-contract and packed-artifact gates prove the public runtime matches
  what consumers install.

Last architecture verification: 2026-07-17.
