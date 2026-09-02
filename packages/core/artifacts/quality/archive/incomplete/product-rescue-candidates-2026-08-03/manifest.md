# Kimi Candidates Modern product-rescue — Codex interim evidence

- Runtime: `app-bithire`, production build, `data-engine=modern`, `data-tenant=bithire`.
- Build: `USE_LOCAL_DS=true pnpm build`, exit 0 on 2026-08-03.
- Viewport captured: 1637 px wide (desktop).
- `listing-bithire-1637.png`: `/candidates` using a live authenticated collection.
- `overview-bithire-1637.png`: `/candidates/overview` using live authenticated data.
- `detail-bithire-1637.png`: living candidate `7f51632a-368f-4457-8eea-d968cd2eba2d`, projected
  by the product into the Home workbench surface.

This bundle is interim. It does not contain 390/768 captures, AR/RTL, or an app-level The
Management render. The Management is currently available only through the DS fixture-backed
`/probe/wl-canary`; that is insufficient for final product acceptance.
