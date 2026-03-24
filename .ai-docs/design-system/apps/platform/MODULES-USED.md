# app-platform - Modules Used

> **Platform Admin Application**

---

## Overview

`app-platform` is the administrative dashboard for managing the platform infrastructure, tenants, and shared services.

---

## Domain Modules

| Module | Import | Use Case |
|--------|--------|----------|
| **@rottay/dm-ia-chat** | `import { ... } from '@rottay/ia-chat'` | AI Provider Pricing Admin (rates, markup, discounts, token packages) |

---

## Platform Modules

| Module | Import | Use Case |
|--------|--------|----------|
| **@rottay/auth** | `import { ... } from '@rottay/auth'` | OAuth, JWT, MFA, Sessions, SSO, SCIM |
| **@rottay/identity** | `import { ... } from '@rottay/identity'` | User profiles, SCIM, Groups, B2B/B2C |
| **@rottay/tenancy** | `import { ... } from '@rottay/tenancy'` | Multi-tenancy, API Keys |
| **@rottay/permissions** | `import { ... } from '@rottay/permissions'` | RBAC, Access Control |
| **@rottay/compliance** | `import { ... } from '@rottay/compliance'` | KYC, AML, GDPR, Healthcare |
| **@rottay/feature-flags** | `import { ... } from '@rottay/feature-flags'` | Feature Toggles, A/B Testing |
| **@rottay/navigation** | `import { ... } from '@rottay/navigation'` | Menus, Routes, Access Control |
| **@rottay/notifications** | `import { ... } from '@rottay/notifications'` | Email, SMS, Push, In-App |

---

## Core

```typescript
import {
  success,
  error,
  type TenantContext,
  type UseCaseResult,
  logger,
  db,
  // Errors
  ValidationError,
  NotFoundError,
  // ...
} from '@rottay/core';
```

---

## Design System

```typescript
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Table,
  Modal,
  // ...
} from '@rottay/design-system';
```

---

## Key Features

1. **Tenant Management** - Create, configure, and manage tenants
2. **User Management** - Manage users across all tenants
3. **Permission Management** - Configure RBAC roles and permissions
4. **Compliance Dashboard** - Monitor KYC, AML, GDPR compliance
5. **Feature Flags** - Manage feature rollouts and A/B tests
6. **System Health** - Monitor platform health and metrics
7. **Audit Logs** - View and export audit trails
8. **AI Pricing Admin** - Configure provider rates, markup/discounts, token packages (`/admin/ai-pricing`)

---

## Architecture Note (2026-02-06)

`app-platform` is the **sole API server** for all platform administration. The standalone API server that previously existed in `platform/src/` (429 routes) has been deleted. `platform/` now contains only `packages/` (the shared `@rottay/*` modules).

---

## Code Quality (2026-02-06)

| Metric | Value |
|--------|-------|
| `Math.random()` usage | 0 (785+ replaced with crypto) |
| `console.*` usage | 0 (103 replaced with structured loggers) |
| `as any` casts | 2 (from 82, both justified) |
| `handleApiError` coverage | 180/184 routes (97.8%) |
| Logger namespaces | identity, tenancy, permissions, navigation, featureFlags |
