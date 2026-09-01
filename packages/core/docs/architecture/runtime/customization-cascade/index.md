# Customization cascade mechanics

This is an operational annex to the repository's
[architecture authority](../../../../../../docs/architecture/index.md). The canonical
tenant split is documented in [Tenant authority](../../tenant-authority/index.md).

## Two productive paths

Code-owned verticals compile their checked-in theme sources into generated CSS
artifacts. A published customer tenant instead arrives as one validated,
server-compiled artifact. With `visualAuthority="compiled-artifact"`, the
provider supplies runtime context without recomputing or emitting competing
visual CSS.

For code-owned `brandTheme` configurations, the runtime merge is:

```text
structural:  engine -> vertical tokens -> brand surfaces -> tenant overrides
personality: defaults -> vertical -> brand motion/charts/chrome -> tenant
branding:    brand palette -> generated scale -> CSS variables
```

The compatibility path used when `brandTheme` is absent is:

```text
structural:  engine -> vertical -> product profile -> tenant overrides
personality: defaults -> vertical -> product profile -> tenant
branding:    legacy tenant branding -> generated scale -> CSS variables
```

Each personality section merges independently, so changing animation does not
erase chart or typography configuration. Tenant overrides are the final layer
in both provider-owned compatibility paths. The static generator and runtime
resolver must produce the same cascade.

## Identity lookup is not visual authority

The compatibility resolver may consult memory, local storage, the bundled
registry, static preview files, and a remote API before producing an
identity-safe generic configuration for the requested slug. That sequence
keeps development and previews resilient; it is not the publication path for
customer visuals.

Published customers follow this boundary instead:

```text
hostname -> tenant identity -> canonical tenancy publication
  -> validate the tenant theme document and vertical envelope
  -> compile/cache immutable CSS on the server
  -> embed the exact artifact in SSR
  -> hydrate with compiled-artifact authority
```

Browser components never query tenancy storage directly, and a failure may not
fall through to another brand.

## CSS contract

Components consume the shared `--ds-*` custom-property contract. Values may
come from a generated vertical artifact or a compiled customer artifact, but
component paint does not hardcode tenant identity. This stable contract is what
allows a bounded tenant control to cascade across every mapped consumer.

## Governed manifest

`governance/manifest/` is the customization authority, not a report folder:

```text
governance/manifest/
  controls/           Publicly bounded customization inputs
  families/           Applicability and evidence per DS family
  recipes/            Shared recipe vocabularies
  cascade/            Root catalog, authored roots and ownership rules
  schema/             Closed manifest vocabulary
  index.json          Generated roll-up of the authored authorities above
```

The roll-up is regenerated; the underlying authorities are reviewed changes.
Computed cascade facts stay outside governance under
`artifacts/generated/manifest/cascade/`, and source/compiled theme parity stays
under `artifacts/generated/manifest/themes/parity/`. Gates consume those
outputs to prove that a declared control reaches its mapped channels without
turning generated analysis into a second source of truth.
