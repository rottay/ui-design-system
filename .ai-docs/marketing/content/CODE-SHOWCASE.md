# Rottay Code Showcase

> Real code examples from the codebase for marketing materials, videos, and documentation.

---

## 1. Auth Factory - 83 Use Cases in One Import

**File:** `platform/packages/platform/auth/config/di/use-cases/index.ts`

```typescript
// One import, 83 authentication use cases
import {
  // User Auth (23)
  makeLoginUseCase,
  makeRegisterUseCase,
  makeChangePasswordUseCase,
  makeResetPasswordUseCase,
  makeVerifyEmailUseCase,

  // Sessions (6)
  makeCreateUserSessionUseCase,
  makeRefreshSessionUseCase,
  makeRevokeSessionUseCase,

  // MFA (8)
  makeEnableMfaUseCase,
  makeVerifyMfaCodeUseCase,
  makeGenerateBackupCodesUseCase,

  // OAuth (4)
  makeInitiateOAuthFlowUseCase,
  makeHandleOAuthCallbackUseCase,

  // Passkeys (6)
  makeRegisterPasskeyUseCase,
  makeAuthenticateWithPasskeyUseCase,

  // SSO/SAML (8)
  makeInitiateSAMLLoginUseCase,
  makeHandleSAMLResponseUseCase,
  makeConfigureSAMLProviderUseCase,

  // SCIM (5)
  makeHandleSCIMUsersRequestUseCase,
  makeHandleSCIMGroupsRequestUseCase,

  // ... 70+ more
} from '@rottay/auth';
```

**Marketing Angle:**
> "80+ auth use cases. From password login to enterprise SAML. One import."

---

## 2. Multi-Tenancy - Automatic Isolation

**File:** `platform/packages/platform/tenancy/config/di/use-cases/index.ts`

```typescript
import { makeCreateCompanyUseCase, makeCreateTenantUseCase } from '@rottay/tenancy';

// Create use case instance
const createCompany = makeCreateCompanyUseCase();

// Every operation automatically isolated by tenant
const result = await createCompany.execute(
  {
    name: 'Acme Corp',
    plan: 'enterprise',
    settings: { maxUsers: 100 }
  },
  { tenantId: 'tenant_abc123' }  // This one line does everything
);

// All queries filter by tenant automatically
// No manual WHERE clauses. No data leaks. No mistakes.

if (result.isSuccess) {
  const company = result.value;
  // Company is guaranteed to belong to tenant_abc123
}
```

**Marketing Angle:**
> "Multi-tenancy in one line. 50+ use cases. Zero data leaks."

---

## 3. Compliance - 14 Frameworks, 92 Use Cases

**File:** `platform/packages/platform/compliance/index.ts`

```typescript
import {
  // GDPR (24 use cases)
  makeGrantConsentUseCase,
  makeRevokeConsentUseCase,
  makeSubmitDsarUseCase,
  makeProcessDsarUseCase,
  makeRequestDataDeletionUseCase,
  makeExportUserDataUseCase,
  makeRecordRopaEntryUseCase,
  makeConductLiaUseCase,

  // HIPAA (9 use cases)
  makeLogPhiAccessUseCase,
  makeReportHipaaBreachUseCase,
  makeReportToHhsUseCase,
  makeConductRiskAssessmentUseCase,

  // KYC (24 use cases)
  makeInitiateVerificationUseCase,
  makeScreenUserUseCase,
  makeManualReviewUseCase,
  makeUploadKycDocumentUseCase,
  makeApproveVerificationUseCase,

  // AML (10 use cases)
  makeAnalyzeTransactionUseCase,
  makeFileSarUseCase,
  makeCreateAmlAlertUseCase,
  makeConfigureAmlRulesUseCase,

  // Gaming (17 use cases)
  makeSetDepositLimitUseCase,
  makeTriggerSelfExclusionUseCase,
  makeCheckResponsibleGamingUseCase,

  // ... 8 more frameworks via wildcard exports
} from '@rottay/compliance';
```

**Marketing Angle:**
> "15+ compliance frameworks. 90+ use cases. Built by regulatory experts."

---

## 4. Base Use Case - RBAC + Errors Built-In

**File:** `platform/packages/core/application/base/use-case/core/index.ts`

```typescript
// Every use case in Rottay inherits this
export abstract class BaseUseCase<TInput, TOutput> {
  // Declarative authorization
  protected readonly requiredRoles?: string[];      // OR logic
  protected readonly requiredPermissions?: string[]; // AND logic

  async execute(
    input: TInput,
    context: TenantContext
  ): Promise<Result<TOutput>> {
    // Automatic checks on every execution:
    // 1. Validate tenant context exists
    // 2. Check user has required roles (any of)
    // 3. Check user has required permissions (all of)
    // 4. Prevent cross-tenant data access
    // 5. Execute with full error handling
    // 6. Return typed Result<T>

    return this.executeWithErrorHandling(input, context);
  }
}

// Usage - just declare requirements
class CreateInvoiceUseCase extends BaseUseCase<CreateInvoiceInput, Invoice> {
  protected readonly requiredRoles = ['admin', 'finance'];
  protected readonly requiredPermissions = ['invoices:create'];

  // Your logic here - auth is handled
}
```

**Marketing Angle:**
> "RBAC, multi-tenancy, and error handling. Built into every use case."

---

## 5. Three Modules Composing

**File:** `app-platform/src/app/api/access/roles/route.ts`

```typescript
import { withAuthAndTenant, requirePermission } from '@rottay/auth';
import { makeCreateRoleUseCase } from '@rottay/permissions';
import type { TenantRequest } from '@rottay/tenancy';

// Auth + Permissions + Tenancy working together
export const POST = withAuthAndTenant(
  requirePermission('roles:write')(
    async (request: TenantRequest) => {
      // At this point:
      // - Auth: User is authenticated (session validated)
      // - Permission: User has 'roles:write' permission
      // - Tenant: Request is scoped to their tenant

      const body = await request.json();
      const createRole = makeCreateRoleUseCase();

      const result = await createRole.execute(
        { name: body.name, permissions: body.permissions },
        {
          tenantId: request.tenantContext.tenantId,
          userId: request.user.id
        }
      );

      // Audit trail: automatic
      // Tenant isolation: automatic
      // Error handling: typed Result<T>

      if (result.isFailure) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ role: result.value });
    }
  )
);
```

**Marketing Angle:**
> "Auth, permissions, tenancy. Three modules. Zero friction."

---

## 6. Feature Flags - Simple and Powerful

**File:** `platform/packages/platform/feature-flags/config/di/use-cases/index.ts`

```typescript
import {
  makeCreateFeatureFlagUseCase,
  makeEvaluateFlagUseCase,
  makeCreateFlagRuleUseCase,
} from '@rottay/feature-flags';

// Create a feature flag
const createFlag = makeCreateFeatureFlagUseCase();
await createFlag.execute(
  {
    key: 'new-checkout-flow',
    name: 'New Checkout Flow',
    defaultValue: false,
  },
  { tenantId }
);

// Evaluate with context
const evaluateFlag = makeEvaluateFlagUseCase();
const result = await evaluateFlag.execute(
  {
    flagKey: 'new-checkout-flow',
    context: {
      userId: user.id,
      email: user.email,
      plan: user.subscription.plan,
    },
  },
  { tenantId }
);

if (result.value.enabled) {
  // Show new checkout
}
```

**Marketing Angle:**
> "30+ feature flag use cases. No LaunchDarkly subscription needed."

---

## Code Style Guidelines for Marketing

### DO
- Show real imports from `@rottay/*` packages
- Include the `{ tenantId }` context parameter
- Use `Result<T>` pattern for error handling
- Show type safety with TypeScript
- Keep examples concise (10-20 lines ideal)

### DON'T
- Show internal implementation details
- Include long configuration objects
- Show error handling edge cases
- Use mock data that looks fake

---

## Video-Ready Code Snippets

### 5-Second Snippet (Hero)
```typescript
import { makeLoginUseCase } from '@rottay/auth';
import { makeGrantConsentUseCase } from '@rottay/compliance';
import { makeCreateTenantUseCase } from '@rottay/tenancy';

// 80+ auth. 90+ compliance. 50+ tenancy. Three imports.
```

### 10-Second Snippet (Feature Highlight)
```typescript
// Before: 5 SDKs, 5 configs, 5 support queues
import auth0 from 'auth0';
import vanta from '@vanta/sdk';
import launchdarkly from 'launchdarkly-node-server-sdk';
import permit from 'permitio';
import nile from '@niledatabase/server';

// After: 1 platform
import { auth, compliance, tenancy, permissions, flags } from '@rottay/platform';
```

### 15-Second Snippet (Demo)
```typescript
import { makeLoginUseCase, makeEnableMfaUseCase } from '@rottay/auth';
import { makeGrantConsentUseCase } from '@rottay/compliance';

const login = makeLoginUseCase();
const result = await login.execute(
  { email, password },
  { tenantId: 'acme' }
);

// Result is typed. Multi-tenancy is automatic.
// GDPR consent tracking is built-in.
// 80+ auth use cases. One SDK.
```

---

## Terminal Demo Script

```bash
# Install Rottay
npm install @rottay/auth @rottay/compliance @rottay/tenancy

# That's it. You now have:
# - 80+ authentication use cases
# - 90+ compliance use cases
# - 50+ tenancy use cases
# - 200+ ready to use. Import more modules for 1,000+.
```
