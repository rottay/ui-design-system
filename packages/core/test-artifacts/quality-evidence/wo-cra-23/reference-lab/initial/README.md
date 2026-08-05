# DS reference lab — initial evidence

Captured 2026-08-04 from the hardcoded `primitives` scene after tenant
hydration. These images are baseline evidence, not visual acceptance.

| Tenant | Authority | Primary | Ground | Radius md | Screenshot |
|---|---|---:|---:|---:|---|
| BitHire | static BrandTheme | `#3A6FB0` | `#ffffff` | `10px` | `primitives-bithire-static.png` |
| The Management | published DB document + production compiler | `#1F6F6B` | `#FBF8F3` | `6.4px` (`8px * 0.8`) | `primitives-themanagement-db.png` |

SHA-256:

- `44fcaedb25acdee36b148d8e2d5e68bdd69bd5a6a0d9d0f2f23cae7716af0dfd` — BitHire
- `575cc32c5f9bf963eab5e3948388a3637c4ccf5457fa798c87fdd3a56feabef6` — The Management

Observed blockers assigned to R0:

1. The reused 5,796-line torture route is a monolithic import boundary and has
   a multi-minute cold compile under webpack.
2. The server first frame paints the default dark ground before hydration
   settles on the light tenant authority. Screenshots above were taken only
   after the settled values were measured.

The two renders already prove causal static/DB divergence, but they are not yet
the target tenant art direction or reference-grade craft.
