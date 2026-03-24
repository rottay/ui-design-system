# app-platform Surface Architecture

**Date**: 2026-03-23
**Status**: Fully migrated - 131/131 dashboard pages use Surfaces

## Overview

All dashboard pages in app-platform use the DS Surface architecture.
Pages are thin wrappers (~15 lines) that import Surface screens from `src/surfaces/`.
All business logic (data fetching, state, filters, actions) lives in the surface layer.

## Surface Coverage

| Module | Surface Files | Pages |
|--------|--------------|-------|
| Users | 12 (list, detail, create, edit, groups, guests, duplicates) | 10 |
| Tenants | 10 (list, detail, create, edit, branding, companies, features, settings, users) | 9 |
| Roles | 6 (list, detail, create, edit, analytics) | 5 |
| Permissions | 6 (list, detail, create, edit, policies) | 5 |
| Companies | 5 (list, detail, create, edit) | 4 |
| Compliance | 9 (overview, audit list+detail, consent, gdpr, kyc-aml, breaches, retention, my-data) | 9 |
| Settings | 14 (overview, account, mfa, passkeys, privacy, notifications, data-export, whitelabel, api-keys, webhooks, billing, attributes, scim) | 13 |
| Security | 11 (overview, tokens, mfa, sso list+create+detail, oauth list+create, auth-methods, jwt, risk) | 10 |
| Notifications | 12 (overview, inbox, send, templates CRUD, webhooks, analytics, providers) | 10 |
| Navigation | 14 (overview, menus CRUD, routes CRUD, policies CRUD) | 13 |
| Payments | 3 (overview, refunds) | 2 |
| Profile | 12 (view, edit, sessions, privacy, security sub-pages) | 12 |
| Feature Flags | 6 (list, detail, create, edit, rules, usage) | 6 |
| Web3 | 6 (tokens, wallets, nfts, staking, transactions, analytics) | 6 |
| Admin | 4 (ai-pricing overview, packages, rates, config) | 4 |
| Dashboard | 2 (DashboardSurface + config) | 1 |
| Admin Units | 2 (list, detail) | 2 |
| Service Accounts | 3 (list, detail, create) | 3 |
| Other | 5 (sessions, impersonation, legal, feature-analytics) | 5 |

**Total: 181 surface files, 131 pages migrated**

## Key Patterns

### ListSurface Pattern (for list/table pages)
1. `src/surfaces/_shared/adapters/{entity}-adapter.ts` - EntityAdapter mapping raw->view
2. `src/surfaces/{module}/list-config.tsx` - Config factory with columns, filters, actions
3. `src/surfaces/{module}/list.tsx` - Screen component with data fetching + ListSurface
4. `src/app/(dashboard)/{module}/page.tsx` - Thin wrapper

### DetailSurface Pattern (for detail pages)
1. `src/surfaces/{module}/detail-config.ts` - Config with tabs, actions, sidebar
2. `src/surfaces/{module}/detail.tsx` - Screen with data fetching + DetailSurface

### Chrome-Wrapped Pattern (for forms/settings)
1. `src/surfaces/{module}/{name}.tsx` - Screen wrapping existing form in Surface chrome
2. Surface provides title, breadcrumbs, back button; form content stays app-owned

## Provider Integration

Surfaces access platform-specific context via:
- `useSurfacePermissions()` from `@/surfaces/_shared` - permission gating
- `useSurfaceFocusMode()` from `@/surfaces/_shared` - FocusMode integration
- `useAuth()` from `@/platform/client` - enriched user context
- `useTenant()` from `@/platform/client` - tenant context

## Excluded from Surface Migration
- `app/(dashboard)/design-lab/**` - 20 prototype pages (experimental)
- `components/showcase/**` - DS component demos
- `app/showroom/**` - DS showcase
- `app/(landing)/**` - Marketing pages (Tailwind)
- `app/docs/**` - MDX documentation
