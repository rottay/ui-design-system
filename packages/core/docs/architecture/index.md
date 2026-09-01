# Package architecture references

The canonical repository and package architecture is
[`docs/ARCHITECTURE.md`](../../../../docs/ARCHITECTURE.md). These package-level
references explain operational mechanics without creating a second authority.

The package is organized into six source-controlled roots: `src/`, `scripts/`,
`contracts/`, `governance/`, `artifacts/` and `docs/`. Their ownership and
lifecycle rules, including the hybrid `governance/manifest/index.json` roll-up,
are defined in the canonical document's package-tree section.

- [Tenant authority](tenant-authority/index.md)
- [Runtime mechanics](runtime/index.md)
- [Component and surface mechanics](ui/index.md)
- [Engine splitting](engine-splitting/index.md)
