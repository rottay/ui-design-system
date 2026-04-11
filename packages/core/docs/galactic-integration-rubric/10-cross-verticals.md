# Cross-Verticals

## Portfolio Comparison

| App | DS mounted at root | Vertical passed | Product profile | Tenant resolution model | Style import model | Main drift |
|---|---|---|---|---|---|---|
| `app-platform` | yes | `platform` | `platform.flagship` | app-owned DB adapter + provider gate | `styles/rottay` + `styles/modern` | outlier in tenant resolution and whitelabel |
| `app-evnto` | yes | `evnto` | `events.organizer` | DS `useTenantBranding()` + app overrides | `styles/evnto` | app-level `rottay -> evnto` remap |
| `app-bithire` | yes | `bithire` | `recruiting.operator` | DS `useTenantBranding()` + app overrides | `styles/bithire` | app-level `rottay -> bithire` remap |

## Main Pattern

`app-evnto` and `app-bithire` are more coherent with each other than either is with `app-platform`.

Why:

- both use `useTenantBranding()`
- both apply product-specific structural overrides on top
- both keep a cleaner DS-owned tenant path

`app-platform` remains the outlier because it:

- owns its own DB normalization path
- still fetches DB branding too early
- still carries a legacy whitelabel authoring model

## Good News

All three apps do share important strengths:

- DS mounted at root
- explicit `vertical`
- explicit product profile
- tenant propagation through app layout/provider boundaries

That means the portfolio already has a real DS spine. The remaining problem is consistency at the app boundary.

## Cross-Vertical Scorecard

| Dimension | Score | Notes |
|---|---:|---|
| Provider-stack consistency | 7 | good, not perfect |
| Tenant/vertical resolution coherence | 6 | uneven between apps |
| Bundled-vs-DB clarity | 5 | mostly weak in `app-platform` |
| Modern MVP alignment | 7 | good for the actual shipping host |
| Product-profile discipline | 8 | strong |
| Cross-app DS adoption consistency | 7 | decent foundation with one clear outlier |

## Architectural Decision To Make

Choose one of these:

### Portfolio model A

All three apps use the same DS-owned tenant resolution path.

### Portfolio model B

`app-platform` remains special because it is the full whitelabel admin host, but then:

- document that exception
- keep the DB tenant contract intentionally smaller
- stop implying that all three apps share the same theming surface

## Recommended Waves

- `V1`: one tenant resolution model
- `V2`: true file-first bundled tenants
- `V3`: vertical contract parity
- `V4`: docs/showroom truthfulness
