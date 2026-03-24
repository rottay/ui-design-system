# Architecture Audit: app-platform vs app-bithire

> **Date**: 2026-01-28
> **Status**: Active
> **Last Updated**: 2026-01-28

---

## Executive Summary

| Aspect | app-platform | app-bithire | Consistent? |
|--------|--------------|-------------|-------------|
| Auth Middleware | `withAuthAndTenant()` | NextAuth whitelist | Different patterns |
| Tenant Context | Manual in each route | Auto-injection via wrappers | app-bithire better |
| Direct DB Calls | 36 files with violations | 2 files with violations | Both have issues |
| Super Admin Check | **FIXED** - JWT only | JWT roles | Now consistent |

---

## 1. Security Fixes Applied

### Super Admin Email Domain Fallback (FIXED 2026-01-28)

**Issue**: Super Admin privileges were being granted based on email domain (`@rottay.com`) as a fallback, which is insecure and can be spoofed.

**Resolution**: Removed all instances (50+ occurrences across 40 files) of the vulnerable pattern:

```typescript
// BEFORE (Vulnerable)
const userIsSuperAdmin = request.user.isSuperAdmin ||
  (request.user.email ? isSuperAdminDomain(request.user.email) : false);

// AFTER (Secure)
const userIsSuperAdmin = request.user.isSuperAdmin;
```

**Files Fixed**:
- All API routes in `app-platform/src/app/api/`
- Security, navigation, features, tenants, permissions, compliance, admin routes
- Total: 40 files, 50+ occurrences

---

## 2. Authentication Patterns

### app-platform

Uses `withAuthAndTenant()` middleware wrapper:

```typescript
// src/app/api/[feature]/route.ts
export const GET = async (request: NextRequest) => {
  try {
    return await withAuthAndTenant(handler)(request);
  } catch (error) {
    return handleApiError(error);
  }
};
```

**Location**: `/src/lib/api/middleware/`

### app-bithire

Uses NextAuth with explicit whitelist in middleware:

```typescript
// src/middleware.ts
// Public routes: /login, /register, /forgot-password
// Default deny for everything else
```

Uses wrapper helpers for server actions with auto-injection:

```typescript
// src/lib/server-utils/index.ts
export const listUsers = query(
  () => makeListUsersQuery(),
  (result) => result.items.map(mapUser)
);

export const createUser = mutation(
  () => makeCreateUserUseCase(),
  { revalidate: ['/users'] }
);
```

**Advantage**: Developers cannot forget to pass tenantId - it's automatically injected.

---

## 3. Direct Database Call Violations

### Architectural Rule

API routes and server actions should use Use Cases from `@rottay/*` modules, NOT direct database calls. Direct DB access:
- Bypasses business logic validation
- Skips audit logging
- Creates tight coupling to schema
- Makes testing harder

### app-platform Violations (36 files)

#### Critical - Settings Routes (High Volume)

| File | Description |
|------|-------------|
| `api/settings/tenant/route.ts` | Tenant settings CRUD |
| `api/settings/route.ts` | General settings |
| `api/settings/company/route.ts` | Company settings |

#### High - Access Control Routes

| File | Description |
|------|-------------|
| `api/access/roles/route.ts` | Role management |
| `api/access/roles/[id]/route.ts` | Role CRUD |
| `api/access/roles/[id]/clone/route.ts` | Role cloning |
| `api/access/matrix/route.ts` | Permission matrix |
| `api/access/policies/route.ts` | Policy management |

#### High - Security Routes

| File | Description |
|------|-------------|
| `api/security/impersonation/route.ts` | Impersonation management |
| `api/auth/impersonate/start/route.ts` | Start impersonation |
| `api/auth/impersonate/route.ts` | Impersonation routes |

#### Medium - Auth Routes

| File | Description |
|------|-------------|
| `api/auth/login/route.ts` | Login (super admin check) |
| `api/auth/register/route.ts` | Registration (tenant lookup) |

#### Medium - Other Routes

| File | Description |
|------|-------------|
| `api/tenants/route.ts` | Tenant management |
| `api/tenants/[id]/companies/route.ts` | Tenant companies |
| `api/tenants/[id]/features/route.ts` | Tenant features |
| `api/tenants/[id]/status/route.ts` | Tenant status |
| `api/companies/route.ts` | Company management |
| `api/companies/[id]/transfer-ownership/route.ts` | Ownership transfer |
| `api/companies/[id]/transfer/route.ts` | Company transfer |
| `api/users/[id]/route.ts` | User management |
| `api/users/[id]/status/route.ts` | User status |
| `api/roles/route.ts` | Role listing |
| `api/roles/[id]/route.ts` | Role CRUD |
| `api/roles/[id]/permissions/route.ts` | Role permissions |
| `api/permissions/[id]/route.ts` | Permission CRUD |
| `api/compliance/breach/route.ts` | Breach management |
| `api/compliance/breach/[id]/route.ts` | Breach details |
| `api/navigation/preview/route.ts` | Navigation preview |
| `api/dashboard/activity/route.ts` | Activity dashboard |
| `api/dashboard/stats/route.ts` | Stats dashboard |
| `api/dashboard/metrics/route.ts` | Metrics dashboard |
| `api/admin/system/health/route.ts` | System health |
| `api/admin/stats/route.ts` | Admin stats |
| `api/audit/route.ts` | Audit logs |

### app-bithire Violations (2 files)

| File | Description | Justification |
|------|-------------|---------------|
| `actions/auth/auth/index.ts` | Registration flow | Workaround for complex registration |
| `actions/scoring/rubrics/index.ts` | Rubric migrations | Batch operations for performance |

---

## 4. Remediation Plan

### Priority 1: Security (COMPLETED)

- [x] Remove email domain fallback in Super Admin checks

### Priority 2: Architecture (Short-term)

1. **Create wrapper utilities in app-platform**
   - Copy pattern from `app-bithire/src/lib/server-utils/`
   - Implement `query()` and `mutation()` wrappers
   - Auto-inject tenantId, userId, etc.

2. **Migrate Settings routes to use cases**
   - Create or use existing `@rottay/settings` module
   - Priority: tenant, company, general settings

### Priority 3: Consistency (Medium-term)

3. **Migrate Security routes to @rottay/auth use cases**
   - sessions, events, impersonation
   - May require creating new use cases in the module

4. **Migrate Access Control routes to @rottay/permissions**
   - roles, matrix, policies
   - Some already use use cases partially

5. **Migrate remaining routes**
   - Dashboard routes (stats, metrics, activity)
   - Admin routes (health, stats)
   - Audit routes

---

## 5. Available Use Cases for Migration

### @rottay/auth - Sessions

| Factory | Purpose |
|---------|---------|
| `makeGetActiveSessionsQuery` | Get active sessions for a user |
| `makeRevokeSessionUseCase` | Revoke single/all sessions |
| `makeGetUserSessionsQuery` | Get all sessions for a user |
| `makeLogoutUseCase` | Logout user |
| `makeRefreshSessionUseCase` | Refresh session token |

### @rottay/auth - Security Events

| Factory | Purpose |
|---------|---------|
| `makeGetSecurityEventsQuery` | Get security events with filtering |
| `makeCreateSecurityEventUseCase` | Log security event |
| `makeGetSecuritySummaryQuery` | Get security summary stats |

### Migration Example

```typescript
// BEFORE - Direct DB call
import { db } from '@/lib/db/client';
import { userSessions } from '@rottay/auth';

const sessions = await db
  .select()
  .from(userSessions)
  .where(and(
    eq(userSessions.userId, userId),
    eq(userSessions.isActive, true)
  ));

// AFTER - Use case pattern
import { makeGetActiveSessionsQuery } from '@rottay/auth';

const query = makeGetActiveSessionsQuery();
const result = await query.execute(
  { userId, tenantId, limit: 50 },
  { tenantId, userId }
);
```

---

## 6. Verification Scripts

### Find Direct DB Calls in API Routes

```bash
grep -r "db\.\(select\|insert\|update\|delete\|execute\)" \
  --include="*.ts" \
  app-platform/src/app/api/ \
  app-bithire/src/app/api/
```

### Find Direct DB Calls in Actions

```bash
grep -r "db\.\(select\|insert\|update\|delete\|execute\)" \
  --include="*.ts" \
  app-platform/src/actions/ \
  app-bithire/src/actions/
```

### Check for isSuperAdminDomain Usage (should be zero)

```bash
grep -r "isSuperAdminDomain" \
  --include="*.ts" \
  app-platform/src/app/api/
```

---

## 6. Recommended Patterns

### For API Routes (app-platform)

```typescript
// Correct Pattern
import { makeListUsersUseCase } from '@rottay/identity';

async function handler(request: TenantRequest) {
  const useCase = makeListUsersUseCase();
  const result = await useCase.execute(
    { tenantId: request.tenantContext.tenantId, ...params },
    request.securityContext
  );
  return NextResponse.json({ success: true, data: result });
}
```

### For Server Actions (app-bithire style)

```typescript
// Correct Pattern
import { query, mutation } from '@/lib/server-utils';
import { makeListUsersUseCase } from '@rottay/identity';

export const listUsers = query(
  () => makeListUsersUseCase(),
  (result) => result.items.map(mapUser)
);
```

---

## Appendix: File Checklist

### app-platform Files to Migrate

- [ ] `api/settings/tenant/route.ts`
- [ ] `api/settings/route.ts`
- [ ] `api/settings/company/route.ts`
- [ ] `api/access/roles/route.ts`
- [ ] `api/access/roles/[id]/route.ts`
- [ ] `api/access/roles/[id]/clone/route.ts`
- [ ] `api/access/matrix/route.ts`
- [ ] `api/access/policies/route.ts`
- [ ] `api/security/impersonation/route.ts`
- [ ] `api/auth/impersonate/start/route.ts`
- [ ] `api/auth/impersonate/route.ts`
- [ ] `api/auth/login/route.ts`
- [ ] `api/auth/register/route.ts`
- [ ] `api/tenants/route.ts`
- [ ] `api/tenants/[id]/companies/route.ts`
- [ ] `api/tenants/[id]/features/route.ts`
- [ ] `api/tenants/[id]/status/route.ts`
- [ ] `api/companies/route.ts`
- [ ] `api/companies/[id]/transfer-ownership/route.ts`
- [ ] `api/companies/[id]/transfer/route.ts`
- [ ] `api/users/[id]/route.ts`
- [ ] `api/users/[id]/status/route.ts`
- [ ] `api/roles/route.ts`
- [ ] `api/roles/[id]/route.ts`
- [ ] `api/roles/[id]/permissions/route.ts`
- [ ] `api/permissions/[id]/route.ts`
- [ ] `api/compliance/breach/route.ts`
- [ ] `api/compliance/breach/[id]/route.ts`
- [ ] `api/navigation/preview/route.ts`
- [ ] `api/dashboard/activity/route.ts`
- [ ] `api/dashboard/stats/route.ts`
- [ ] `api/dashboard/metrics/route.ts`
- [ ] `api/admin/system/health/route.ts`
- [ ] `api/admin/stats/route.ts`
- [ ] `api/audit/route.ts`
- [ ] `api/access/impersonation/history/route.ts`

### app-bithire Files to Review

- [ ] `actions/auth/auth/index.ts` - Consider if workaround still needed
- [ ] `actions/scoring/rubrics/index.ts` - Batch operations, may be acceptable
