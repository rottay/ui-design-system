# Executive Scorecard

## Portfolio View

| Domain | Score | Status | Why |
|---|---:|---|---|
| Runtime / theming / provider chain | 7.4 | Strong | Merge order is explicit and the provider stack is mostly coherent. |
| Bundled verticals vs DB tenants | 5.2 | Partial | Intent is right, but app-platform still fetches DB first and discards later. |
| Premium contracts / appearance / brandTheme | 6.3 | Mixed | `brandTheme` is strong; `appearance` and DB authoring are still narrower and uneven. |
| Modern foundation / layout | 8.0 | Strong | Foundation tokenization is one of the best parts of the system. |
| Modern display / content | 5.0 | Weak | Several display primitives still bypass their own bridges/token surfaces. |
| Modern inputs / forms | 5.6 | Partial | Core shells are good, deep customization is still uneven. |
| Modern navigation / feedback / overlay | 6.2 | Mixed | Good MVP readiness, but Daisy ownership and accessibility drift remain. |
| Patterns / surfaces / structures | 6.4 | Mixed | Some patterns are very strong, others still lean on local styling. |
| Hooks / system integration | 5.0 | Partial | `useTokens`, responsive, motion are real; many other hooks remain app-facing or dormant. |
| Rotate / app-platform integration | 6.0 | Mixed | Visible DS integration is real, but the host still bypasses several contracts. |
| Cross-vertical coherence | 6.7 | Healthy but uneven | `app-evnto` and `app-bithire` are more internally consistent than `app-platform`. |
| Non-functional quality | 6.3 | Mixed | Good fallback behavior; accessibility and some runtime performance still need work. |
| Docs / tests / guardrails / auditability | 6.4 | Mixed | Strong scaffolding, but stale docs and partial guardrails remain. |

## Summary Verdicts

### Ready Now

- Rotate on `Modern` is good enough to ship as an MVP host.
- First-party bundled styling can already look differentiated.
- `brandTheme` is a credible premium source.
- The DS runtime spine is good.

### Not Ready To Call "Perfect"

- runtime DB tenants are not on a clean v1/v2 contract yet
- several Modern display and input primitives still over-promise
- app-platform still owns too much visible shell behavior
- command/search, data/routing/state, and AI/DnD/notification hooks are not truly fused
- docs, previews, and static generation do not fully track the live runtime story

## Executive Priorities

1. Make bundled tenants truly file-first at the earliest app entrypoints.
2. Define the runtime DB tenant contract clearly: core-first, advanced optional.
3. Finish the high-value Modern primitives that still bypass their own token/bridge surfaces.
4. Activate or narrow dormant system stories: command/search, data/routing/state, notifications/DnD/AI.
5. Bring docs, previews, tests, and guardrails in line with the actual runtime model.

## MVP Position

If the product goal is:

- `Rotate on Modern`: score `7.5/10`
- `all first-party verticals on a coherent DS`: score `6.8/10`
- `any front-end, any tenant, fully premium, fully declarative`: score `5.5/10`

That gap between `7.5` and `5.5` is the real opportunity area for the next waves.
