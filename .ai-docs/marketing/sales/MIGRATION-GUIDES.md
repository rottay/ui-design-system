# Rottay Migration Guides

> Step-by-step guides for migrating from major competitors to Rottay.
> Last updated: January 2026

---

## Table of Contents

1. [Azure AD B2C -> Rottay](#migration-azure-ad-b2c--rottay) (URGENT - Sunset May 2025)
2. [Auth0 -> Rottay](#migration-auth0--rottay)
3. [Clerk -> Rottay](#migration-clerk--rottay)
4. [Firebase Auth -> Rottay](#migration-firebase-auth--rottay)
5. [Vanta -> Rottay Compliance](#migration-vanta--rottay-compliance)
6. [LaunchDarkly -> Rottay Feature Flags](#migration-launchdarkly--rottay-feature-flags)

---

## Migration: Azure AD B2C -> Rottay

> **CRITICAL: Azure AD B2C external identities are being discontinued May 2025.**
> Microsoft announced the sunset. Your migration timeline is NOW.

### Why Migrate

**Azure AD B2C Pain Points:**
- **BEING DISCONTINUED** - No choice, you must migrate
- Complex custom policy XML (IEF) that requires specialists
- Steep learning curve for basic customizations
- Limited CIAM features compared to dedicated auth providers
- Confusing pricing tiers and user flow limitations
- Poor developer experience with custom branding
- Enterprise SSO requires additional Azure AD P1/P2 licensing

**What You Gain with Rottay:**
- **Stable platform** - Not being discontinued
- 80+ auth use cases out of the box (OAuth, SAML, Passkeys, MFA, SCIM)
- TypeScript-first with Result<T> pattern - no XML configuration
- Built-in multi-tenancy with { tenantId } context
- Impossible travel detection included (Azure charges extra)
- Enterprise SSO without enterprise pricing
- One unified SDK instead of fragmented Azure services

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 2-4 weeks (depending on custom policies) |
| **Risk Level** | HIGH if delayed past March 2025 |
| **Team Required** | 1-2 backend engineers |
| **Downtime Required** | Zero (parallel run recommended) |

**Key Considerations:**
- Export user data BEFORE migration (Azure AD B2C data export limits)
- Plan password reset flow for migrated users (passwords cannot be exported)
- Map Azure AD B2C custom policies to Rottay use cases
- Test all SAML/OAuth integrations in staging first
- Budget 2 weeks buffer for enterprise SSO testing

### Step-by-Step Migration

**Step 1: Audit Current Azure AD B2C Configuration (Day 1-2)**
- Document all user flows (sign-up, sign-in, password reset, profile edit)
- List all custom policies (IEF XML files)
- Inventory identity providers (social, enterprise SAML)
- Export user attributes schema

**Step 2: Export User Data (Day 2-3)**
- Use Microsoft Graph API to export users
- Extract custom attributes and claims
- Document B2B vs B2C user separation
- Store export with encryption (contains PII)

**Step 3: Map to Rottay Use Cases (Day 3-4)**
- Azure sign-up flow -> `makeRegisterUseCase`
- Azure sign-in flow -> `makeLoginUseCase`
- Azure MFA -> `makeEnableMfaUseCase`, `makeVerifyMfaCodeUseCase`
- Azure custom policies -> Rottay permission decorators
- Azure social login -> `makeInitiateOAuthFlowUseCase`

**Step 4: Implement Rottay Auth (Day 5-10)**
- Install `@rottay/auth`, `@rottay/identity`, `@rottay/tenancy`
- Configure OAuth providers in Rottay
- Implement user migration script
- Set up MFA enrollment flow

**Step 5: Parallel Run Testing (Day 11-14)**
- Run both systems simultaneously
- Shadow test all authentication flows
- Verify token claims match expectations
- Test enterprise SSO connections

**Step 6: User Migration (Day 15-17)**
- Migrate users in batches
- Trigger password reset emails
- Migrate OAuth connections
- Verify audit trail continuity

**Step 7: Cutover and Decommission (Day 18-20)**
- Switch DNS/load balancer to Rottay
- Monitor error rates for 48 hours
- Disable Azure AD B2C flows
- Archive Azure configuration for compliance

### Code Comparison

```typescript
// BEFORE (Azure AD B2C - Custom Policy XML)
// File: TrustFrameworkExtensions.xml (hundreds of lines of XML)
<ClaimsProvider>
  <DisplayName>Local Account SignIn</DisplayName>
  <TechnicalProfiles>
    <TechnicalProfile Id="login-NonInteractive">
      <DisplayName>Local Account SignIn</DisplayName>
      <Protocol Name="OpenIdConnect" />
      <Metadata>
        <Item Key="UserMessageIfClaimsPrincipalDoesNotExist">
          User not found
        </Item>
        <Item Key="UserMessageIfInvalidPassword">
          Invalid password
        </Item>
        <!-- 50+ more configuration items -->
      </Metadata>
      <InputClaims>
        <InputClaim ClaimTypeReferenceId="signInName" />
      </InputClaims>
      <OutputClaims>
        <OutputClaim ClaimTypeReferenceId="objectId" />
        <OutputClaim ClaimTypeReferenceId="tenantId" />
        <!-- More claims mapping -->
      </OutputClaims>
      <!-- Validation, transformations, etc. -->
    </TechnicalProfile>
  </TechnicalProfiles>
</ClaimsProvider>

// AFTER (Rottay - TypeScript)
import { makeLoginUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const result = await login.execute(
  { email: credentials.email, password: credentials.password },
  { tenantId: 'tenant_abc123' }
);

if (result.isSuccess) {
  const { user, session, tokens } = result.value;
  // User authenticated, session created, tokens issued
} else {
  // Typed error handling
  switch (result.error.code) {
    case 'AUTH/USER_NOT_FOUND':
      return { error: 'User not found' };
    case 'AUTH/INVALID_PASSWORD':
      return { error: 'Invalid password' };
    case 'AUTH/ACCOUNT_LOCKED':
      return { error: 'Account locked' };
  }
}
```

### User Migration Script Example

```typescript
import { makeCreateUserUseCase, makeLinkProviderUseCase } from '@rottay/identity';
import { azureUsers } from './azure-export.json';

const createUser = makeCreateUserUseCase();
const linkProvider = makeLinkProviderUseCase();

for (const azureUser of azureUsers) {
  // Create user in Rottay
  const result = await createUser.execute(
    {
      email: azureUser.email,
      emailVerified: azureUser.emailVerified,
      name: azureUser.displayName,
      metadata: {
        azureObjectId: azureUser.objectId, // Preserve for audit
        migratedAt: new Date().toISOString(),
      },
    },
    { tenantId: mapAzureTenantToRottay(azureUser.tenantId) }
  );

  // Link existing OAuth providers
  if (azureUser.identities?.length > 0) {
    for (const identity of azureUser.identities) {
      await linkProvider.execute(
        {
          userId: result.value.id,
          provider: mapAzureProviderToRottay(identity.issuer),
          providerUserId: identity.issuerAssignedId,
        },
        { tenantId }
      );
    }
  }
}
```

### Migration Checklist

- [ ] Document current Azure AD B2C configuration
- [ ] Export all user data via Microsoft Graph API
- [ ] Map Azure custom policies to Rottay use cases
- [ ] Set up Rottay environment (staging + production)
- [ ] Configure OAuth providers in Rottay
- [ ] Implement and test user migration script
- [ ] Test all authentication flows in staging
- [ ] Test enterprise SSO connections
- [ ] Plan password reset communication to users
- [ ] Execute parallel run (minimum 1 week)
- [ ] Migrate users in batches
- [ ] Cut over to Rottay
- [ ] Monitor for 48 hours
- [ ] Decommission Azure AD B2C
- [ ] Archive configuration for compliance records

### Common Pitfalls

- **Waiting too long** - May 2025 deadline is firm. Start NOW.
- **Forgetting custom claims** - Azure custom attributes need mapping to Rottay metadata
- **Password migration** - Passwords cannot be exported; plan for mandatory reset
- **Token lifetime differences** - Azure default tokens differ from Rottay; test session duration
- **Enterprise SSO testing** - Allow 2 weeks for enterprise customer SSO validation
- **Conditional Access policies** - Migrate to Rottay permission decorators
- **B2B collaboration** - Map Azure B2B guests to Rottay multi-tenancy model

### Timeline Warning

```
TODAY ------> March 2025 ------> May 2025
  |              |                   |
  |              |                   X Azure AD B2C Sunset
  |              |
  |              LATEST safe migration start
  |
  START NOW (recommended)
```

---

## Migration: Auth0 -> Rottay

### Why Migrate

**Auth0 Pain Points:**
- 34% of developers cite pricing concerns (industry surveys)
- 4 major outages in 2024
- Complex pricing tiers ($35-$800/mo) with MAU traps
- Advanced features require Enterprise tier ($$$)
- Impossible travel detection costs extra
- Actions/Rules can become maintenance burden

**What You Gain with Rottay:**
- Predictable pricing without MAU surprises
- Zero outages in 2024
- 80+ auth use cases included
- Impossible travel detection included (no extra cost)
- Result<T> pattern for predictable error handling
- Profile merging across providers (Auth0 lacks this)

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 1-2 weeks |
| **Risk Level** | MEDIUM |
| **Team Required** | 1 backend engineer |
| **Downtime Required** | Zero (parallel run) |

**Key Considerations:**
- Auth0 Management API rate limits affect user export speed
- Actions/Rules need manual conversion to Rottay logic
- Refresh token rotation behavior may differ

### Step-by-Step Migration

**Step 1: Export Auth0 Configuration**
- Export users via Management API (paginated)
- Document all Actions, Rules, and Hooks
- List all OAuth/Social connections
- Export tenant settings

**Step 2: Map Auth0 Features to Rottay**
- Auth0 Universal Login -> Rottay auth flows
- Auth0 Actions -> Rottay use case composition
- Auth0 Roles -> Rottay permissions module
- Auth0 Organizations -> Rottay tenancy

**Step 3: Implement Rottay Auth**
- Install `@rottay/auth`, `@rottay/identity`
- Configure OAuth providers
- Implement custom logic (replacing Actions)

**Step 4: Migrate Users**
- Export users with metadata
- Import to Rottay with password reset flow
- Link OAuth identities

**Step 5: Test and Cutover**
- Parallel run for 1 week
- Switch over
- Decommission Auth0

### Code Comparison

```typescript
// BEFORE (Auth0 - SDK + Actions)
// auth0-action.js
exports.onExecutePostLogin = async (event, api) => {
  const { user, connection } = event;

  // Check suspicious login (requires Enterprise)
  if (event.request.geoip.country_code !== user.app_metadata.country) {
    api.access.deny('Suspicious login location');
    return;
  }

  // Add custom claims
  api.idToken.setCustomClaim('tenant_id', user.app_metadata.tenant_id);
  api.accessToken.setCustomClaim('permissions', user.permissions);
};

// auth0-client.ts
import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: 'your-tenant.auth0.com',
  clientId: 'YOUR_CLIENT_ID',
});

await auth0.loginWithRedirect();
const user = await auth0.getUser();
// Multiple SDK calls, separate config...

// AFTER (Rottay)
import { makeLoginUseCase, makeDetectImpossibleTravelUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const detectTravel = makeDetectImpossibleTravelUseCase();

// Impossible travel detection INCLUDED (no Enterprise tier needed)
const travelCheck = await detectTravel.execute(
  { userId: user.id, currentIp: request.ip },
  { tenantId }
);

if (travelCheck.value.isSuspicious) {
  return error(new SuspiciousLoginError());
}

// Login with automatic tenant context
const result = await login.execute(
  { email, password },
  { tenantId }  // Multi-tenancy built-in
);

// Result is typed, errors are explicit
// No Actions to maintain, no separate dashboard
```

### Migration Checklist

- [ ] Export Auth0 users via Management API
- [ ] Document all Auth0 Actions and Rules
- [ ] Map Auth0 connections to Rottay OAuth config
- [ ] Install and configure Rottay packages
- [ ] Implement Action logic in Rottay use cases
- [ ] Test authentication flows
- [ ] Migrate users with password reset
- [ ] Run parallel for 1 week
- [ ] Cut over
- [ ] Cancel Auth0 subscription

### Common Pitfalls

- **Rate limits on user export** - Auth0 limits Management API; batch carefully
- **Action complexity** - Complex Actions may need decomposition into multiple use cases
- **Refresh token differences** - Rotation behavior may vary; test thoroughly
- **Universal Login customization** - Rebuild branding in your frontend

---

## Migration: Clerk -> Rottay

### Why Migrate

**Clerk Pain Points:**
- B2B organization pricing compounds fast ($0.02/org/mo)
- At scale: 50K users + 100 orgs = $2K/mo minimum
- Limited compliance features
- No built-in KYC/AML
- Separate subscription for each feature vertical

**What You Gain with Rottay:**
- No per-org charges (multi-tenancy included)
- 15 compliance frameworks built-in
- Full auth + compliance + feature flags in one platform
- Result<T> pattern for consistent error handling

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 3-5 days |
| **Risk Level** | LOW |
| **Team Required** | 1 developer |
| **Downtime Required** | Zero |

**Key Considerations:**
- Clerk's React hooks need replacement with Rottay equivalents
- Organization -> Tenant mapping is 1:1
- Clerk metadata maps to Rottay user metadata

### Step-by-Step Migration

**Step 1: Export Clerk Data**
- Export users via Clerk Backend API
- Export organizations
- Document organization memberships

**Step 2: Map Clerk Concepts**
- Clerk User -> Rottay User
- Clerk Organization -> Rottay Tenant
- Clerk Roles -> Rottay Permissions

**Step 3: Replace Frontend Components**
- Clerk's `<SignIn>` -> Your custom form + Rottay
- Clerk's `useAuth()` -> Rottay session handling
- Clerk's `<OrganizationSwitcher>` -> Rottay tenant switcher

**Step 4: Migrate and Test**
- Import users and orgs
- Test all flows
- Cut over

### Code Comparison

```typescript
// BEFORE (Clerk)
import { useAuth, useOrganization } from '@clerk/nextjs';

function Dashboard() {
  const { userId, sessionId } = useAuth();
  const { organization } = useOrganization();

  // Clerk charges per organization
  // At 100 orgs, you're paying $200/mo just for orgs
}

// API route
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId, orgId } = getAuth(request);
  // Manual org filtering in every query
  const data = await db.query.items.findMany({
    where: eq(items.orgId, orgId), // Manual, error-prone
  });
}

// AFTER (Rottay)
import { makeGetCurrentUserUseCase } from '@rottay/identity';
import { withAuthAndTenant } from '@rottay/auth';
import type { TenantRequest } from '@rottay/tenancy';

// No per-org pricing. Tenancy is included.
export const GET = withAuthAndTenant(
  async (request: TenantRequest) => {
    // tenantId automatically extracted and validated
    const { tenantId } = request.tenantContext;

    const getUser = makeGetCurrentUserUseCase();
    const result = await getUser.execute(
      { userId: request.user.id },
      { tenantId } // Automatic tenant isolation
    );

    // Every query automatically filtered by tenant
    // No manual WHERE clauses, no data leaks
    return NextResponse.json(result.value);
  }
);
```

### Migration Checklist

- [ ] Export Clerk users and organizations
- [ ] Map Clerk orgs to Rottay tenants
- [ ] Replace Clerk React components
- [ ] Update API routes to use Rottay middleware
- [ ] Test multi-tenant flows
- [ ] Migrate production data
- [ ] Cancel Clerk subscription

### Common Pitfalls

- **Component replacement** - Clerk's prebuilt UI needs custom replacement
- **Webhook differences** - Clerk webhook events need remapping
- **Session storage** - Clerk uses its own session; migrate to Rottay sessions

---

## Migration: Firebase Auth -> Rottay

### Why Migrate

**Firebase Auth Pain Points:**
- Hidden SMS costs ($0.06/verification = $6K/mo at 100K verifications)
- No native sharding for 10M+ users
- SSO requires expensive Firebase Extensions or custom work
- Limited compliance features
- Vendor lock-in to Google Cloud ecosystem

**What You Gain with Rottay:**
- SMS notifications included (no per-message fees)
- Designed for enterprise scale
- Enterprise SSO included
- 15 compliance frameworks
- Cloud-agnostic deployment

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 1-2 weeks |
| **Risk Level** | MEDIUM |
| **Team Required** | 1-2 developers |
| **Downtime Required** | Zero |

**Key Considerations:**
- Firebase passwords can be exported (with scrypt hash)
- Firebase custom claims map to Rottay metadata
- Phone auth users need re-verification or migration path

### Step-by-Step Migration

**Step 1: Export Firebase Users**
- Use Firebase CLI: `firebase auth:export users.json`
- This includes password hashes (scrypt)
- Document custom claims usage

**Step 2: Plan Password Migration**
- Option A: Import hashes and use Firebase scrypt verification
- Option B: Force password reset on first login
- Option B recommended for security

**Step 3: Map Firebase Features**
- Firebase email/password -> Rottay auth
- Firebase phone auth -> Rottay MFA
- Firebase custom claims -> Rottay metadata + permissions

**Step 4: Implement and Migrate**
- Set up Rottay auth
- Import users
- Test all auth flows

**Step 5: Cutover**
- Switch authentication endpoints
- Monitor for issues
- Disable Firebase Auth

### Code Comparison

```typescript
// BEFORE (Firebase)
import { getAuth, signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';

const auth = getAuth();

// Email/password
const result = await signInWithEmailAndPassword(auth, email, password);
const user = result.user;

// Phone auth - EXPENSIVE at scale
// $0.06 per verification = $6,000/mo at 100K users
const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
await confirmationResult.confirm(verificationCode);

// Custom claims require Cloud Functions
// admin.auth().setCustomUserClaims(uid, { tenantId: 'abc', role: 'admin' });

// AFTER (Rottay)
import { makeLoginUseCase, makeEnableMfaUseCase, makeVerifyMfaCodeUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const result = await login.execute(
  { email, password },
  { tenantId }
);

// MFA with SMS - INCLUDED (no per-message fees)
const enableMfa = makeEnableMfaUseCase();
await enableMfa.execute(
  { userId: result.value.user.id, method: 'sms', phoneNumber },
  { tenantId }
);

const verifyMfa = makeVerifyMfaCodeUseCase();
await verifyMfa.execute(
  { userId, code: userEnteredCode },
  { tenantId }
);

// Metadata and permissions built-in
// No Cloud Functions needed
// Multi-tenancy automatic with { tenantId }
```

### Migration Checklist

- [ ] Export Firebase users via CLI
- [ ] Decide on password migration strategy
- [ ] Map Firebase custom claims to Rottay
- [ ] Handle phone auth users (re-verify or migrate)
- [ ] Set up Rottay environment
- [ ] Import users
- [ ] Test all authentication flows
- [ ] Test MFA flows
- [ ] Run parallel for 1 week
- [ ] Cut over
- [ ] Disable Firebase Auth

### Common Pitfalls

- **SMS cost surprise** - Calculate current Firebase SMS spend before migration
- **Password hash format** - Firebase uses scrypt; plan verification strategy
- **Phone auth re-enrollment** - Users may need to re-verify phone numbers
- **Anonymous auth** - Firebase anonymous users need conversion strategy

---

## Migration: Vanta -> Rottay Compliance

### Why Migrate

**Vanta Pain Points:**
- $7,500-$30K/year base + $10K-$50K audit fees
- Only 5 frameworks (SOC 2, ISO 27001, HIPAA, PCI-DSS, GDPR)
- Evidence collection tool, not implementation
- Separate tool from your auth/identity stack
- Manual policy management

**What You Gain with Rottay:**
- 15 compliance frameworks (including KYC, AML, Gaming, Crypto)
- 138 compliance use cases
- Compliance implemented in code, not tracked in dashboard
- Integrated with auth, identity, and tenancy
- Automatic evidence generation from use case execution

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 2-4 weeks |
| **Risk Level** | MEDIUM |
| **Team Required** | 1 compliance lead + 1 developer |
| **Downtime Required** | Zero |

**Key Considerations:**
- Vanta is tracking tool; Rottay implements compliance
- Map Vanta evidence items to Rottay use cases
- Continue Vanta during transition if audits pending

### Step-by-Step Migration

**Step 1: Audit Current Vanta Setup**
- Document all connected integrations
- List compliance frameworks in use
- Export evidence items and policies

**Step 2: Map Vanta Controls to Rottay**
- Access control evidence -> Rottay permissions module
- User management evidence -> Rottay identity module
- Authentication logs -> Rottay auth audit trails
- Data handling -> Rottay compliance GDPR use cases

**Step 3: Implement Rottay Compliance**
- Install `@rottay/compliance`
- Configure frameworks needed
- Implement consent management
- Set up DSAR handling

**Step 4: Replace Evidence Collection**
- Rottay auto-generates evidence from use case execution
- Configure audit trail exports
- Set up compliance reporting

**Step 5: Transition and Decommission**
- Run both during audit period if needed
- Cancel Vanta after audit complete

### Code Comparison

```typescript
// BEFORE (Vanta)
// Vanta doesn't have code - it's a dashboard
// You manually upload evidence, connect integrations,
// and track controls in a separate system.
//
// Evidence collection is manual:
// 1. Screenshot your auth system
// 2. Export user access logs
// 3. Document data handling procedures
// 4. Upload to Vanta dashboard
// 5. Repeat for every audit

// AFTER (Rottay)
import {
  makeGrantConsentUseCase,
  makeSubmitDsarUseCase,
  makeProcessDsarUseCase,
  makeExportUserDataUseCase,
  makeLogPhiAccessUseCase,
} from '@rottay/compliance';

// GDPR Consent - automatically tracked
const grantConsent = makeGrantConsentUseCase();
await grantConsent.execute(
  {
    userId,
    consentType: 'marketing_emails',
    granted: true,
    legalBasis: 'consent',
  },
  { tenantId }
);
// Evidence: Timestamped consent record with audit trail

// DSAR Handling - automated workflow
const submitDsar = makeSubmitDsarUseCase();
const dsarResult = await submitDsar.execute(
  {
    requestorEmail: 'user@example.com',
    requestType: 'data_export',
  },
  { tenantId }
);
// Evidence: DSAR request logged, 30-day timer started

const processDsar = makeProcessDsarUseCase();
await processDsar.execute(
  { dsarId: dsarResult.value.id },
  { tenantId }
);
// Evidence: Processing actions logged

// HIPAA PHI Access - automatic logging
const logPhiAccess = makeLogPhiAccessUseCase();
await logPhiAccess.execute(
  {
    userId: staffMember.id,
    patientId: patient.id,
    accessType: 'view',
    resourceType: 'medical_record',
    justification: 'Treatment',
  },
  { tenantId }
);
// Evidence: PHI access automatically logged for audits

// All evidence generated automatically from use case execution
// No manual uploads, no separate dashboard
```

### Migration Checklist

- [ ] Document current Vanta configuration
- [ ] Export Vanta evidence and policies
- [ ] Map Vanta controls to Rottay use cases
- [ ] Install and configure `@rottay/compliance`
- [ ] Implement GDPR use cases (consent, DSAR, deletion)
- [ ] Implement applicable framework use cases
- [ ] Configure audit trail exports
- [ ] Test compliance reporting
- [ ] Run both systems during transition
- [ ] Complete any pending audits with Vanta
- [ ] Cancel Vanta subscription

### Common Pitfalls

- **Audit timing** - Don't cancel Vanta mid-audit
- **Evidence continuity** - Ensure historical evidence is preserved
- **Framework coverage** - Verify all your frameworks are in Rottay's 15
- **Integration gaps** - Vanta integrates with many tools; ensure coverage

---

## Migration: LaunchDarkly -> Rottay Feature Flags

### Why Migrate

**LaunchDarkly Pain Points:**
- $10-$20/seat/month (50 engineers = $1K/mo minimum)
- Seat-based pricing scales expensively
- Separate service from your auth/identity
- Another SDK, another dashboard, another vendor

**What You Gain with Rottay:**
- 30+ feature flag use cases included
- No seat-based pricing
- Per-tenant and per-user flags
- Integrated with auth and permissions
- One SDK, one dashboard

### Migration Complexity

| Metric | Value |
|--------|-------|
| **Estimated Time** | 3-5 days |
| **Risk Level** | LOW |
| **Team Required** | 1 developer |
| **Downtime Required** | Zero |

**Key Considerations:**
- Export LaunchDarkly flag configurations
- Map targeting rules to Rottay flag rules
- Preserve flag evaluation history for compliance

### Step-by-Step Migration

**Step 1: Export LaunchDarkly Config**
- Export all feature flags via API
- Document targeting rules
- List all environments

**Step 2: Map to Rottay**
- LD flags -> Rottay flags
- LD targeting -> Rottay rules
- LD segments -> Rottay tenant/user context

**Step 3: Implement in Rottay**
- Create flags via use cases
- Configure targeting rules
- Test evaluations

**Step 4: Switch Evaluation**
- Update flag evaluation calls
- Remove LaunchDarkly SDK
- Monitor flag performance

### Code Comparison

```typescript
// BEFORE (LaunchDarkly)
import * as ld from 'launchdarkly-node-server-sdk';

const ldClient = ld.init('sdk-key-xxx');
await ldClient.waitForInitialization();

// Evaluate flag
const showNewFeature = await ldClient.variation(
  'new-checkout-flow',
  { key: userId, email: userEmail, custom: { plan: 'pro' } },
  false
);

// $10-$20 per engineer per month
// 50 engineers = $500-$1,000/month
// Just for feature flags

// AFTER (Rottay)
import {
  makeCreateFeatureFlagUseCase,
  makeEvaluateFlagUseCase,
  makeCreateFlagRuleUseCase,
} from '@rottay/feature-flags';

// Create flag (admin)
const createFlag = makeCreateFeatureFlagUseCase();
await createFlag.execute(
  {
    key: 'new-checkout-flow',
    name: 'New Checkout Flow',
    description: 'Redesigned checkout experience',
    defaultValue: false,
  },
  { tenantId }
);

// Add targeting rule
const createRule = makeCreateFlagRuleUseCase();
await createRule.execute(
  {
    flagKey: 'new-checkout-flow',
    attribute: 'plan',
    operator: 'equals',
    value: 'enterprise',
    flagValue: true,
    priority: 1,
  },
  { tenantId }
);

// Evaluate (runtime)
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
  { tenantId }  // Per-tenant flags built-in
);

if (result.value.enabled) {
  // Show new checkout
}

// No seat pricing. Included with platform.
// Same SDK as auth, compliance, tenancy.
```

### Migration Checklist

- [ ] Export LaunchDarkly flag configurations
- [ ] Document all targeting rules
- [ ] Map LD concepts to Rottay equivalents
- [ ] Create flags in Rottay
- [ ] Implement targeting rules
- [ ] Update code to use Rottay SDK
- [ ] Test flag evaluations
- [ ] Remove LaunchDarkly SDK
- [ ] Cancel LaunchDarkly subscription

### Common Pitfalls

- **Targeting rule complexity** - Complex LD rules may need decomposition
- **Percentage rollouts** - Verify percentage calculation matches
- **Experimentation** - LD experiments need separate migration planning
- **Flag history** - Export evaluation history before decommission

---

## General Migration Best Practices

### Pre-Migration

1. **Audit current state** - Document everything before changes
2. **Test environment** - Set up Rottay staging first
3. **Parallel run** - Never hard cutover without parallel testing
4. **Rollback plan** - Know how to revert if issues arise

### During Migration

1. **Batch users** - Migrate in cohorts, not all at once
2. **Monitor errors** - Watch error rates during each batch
3. **Communicate** - Notify users of password reset requirements
4. **Document** - Keep migration logs for compliance

### Post-Migration

1. **Verify** - Check all flows work in production
2. **Monitor** - Watch metrics for 2 weeks post-migration
3. **Decommission** - Only after stable period
4. **Archive** - Keep old config for compliance/audit

---

## Support

- **Documentation**: [CATALOG.md](../CATALOG.md)
- **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Code Examples**: [CODE-SHOWCASE.md](./CODE-SHOWCASE.md)

---

## Related Documents

| Document | Description |
|----------|-------------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | Detailed competitor comparison |
| [TCO-CALCULATOR.md](./TCO-CALCULATOR.md) | Cost comparison calculator |
| [MARKETING-STRATEGY.md](./MARKETING-STRATEGY.md) | Overall marketing strategy |
